create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

create type public.user_role as enum ('super_admin', 'owner', 'employee');
create type public.plan_code as enum ('free', 'pro', 'enterprise');
create type public.appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.notification_kind as enum ('appointment_created', 'appointment_reminder', 'appointment_cancelled', 'appointment_changed');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  category text not null default 'small_business',
  timezone text not null default 'Europe/Istanbul',
  plan public.plan_code not null default 'free',
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  role public.user_role not null default 'owner',
  full_name text not null,
  created_at timestamptz not null default now()
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  title text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  color text not null default '#0f766e',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  full_name text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (business_id, phone)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  employee_id uuid not null references public.employees(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  price_cents integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade unique,
  plan public.plan_code not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  check (ends_at > starts_at),
  unique (employee_id, weekday, starts_at)
);

create table public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  check (ends_at > starts_at)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete cascade,
  kind public.notification_kind not null,
  channel text not null default 'in_app',
  payload jsonb not null default '{}',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;
alter table public.users enable row level security;
alter table public.employees enable row level security;
alter table public.services enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.working_hours enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.notifications enable row level security;

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select business_id from public.users where id = auth.uid()
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
$$;

create policy "business tenant read" on public.businesses for select using (public.is_super_admin() or id = public.current_business_id() or owner_id = auth.uid());
create policy "business owner insert" on public.businesses for insert with check (owner_id = auth.uid());
create policy "business owner update" on public.businesses for update using (public.is_super_admin() or owner_id = auth.uid());

create policy "users tenant read" on public.users for select using (public.is_super_admin() or business_id = public.current_business_id() or id = auth.uid());
create policy "users tenant write" on public.users for all using (public.is_super_admin() or business_id = public.current_business_id()) with check (public.is_super_admin() or business_id = public.current_business_id());

create policy "employees tenant" on public.employees for all using (public.is_super_admin() or business_id = public.current_business_id()) with check (public.is_super_admin() or business_id = public.current_business_id());
create policy "services tenant" on public.services for all using (public.is_super_admin() or business_id = public.current_business_id()) with check (public.is_super_admin() or business_id = public.current_business_id());
create policy "customers tenant" on public.customers for all using (public.is_super_admin() or business_id = public.current_business_id()) with check (public.is_super_admin() or business_id = public.current_business_id());
create policy "subscriptions tenant" on public.subscriptions for all using (public.is_super_admin() or business_id = public.current_business_id()) with check (public.is_super_admin() or business_id = public.current_business_id());
create policy "hours tenant" on public.working_hours for all using (public.is_super_admin() or business_id = public.current_business_id()) with check (public.is_super_admin() or business_id = public.current_business_id());
create policy "blocks tenant" on public.blocked_dates for all using (public.is_super_admin() or business_id = public.current_business_id()) with check (public.is_super_admin() or business_id = public.current_business_id());
create policy "notifications tenant" on public.notifications for all using (public.is_super_admin() or business_id = public.current_business_id()) with check (public.is_super_admin() or business_id = public.current_business_id());

create policy "appointments owner and employee read" on public.appointments
for select using (
  public.is_super_admin()
  or business_id = public.current_business_id()
  or employee_id in (select id from public.employees where user_id = auth.uid())
);

create policy "appointments tenant write" on public.appointments
for all using (public.is_super_admin() or business_id = public.current_business_id())
with check (public.is_super_admin() or business_id = public.current_business_id());

create index appointments_business_starts_idx on public.appointments (business_id, starts_at);
create index appointments_employee_starts_idx on public.appointments (employee_id, starts_at);
create index services_business_active_idx on public.services (business_id, active);
create index customers_business_phone_idx on public.customers (business_id, phone);

alter table public.appointments
  add constraint no_employee_overlap
  exclude using gist (
    employee_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('pending', 'confirmed'));

-- =============================================
-- RANDEVORA - DATABASE SCHEMA (RESET & CREATE)
-- =============================================

-- Önce mevcut tabloları ve tipleri temizle
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.current_business_id() cascade;
drop function if exists public.is_super_admin() cascade;
drop function if exists public.get_user_role() cascade;
drop function if exists public.approve_business(uuid) cascade;
drop function if exists public.reject_business(uuid) cascade;

drop table if exists public.notifications cascade;
drop table if exists public.blocked_dates cascade;
drop table if exists public.working_hours cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.appointments cascade;
drop table if exists public.customers cascade;
drop table if exists public.services cascade;
drop table if exists public.employees cascade;
drop table if exists public.users cascade;
drop table if exists public.businesses cascade;

drop type if exists public.notification_kind;
drop type if exists public.appointment_status;
drop type if exists public.plan_code;
drop type if exists public.user_role;
drop type if exists public.business_status;

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- Enum types
create type public.user_role as enum ('super_admin', 'owner', 'admin', 'employee');
create type public.plan_code as enum ('free', 'pro', 'enterprise');
create type public.appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.notification_kind as enum ('appointment_created', 'appointment_reminder', 'appointment_cancelled', 'appointment_changed');
create type public.business_status as enum ('pending', 'approved', 'rejected', 'suspended');

-- =============================================
-- TABLES
-- =============================================

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  category text not null default 'small_business',
  timezone text not null default 'Europe/Istanbul',
  plan public.plan_code not null default 'free',
  status public.business_status not null default 'pending',
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  role public.user_role not null default 'owner',
  full_name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  title text,
  phone text,
  email text,
  role public.user_role not null default 'employee',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  price_variable boolean not null default false,
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

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

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

-- Helper functions (security definer = postgres superuser olarak çalışır, RLS bypass eder)
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
  select coalesce(
    (select role = 'super_admin' from public.users where id = auth.uid()),
    false
  )
$$;

create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

-- =============================================
-- RLS Policies - Businesses
-- =============================================
create policy "businesses_select" on public.businesses for select using (true);
create policy "businesses_insert" on public.businesses for insert with check (owner_id = auth.uid());
create policy "businesses_update" on public.businesses for update using (
  public.is_super_admin() or owner_id = auth.uid()
);
create policy "businesses_delete" on public.businesses for delete using (
  public.is_super_admin()
);

-- =============================================
-- RLS Policies - Users
-- =============================================
create policy "users_select" on public.users for select using (true);
create policy "users_insert" on public.users for insert with check (true);
create policy "users_update" on public.users for update using (
  public.is_super_admin() 
  or id = auth.uid()
  or business_id = public.current_business_id()
);

-- =============================================
-- RLS Policies - Employees
-- =============================================
create policy "employees_select" on public.employees for select using (true);
create policy "employees_insert" on public.employees for insert with check (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "employees_update" on public.employees for update using (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "employees_delete" on public.employees for delete using (
  public.is_super_admin() or business_id = public.current_business_id()
);

-- =============================================
-- RLS Policies - Services
-- =============================================
create policy "services_select" on public.services for select using (true);
create policy "services_insert" on public.services for insert with check (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "services_update" on public.services for update using (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "services_delete" on public.services for delete using (
  public.is_super_admin() or business_id = public.current_business_id()
);

-- =============================================
-- RLS Policies - Customers
-- =============================================
create policy "customers_select" on public.customers for select using (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "customers_insert" on public.customers for insert with check (true);
create policy "customers_update" on public.customers for update using (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "customers_delete" on public.customers for delete using (
  public.is_super_admin() or business_id = public.current_business_id()
);

-- =============================================
-- RLS Policies - Appointments
-- =============================================
create policy "appointments_select" on public.appointments for select using (true);
create policy "appointments_insert" on public.appointments for insert with check (true);
create policy "appointments_update" on public.appointments for update using (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "appointments_delete" on public.appointments for delete using (
  public.is_super_admin() or business_id = public.current_business_id()
);

-- =============================================
-- RLS Policies - Subscriptions
-- =============================================
create policy "subscriptions_select" on public.subscriptions for select using (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "subscriptions_insert" on public.subscriptions for insert with check (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "subscriptions_update" on public.subscriptions for update using (
  public.is_super_admin() or business_id = public.current_business_id()
);

-- =============================================
-- RLS Policies - Working Hours
-- =============================================
create policy "hours_select" on public.working_hours for select using (true);
create policy "hours_insert" on public.working_hours for insert with check (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "hours_update" on public.working_hours for update using (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "hours_delete" on public.working_hours for delete using (
  public.is_super_admin() or business_id = public.current_business_id()
);

-- =============================================
-- RLS Policies - Blocked Dates
-- =============================================
create policy "blocks_select" on public.blocked_dates for select using (true);
create policy "blocks_insert" on public.blocked_dates for insert with check (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "blocks_update" on public.blocked_dates for update using (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "blocks_delete" on public.blocked_dates for delete using (
  public.is_super_admin() or business_id = public.current_business_id()
);

-- =============================================
-- RLS Policies - Notifications
-- =============================================
create policy "notifications_select" on public.notifications for select using (
  public.is_super_admin() or business_id = public.current_business_id()
);
create policy "notifications_insert" on public.notifications for insert with check (true);
create policy "notifications_update" on public.notifications for update using (
  public.is_super_admin() or business_id = public.current_business_id()
);

-- =============================================
-- INDEXES
-- =============================================

create index idx_appointments_business_starts on public.appointments (business_id, starts_at);
create index idx_appointments_employee_starts on public.appointments (employee_id, starts_at);
create index idx_services_business_active on public.services (business_id, active);
create index idx_customers_business_phone on public.customers (business_id, phone);
create index idx_businesses_status on public.businesses (status);
create index idx_businesses_slug on public.businesses (slug);

-- Randevu çakışma kontrolü (btree_gist gerektirir)
do $$
begin
  alter table public.appointments
    add constraint no_employee_overlap
    exclude using gist (
      employee_id with =,
      tstzrange(starts_at, ends_at, '[)') with &&
    )
    where (status in ('pending', 'confirmed'));
exception when others then
  raise notice 'Overlap constraint atlandı: %', sqlerrm;
end;
$$;

-- =============================================
-- TRIGGER: Kayıt sonrası otomatik business + user oluştur
-- =============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _business_id uuid;
  _role public.user_role;
begin
  _role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'owner');
  
  -- Super admin ise sadece users tablosuna ekle
  if _role = 'super_admin' then
    insert into public.users (id, role, full_name, email)
    values (new.id, 'super_admin', coalesce(new.raw_user_meta_data->>'full_name', 'Super Admin'), new.email);
    return new;
  end if;

  -- İşletme sahibi kaydı
  if new.raw_user_meta_data->>'business_name' is not null then
    insert into public.businesses (owner_id, name, slug, category, status)
    values (
      new.id,
      new.raw_user_meta_data->>'business_name',
      new.raw_user_meta_data->>'business_slug',
      coalesce(new.raw_user_meta_data->>'category', 'small_business'),
      'pending'  -- Onay bekliyor
    )
    returning id into _business_id;

    insert into public.users (id, business_id, role, full_name, email)
    values (new.id, _business_id, 'owner', new.raw_user_meta_data->>'business_name', new.email);

    insert into public.subscriptions (business_id, plan, status)
    values (_business_id, 'free', 'active');
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- SUPER ADMIN ONAY FONKSİYONU
-- =============================================

create or replace function public.approve_business(business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Yetkiniz yok';
  end if;

  update public.businesses 
  set status = 'approved', approved_at = now(), approved_by = auth.uid()
  where id = business_id;
end;
$$;

create or replace function public.reject_business(business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Yetkiniz yok';
  end if;

  update public.businesses 
  set status = 'rejected'
  where id = business_id;
end;
$$;

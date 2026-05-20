-- ============================================
-- SIFIRDAN KURULUM - TEK SEFERDE
-- Supabase restart sonrası SQL Editor'e yapıştır
-- ============================================

-- ========== TEMİZLİK ==========
-- Trigger'ları kaldır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Fonksiyonları kaldır
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.current_business_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.approve_business(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.reject_business(uuid) CASCADE;

-- Public tabloları kaldır
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.blocked_dates CASCADE;
DROP TABLE IF EXISTS public.working_hours CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;

-- Tipleri kaldır
DROP TYPE IF EXISTS public.notification_kind CASCADE;
DROP TYPE IF EXISTS public.appointment_status CASCADE;
DROP TYPE IF EXISTS public.plan_code CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.business_status CASCADE;

-- Auth temizle (tüm test kullanıcıları sil)
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.users;

-- ========== EXTENSIONS ==========
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== TYPES ==========
CREATE TYPE public.user_role AS ENUM ('super_admin', 'owner', 'admin', 'employee');
CREATE TYPE public.plan_code AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.notification_kind AS ENUM ('appointment_created', 'appointment_reminder', 'appointment_cancelled', 'appointment_changed');
CREATE TYPE public.business_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- ========== TABLES ==========
CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'small_business',
  timezone text NOT NULL DEFAULT 'Europe/Istanbul',
  plan public.plan_code NOT NULL DEFAULT 'free',
  status public.business_status NOT NULL DEFAULT 'pending',
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'owner',
  full_name text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  title text,
  phone text,
  email text,
  role public.user_role NOT NULL DEFAULT 'employee',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  price_variable boolean NOT NULL DEFAULT false,
  color text NOT NULL DEFAULT '#0f766e',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, phone)
);

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  price_cents integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
  plan public.plan_code NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  weekday integer NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  starts_at time NOT NULL,
  ends_at time NOT NULL,
  CHECK (ends_at > starts_at),
  UNIQUE (employee_id, weekday, starts_at)
);

CREATE TABLE public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  CHECK (ends_at > starts_at)
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  kind public.notification_kind NOT NULL,
  channel text NOT NULL DEFAULT 'in_app',
  payload jsonb NOT NULL DEFAULT '{}',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ========== RLS ==========
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basit RLS: service_role her şeye erişir, anon sadece SELECT yapabilir
CREATE POLICY "allow_all_for_authenticated" ON public.businesses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_for_authenticated" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_for_authenticated" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_for_authenticated" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_for_authenticated" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_for_authenticated" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_for_authenticated" ON public.subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_for_authenticated" ON public.working_hours FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_for_authenticated" ON public.blocked_dates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_for_authenticated" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_read_for_anon" ON public.businesses FOR SELECT TO anon USING (true);
CREATE POLICY "allow_read_for_anon" ON public.services FOR SELECT TO anon USING (true);
CREATE POLICY "allow_read_for_anon" ON public.employees FOR SELECT TO anon USING (true);
CREATE POLICY "allow_read_for_anon" ON public.working_hours FOR SELECT TO anon USING (true);
CREATE POLICY "allow_read_for_anon" ON public.blocked_dates FOR SELECT TO anon USING (true);
CREATE POLICY "allow_read_for_anon" ON public.appointments FOR SELECT TO anon USING (true);
CREATE POLICY "allow_insert_for_anon" ON public.customers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_insert_for_anon" ON public.appointments FOR INSERT TO anon WITH CHECK (true);

-- ========== INDEXES ==========
CREATE INDEX idx_appointments_business ON public.appointments (business_id, starts_at);
CREATE INDEX idx_appointments_employee ON public.appointments (employee_id, starts_at);
CREATE INDEX idx_businesses_slug ON public.businesses (slug);
CREATE INDEX idx_businesses_status ON public.businesses (status);

-- ========== SUPER ADMIN OLUŞTUR ==========
DO $$
DECLARE
  _uid uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    aud, role, created_at, updated_at,
    confirmation_token, recovery_token, is_sso_user
  ) VALUES (
    _uid,
    '00000000-0000-0000-0000-000000000000',
    'gmyusuf13@gmail.com',
    crypt('47504750Ff*', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"super_admin","full_name":"Super Admin"}',
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    '',
    false
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  ) VALUES (
    _uid, _uid, 'gmyusuf13@gmail.com', 'email',
    jsonb_build_object('sub', _uid::text, 'email', 'gmyusuf13@gmail.com', 'email_verified', true),
    now(), now(), now()
  );

  INSERT INTO public.users (id, role, full_name, email)
  VALUES (_uid, 'super_admin', 'Super Admin', 'gmyusuf13@gmail.com');

  RAISE NOTICE 'TAMAM! Super admin olusturuldu. UID: %', _uid;
END;
$$;

-- ========== SCHEMA RELOAD ==========
NOTIFY pgrst, 'reload schema';

SELECT 'BASARILI! Artik gmyusuf13@gmail.com ile giris yapabilirsiniz.' AS sonuc;

-- =====================================================================
-- RANDEVORA - TEK SETUP DOSYASI (idempotent, guvenli)
-- Supabase SQL Editor'a bu dosyanin TAMAMINI yapistirip "Run" e basin.
-- - Tablolari, enum'lari, fonksiyonlari olusturur (varsa atlar)
-- - RLS'i login'i bozmayacak sekilde acar (cok-kiracili izolasyon UYGULAMA KODUNDA)
-- - Eski yetim kayitlari temizler
-- - Hizmet fiyat/sure araligi kolonlarini ekler
-- En altta opsiyonel "tum veriyi sifirla" blogu var (yorumlu).
-- =====================================================================

-- 1) EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2) ENUMS (idempotent + eksik degerleri ekle)
DO $$ BEGIN CREATE TYPE public.user_role AS ENUM ('super_admin','owner','admin','employee'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.business_status AS ENUM ('pending','approved','rejected','suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.plan_code AS ENUM ('free','starter','pro','enterprise'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','cancelled','completed','no_show'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.notification_kind AS ENUM ('appointment_created','appointment_confirmed','appointment_cancelled','reminder_24h','reminder_1h','review_request'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Eksik enum degerlerini ekle (eski semadan kalmis olabilir)
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'employee';

ALTER TYPE public.business_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE public.business_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE public.business_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE public.business_status ADD VALUE IF NOT EXISTS 'suspended';

ALTER TYPE public.plan_code ADD VALUE IF NOT EXISTS 'free';
ALTER TYPE public.plan_code ADD VALUE IF NOT EXISTS 'starter';
ALTER TYPE public.plan_code ADD VALUE IF NOT EXISTS 'pro';
ALTER TYPE public.plan_code ADD VALUE IF NOT EXISTS 'enterprise';

ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'no_show';

ALTER TYPE public.notification_kind ADD VALUE IF NOT EXISTS 'appointment_created';
ALTER TYPE public.notification_kind ADD VALUE IF NOT EXISTS 'appointment_confirmed';
ALTER TYPE public.notification_kind ADD VALUE IF NOT EXISTS 'appointment_cancelled';
ALTER TYPE public.notification_kind ADD VALUE IF NOT EXISTS 'reminder_24h';
ALTER TYPE public.notification_kind ADD VALUE IF NOT EXISTS 'reminder_1h';
ALTER TYPE public.notification_kind ADD VALUE IF NOT EXISTS 'review_request';

-- 3) TABLOLAR (idempotent)
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text,
  status public.business_status NOT NULL DEFAULT 'pending',
  plan public.plan_code NOT NULL DEFAULT 'starter',
  booking_window text DEFAULT 'weekly',
  slot_capacity integer DEFAULT 1,
  slot_merge boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  email text,
  full_name text,
  role public.user_role NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  title text,
  role public.user_role NOT NULL DEFAULT 'employee',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  duration_max_minutes integer,
  price_cents integer NOT NULL DEFAULT 0,
  price_max_cents integer,
  price_variable boolean NOT NULL DEFAULT false,
  color text DEFAULT '#0f766e',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  price_cents integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  weekday integer NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  starts_at time NOT NULL,
  ends_at time NOT NULL,
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  recurring boolean NOT NULL DEFAULT false,
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
  plan public.plan_code NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  kind public.notification_kind NOT NULL,
  channel text NOT NULL DEFAULT 'in_app',
  payload jsonb NOT NULL DEFAULT '{}',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4) YENI KOLONLAR (varsa atlar)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price_max_cents integer;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS duration_max_minutes integer;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price_variable boolean NOT NULL DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS booking_window text DEFAULT 'weekly';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS slot_capacity integer DEFAULT 1;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS slot_merge boolean DEFAULT true;
ALTER TABLE public.blocked_dates ADD COLUMN IF NOT EXISTS recurring boolean NOT NULL DEFAULT false;

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_price_range_check;
ALTER TABLE public.services ADD CONSTRAINT services_price_range_check CHECK (price_max_cents IS NULL OR price_max_cents >= price_cents);
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_duration_range_check;
ALTER TABLE public.services ADD CONSTRAINT services_duration_range_check CHECK (duration_max_minutes IS NULL OR duration_max_minutes >= duration_minutes);

-- 5) YARDIMCI FONKSIYONLAR
DROP FUNCTION IF EXISTS public.current_business_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE FUNCTION public.current_business_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $f$ SELECT business_id FROM public.users WHERE id = auth.uid() $f$;
CREATE FUNCTION public.is_super_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $f$ SELECT COALESCE((SELECT role::text = 'super_admin' FROM public.users WHERE id = auth.uid()), false) $f$;
CREATE FUNCTION public.get_user_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $f$ SELECT role::text FROM public.users WHERE id = auth.uid() $f$;

GRANT EXECUTE ON FUNCTION public.current_business_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon, authenticated, service_role;

-- 6) YETIM KAYIT TEMIZLIGI
UPDATE public.users SET business_id = NULL WHERE business_id IS NOT NULL AND business_id NOT IN (SELECT id FROM public.businesses);
DELETE FROM public.employees WHERE business_id NOT IN (SELECT id FROM public.businesses);
DELETE FROM public.services WHERE business_id NOT IN (SELECT id FROM public.businesses);
DELETE FROM public.customers WHERE business_id NOT IN (SELECT id FROM public.businesses);
DELETE FROM public.appointments WHERE business_id NOT IN (SELECT id FROM public.businesses);
DELETE FROM public.working_hours WHERE business_id NOT IN (SELECT id FROM public.businesses);
DELETE FROM public.blocked_dates WHERE business_id NOT IN (SELECT id FROM public.businesses);

-- Sahibi olmayan auth.users kayitlarini owner_id ile esle
UPDATE public.users u SET business_id = b.id FROM public.businesses b WHERE u.business_id IS NULL AND b.owner_id = u.id;

-- 7) RLS - LOGIN'I BOZMAYAN AYAR
-- Cok-kiracili izolasyon UYGULAMA KODUNDA (.eq("business_id", businessId)) yapiliyor.
-- Burada RLS'i acik tutuyoruz ki auth/login akisi hicbir zaman bozulmasin.
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ESKI POLITIKALARI KALDIR
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.businesses;
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.users;
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.employees;
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.services;
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.customers;
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.appointments;
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.subscriptions;
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.working_hours;
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.blocked_dates;
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.notifications;
DROP POLICY IF EXISTS "allow_read_for_anon" ON public.businesses;
DROP POLICY IF EXISTS "allow_read_for_anon" ON public.services;
DROP POLICY IF EXISTS "allow_read_for_anon" ON public.employees;
DROP POLICY IF EXISTS "allow_read_for_anon" ON public.working_hours;
DROP POLICY IF EXISTS "allow_read_for_anon" ON public.blocked_dates;
DROP POLICY IF EXISTS "allow_read_for_anon" ON public.appointments;
DROP POLICY IF EXISTS "allow_insert_for_anon" ON public.customers;
DROP POLICY IF EXISTS "allow_insert_for_anon" ON public.appointments;
DROP POLICY IF EXISTS "businesses_select" ON public.businesses;
DROP POLICY IF EXISTS "businesses_insert" ON public.businesses;
DROP POLICY IF EXISTS "businesses_update" ON public.businesses;
DROP POLICY IF EXISTS "businesses_delete" ON public.businesses;
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;
DROP POLICY IF EXISTS "services_select" ON public.services;
DROP POLICY IF EXISTS "services_insert" ON public.services;
DROP POLICY IF EXISTS "services_update" ON public.services;
DROP POLICY IF EXISTS "services_delete" ON public.services;
DROP POLICY IF EXISTS "employees_select" ON public.employees;
DROP POLICY IF EXISTS "employees_insert" ON public.employees;
DROP POLICY IF EXISTS "employees_update" ON public.employees;
DROP POLICY IF EXISTS "employees_delete" ON public.employees;
DROP POLICY IF EXISTS "customers_select" ON public.customers;
DROP POLICY IF EXISTS "customers_insert" ON public.customers;
DROP POLICY IF EXISTS "customers_update" ON public.customers;
DROP POLICY IF EXISTS "customers_delete" ON public.customers;
DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;
DROP POLICY IF EXISTS "hours_select" ON public.working_hours;
DROP POLICY IF EXISTS "hours_insert" ON public.working_hours;
DROP POLICY IF EXISTS "hours_update" ON public.working_hours;
DROP POLICY IF EXISTS "hours_delete" ON public.working_hours;
DROP POLICY IF EXISTS "blocks_select" ON public.blocked_dates;
DROP POLICY IF EXISTS "blocks_insert" ON public.blocked_dates;
DROP POLICY IF EXISTS "blocks_update" ON public.blocked_dates;
DROP POLICY IF EXISTS "blocks_delete" ON public.blocked_dates;
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update" ON public.subscriptions;
DROP POLICY IF EXISTS "all_access" ON public.businesses;
DROP POLICY IF EXISTS "all_access" ON public.users;
DROP POLICY IF EXISTS "all_access" ON public.employees;
DROP POLICY IF EXISTS "all_access" ON public.services;
DROP POLICY IF EXISTS "all_access" ON public.customers;
DROP POLICY IF EXISTS "all_access" ON public.appointments;
DROP POLICY IF EXISTS "all_access" ON public.working_hours;
DROP POLICY IF EXISTS "all_access" ON public.blocked_dates;
DROP POLICY IF EXISTS "all_access" ON public.notifications;
DROP POLICY IF EXISTS "all_access" ON public.subscriptions;
DROP POLICY IF EXISTS "all_access" ON public.payments;

-- TUM TABLOLAR ICIN "all_access" - hem authenticated hem anon (public booking icin gerekli)
CREATE POLICY "all_access" ON public.businesses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_access" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_access" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_access" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_access" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_access" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_access" ON public.working_hours FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_access" ON public.blocked_dates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_access" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_access" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- 8) GRANTS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 9) SCHEMA CACHE'I YENILE
NOTIFY pgrst, 'reload schema';

-- 10) DOGRULAMA
SELECT 'Setup OK' AS status,
  (SELECT count(*) FROM public.businesses) AS businesses,
  (SELECT count(*) FROM public.users) AS users,
  (SELECT count(*) FROM public.employees) AS employees,
  (SELECT count(*) FROM public.services) AS services;

-- =====================================================================
-- OPSIYONEL: TUM VERIYI SIFIRLA (super admin haric)
-- Asagidaki blogun /* ve */ yorum isaretlerini KALDIR, sonra Run et.
-- =====================================================================
/*
DELETE FROM public.notifications;
DELETE FROM public.payments;
DELETE FROM public.appointments;
DELETE FROM public.blocked_dates;
DELETE FROM public.working_hours;
DELETE FROM public.customers;
DELETE FROM public.services;
DELETE FROM public.employees;
DELETE FROM public.subscriptions;
DELETE FROM public.businesses;
DELETE FROM public.users WHERE role::text <> 'super_admin';
DELETE FROM auth.users WHERE id NOT IN (SELECT id FROM public.users);
SELECT 'Reset OK' AS status,
  (SELECT count(*) FROM public.businesses) AS businesses,
  (SELECT count(*) FROM public.users) AS users,
  (SELECT count(*) FROM auth.users) AS auth_users;
*/

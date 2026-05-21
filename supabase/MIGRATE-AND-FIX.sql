-- =====================================================
-- RANDEVORA - TUM SORUNLARI GIDER + SEMA GUNCELLE
-- Supabase SQL Editor'da TEK SEFERDE calistirin.
-- (Yorumlar ASCII, ifadeler tek satir; editor parse hatasini onlemek icin)
-- =====================================================

CREATE OR REPLACE FUNCTION public.current_business_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $f$ SELECT business_id FROM public.users WHERE id = auth.uid() $f$;

CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $f$ SELECT COALESCE((SELECT role::text = 'super_admin' FROM public.users WHERE id = auth.uid()), false) $f$;

CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $f$ SELECT role::text FROM public.users WHERE id = auth.uid() $f$;

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price_max_cents integer;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS duration_max_minutes integer;

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_price_range_check;
ALTER TABLE public.services ADD CONSTRAINT services_price_range_check CHECK (price_max_cents IS NULL OR price_max_cents >= price_cents);

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_duration_range_check;
ALTER TABLE public.services ADD CONSTRAINT services_duration_range_check CHECK (duration_max_minutes IS NULL OR duration_max_minutes >= duration_minutes);

UPDATE public.users u SET business_id = NULL WHERE u.business_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = u.business_id);

UPDATE public.users u SET business_id = b.id FROM public.businesses b WHERE u.business_id IS NULL AND b.owner_id = u.id;

DELETE FROM public.employees e WHERE NOT EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = e.business_id);

-- =========================================
-- Eski politikalari kaldir (her ihtimale karsi)
-- =========================================
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

-- =========================================
-- Yeni isletme-scoped politikalar (tek satir)
-- =========================================

CREATE POLICY "businesses_select" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "businesses_insert" ON public.businesses FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "businesses_update" ON public.businesses FOR UPDATE USING (public.is_super_admin() OR owner_id = auth.uid());
CREATE POLICY "businesses_delete" ON public.businesses FOR DELETE USING (public.is_super_admin());

CREATE POLICY "users_select" ON public.users FOR SELECT USING (public.is_super_admin() OR id = auth.uid() OR business_id = public.current_business_id());
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (public.is_super_admin() OR id = auth.uid() OR business_id = public.current_business_id());

CREATE POLICY "services_select" ON public.services FOR SELECT USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "services_insert" ON public.services FOR INSERT WITH CHECK (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "services_update" ON public.services FOR UPDATE USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "services_delete" ON public.services FOR DELETE USING (public.is_super_admin() OR business_id = public.current_business_id());

CREATE POLICY "employees_select" ON public.employees FOR SELECT USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "employees_insert" ON public.employees FOR INSERT WITH CHECK (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "employees_update" ON public.employees FOR UPDATE USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "employees_delete" ON public.employees FOR DELETE USING (public.is_super_admin() OR business_id = public.current_business_id());

CREATE POLICY "customers_select" ON public.customers FOR SELECT USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "customers_insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "customers_update" ON public.customers FOR UPDATE USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "customers_delete" ON public.customers FOR DELETE USING (public.is_super_admin() OR business_id = public.current_business_id());

CREATE POLICY "appointments_select" ON public.appointments FOR SELECT USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "appointments_delete" ON public.appointments FOR DELETE USING (public.is_super_admin() OR business_id = public.current_business_id());

CREATE POLICY "hours_select" ON public.working_hours FOR SELECT USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "hours_insert" ON public.working_hours FOR INSERT WITH CHECK (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "hours_update" ON public.working_hours FOR UPDATE USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "hours_delete" ON public.working_hours FOR DELETE USING (public.is_super_admin() OR business_id = public.current_business_id());

CREATE POLICY "blocks_select" ON public.blocked_dates FOR SELECT USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "blocks_insert" ON public.blocked_dates FOR INSERT WITH CHECK (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "blocks_update" ON public.blocked_dates FOR UPDATE USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "blocks_delete" ON public.blocked_dates FOR DELETE USING (public.is_super_admin() OR business_id = public.current_business_id());

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (public.is_super_admin() OR business_id = public.current_business_id());

CREATE POLICY "subscriptions_select" ON public.subscriptions FOR SELECT USING (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "subscriptions_insert" ON public.subscriptions FOR INSERT WITH CHECK (public.is_super_admin() OR business_id = public.current_business_id());
CREATE POLICY "subscriptions_update" ON public.subscriptions FOR UPDATE USING (public.is_super_admin() OR business_id = public.current_business_id());

NOTIFY pgrst, 'reload schema';

SELECT 'businesses' AS tablo, COUNT(*) AS adet FROM public.businesses UNION ALL SELECT 'users', COUNT(*) FROM public.users UNION ALL SELECT 'employees', COUNT(*) FROM public.employees UNION ALL SELECT 'services', COUNT(*) FROM public.services;

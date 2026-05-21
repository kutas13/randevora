-- =====================================================
-- RANDEVORA - RLS POLİTİKALARINI SIKILAŞTIR
-- (İşletmeler arası veri sızıntısını engelle)
-- Supabase SQL Editor'da çalıştırın.
-- =====================================================

-- ----------------------------------------------------------
-- SERVICES: Sadece kendi işletmenin hizmetlerini gör
-- (Public booking sunucu tarafı service-role ile çekiyor, etkilenmez)
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "services_select" ON public.services;
CREATE POLICY "services_select" ON public.services FOR SELECT USING (
  public.is_super_admin() OR business_id = public.current_business_id()
);

-- ----------------------------------------------------------
-- EMPLOYEES: Sadece kendi işletmen
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "employees_select" ON public.employees;
CREATE POLICY "employees_select" ON public.employees FOR SELECT USING (
  public.is_super_admin() OR business_id = public.current_business_id()
);

-- ----------------------------------------------------------
-- WORKING_HOURS: Sadece kendi işletmen
-- (Public booking sunucu tarafı service-role kullanıyor)
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "hours_select" ON public.working_hours;
CREATE POLICY "hours_select" ON public.working_hours FOR SELECT USING (
  public.is_super_admin() OR business_id = public.current_business_id()
);

-- ----------------------------------------------------------
-- BLOCKED_DATES: Sadece kendi işletmen
-- (Public booking sunucu tarafı service-role kullanıyor)
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "blocks_select" ON public.blocked_dates;
CREATE POLICY "blocks_select" ON public.blocked_dates FOR SELECT USING (
  public.is_super_admin() OR business_id = public.current_business_id()
);

-- ----------------------------------------------------------
-- APPOINTMENTS: Sadece kendi işletmen
-- (Public booking için /api/busy-slots endpoint'i service-role ile çalışır)
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
CREATE POLICY "appointments_select" ON public.appointments FOR SELECT USING (
  public.is_super_admin() OR business_id = public.current_business_id()
);

-- Anon randevu oluşturmalı (public-booking route'u zaten service-role kullanıyor)
-- INSERT politikası zaten using (true) olarak ayarlı, kalsın

-- ----------------------------------------------------------
-- USERS: Sadece kendi işletmenin kullanıcılarını veya kendini gör
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "users_select" ON public.users;
CREATE POLICY "users_select" ON public.users FOR SELECT USING (
  public.is_super_admin()
  OR id = auth.uid()
  OR business_id = public.current_business_id()
);

-- ----------------------------------------------------------
-- NOTIFICATIONS: Zaten doğru filtrelenmiş, dokunma
-- CUSTOMERS:     Zaten doğru filtrelenmiş, dokunma
-- BUSINESSES:    Slug bazlı arama için herkese açık, dokunma
-- ----------------------------------------------------------

-- Doğrulama: Mevcut politikaları listele
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('services', 'employees', 'working_hours', 'blocked_dates', 'appointments', 'users')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;

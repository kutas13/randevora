-- =====================================================
-- RANDEVORA - SUPER ADMIN HARİÇ TÜM VERİLERİ SIFIRLA
-- Supabase SQL Editor'da çalıştırın.
-- - Schema (tablolar, kolonlar, RLS, fonksiyonlar) korunur
-- - Super admin kullanıcısı korunur
-- - Diğer her şey silinir
-- =====================================================

-- 0) Yabancı anahtar kısıtlamalarını rahatlatmak için tek transaction'da çalış
BEGIN;

-- 1) Bağımlı tabloları sil (sıralama önemli)
--    appointments → restrict FK'leri olduğu için önce o gider
DELETE FROM public.notifications;
DELETE FROM public.appointments;

-- Payments tablosu varsa onu da temizle
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    EXECUTE 'DELETE FROM public.payments';
  END IF;
END $$;

DELETE FROM public.blocked_dates;
DELETE FROM public.working_hours;
DELETE FROM public.customers;
DELETE FROM public.services;
DELETE FROM public.employees;
DELETE FROM public.subscriptions;
DELETE FROM public.businesses;

-- 2) public.users tablosundan super admin haricindekileri sil
DELETE FROM public.users
WHERE role::text <> 'super_admin';

-- 3) auth.users içinden super admin haricindekileri sil
--    - public.users.role = 'super_admin' olan UID'leri koruyoruz
--    - auth.users CASCADE'leri ile auth.identities, sessions vs. otomatik temizlenir
DELETE FROM auth.users
WHERE id NOT IN (
  SELECT id FROM public.users WHERE role::text = 'super_admin'
);

-- 4) (Güvenlik) auth tarafında kalmış oturum/refresh token'ları temizle
DELETE FROM auth.sessions
WHERE user_id NOT IN (SELECT id FROM public.users WHERE role::text = 'super_admin');

DELETE FROM auth.refresh_tokens
WHERE user_id NOT IN (
  SELECT id::text FROM public.users WHERE role::text = 'super_admin'
);

COMMIT;

-- 5) Doğrulama raporu
SELECT 'auth.users (kalan)' AS tablo, COUNT(*) AS adet FROM auth.users
UNION ALL SELECT 'public.users (kalan)', COUNT(*) FROM public.users
UNION ALL SELECT 'businesses', COUNT(*) FROM public.businesses
UNION ALL SELECT 'employees', COUNT(*) FROM public.employees
UNION ALL SELECT 'services', COUNT(*) FROM public.services
UNION ALL SELECT 'customers', COUNT(*) FROM public.customers
UNION ALL SELECT 'appointments', COUNT(*) FROM public.appointments
UNION ALL SELECT 'working_hours', COUNT(*) FROM public.working_hours
UNION ALL SELECT 'blocked_dates', COUNT(*) FROM public.blocked_dates
UNION ALL SELECT 'subscriptions', COUNT(*) FROM public.subscriptions
UNION ALL SELECT 'notifications', COUNT(*) FROM public.notifications;

-- Kalan super admin'i göster
SELECT id, email, role, created_at FROM public.users WHERE role::text = 'super_admin';

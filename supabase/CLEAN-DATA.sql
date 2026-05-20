-- TÜM VERİLERİ TEMİZLE (Super Admin hariç)
-- Super Admin: gmyusuf13@gmail.com

-- Önce bağımlı tabloları temizle
DELETE FROM public.payments;
DELETE FROM public.blocked_dates;
DELETE FROM public.working_hours;
DELETE FROM public.appointments;
DELETE FROM public.customers;
DELETE FROM public.services;
DELETE FROM public.employees;
DELETE FROM public.businesses;

-- Users tablosundan super admin hariç herkesi sil
DELETE FROM public.users WHERE role != 'super_admin';

-- Auth tablosundan super admin hariç herkesi sil
-- (Bu Supabase Auth admin API ile yapılır, SQL ile auth.users'a erişim)
DELETE FROM auth.users WHERE email != 'gmyusuf13@gmail.com';

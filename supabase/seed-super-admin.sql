-- =============================================
-- SUPER ADMIN OLUŞTURMA (Direkt insert)
-- =============================================
-- Bu script auth.users tablosuna direkt kullanıcı ekler
-- Supabase Dashboard'a gerek kalmadan çalışır

-- Önce varsa sil
delete from public.users where email = 'gmyusuf13@gmail.com';
delete from auth.users where email = 'gmyusuf13@gmail.com';

-- Auth kullanıcı oluştur
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
values (
  gen_random_uuid(),
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
  ''
);

-- Public users tablosuna super admin olarak ekle
insert into public.users (id, role, full_name, email)
select id, 'super_admin', 'Super Admin', 'gmyusuf13@gmail.com'
from auth.users
where email = 'gmyusuf13@gmail.com'
on conflict (id) do update set role = 'super_admin';

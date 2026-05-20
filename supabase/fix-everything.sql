-- ============================================
-- TEK ADIMDA HER ŞEYİ DÜZELT
-- Bu SQL'i Supabase SQL Editor'e yapıştır ve çalıştır
-- ============================================

-- 1. Trigger'ı kaldır (sorun kaynağı)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Eski super admin kayıtlarını temizle
DELETE FROM public.users WHERE email = 'gmyusuf13@gmail.com';
DELETE FROM auth.identities WHERE provider_id = 'gmyusuf13@gmail.com';
DELETE FROM auth.users WHERE email = 'gmyusuf13@gmail.com';

-- 3. Extension kontrol
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 4. public.users tablosu yoksa oluştur
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid,
  role text NOT NULL DEFAULT 'owner',
  full_name text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Super admin kullanıcısını oluştur
DO $$
DECLARE
  _uid uuid := gen_random_uuid();
BEGIN
  -- auth.users'a ekle
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    aud, role, created_at, updated_at,
    confirmation_token, recovery_token
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
    ''
  );

  -- auth.identities'e ekle (login için zorunlu)
  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  ) VALUES (
    _uid,
    _uid,
    'gmyusuf13@gmail.com',
    'email',
    jsonb_build_object('sub', _uid::text, 'email', 'gmyusuf13@gmail.com', 'email_verified', true),
    now(),
    now(),
    now()
  );

  -- public.users'a ekle
  INSERT INTO public.users (id, role, full_name, email)
  VALUES (_uid, 'super_admin', 'Super Admin', 'gmyusuf13@gmail.com')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  RAISE NOTICE 'BASARILI! Super admin olusturuldu. UID: %', _uid;
END;
$$;

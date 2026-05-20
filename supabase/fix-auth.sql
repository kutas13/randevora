-- ============================================
-- AUTH SORUNUNU KÖK ÇÖZÜM
-- Supabase SQL Editor'de çalıştır
-- ============================================

-- 1. auth.users üzerindeki TÜM custom trigger'ları kaldır
DO $$
DECLARE
  _trig record;
BEGIN
  FOR _trig IN
    SELECT tgname FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass
    AND tgname != 'tr_check_role_exists'
    AND tgname NOT LIKE 'RI_%'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', _trig.tgname);
    RAISE NOTICE 'Trigger kaldirildi: %', _trig.tgname;
  END LOOP;
END;
$$;

-- 2. Sorunlu fonksiyonları kaldır
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.current_business_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.approve_business(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.reject_business(uuid) CASCADE;

-- 3. PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';

-- 4. Auth hooks kontrolü - varsa kaldır
DELETE FROM auth.flow_state WHERE true;

-- 5. Mevcut super admin kaydını temizle ve yeniden oluştur
DELETE FROM public.users WHERE email = 'gmyusuf13@gmail.com';
DELETE FROM auth.identities WHERE provider_id = 'gmyusuf13@gmail.com';
DELETE FROM auth.users WHERE email = 'gmyusuf13@gmail.com';

-- 6. Yeni super admin oluştur
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

  RAISE NOTICE 'Super admin olusturuldu: %', _uid;
END;
$$;

-- 7. public.users tablosu varsa ekle
DO $$
DECLARE
  _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = 'gmyusuf13@gmail.com';
  IF _uid IS NOT NULL THEN
    INSERT INTO public.users (id, role, full_name, email)
    VALUES (_uid, 'super_admin', 'Super Admin', 'gmyusuf13@gmail.com')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
    RAISE NOTICE 'public.users guncellendi';
  END IF;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'public.users tablosu yok, atlanıyor';
END;
$$;

-- 8. Schema reload tekrar
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

SELECT 'TAMAM! Simdi login sayfasindan giris yapin.' as sonuc;

-- =============================================
-- SUPER ADMIN OLUŞTURMA
-- =============================================
-- ÖNCE Supabase Dashboard'da şunu yap:
-- Authentication → Providers → Email → ENABLE et
-- 
-- Sonra bu SQL'i çalıştır:

delete from public.users where email = 'gmyusuf13@gmail.com';
delete from auth.identities where provider_id = 'gmyusuf13@gmail.com';
delete from auth.users where email = 'gmyusuf13@gmail.com';

do $$
declare
  _uid uuid := gen_random_uuid();
begin
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

  -- identity kaydı oluştur (Supabase login için gerekli)
  insert into auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    _uid,
    _uid,
    'gmyusuf13@gmail.com',
    'email',
    jsonb_build_object('sub', _uid::text, 'email', 'gmyusuf13@gmail.com', 'email_verified', true),
    now(),
    now(),
    now()
  );

  -- Public users tablosuna super admin olarak ekle
  insert into public.users (id, role, full_name, email)
  values (_uid, 'super_admin', 'Super Admin', 'gmyusuf13@gmail.com')
  on conflict (id) do update set role = 'super_admin';

  raise notice 'Super admin oluşturuldu! UID: %', _uid;
end;
$$;

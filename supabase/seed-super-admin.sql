-- =============================================
-- SUPER ADMIN OLUŞTURMA
-- =============================================
-- Bu SQL'i schema.sql'den SONRA çalıştır.
-- Önce Supabase Auth'da kullanıcıyı oluştur:
--   Email: gmyusuf13@gmail.com
--   Password: 47504750Ff*
-- 
-- Auth'da kullanıcı oluşturduktan sonra, 
-- Authentication > Users sayfasından kullanıcının UUID'sini al
-- ve aşağıdaki SQL'de <USER_UUID> yerine yapıştır.
-- =============================================

-- Yöntem 1: Eğer kullanıcı zaten auth.users'da varsa
-- (Supabase Dashboard > Authentication > Users'dan UUID'yi al)

-- INSERT INTO public.users (id, role, full_name, email)
-- VALUES ('<USER_UUID>', 'super_admin', 'Super Admin', 'gmyusuf13@gmail.com')
-- ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- Yöntem 2: Email ile otomatik bul ve ata
do $$
declare
  _uid uuid;
begin
  select id into _uid from auth.users where email = 'gmyusuf13@gmail.com' limit 1;
  
  if _uid is not null then
    insert into public.users (id, role, full_name, email)
    values (_uid, 'super_admin', 'Super Admin', 'gmyusuf13@gmail.com')
    on conflict (id) do update set role = 'super_admin';
    
    raise notice 'Super admin atandı: %', _uid;
  else
    raise notice 'Kullanıcı bulunamadı. Önce Authentication > Users sayfasından gmyusuf13@gmail.com ile kayıt oluşturun.';
  end if;
end;
$$;

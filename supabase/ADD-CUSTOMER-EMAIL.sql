-- Customers tablosuna email kolonu ekle (idempotent)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email text;

-- PostgREST schema cache yenile (Supabase API'nin yeni kolonu hemen gormesi icin)
NOTIFY pgrst, 'reload schema';

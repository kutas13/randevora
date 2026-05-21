-- =====================================================
-- KAPORA OZELLIGI ICIN SQL PATCH (mevcut DB icin)
-- Supabase SQL Editor'e yapistirip Run'a bas.
-- =====================================================

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS deposit_cents integer NOT NULL DEFAULT 0;

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS deposit_amount_cents integer NOT NULL DEFAULT 0;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'none';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS payment_ref text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS payment_token text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS customer_email text;

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_deposit_check;
ALTER TABLE public.services ADD CONSTRAINT services_deposit_check CHECK (deposit_cents >= 0 AND deposit_cents <= price_cents);

NOTIFY pgrst, 'reload schema';

SELECT 'Kapora kolonlari hazir' AS status;

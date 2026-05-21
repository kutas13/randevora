-- =====================================================
-- HIZMETLER: EN GEC RANDEVU SAATI (latest_booking_time)
-- Supabase SQL Editor'e yapistirip Run'a bas.
-- =====================================================

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS latest_booking_time time;

NOTIFY pgrst, 'reload schema';

SELECT 'En gec randevu saati kolonu hazir' AS status;

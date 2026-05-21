-- ============================================
-- HİZMETLERE FİYAT VE SÜRE ARALIĞI EKLE
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- ============================================

-- price_cents = minimum fiyat (mevcut alan)
-- price_max_cents = maksimum fiyat (null ise aralık yok, sabit fiyat)
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS price_max_cents integer;

-- duration_minutes = minimum süre (mevcut alan)
-- duration_max_minutes = maksimum süre (null ise sabit süre)
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS duration_max_minutes integer;

-- Tutarlılık kontrolleri: max her zaman min'den büyük/eşit olmalı
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_price_range_check'
  ) THEN
    ALTER TABLE public.services
    ADD CONSTRAINT services_price_range_check
    CHECK (price_max_cents IS NULL OR price_max_cents >= price_cents);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_duration_range_check'
  ) THEN
    ALTER TABLE public.services
    ADD CONSTRAINT services_duration_range_check
    CHECK (duration_max_minutes IS NULL OR duration_max_minutes >= duration_minutes);
  END IF;
END $$;

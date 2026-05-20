-- ============================================
-- RANDEVORA - TÜM EKLENMESİ GEREKEN SQL'LER
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- ============================================

-- 1. Plan enum'unu güncelle (starter ve pro ekle)
ALTER TYPE public.plan_code ADD VALUE IF NOT EXISTS 'starter';
-- Not: enum'a eklenen değerler geri alınamaz

-- 2. Booking window (randevu kabul süresi)
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS booking_window text NOT NULL DEFAULT 'weekly';

-- 3. Slot capacity (saat başı müşteri kapasitesi)
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS slot_capacity integer NOT NULL DEFAULT 1;

-- 4. Payment day (ödeme günü)
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS payment_day integer;

-- 5. Recurring leave (tekrar eden izin)
ALTER TABLE public.blocked_dates
ADD COLUMN IF NOT EXISTS recurring boolean NOT NULL DEFAULT false;

-- 5.5. Slot merge (çoklu hizmet slot birleştirme)
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS slot_merge boolean NOT NULL DEFAULT true;

-- 6. Payments tablosu (ödeme kayıtları)
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  paid_at timestamptz NOT NULL DEFAULT now(),
  period text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments için policy (herkes okuyabilsin, super admin yazabilsin)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'payments_full_access') THEN
    CREATE POLICY "payments_full_access" ON public.payments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

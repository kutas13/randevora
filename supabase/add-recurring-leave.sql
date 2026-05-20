-- Tekrar edilebilir izin desteği
ALTER TABLE public.blocked_dates
ADD COLUMN IF NOT EXISTS recurring boolean NOT NULL DEFAULT false;

-- services tablosuna price_variable kolonu ekle
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price_variable boolean NOT NULL DEFAULT false;

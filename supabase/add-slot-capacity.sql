-- Aynı saatte kaç müşteri kabul edilebileceği
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS slot_capacity integer NOT NULL DEFAULT 1;

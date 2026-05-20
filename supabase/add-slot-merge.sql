-- Slot birleştirme (çoklu hizmet seçildiğinde slotları yarıya düşürme)
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS slot_merge boolean NOT NULL DEFAULT true;

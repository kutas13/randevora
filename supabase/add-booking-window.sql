-- Booking window: haftalık/2 haftalık/aylık randevu aralığı
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS booking_window text NOT NULL DEFAULT 'weekly';
-- Değerler: 'weekly', 'biweekly', 'monthly'

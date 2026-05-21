-- =====================================================
-- BILDIRIM / WHATSAPP ALTYAPISI
-- Supabase SQL Editor'e yapistirip Run'a bas.
-- =====================================================

-- 0) Calisanlara telefon kolonu (bildirim icin)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS phone text;

-- 1) Isletme basina WhatsApp baglantisi durumu
CREATE TABLE IF NOT EXISTS public.business_whatsapp (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'disconnected', -- disconnected | pending | connected
  phone_number text,
  session_id text,            -- whatsapp-web.js client id (her isletmeye ozel)
  connected_at timestamptz,
  last_seen_at timestamptz,
  qr_token text,              -- baglanti QR'i icin gecici token
  qr_expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Isletme basina mesaj sablonlari (sadece text, basit)
CREATE TABLE IF NOT EXISTS public.business_message_templates (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_confirmation text NOT NULL DEFAULT 'Merhaba {customer_name}, randevunuz oluşturuldu. ✅\nTarih: {date} {time}\nHizmet: {services}\n{business_name}',
  customer_reminder_24h text NOT NULL DEFAULT 'Merhaba {customer_name}, yarın {time} saatinde randevunuz var. {business_name} olarak sizi bekliyoruz! 🙌',
  customer_reminder_3h text NOT NULL DEFAULT 'Merhaba {customer_name}, bugün {time} saatindeki randevunuza birkaç saat kaldı. Görüşmek üzere! 👋',
  employee_new_booking text NOT NULL DEFAULT 'Yeni randevu! 📅\n{customer_name} ({customer_phone})\nTarih: {date} {time}\nHizmet: {services}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Mesaj kuyrugu (WhatsApp/SMS/Email gonderim queue'su)
-- Mevcut "notifications" tablosu in-app bildirimler icin, bu yeni tablo dis kanallar icin.
CREATE TABLE IF NOT EXISTS public.message_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  kind text NOT NULL,         -- customer_confirmation | customer_reminder_24h | customer_reminder_3h | employee_new_booking
  channel text NOT NULL DEFAULT 'whatsapp',  -- whatsapp | sms | email
  recipient text NOT NULL,    -- telefon veya email
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',    -- pending | sending | sent | failed | skipped
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS message_queue_status_scheduled_idx
  ON public.message_queue (status, scheduled_at);
CREATE INDEX IF NOT EXISTS message_queue_business_idx
  ON public.message_queue (business_id);

-- 4) RLS - hepsi servis rolu uzerinden yonetilir (multi-tenancy app code icinde)
ALTER TABLE public.business_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bw_all ON public.business_whatsapp;
DROP POLICY IF EXISTS bmt_all ON public.business_message_templates;
DROP POLICY IF EXISTS mq_all ON public.message_queue;

CREATE POLICY bw_all ON public.business_whatsapp FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY bmt_all ON public.business_message_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY mq_all ON public.message_queue FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';

SELECT 'Bildirim/WhatsApp altyapisi hazir' AS status;

-- Ödeme takibi için payments tablosu ve businesses'a payment_day sütunu

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS payment_day integer;

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  paid_at timestamptz NOT NULL DEFAULT now(),
  period text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on payments"
  ON public.payments FOR ALL
  USING (true)
  WITH CHECK (true);

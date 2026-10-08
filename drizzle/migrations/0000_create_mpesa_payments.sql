CREATE TABLE public.mpesa_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('subscription','boost')),
  plan_name TEXT NOT NULL,
  role TEXT,
  price_kes INTEGER NOT NULL CHECK (price_kes > 0),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  listing_id UUID REFERENCES public.listings(id),
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','timeout')),
  merchant_request_id TEXT,
  checkout_request_id TEXT UNIQUE,
  mpesa_receipt TEXT,
  result_desc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mpesa_payments TO authenticated;
GRANT ALL ON public.mpesa_payments TO service_role;

ALTER TABLE public.mpesa_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own payments"
ON public.mpesa_payments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins read all payments"
ON public.mpesa_payments FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER mpesa_payments_updated_at
BEFORE UPDATE ON public.mpesa_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX mpesa_payments_user_idx ON public.mpesa_payments (user_id, created_at DESC);
CREATE INDEX mpesa_payments_checkout_idx ON public.mpesa_payments (checkout_request_id);
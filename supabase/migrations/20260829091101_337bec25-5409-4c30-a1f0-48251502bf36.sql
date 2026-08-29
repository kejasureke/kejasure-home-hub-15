ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS message_id TEXT, ADD COLUMN IF NOT EXISTS delivery_status TEXT, ADD COLUMN IF NOT EXISTS delivery_failure_reason TEXT, ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS otp_codes_message_id_idx ON public.otp_codes (message_id);

CREATE TABLE IF NOT EXISTS public.sms_delivery_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT,
  phone TEXT,
  status TEXT,
  failure_reason TEXT,
  network_code TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.sms_delivery_reports TO service_role;
ALTER TABLE public.sms_delivery_reports ENABLE ROW LEVEL SECURITY;
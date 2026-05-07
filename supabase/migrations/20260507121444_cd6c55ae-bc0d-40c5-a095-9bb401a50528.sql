-- Track OTP send attempts for server-enforced rate limiting
CREATE TABLE public.otp_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_attempts_phone_time ON public.otp_attempts (phone, created_at DESC);
CREATE INDEX idx_otp_attempts_ip_time ON public.otp_attempts (ip, created_at DESC);

ALTER TABLE public.otp_attempts ENABLE ROW LEVEL SECURITY;

-- No policies = no client access. Only the service role (edge functions) can read/write.

-- Cleanup helper (callable from edge functions via service role)
CREATE OR REPLACE FUNCTION public.purge_old_otp_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.otp_attempts WHERE created_at < now() - interval '24 hours';
$$;
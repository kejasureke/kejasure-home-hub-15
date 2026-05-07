CREATE TABLE public.otp_verify_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  ip TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_verify_phone_time ON public.otp_verify_attempts (phone, created_at DESC);
CREATE INDEX idx_otp_verify_ip_time ON public.otp_verify_attempts (ip, created_at DESC);

ALTER TABLE public.otp_verify_attempts ENABLE ROW LEVEL SECURITY;
-- No policies = deny all client access. Service role only.

CREATE OR REPLACE FUNCTION public.purge_old_otp_verify_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.otp_verify_attempts WHERE created_at < now() - interval '24 hours';
$$;

REVOKE ALL ON FUNCTION public.purge_old_otp_verify_attempts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_otp_verify_attempts() TO service_role;
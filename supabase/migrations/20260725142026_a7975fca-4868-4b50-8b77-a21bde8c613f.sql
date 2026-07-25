CREATE TABLE public.request_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  user_id UUID,
  ip TEXT,
  device_id TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_attempts_action_user_created ON public.request_attempts (action, user_id, created_at DESC);
CREATE INDEX idx_request_attempts_action_ip_created ON public.request_attempts (action, ip, created_at DESC);
CREATE INDEX idx_request_attempts_created ON public.request_attempts (created_at);

GRANT ALL ON public.request_attempts TO service_role;

ALTER TABLE public.request_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role only" ON public.request_attempts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.purge_old_request_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.request_attempts WHERE created_at < now() - interval '24 hours';
$$;

REVOKE EXECUTE ON FUNCTION public.purge_old_request_attempts() FROM PUBLIC, anon, authenticated;
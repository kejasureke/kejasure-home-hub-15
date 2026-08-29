ALTER TABLE public.kyc_submissions
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS provider_job_id text,
  ADD COLUMN IF NOT EXISTS provider_job_type integer,
  ADD COLUMN IF NOT EXISTS provider_result jsonb,
  ADD COLUMN IF NOT EXISTS confidence numeric;

CREATE UNIQUE INDEX IF NOT EXISTS kyc_submissions_provider_job_id_key
  ON public.kyc_submissions (provider_job_id)
  WHERE provider_job_id IS NOT NULL;
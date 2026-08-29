CREATE TABLE IF NOT EXISTS public.listing_image_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid,
  sha256 text NOT NULL,
  phash text,
  width int,
  height int,
  byte_size int,
  mime_type text,
  has_exif boolean NOT NULL DEFAULT false,
  has_gps boolean NOT NULL DEFAULT false,
  camera_make text,
  captured_at timestamptz,
  ai_verdict jsonb,
  checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  score int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'review' CHECK (status IN ('passed','review','rejected')),
  duplicate_of uuid REFERENCES public.listing_image_checks(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_image_checks_sha_idx ON public.listing_image_checks (sha256);
CREATE INDEX IF NOT EXISTS listing_image_checks_phash_idx ON public.listing_image_checks (phash);
CREATE INDEX IF NOT EXISTS listing_image_checks_listing_idx ON public.listing_image_checks (listing_id);
CREATE INDEX IF NOT EXISTS listing_image_checks_status_idx ON public.listing_image_checks (status, created_at DESC);

GRANT SELECT ON public.listing_image_checks TO authenticated;
GRANT ALL ON public.listing_image_checks TO service_role;

ALTER TABLE public.listing_image_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners read own image checks" ON public.listing_image_checks;
CREATE POLICY "Owners read own image checks"
ON public.listing_image_checks FOR SELECT TO authenticated
USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
CREATE TABLE public.referral_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  minutes integer NOT NULL,
  referral_id uuid REFERENCES public.referrals(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz,
  listing_id uuid
);

GRANT SELECT ON public.referral_boosts TO authenticated;
GRANT ALL ON public.referral_boosts TO service_role;

ALTER TABLE public.referral_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own referral boosts"
ON public.referral_boosts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.apply_referral_boosts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  b record;
BEGIN
  FOR b IN
    SELECT * FROM public.referral_boosts
    WHERE user_id = NEW.owner_id AND used_at IS NULL
    ORDER BY granted_at
  LOOP
    NEW.boost_expires_at := greatest(COALESCE(NEW.boost_expires_at, now()), now())
      + make_interval(mins => b.minutes);
    UPDATE public.referral_boosts
      SET used_at = now(), listing_id = NEW.id
      WHERE id = b.id;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_referral_boosts
BEFORE INSERT ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.apply_referral_boosts();
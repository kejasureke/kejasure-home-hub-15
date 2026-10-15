CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  rewarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "See own referrals" ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE OR REPLACE FUNCTION public.my_referral_code()
RETURNS text LANGUAGE sql STABLE SET search_path = public
AS $$ SELECT upper(substr(replace(auth.uid()::text,'-',''),1,8)) $$;

CREATE OR REPLACE FUNCTION public.claim_referral(_code text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE ref uuid; me uuid := auth.uid();
BEGIN
  IF me IS NULL THEN RETURN 'not_signed_in'; END IF;
  IF _code IS NULL OR length(_code) <> 8 THEN RETURN 'invalid'; END IF;
  SELECT id INTO ref FROM auth.users
    WHERE upper(substr(replace(id::text,'-',''),1,8)) = upper(_code) LIMIT 1;
  IF ref IS NULL THEN RETURN 'invalid'; END IF;
  IF ref = me THEN RETURN 'self'; END IF;
  IF EXISTS (SELECT 1 FROM public.mpesa_payments WHERE user_id = me AND status='success') THEN RETURN 'too_late'; END IF;
  INSERT INTO public.referrals (referrer_id, referred_id) VALUES (ref, me) ON CONFLICT (referred_id) DO NOTHING;
  RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION public.claim_referral(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_referral_code() TO authenticated;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS boost_kind text;
CREATE OR REPLACE FUNCTION public.protect_listing_boost()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role'
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND current_user NOT IN ('postgres','service_role','supabase_admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.boost_expires_at := NULL;
      NEW.boost_kind := NULL;
    ELSE
      IF NEW.boost_expires_at IS DISTINCT FROM OLD.boost_expires_at THEN
        NEW.boost_expires_at := OLD.boost_expires_at;
      END IF;
      IF NEW.boost_kind IS DISTINCT FROM OLD.boost_kind THEN
        NEW.boost_kind := OLD.boost_kind;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;
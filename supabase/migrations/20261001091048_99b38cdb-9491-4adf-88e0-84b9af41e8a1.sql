CREATE OR REPLACE FUNCTION public.protect_listing_boost()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role'
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND current_user NOT IN ('postgres','service_role','supabase_admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.boost_expires_at := NULL;
    ELSIF NEW.boost_expires_at IS DISTINCT FROM OLD.boost_expires_at THEN
      NEW.boost_expires_at := OLD.boost_expires_at;
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_listing_boost ON public.listings;
CREATE TRIGGER protect_listing_boost BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.protect_listing_boost();
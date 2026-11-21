-- Verification badges can only be set by the backend (OTP, Smile ID) or admins.
CREATE OR REPLACE FUNCTION public.protect_profile_verification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS NOT DISTINCT FROM 'service_role'
     OR auth.role() IS NOT DISTINCT FROM 'service_role'
     OR current_user IN ('postgres','service_role','supabase_admin')
     OR (auth.uid() IS NOT NULL AND private.has_role(auth.uid(), 'admin')) THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.id_verified := false;
    NEW.business_verified := false;
    NEW.phone_verified := false;
    NEW.kyc_tier := 'none';
  ELSE
    NEW.id_verified := OLD.id_verified;
    NEW.business_verified := OLD.business_verified;
    NEW.phone_verified := OLD.phone_verified;
    NEW.kyc_tier := OLD.kyc_tier;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.protect_profile_verification() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_profile_verification ON public.profiles;
CREATE TRIGGER protect_profile_verification BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_verification();

-- Booked nights / full slots: only answer for listings the caller can already see.
CREATE OR REPLACE FUNCTION private.listing_booked_times(_listing_id uuid, _owner uuid, _cap integer)
RETURNS TABLE(kind text, start_date date, end_date date, slot_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'stay'::text, b.check_in, coalesce(b.check_out, b.check_in + 1), NULL::timestamptz
    FROM bookings b
   WHERE b.listing_id = _listing_id AND b.type = 'short_stay' AND b.status IN ('accepted','completed')
     AND coalesce(b.check_out, b.check_in + 1) >= current_date
  UNION ALL
  SELECT 'slot_full'::text, NULL::date, NULL::date, x.slot_at
    FROM (SELECT b.slot_at, count(*) AS c FROM bookings b
           WHERE b.host_id = _owner AND b.type = 'service' AND b.status IN ('accepted','completed')
             AND b.slot_at >= now() - interval '1 day'
           GROUP BY b.slot_at) x
   WHERE x.c >= coalesce(_cap, 1)
$$;
REVOKE ALL ON FUNCTION private.listing_booked_times(uuid, uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.listing_booked_times(uuid, uuid, integer) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.listing_availability(_listing_id uuid)
RETURNS TABLE(kind text, start_date date, end_date date, slot_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT a.kind, a.start_date, a.end_date, a.slot_at
    FROM listings l
    CROSS JOIN LATERAL private.listing_booked_times(l.id, l.owner_id, l.job_capacity) a
   WHERE l.id = _listing_id
     AND (l.status = 'active' OR l.owner_id = auth.uid())
$$;
GRANT EXECUTE ON FUNCTION public.listing_availability(uuid) TO anon, authenticated, service_role;
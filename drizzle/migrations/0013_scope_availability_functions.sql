REVOKE EXECUTE ON FUNCTION private.system_close_bookings(uuid[], text) FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.expire_stale_bookings();
CREATE FUNCTION public.expire_stale_bookings()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ids uuid[]; _me uuid := auth.uid();
BEGIN
  IF _me IS NULL THEN RETURN; END IF;
  SELECT array_agg(id) INTO _ids FROM public.bookings
   WHERE status = 'requested'
     AND (guest_id = _me OR host_id = _me)
     AND created_at < now() - public.request_wait_limit(type);
  PERFORM private.system_close_bookings(_ids, 'expired');
END $$;
REVOKE ALL ON FUNCTION public.expire_stale_bookings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expire_stale_bookings() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.provider_job_load(_owner uuid)
RETURNS TABLE(open_requests integer, active_jobs integer, jobs_end timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (SELECT count(*)::int FROM bookings b WHERE b.host_id = _owner AND b.status = 'requested'),
    (SELECT count(*)::int FROM bookings b WHERE b.host_id = _owner AND b.type = 'service' AND b.status = 'accepted'
       AND b.slot_at <= now() AND b.slot_at > now() - interval '2 hours'),
    (SELECT max(b.slot_at) + interval '2 hours' FROM bookings b WHERE b.host_id = _owner AND b.type = 'service' AND b.status = 'accepted'
       AND b.slot_at <= now() AND b.slot_at > now() - interval '2 hours')
$$;
REVOKE ALL ON FUNCTION private.provider_job_load(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.provider_job_load(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.service_status(_ids uuid[])
RETURNS TABLE(listing_id uuid, busy_until timestamptz, busy_now boolean, open_requests integer, job_capacity integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT l.id,
    CASE WHEN l.busy_until > now() THEN l.busy_until
         WHEN j.active_jobs >= l.job_capacity THEN j.jobs_end END,
    coalesce(l.busy_until > now(), false) OR (j.active_jobs >= l.job_capacity),
    j.open_requests,
    l.job_capacity
  FROM listings l
  CROSS JOIN LATERAL private.provider_job_load(l.owner_id) j
  WHERE l.id = ANY(_ids) AND l.segment = 'service' AND l.status = 'active'
$$;
GRANT EXECUTE ON FUNCTION public.service_status(uuid[]) TO anon, authenticated, service_role;
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS taken_at timestamptz,
  ADD COLUMN IF NOT EXISTS busy_until timestamptz,
  ADD COLUMN IF NOT EXISTS job_capacity integer NOT NULL DEFAULT 1;
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_job_capacity_range;
ALTER TABLE public.listings ADD CONSTRAINT listings_job_capacity_range CHECK (job_capacity BETWEEN 1 AND 20);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS slot_at timestamptz,
  ADD COLUMN IF NOT EXISTS close_reason text;
CREATE INDEX IF NOT EXISTS bookings_listing_status_idx ON public.bookings (listing_id, status);
CREATE INDEX IF NOT EXISTS bookings_host_slot_idx ON public.bookings (host_id, slot_at) WHERE type = 'service';
CREATE INDEX IF NOT EXISTS bookings_requested_created_idx ON public.bookings (created_at) WHERE status = 'requested';

CREATE POLICY "Recently taken listings viewable by all" ON public.listings
  FOR SELECT USING (status = 'rented' AND taken_at > now() - interval '3 days');

CREATE OR REPLACE FUNCTION public.request_wait_limit(_type public.booking_type)
RETURNS interval LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN _type = 'service' THEN interval '2 hours' ELSE interval '24 hours' END
$$;

CREATE OR REPLACE FUNCTION private.system_close_bookings(_ids uuid[], _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _ids IS NULL OR array_length(_ids, 1) IS NULL THEN RETURN; END IF;
  PERFORM set_config('kejasure.system_close', 'on', true);
  UPDATE public.bookings SET status = 'declined', close_reason = _reason
   WHERE id = ANY(_ids) AND status = 'requested';
  PERFORM set_config('kejasure.system_close', '', true);
END $$;

CREATE OR REPLACE FUNCTION public.expire_stale_bookings()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ids uuid[];
BEGIN
  SELECT array_agg(id) INTO _ids FROM public.bookings
   WHERE status = 'requested' AND created_at < now() - public.request_wait_limit(type);
  PERFORM private.system_close_bookings(_ids, 'expired');
  RETURN coalesce(array_length(_ids, 1), 0);
END $$;
REVOKE ALL ON FUNCTION public.expire_stale_bookings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expire_stale_bookings() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.enforce_booking_rules()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _pending int; _uid uuid := auth.uid(); _l record; _taken int; _cap int;
  _system boolean := coalesce(current_setting('kejasure.system_close', true), '') = 'on';
BEGIN
  IF tg_op = 'INSERT' THEN
    IF new.guest_id = new.host_id THEN
      RAISE EXCEPTION 'You cannot book your own listing';
    END IF;
    new.status := 'requested';
    new.close_reason := NULL;
    PERFORM public.expire_stale_bookings();
    SELECT id, owner_id, status, job_capacity INTO _l FROM listings WHERE id = new.listing_id;
    IF _l.id IS NULL OR _l.status <> 'active' THEN
      RAISE EXCEPTION 'LISTING_TAKEN: This listing is no longer available.';
    END IF;
    IF EXISTS (SELECT 1 FROM bookings b WHERE b.guest_id = new.guest_id AND b.listing_id = new.listing_id AND b.status = 'requested') THEN
      RAISE EXCEPTION 'ALREADY_REQUESTED: You already have a waiting request here.';
    END IF;
    SELECT count(*) INTO _pending FROM bookings WHERE guest_id = new.guest_id AND status = 'requested';
    IF _pending >= 3 THEN
      RAISE EXCEPTION 'You already have 3 pending requests. Wait for a reply or cancel one first.';
    END IF;
    new.slot_at := NULL;
    IF new.type IN ('service', 'viewing') AND new.check_in IS NOT NULL AND new.message ~ '^Preferred time: ' THEN
      BEGIN
        new.slot_at := ((new.check_in::text || ' ' || substring(new.message FROM '^Preferred time: (.+)$'))::timestamp) AT TIME ZONE 'Africa/Nairobi';
      EXCEPTION WHEN others THEN
        new.slot_at := NULL;
      END;
    END IF;
    IF new.type = 'short_stay' THEN
      IF new.check_in IS NULL OR new.check_out IS NULL OR new.check_out <= new.check_in THEN
        RAISE EXCEPTION 'Pick a check-in and check-out date.';
      END IF;
      IF EXISTS (SELECT 1 FROM bookings b WHERE b.listing_id = new.listing_id AND b.type = 'short_stay'
                 AND b.status IN ('accepted','completed')
                 AND daterange(b.check_in, coalesce(b.check_out, b.check_in + 1)) && daterange(new.check_in, new.check_out)) THEN
        RAISE EXCEPTION 'DATES_TAKEN: Those nights are already booked. Pick other dates.';
      END IF;
    END IF;
    IF new.type = 'service' AND new.slot_at IS NOT NULL THEN
      SELECT count(*) INTO _taken FROM bookings b WHERE b.host_id = new.host_id AND b.type = 'service'
        AND b.status IN ('accepted','completed') AND b.slot_at = new.slot_at;
      IF _taken >= coalesce(_l.job_capacity, 1) THEN
        RAISE EXCEPTION 'SLOT_FULL: This provider is fully booked at that time. Pick another time or try another provider.';
      END IF;
    END IF;
    RETURN new;
  END IF;

  IF new.guest_id <> old.guest_id OR new.host_id <> old.host_id OR new.listing_id <> old.listing_id
     OR new.type <> old.type THEN
    RAISE EXCEPTION 'Booking parties cannot be changed';
  END IF;
  IF _system THEN
    IF old.status = 'requested' AND new.status = 'declined' THEN
      RETURN new;
    END IF;
    RAISE EXCEPTION 'Invalid booking status change';
  END IF;
  new.close_reason := old.close_reason;
  new.slot_at := old.slot_at;
  IF _uid IS NULL OR private.has_role(_uid, 'admin') OR new.status = old.status THEN
    RETURN new;
  END IF;
  IF _uid = old.host_id THEN
    IF NOT ((old.status = 'requested' AND new.status IN ('accepted','declined'))
         OR (old.status = 'accepted' AND new.status IN ('completed','cancelled'))) THEN
      RAISE EXCEPTION 'Invalid booking status change';
    END IF;
    IF old.status = 'requested' AND new.status = 'accepted' THEN
      IF old.created_at < now() - public.request_wait_limit(old.type) THEN
        RAISE EXCEPTION 'REQUEST_EXPIRED: This request closed because it waited too long.';
      END IF;
      IF EXISTS (SELECT 1 FROM listings l WHERE l.id = old.listing_id AND l.status <> 'active') THEN
        RAISE EXCEPTION 'LISTING_TAKEN: This listing is marked as taken. Make it available again first.';
      END IF;
      IF old.type = 'short_stay' AND EXISTS (
          SELECT 1 FROM bookings b WHERE b.listing_id = old.listing_id AND b.id <> old.id AND b.type = 'short_stay'
            AND b.status IN ('accepted','completed')
            AND daterange(b.check_in, coalesce(b.check_out, b.check_in + 1)) && daterange(old.check_in, coalesce(old.check_out, old.check_in + 1))) THEN
        RAISE EXCEPTION 'DATES_TAKEN: You already accepted a guest for some of these nights.';
      END IF;
      IF old.type = 'service' AND old.slot_at IS NOT NULL THEN
        SELECT count(*) INTO _taken FROM bookings b WHERE b.host_id = old.host_id AND b.type = 'service'
          AND b.id <> old.id AND b.status IN ('accepted','completed') AND b.slot_at = old.slot_at;
        SELECT coalesce(job_capacity, 1) INTO _cap FROM listings WHERE id = old.listing_id;
        IF _taken >= coalesce(_cap, 1) THEN
          RAISE EXCEPTION 'SLOT_FULL: You are already fully booked at this time.';
        END IF;
      END IF;
    END IF;
  ELSIF _uid = old.guest_id THEN
    IF NOT (old.status IN ('requested','accepted') AND new.status = 'cancelled') THEN
      RAISE EXCEPTION 'Only the provider can accept, decline or complete a booking';
    END IF;
  ELSE
    RAISE EXCEPTION 'Not allowed';
  END IF;
  RETURN new;
END $$;

CREATE OR REPLACE FUNCTION public.close_conflicting_requests()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ids uuid[]; _taken int; _cap int;
BEGIN
  IF new.status <> 'accepted' OR old.status = 'accepted' THEN
    RETURN new;
  END IF;
  IF new.type = 'short_stay' THEN
    SELECT array_agg(b.id) INTO _ids FROM bookings b
     WHERE b.listing_id = new.listing_id AND b.id <> new.id AND b.type = 'short_stay' AND b.status = 'requested'
       AND daterange(b.check_in, coalesce(b.check_out, b.check_in + 1)) && daterange(new.check_in, coalesce(new.check_out, new.check_in + 1));
    PERFORM private.system_close_bookings(_ids, 'dates_taken');
  ELSIF new.type = 'service' AND new.slot_at IS NOT NULL THEN
    SELECT count(*) INTO _taken FROM bookings b WHERE b.host_id = new.host_id AND b.type = 'service'
      AND b.status IN ('accepted','completed') AND b.slot_at = new.slot_at;
    SELECT coalesce(job_capacity, 1) INTO _cap FROM listings WHERE id = new.listing_id;
    IF _taken >= coalesce(_cap, 1) THEN
      SELECT array_agg(b.id) INTO _ids FROM bookings b
       WHERE b.host_id = new.host_id AND b.type = 'service' AND b.status = 'requested' AND b.slot_at = new.slot_at AND b.id <> new.id;
      PERFORM private.system_close_bookings(_ids, 'slot_full');
    END IF;
  END IF;
  RETURN new;
END $$;
DROP TRIGGER IF EXISTS bookings_close_conflicts ON public.bookings;
CREATE TRIGGER bookings_close_conflicts AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.close_conflicting_requests();

CREATE OR REPLACE FUNCTION public.notify_booking_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recipient uuid; title_text text; body_text text := 'Tap to view booking';
BEGIN
  IF TG_OP = 'INSERT' THEN
    recipient := NEW.host_id;
    title_text := 'New booking request';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.close_reason IS NOT NULL AND NEW.status = 'declined' THEN
      recipient := NEW.guest_id;
      title_text := CASE NEW.close_reason
        WHEN 'expired' THEN 'Request closed: no reply in time'
        WHEN 'taken' THEN 'This home was taken'
        WHEN 'dates_taken' THEN 'Those dates were booked'
        WHEN 'slot_full' THEN 'Provider fully booked at that time'
        ELSE 'Request closed' END;
      body_text := CASE NEW.close_reason
        WHEN 'expired' THEN 'The provider did not reply in time. Try another listing or provider.'
        WHEN 'taken' THEN 'Another tenant took this home. See similar homes nearby.'
        WHEN 'dates_taken' THEN 'Someone else booked those nights. Pick other dates.'
        WHEN 'slot_full' THEN 'That time is full. Pick another time or try another provider.'
        ELSE 'This listing is no longer available.' END;
    ELSE
      recipient := CASE WHEN auth.uid() = NEW.host_id THEN NEW.guest_id ELSE NEW.host_id END;
      title_text := 'Booking ' || NEW.status::text;
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  INSERT INTO public.notifications (user_id, type, title, body, deep_link)
  VALUES (recipient, 'booking', title_text, body_text, '/bookings/' || NEW.id);
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.listing_taken_state()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'rented' AND OLD.status IS DISTINCT FROM 'rented' THEN
    NEW.taken_at := now();
  ELSIF NEW.status <> 'rented' THEN
    NEW.taken_at := NULL;
  ELSE
    NEW.taken_at := OLD.taken_at;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS listings_taken_state ON public.listings;
CREATE TRIGGER listings_taken_state BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.listing_taken_state();

CREATE OR REPLACE FUNCTION public.listing_taken_effects()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ids uuid[]; _reason text;
BEGIN
  IF OLD.status = 'active' AND NEW.status <> 'active' THEN
    SELECT array_agg(id) INTO _ids FROM bookings WHERE listing_id = NEW.id AND status = 'requested';
    _reason := 'unavailable';
    IF NEW.status = 'rented' THEN
      _reason := 'taken';
    END IF;
    PERFORM private.system_close_bookings(_ids, _reason);
    IF NEW.status = 'rented' THEN
      INSERT INTO notifications (user_id, type, title, body, deep_link)
      SELECT s.user_id, 'listing', 'A home you saved was taken',
             LEFT(NEW.title || ' is no longer available. See similar homes nearby.', 140), '/listing/' || NEW.id
        FROM saved_listings s WHERE s.listing_id = NEW.id AND s.user_id <> NEW.owner_id;
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS listings_taken_effects ON public.listings;
CREATE TRIGGER listings_taken_effects AFTER UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.listing_taken_effects();

CREATE OR REPLACE FUNCTION public.listing_availability(_listing_id uuid)
RETURNS TABLE(kind text, start_date date, end_date date, slot_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'stay'::text, b.check_in, coalesce(b.check_out, b.check_in + 1), NULL::timestamptz
    FROM bookings b
   WHERE b.listing_id = _listing_id AND b.type = 'short_stay' AND b.status IN ('accepted','completed')
     AND coalesce(b.check_out, b.check_in + 1) >= current_date
  UNION ALL
  SELECT 'slot_full'::text, NULL::date, NULL::date, x.slot_at
    FROM (SELECT b.slot_at, count(*) AS c FROM bookings b JOIN listings l ON l.id = _listing_id
           WHERE b.host_id = l.owner_id AND b.type = 'service' AND b.status IN ('accepted','completed')
             AND b.slot_at >= now() - interval '1 day'
           GROUP BY b.slot_at) x
   WHERE x.c >= coalesce((SELECT job_capacity FROM listings WHERE id = _listing_id), 1)
$$;
GRANT EXECUTE ON FUNCTION public.listing_availability(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.service_status(_ids uuid[])
RETURNS TABLE(listing_id uuid, busy_until timestamptz, busy_now boolean, open_requests integer, job_capacity integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT l.id,
    CASE WHEN l.busy_until > now() THEN l.busy_until
         WHEN j.c >= l.job_capacity THEN j.ends END,
    coalesce(l.busy_until > now(), false) OR (j.c >= l.job_capacity),
    (SELECT count(*)::int FROM bookings b WHERE b.host_id = l.owner_id AND b.status = 'requested'),
    l.job_capacity
  FROM listings l
  CROSS JOIN LATERAL (
    SELECT count(*) AS c, max(b.slot_at) + interval '2 hours' AS ends FROM bookings b
     WHERE b.host_id = l.owner_id AND b.type = 'service' AND b.status = 'accepted'
       AND b.slot_at <= now() AND b.slot_at > now() - interval '2 hours') j
  WHERE l.id = ANY(_ids) AND l.segment = 'service'
$$;
GRANT EXECUTE ON FUNCTION public.service_status(uuid[]) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.my_incoming_requests()
RETURNS TABLE(id uuid, listing_id uuid, listing_title text, listing_segment text, listing_status text,
  type text, status text, check_in date, check_out date, guests integer, slot_at timestamptz,
  close_reason text, created_at timestamptz, guest_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.id, b.listing_id, l.title, l.segment::text, l.status::text, b.type::text, b.status::text,
         b.check_in, b.check_out, b.guests, b.slot_at, b.close_reason, b.created_at,
         coalesce(nullif(split_part(coalesce(p.full_name, ''), ' ', 1), ''), 'KejaSure tenant')
    FROM bookings b
    JOIN listings l ON l.id = b.listing_id
    LEFT JOIN profiles p ON p.id = b.guest_id
   WHERE b.host_id = auth.uid()
     AND (b.status IN ('requested','accepted') OR b.updated_at > now() - interval '3 days')
   ORDER BY (b.status = 'requested') DESC, b.created_at DESC
   LIMIT 100
$$;
REVOKE ALL ON FUNCTION public.my_incoming_requests() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_incoming_requests() TO authenticated, service_role;
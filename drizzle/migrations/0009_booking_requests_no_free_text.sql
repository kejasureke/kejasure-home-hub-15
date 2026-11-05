CREATE OR REPLACE FUNCTION public.open_conversation_for_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cid uuid;
BEGIN
  SELECT id INTO _cid FROM conversations
   WHERE listing_id IS NOT DISTINCT FROM NEW.listing_id
     AND ((participant_a = NEW.guest_id AND participant_b = NEW.host_id) OR (participant_a = NEW.host_id AND participant_b = NEW.guest_id))
   LIMIT 1;
  IF _cid IS NULL THEN
    INSERT INTO conversations (participant_a, participant_b, listing_id, last_message_at)
    VALUES (NEW.guest_id, NEW.host_id, NEW.listing_id, now());
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.strip_booking_free_text()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- Tenants may not attach notes; only the app's "Preferred time: ..." line is kept.
  IF NEW.message IS NOT NULL AND NEW.message !~ '^Preferred time: [0-9A-Za-z: ]{1,12}$' THEN
    NEW.message := NULL;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bookings_strip_free_text ON public.bookings;
CREATE TRIGGER bookings_strip_free_text BEFORE INSERT OR UPDATE OF message ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.strip_booking_free_text();
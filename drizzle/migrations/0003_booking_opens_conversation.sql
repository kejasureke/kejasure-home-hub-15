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
    VALUES (NEW.guest_id, NEW.host_id, NEW.listing_id, now()) RETURNING id INTO _cid;
  END IF;
  IF NEW.message IS NOT NULL AND length(trim(NEW.message)) > 0 THEN
    INSERT INTO messages (conversation_id, sender_id, body) VALUES (_cid, NEW.guest_id, NEW.message);
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.open_conversation_for_booking() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS bookings_open_conversation ON public.bookings;
CREATE TRIGGER bookings_open_conversation AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.open_conversation_for_booking();
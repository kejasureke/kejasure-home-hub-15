CREATE OR REPLACE FUNCTION public.my_conversations()
RETURNS TABLE(id uuid, other_id uuid, other_name text, other_verified boolean, other_role text, listing_title text, last_body text, last_at timestamptz, unread integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id,
    o.oid,
    COALESCE(NULLIF(p.full_name,''),'KejaSure member'),
    COALESCE(p.id_verified OR p.business_verified, false),
    (SELECT r.role::text FROM user_roles r WHERE r.user_id = o.oid AND r.role <> 'admin' ORDER BY r.created_at LIMIT 1),
    l.title,
    (SELECT m.body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1),
    COALESCE(c.last_message_at, c.created_at),
    (SELECT count(*)::int FROM messages m WHERE m.conversation_id = c.id AND m.sender_id <> auth.uid() AND m.read_at IS NULL)
  FROM conversations c
  CROSS JOIN LATERAL (SELECT CASE WHEN c.participant_a = auth.uid() THEN c.participant_b ELSE c.participant_a END AS oid) o
  LEFT JOIN profiles p ON p.id = o.oid
  LEFT JOIN listings l ON l.id = c.listing_id
  WHERE auth.uid() IN (c.participant_a, c.participant_b)
  ORDER BY COALESCE(c.last_message_at, c.created_at) DESC;
$$;

CREATE OR REPLACE FUNCTION public.chat_contact_phone(_conversation_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.phone FROM conversations c
  JOIN profiles p ON p.id = CASE WHEN c.participant_a = auth.uid() THEN c.participant_b ELSE c.participant_a END
  WHERE c.id = _conversation_id
    AND auth.uid() IN (c.participant_a, c.participant_b)
    AND EXISTS (SELECT 1 FROM bookings b WHERE b.status IN ('accepted','completed')
      AND ((b.guest_id = c.participant_a AND b.host_id = c.participant_b) OR (b.guest_id = c.participant_b AND b.host_id = c.participant_a)))
$$;

REVOKE ALL ON FUNCTION public.my_conversations() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.chat_contact_phone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.chat_contact_phone(uuid) TO authenticated;
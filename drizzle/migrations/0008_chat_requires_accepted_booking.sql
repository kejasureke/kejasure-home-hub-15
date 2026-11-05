create or replace function public.can_chat_in_conversation(_conversation_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from conversations c join bookings b
      on ((b.guest_id = c.participant_a and b.host_id = c.participant_b) or (b.guest_id = c.participant_b and b.host_id = c.participant_a))
     and (c.listing_id is null or b.listing_id = c.listing_id)
    where c.id = _conversation_id and b.status in ('accepted','completed'))
$$;
grant execute on function public.can_chat_in_conversation(uuid) to authenticated;

create or replace function public.enforce_chat_after_acceptance()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- allow the booking request note inserted by the booking trigger, and admins
  if pg_trigger_depth() > 1 or auth.uid() is null or private.has_role(auth.uid(), 'admin') then
    return new;
  end if;
  if not public.can_chat_in_conversation(new.conversation_id) then
    raise exception 'Chat unlocks once your booking request is accepted';
  end if;
  return new;
end $$;
revoke all on function public.enforce_chat_after_acceptance() from public, anon, authenticated;
drop trigger if exists messages_require_acceptance on public.messages;
create trigger messages_require_acceptance before insert on public.messages
for each row execute function public.enforce_chat_after_acceptance();
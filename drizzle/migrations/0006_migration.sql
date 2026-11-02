create or replace function public.enforce_booking_rules()
returns trigger language plpgsql security definer set search_path = public as $$
declare _pending int; _uid uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    if new.guest_id = new.host_id then
      raise exception 'You cannot book your own listing';
    end if;
    new.status := 'requested';
    if not exists (select 1 from subscriptions s where s.user_id = new.guest_id and s.status = 'active'
                   and (s.starts_at is null or s.starts_at <= now()) and s.ends_at > now()) then
      raise exception 'An active plan is required to request a booking';
    end if;
    select count(*) into _pending from bookings where guest_id = new.guest_id and status = 'requested';
    if _pending >= 3 then
      raise exception 'You already have 3 pending requests. Wait for a reply or cancel one first.';
    end if;
    return new;
  end if;
  -- UPDATE
  if new.guest_id <> old.guest_id or new.host_id <> old.host_id or new.listing_id <> old.listing_id
     or new.type <> old.type then
    raise exception 'Booking parties cannot be changed';
  end if;
  if _uid is null or private.has_role(_uid, 'admin') or new.status = old.status then
    return new;
  end if;
  if _uid = old.host_id then
    if not ((old.status = 'requested' and new.status in ('accepted','declined'))
         or (old.status = 'accepted' and new.status in ('completed','cancelled'))) then
      raise exception 'Invalid booking status change';
    end if;
  elsif _uid = old.guest_id then
    if not (old.status in ('requested','accepted') and new.status = 'cancelled') then
      raise exception 'Only the provider can accept, decline or complete a booking';
    end if;
  else
    raise exception 'Not allowed';
  end if;
  return new;
end $$;

drop trigger if exists enforce_booking_rules on public.bookings;
create trigger enforce_booking_rules before insert or update on public.bookings
for each row execute function public.enforce_booking_rules();
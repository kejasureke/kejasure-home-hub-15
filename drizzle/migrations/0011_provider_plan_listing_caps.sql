-- Current provider plans (tenants are free: retire tenant passes)
UPDATE public.subscription_plans SET active = false WHERE role = 'tenant';
UPDATE public.subscription_plans SET active = false
  WHERE (role, tier) IN (('landlord','Basic'),('agency','Starter'),('host','Basic'),('service_provider','Starter'),('service_provider','Growth'),('service_provider','Premium'));

INSERT INTO public.subscription_plans (role, tier, price_kes, listing_cap, features, active, sort_order) VALUES
  ('landlord','Free',0,1,'["1 active listing"]',true,0),
  ('landlord','Pro',750,5,'["5 active listings"]',true,1),
  ('landlord','Premium',1450,15,'["15 active listings"]',true,2),
  ('agency','Free',0,1,'["1 active listing"]',true,0),
  ('agency','Growth',1950,50,'["50 listings"]',true,1),
  ('agency','Enterprise',4950,NULL,'["Unlimited listings"]',true,2),
  ('host','Free',0,1,'["1 active listing"]',true,0),
  ('host','Pro',850,10,'["10 stay listings"]',true,1),
  ('host','Premium',2450,NULL,'["Unlimited listings"]',true,2),
  ('service_provider','Free',0,1,'["1 service listing"]',true,0),
  ('service_provider','Pro',300,3,'["3 service listings"]',true,1),
  ('service_provider','Business',1500,NULL,'["Unlimited service listings"]',true,2)
ON CONFLICT (role, tier) DO UPDATE
  SET price_kes = EXCLUDED.price_kes, listing_cap = EXCLUDED.listing_cap,
      features = EXCLUDED.features, active = true, sort_order = EXCLUDED.sort_order;

-- Server-side listing limit: Free = 1 active listing; paid plans use their cap (NULL = unlimited)
CREATE OR REPLACE FUNCTION public.enforce_listing_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cap integer := 1;
  _tier text := 'Free';
  _found boolean := false;
  _active integer;
BEGIN
  IF NEW.status <> 'active' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'active' THEN RETURN NEW; END IF;
  IF private.has_role(NEW.owner_id, 'admin') THEN RETURN NEW; END IF;

  SELECT p.listing_cap, p.tier, true INTO _cap, _tier, _found
  FROM public.subscriptions s
  JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE s.user_id = NEW.owner_id AND s.status = 'active'
    AND p.role <> 'tenant' AND p.price_kes > 0
    AND (s.starts_at IS NULL OR s.starts_at <= now())
    AND s.ends_at > now()
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF NOT coalesce(_found, false) THEN _cap := 1; _tier := 'Free'; END IF;
  IF _cap IS NULL THEN RETURN NEW; END IF;

  SELECT count(*) INTO _active FROM public.listings
  WHERE owner_id = NEW.owner_id AND status = 'active' AND id <> NEW.id;

  IF _active >= _cap THEN
    RAISE EXCEPTION 'LISTING_LIMIT:%:%', _tier, _cap USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_listing_cap ON public.listings;
CREATE TRIGGER enforce_listing_cap
BEFORE INSERT OR UPDATE OF status ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_cap();
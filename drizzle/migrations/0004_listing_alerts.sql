CREATE TABLE public.listing_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  segment text NOT NULL DEFAULT 'any',
  county text NOT NULL DEFAULT '',
  estate text NOT NULL DEFAULT '',
  bedrooms integer NOT NULL DEFAULT 0,
  max_price integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.listing_alerts TO authenticated;
GRANT ALL ON public.listing_alerts TO service_role;
ALTER TABLE public.listing_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts select" ON public.listing_alerts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own alerts insert" ON public.listing_alerts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own alerts delete" ON public.listing_alerts FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX listing_alerts_user_idx ON public.listing_alerts(user_id);

CREATE OR REPLACE FUNCTION public.notify_listing_alerts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status <> 'active' OR NEW.segment = 'service' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'active' THEN RETURN NEW; END IF;
  INSERT INTO notifications (user_id, type, title, body, deep_link)
  SELECT DISTINCT ON (a.user_id) a.user_id, 'listing',
    'New home matches your alert',
    LEFT(NEW.title || ' in ' || COALESCE(NULLIF(NEW.estate,''), NEW.county, 'Kenya') || ' — KES ' || to_char(NEW.price_kes, 'FM999,999,999'), 140),
    '/listing/' || NEW.id
  FROM listing_alerts a
  WHERE a.user_id <> NEW.owner_id
    AND (a.segment = 'any' OR replace(a.segment,'shortstay','short_stay') = NEW.segment::text)
    AND (a.county = '' OR lower(a.county) = lower(COALESCE(NEW.county,'')))
    AND (a.estate = '' OR lower(a.estate) = lower(COALESCE(NEW.estate,'')))
    AND (a.bedrooms = 0 OR a.bedrooms = COALESCE(NEW.bedrooms,0))
    AND (a.max_price = 0 OR NEW.price_kes <= a.max_price);
  RETURN NEW;
END $$;
CREATE TRIGGER listings_notify_alerts AFTER INSERT OR UPDATE OF status ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.notify_listing_alerts();
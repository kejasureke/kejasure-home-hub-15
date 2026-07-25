
-- =========================================================================
-- KEJASURE FULL BACKEND SCHEMA
-- =========================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ---------- Enums ----------
CREATE TYPE public.app_role AS ENUM ('tenant','landlord','agency','host','service_provider','admin');
CREATE TYPE public.listing_segment AS ENUM ('rental','short_stay','commercial','corporate','service');
CREATE TYPE public.listing_status AS ENUM ('draft','active','rented','archived','rejected');
CREATE TYPE public.verification_status AS ENUM ('unverified','pending','verified','rejected');
CREATE TYPE public.price_unit AS ENUM ('month','night','sqft','job','hour');
CREATE TYPE public.booking_type AS ENUM ('viewing','short_stay','service');
CREATE TYPE public.booking_status AS ENUM ('requested','accepted','declined','cancelled','completed');
CREATE TYPE public.kyc_tier AS ENUM ('none','phone','id','business');
CREATE TYPE public.kyc_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.subscription_status AS ENUM ('active','expired','cancelled','pending');
CREATE TYPE public.report_target AS ENUM ('listing','user','message','review');
CREATE TYPE public.report_status AS ENUM ('open','reviewing','resolved','dismissed');
CREATE TYPE public.dispute_status AS ENUM ('open','reviewing','resolved','closed');
CREATE TYPE public.review_target AS ENUM ('listing','host','provider');

-- =========================================================================
-- 1. PROFILES + ROLES
-- =========================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  county TEXT,
  preferred_language TEXT DEFAULT 'en',
  kyc_tier public.kyc_tier NOT NULL DEFAULT 'none',
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  id_verified BOOLEAN NOT NULL DEFAULT false,
  business_verified BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users can add own non-admin role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role <> 'admin');
CREATE POLICY "Admins manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'tenant')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 2. LISTINGS
-- =========================================================================
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  segment public.listing_segment NOT NULL,
  subcategory TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price_kes NUMERIC(12,2) NOT NULL,
  price_unit public.price_unit NOT NULL DEFAULT 'month',
  bedrooms INT,
  bathrooms INT,
  sqft INT,
  county TEXT,
  subcounty TEXT,
  ward TEXT,
  estate TEXT,
  landmark TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.listing_status NOT NULL DEFAULT 'draft',
  verification public.verification_status NOT NULL DEFAULT 'unverified',
  boost_expires_at TIMESTAMPTZ,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active listings viewable by all" ON public.listings FOR SELECT USING (status = 'active' OR auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners insert own listings" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own listings" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners delete own listings" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));
CREATE INDEX listings_segment_status_idx ON public.listings(segment, status);
CREATE INDEX listings_owner_idx ON public.listings(owner_id);
CREATE INDEX listings_location_idx ON public.listings(county, subcounty, estate);
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listing_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listing_images TO authenticated;
GRANT ALL ON public.listing_images TO service_role;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listing images viewable by all" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "Owners manage listing images" ON public.listing_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid()));

CREATE TABLE public.listing_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listing_videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listing_videos TO authenticated;
GRANT ALL ON public.listing_videos TO service_role;
ALTER TABLE public.listing_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listing videos viewable by all" ON public.listing_videos FOR SELECT USING (true);
CREATE POLICY "Owners manage listing videos" ON public.listing_videos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid()));

CREATE TABLE public.neighborhood_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county TEXT NOT NULL,
  estate TEXT NOT NULL,
  safety INT, water INT, noise INT, transport INT,
  avg_rent_kes NUMERIC(12,2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (county, estate)
);
GRANT SELECT ON public.neighborhood_scores TO anon, authenticated;
GRANT ALL ON public.neighborhood_scores TO service_role;
ALTER TABLE public.neighborhood_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Neighborhood scores viewable by all" ON public.neighborhood_scores FOR SELECT USING (true);
CREATE POLICY "Admins manage neighborhood scores" ON public.neighborhood_scores FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.saved_listings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_listings TO authenticated;
GRANT ALL ON public.saved_listings TO service_role;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorites" ON public.saved_listings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.recently_viewed (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recently_viewed TO authenticated;
GRANT ALL ON public.recently_viewed TO service_role;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recents" ON public.recently_viewed FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  notify BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_searches TO authenticated;
GRANT ALL ON public.saved_searches TO service_role;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own searches" ON public.saved_searches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER saved_searches_updated_at BEFORE UPDATE ON public.saved_searches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  price_kes NUMERIC(12,2) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_history TO anon, authenticated;
GRANT ALL ON public.price_history TO service_role;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Price history viewable by all" ON public.price_history FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.track_price_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.price_kes IS DISTINCT FROM OLD.price_kes THEN
    INSERT INTO public.price_history (listing_id, price_kes) VALUES (NEW.id, NEW.price_kes);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER listings_track_price AFTER UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.track_price_change();

CREATE TABLE public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  threshold_kes NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_alerts TO authenticated;
GRANT ALL ON public.price_alerts TO service_role;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own alerts" ON public.price_alerts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 3. BOOKINGS
-- =========================================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.booking_type NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'requested',
  check_in DATE,
  check_out DATE,
  guests INT DEFAULT 1,
  message TEXT,
  contact_unlocked_at TIMESTAMPTZ,
  total_kes NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = guest_id OR auth.uid() = host_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Guests create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = guest_id);
CREATE POLICY "Participants update bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = guest_id OR auth.uid() = host_id) WITH CHECK (auth.uid() = guest_id OR auth.uid() = host_id);
CREATE INDEX bookings_guest_idx ON public.bookings(guest_id, status);
CREATE INDEX bookings_host_idx ON public.bookings(host_id, status);
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.booking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.booking_events TO authenticated;
GRANT ALL ON public.booking_events TO service_role;
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view events" ON public.booking_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.guest_id = auth.uid() OR b.host_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "Participants create events" ON public.booking_events FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = actor_id AND EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.guest_id = auth.uid() OR b.host_id = auth.uid()))
);

CREATE OR REPLACE FUNCTION public.log_booking_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.booking_events (booking_id, event, actor_id) VALUES (NEW.id, 'requested', NEW.guest_id);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.booking_events (booking_id, event, actor_id) VALUES (NEW.id, NEW.status::text, auth.uid());
    IF NEW.status = 'accepted' AND NEW.contact_unlocked_at IS NULL THEN
      NEW.contact_unlocked_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER bookings_log_status_ins AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.log_booking_status();
CREATE TRIGGER bookings_log_status_upd BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.log_booking_status();

-- =========================================================================
-- 4. CHAT
-- =========================================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  muted_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  archived_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view conversations" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() IN (participant_a, participant_b));
CREATE POLICY "Users start conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (participant_a, participant_b));
CREATE POLICY "Participants update conversations" ON public.conversations FOR UPDATE TO authenticated USING (auth.uid() IN (participant_a, participant_b)) WITH CHECK (auth.uid() IN (participant_a, participant_b));
CREATE INDEX conv_a_idx ON public.conversations(participant_a, last_message_at DESC);
CREATE INDEX conv_b_idx ON public.conversations(participant_b, last_message_at DESC);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT,
  attachment_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view messages" ON public.messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() IN (c.participant_a, c.participant_b))
);
CREATE POLICY "Participants send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() IN (c.participant_a, c.participant_b))
);
CREATE POLICY "Recipients mark read" ON public.messages FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() IN (c.participant_a, c.participant_b))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() IN (c.participant_a, c.participant_b))
);
CREATE INDEX messages_conv_idx ON public.messages(conversation_id, created_at);
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

CREATE OR REPLACE FUNCTION public.bump_conversation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER messages_bump_conv AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.bump_conversation();

-- =========================================================================
-- 5. SUBSCRIPTIONS & BOOSTS
-- =========================================================================
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  tier TEXT NOT NULL,
  price_kes NUMERIC(10,2) NOT NULL,
  listing_cap INT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE (role, tier)
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans viewable by all" ON public.subscription_plans FOR SELECT USING (active);
CREATE POLICY "Admins manage plans" ON public.subscription_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.subscription_plans (role, tier, price_kes, listing_cap, features, sort_order) VALUES
  ('tenant','Free',0,NULL,'["Browse listings","Save favorites"]',0),
  ('tenant','Basic',30,NULL,'["Contact 3 landlords/day","Price alerts"]',1),
  ('tenant','Plus',50,NULL,'["Unlimited contacts","Priority support"]',2),
  ('tenant','Premium',100,NULL,'["Verified badge","AI match","Neighborhood insights"]',3),
  ('landlord','Basic',250,1,'["1 listing","Basic analytics"]',1),
  ('landlord','Pro',1000,5,'["5 listings","Boost credits","Advanced analytics"]',2),
  ('landlord','Premium',1500,15,'["15 listings","Priority placement","Verified badge"]',3),
  ('agency','Starter',1000,10,'["10 listings","2 agents","Basic branding"]',1),
  ('agency','Growth',2500,30,'["30 listings","5 agents","Custom branding"]',2),
  ('agency','Enterprise',4500,NULL,'["Unlimited listings","Unlimited agents","Corporate & commercial access"]',3),
  ('host','Basic',500,3,'["3 short stays","Calendar sync"]',1),
  ('host','Pro',1000,10,'["10 short stays","Featured placement"]',2),
  ('host','Premium',1500,NULL,'["Unlimited stays","Priority + corporate access"]',3),
  ('service_provider','Starter',300,NULL,'["Basic profile","5 bookings/mo"]',1),
  ('service_provider','Growth',800,NULL,'["Featured in category","20 bookings/mo"]',2),
  ('service_provider','Pro',1000,NULL,'["Verified badge","Unlimited bookings"]',3),
  ('service_provider','Premium',1500,NULL,'["Top placement","Priority leads"]',4);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status public.subscription_status NOT NULL DEFAULT 'pending',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  mpesa_receipt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subs" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own subs" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users cancel own subs" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER subs_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.boost_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package TEXT NOT NULL,
  price_kes NUMERIC(10,2) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  mpesa_receipt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.boost_purchases TO authenticated;
GRANT ALL ON public.boost_purchases TO service_role;
ALTER TABLE public.boost_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view own boosts" ON public.boost_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners create own boosts" ON public.boost_purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 6. KYC / VERIFICATION / TRUST
-- =========================================================================
CREATE TABLE public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier public.kyc_tier NOT NULL,
  id_type TEXT,
  id_number TEXT,
  selfie_url TEXT,
  id_photo_url TEXT,
  business_docs JSONB DEFAULT '[]'::jsonb,
  status public.kyc_status NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.kyc_submissions TO authenticated;
GRANT ALL ON public.kyc_submissions TO service_role;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own KYC" ON public.kyc_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users submit own KYC" ON public.kyc_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update KYC" ON public.kyc_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER kyc_updated_at BEFORE UPDATE ON public.kyc_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.listing_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  photo_checks JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.verification_status NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.listing_verifications TO authenticated;
GRANT ALL ON public.listing_verifications TO service_role;
ALTER TABLE public.listing_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view verifications" ON public.listing_verifications FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid()) OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "Owners submit verifications" ON public.listing_verifications FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid())
);
CREATE POLICY "Admins update verifications" ON public.listing_verifications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type public.report_target NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  status public.report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporters view own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users file reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  opener_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  status public.dispute_status NOT NULL DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.disputes TO authenticated;
GRANT ALL ON public.disputes TO service_role;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view disputes" ON public.disputes FOR SELECT TO authenticated USING (
  auth.uid() = opener_id OR public.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.guest_id = auth.uid() OR b.host_id = auth.uid()))
);
CREATE POLICY "Participants open disputes" ON public.disputes FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = opener_id AND EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.guest_id = auth.uid() OR b.host_id = auth.uid()))
);
CREATE POLICY "Admins update disputes" ON public.disputes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- 7. REVIEWS
-- =========================================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type public.review_target NOT NULL,
  target_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  helpful_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable by all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = reviewer_id OR public.has_role(auth.uid(),'admin'));
CREATE INDEX reviews_target_idx ON public.reviews(target_type, target_id);
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.review_helpful (
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.review_helpful TO authenticated;
GRANT ALL ON public.review_helpful TO service_role;
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own helpful" ON public.review_helpful FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.bump_review_helpful()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.review_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER review_helpful_bump AFTER INSERT OR DELETE ON public.review_helpful FOR EACH ROW EXECUTE FUNCTION public.bump_review_helpful();

-- =========================================================================
-- 8. NOTIFICATIONS
-- =========================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  deep_link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

CREATE OR REPLACE FUNCTION public.notify_booking_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recipient UUID; title_text TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    recipient := NEW.host_id;
    title_text := 'New booking request';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    recipient := CASE WHEN auth.uid() = NEW.host_id THEN NEW.guest_id ELSE NEW.host_id END;
    title_text := 'Booking ' || NEW.status::text;
  ELSE
    RETURN NEW;
  END IF;
  INSERT INTO public.notifications (user_id, type, title, body, deep_link)
  VALUES (recipient, 'booking', title_text, 'Tap to view booking', '/bookings/' || NEW.id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER bookings_notify_ins AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.notify_booking_change();
CREATE TRIGGER bookings_notify_upd AFTER UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.notify_booking_change();

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recipient UUID;
BEGIN
  SELECT CASE WHEN c.participant_a = NEW.sender_id THEN c.participant_b ELSE c.participant_a END
    INTO recipient FROM public.conversations c WHERE c.id = NEW.conversation_id;
  IF recipient IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, deep_link)
    VALUES (recipient, 'message', 'New message', LEFT(COALESCE(NEW.body,'Attachment'), 100), '/chat/' || NEW.conversation_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER messages_notify AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

-- =========================================================================
-- 9. ADMIN AUDIT
-- =========================================================================
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_actions TO authenticated;
GRANT ALL ON public.admin_actions TO service_role;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit" ON public.admin_actions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins write audit" ON public.admin_actions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND auth.uid() = admin_id);

-- =========================================================================
-- 10. STORAGE OBJECT POLICIES (buckets created out-of-band)
-- =========================================================================
CREATE POLICY "Avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Listing media public read" ON storage.objects FOR SELECT USING (bucket_id = 'listing-media');
CREATE POLICY "Owners upload listing media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners update listing media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'listing-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners delete listing media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listing-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners read own kyc" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'kyc-docs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "Owners upload own kyc" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'kyc-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners update own kyc" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'kyc-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Participants read chat attachments" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'chat-attachments' AND EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id::text = (storage.foldername(name))[1] AND auth.uid() IN (c.participant_a, c.participant_b)
  )
);
CREATE POLICY "Participants upload chat attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'chat-attachments' AND EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id::text = (storage.foldername(name))[1] AND auth.uid() IN (c.participant_a, c.participant_b)
  )
);

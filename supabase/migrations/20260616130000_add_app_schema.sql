-- Add application data schema for KejaSure

create extension if not exists pgcrypto;

-- enum types
create type public.user_role as enum (
  'tenant',
  'landlord',
  'agency',
  'stayhost',
  'serviceprovider'
);

create type public.listing_type as enum (
  'rental',
  'shortstay',
  'commercial',
  'service',
  'corporate'
);

create type public.subscription_status as enum (
  'pending',
  'active',
  'cancelled',
  'expired',
  'failed'
);

create type public.payment_status as enum (
  'pending',
  'completed',
  'failed',
  'refunded'
);

create type public.booking_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'rejected'
);

create type public.dispute_status as enum (
  'open',
  'investigating',
  'resolved',
  'closed'
);

create type public.dispute_category as enum (
  'listing-mismatch',
  'billing',
  'fraud',
  'other'
);

-- OTP codes table (stores generated OTP codes for phone verification)
create table public.otp_codes (
  id uuid not null primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index idx_otp_codes_phone on public.otp_codes(phone);
create index idx_otp_codes_expires on public.otp_codes(expires_at);

-- Profiles
create table public.profiles (
  id uuid not null primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  phone text unique,
  role public.user_role not null default 'tenant',
  first_name text,
  last_name text,
  display_name text,
  avatar text,
  agency_name text,
  service_category text,
  preferred_counties text[],
  budget_range text,
  property_count text,
  stay_type text,
  bio text,
  kyc_verified boolean not null default false,
  plan_name text,
  plan_started_at timestamptz,
  plan_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_phone on public.profiles(phone);
create index idx_profiles_role on public.profiles(role);

-- Subscription plans
create table public.subscription_plans (
  id uuid not null primary key default gen_random_uuid(),
  role public.user_role not null,
  name text not null,
  price integer not null default 0,
  duration text not null,
  billing_interval text not null,
  features text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_subscription_plans_role_name on public.subscription_plans(role, name);

-- Subscriptions
create table public.subscriptions (
  id uuid not null primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id) on delete set null,
  plan_name text not null,
  role public.user_role not null,
  price integer not null,
  currency text not null default 'KES',
  duration text not null,
  status public.subscription_status not null default 'pending',
  auto_renew boolean not null default false,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_profile on public.subscriptions(profile_id);
create index idx_subscriptions_status on public.subscriptions(status);

-- Listings
create table public.listings (
  id uuid not null primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  listing_type public.listing_type not null default 'rental',
  commercial_type text,
  rental_type text,
  stay_type text,
  corporate_type text,
  service_category text,
  price integer,
  price_unit text default '/mo',
  bedrooms integer,
  bathrooms integer,
  county text,
  subcounty text,
  estate text,
  amenities text[],
  video_url text,
  furnished boolean not null default false,
  pet_friendly boolean not null default false,
  deposit text,
  move_in_date date,
  size text,
  size_sqft text,
  floor text,
  featured boolean not null default false,
  boost_days integer not null default 0,
  availability text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_listings_owner on public.listings(owner_id);
create index idx_listings_county on public.listings(county);
create index idx_listings_status on public.listings(status);

-- Listing media
create table public.listing_photos (
  id uuid not null primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  caption text,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_listing_photos_listing on public.listing_photos(listing_id);

-- Service provider portfolio
create table public.portfolio_projects (
  id uuid not null primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  photos text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_portfolio_projects_profile on public.portfolio_projects(profile_id);

-- Bookings
create table public.bookings (
  id uuid not null primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  check_in date,
  check_out date,
  guests integer,
  status public.booking_status not null default 'pending',
  amount integer,
  currency text not null default 'KES',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bookings_listing on public.bookings(listing_id);
create index idx_bookings_requester on public.bookings(requester_id);
create index idx_bookings_owner on public.bookings(owner_id);

-- Reviews
create table public.reviews (
  id uuid not null primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete set null,
  target_profile_id uuid not null references public.profiles(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  message text,
  created_at timestamptz not null default now()
);

create index idx_reviews_target on public.reviews(target_profile_id);

-- Disputes
create table public.disputes (
  id uuid not null primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  category public.dispute_category not null default 'other',
  description text not null,
  status public.dispute_status not null default 'open',
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_disputes_profile on public.disputes(profile_id);
create index idx_disputes_status on public.disputes(status);

-- Documents for verification
create table public.documents (
  id uuid not null primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  url text not null,
  status text not null default 'pending',
  metadata jsonb,
  uploaded_at timestamptz not null default now()
);

create index idx_documents_profile on public.documents(profile_id);

-- Payments
create table public.payments (
  id uuid not null primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  amount integer not null,
  currency text not null default 'KES',
  method text not null,
  status public.payment_status not null default 'pending',
  transaction_id text,
  metadata jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payments_profile on public.payments(profile_id);
create index idx_payments_status on public.payments(status);

create unique index idx_profiles_auth_user_id on public.profiles(auth_user_id);

-- Enable row-level security for application tables.
alter table public.otp_codes enable row level security;
alter table public.profiles enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.disputes enable row level security;
alter table public.documents enable row level security;
alter table public.payments enable row level security;

create or replace function public.current_profile_id()
returns uuid
language sql stable as $$
  select id from public.profiles where auth_user_id = auth.uid()::uuid limit 1;
$$;

create or replace function public.current_profile()
returns public.profiles
language sql stable as $$
  select * from public.profiles where auth_user_id = auth.uid()::uuid limit 1;
$$;

create policy "Profiles can view and manage own profile" on public.profiles
  for all
  using (auth.uid()::uuid = auth_user_id)
  with check (auth.uid()::uuid = auth_user_id);

create policy "Subscription plans are public" on public.subscription_plans
  for select using (true);

create policy "Subscriptions can be managed by subscription owner" on public.subscriptions
  for select using (profile_id = public.current_profile_id());
create policy "Subscriptions can be created by profile owner" on public.subscriptions
  for insert with check (profile_id = public.current_profile_id());
create policy "Subscriptions can be updated by subscription owner" on public.subscriptions
  for update using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());
create policy "Subscriptions can be deleted by subscription owner" on public.subscriptions
  for delete using (profile_id = public.current_profile_id());

create policy "Listings are public" on public.listings
  for select using (true);
create policy "Listings owner can insert own listings" on public.listings
  for insert with check (owner_id = public.current_profile_id());
create policy "Listings owner can update own listings" on public.listings
  for update using (owner_id = public.current_profile_id())
  with check (owner_id = public.current_profile_id());
create policy "Listings owner can delete own listings" on public.listings
  for delete using (owner_id = public.current_profile_id());

create policy "Listing photos are public" on public.listing_photos
  for select using (true);
create policy "Listing photos can only be managed by listing owner" on public.listing_photos
  for insert with check (
    exists(
      select 1 from public.listings
      where id = listing_id
        and owner_id = public.current_profile_id()
    )
  );
create policy "Listing photos can only be updated by listing owner" on public.listing_photos
  for update using (
    exists(
      select 1 from public.listings
      where id = listing_id
        and owner_id = public.current_profile_id()
    )
  ) with check (
    exists(
      select 1 from public.listings
      where id = listing_id
        and owner_id = public.current_profile_id()
    )
  );
create policy "Listing photos can only be deleted by listing owner" on public.listing_photos
  for delete using (
    exists(
      select 1 from public.listings
      where id = listing_id
        and owner_id = public.current_profile_id()
    )
  );

create policy "Portfolio projects can only be managed by profile owner" on public.portfolio_projects
  for all
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

create policy "Bookings can be viewed by requester or owner" on public.bookings
  for select using (
    requester_id = public.current_profile_id()
    or owner_id = public.current_profile_id()
  );
create policy "Bookings can be created by requesters" on public.bookings
  for insert with check (
    requester_id = public.current_profile_id()
    and owner_id = (
      select owner_id from public.listings where id = listing_id
    )
  );
create policy "Bookings can be updated by requester or owner" on public.bookings
  for update using (
    requester_id = public.current_profile_id()
    or owner_id = public.current_profile_id()
  ) with check (
    requester_id = public.current_profile_id()
    or owner_id = public.current_profile_id()
  );
create policy "Bookings can be deleted by requester or owner" on public.bookings
  for delete using (
    requester_id = public.current_profile_id()
    or owner_id = public.current_profile_id()
  );

create policy "Reviews are public" on public.reviews
  for select using (true);
create policy "Reviews can be created by author" on public.reviews
  for insert with check (author_id = public.current_profile_id());
create policy "Reviews can be updated or deleted by author" on public.reviews
  for update using (author_id = public.current_profile_id())
  with check (author_id = public.current_profile_id());
create policy "Reviews can be deleted by author" on public.reviews
  for delete using (author_id = public.current_profile_id());

create policy "Disputes can be viewed only by owner" on public.disputes
  for select using (profile_id = public.current_profile_id());
create policy "Disputes can be created by owner" on public.disputes
  for insert with check (profile_id = public.current_profile_id());
create policy "Disputes can be updated or deleted by owner" on public.disputes
  for update using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());
create policy "Disputes can be deleted by owner" on public.disputes
  for delete using (profile_id = public.current_profile_id());

create policy "Documents can be managed only by owner" on public.documents
  for all
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

create policy "Payments can be managed only by profile owner" on public.payments
  for all
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

create or replace function public.upsert_profile(
  p_phone text default null,
  p_role public.user_role default 'tenant',
  p_first_name text default null,
  p_last_name text default null,
  p_display_name text default null,
  p_avatar text default null,
  p_agency_name text default null,
  p_service_category text default null,
  p_preferred_counties text[] default null,
  p_budget_range text default null,
  p_property_count text default null,
  p_stay_type text default null,
  p_bio text default null
)
returns setof public.profiles
language plpgsql security invoker as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  return query
    insert into public.profiles(
      auth_user_id,
      phone,
      role,
      first_name,
      last_name,
      display_name,
      avatar,
      agency_name,
      service_category,
      preferred_counties,
      budget_range,
      property_count,
      stay_type,
      bio
    ) values (
      auth.uid()::uuid,
      p_phone,
      p_role,
      p_first_name,
      p_last_name,
      p_display_name,
      p_avatar,
      p_agency_name,
      p_service_category,
      p_preferred_counties,
      p_budget_range,
      p_property_count,
      p_stay_type,
      p_bio
    ) on conflict (auth_user_id) do update set
      phone = coalesce(excluded.phone, public.profiles.phone),
      role = coalesce(excluded.role, public.profiles.role),
      first_name = coalesce(excluded.first_name, public.profiles.first_name),
      last_name = coalesce(excluded.last_name, public.profiles.last_name),
      display_name = coalesce(excluded.display_name, public.profiles.display_name),
      avatar = coalesce(excluded.avatar, public.profiles.avatar),
      agency_name = coalesce(excluded.agency_name, public.profiles.agency_name),
      service_category = coalesce(excluded.service_category, public.profiles.service_category),
      preferred_counties = coalesce(excluded.preferred_counties, public.profiles.preferred_counties),
      budget_range = coalesce(excluded.budget_range, public.profiles.budget_range),
      property_count = coalesce(excluded.property_count, public.profiles.property_count),
      stay_type = coalesce(excluded.stay_type, public.profiles.stay_type),
      bio = coalesce(excluded.bio, public.profiles.bio),
      updated_at = now()
    returning *;
end;
$$;

create or replace function public.create_subscription(
  p_plan_name text,
  p_role public.user_role,
  p_price integer,
  p_duration text,
  p_plan_id uuid default null,
  p_auto_renew boolean default false,
  p_currency text default 'KES',
  p_metadata jsonb default null
)
returns setof public.subscriptions
language plpgsql security invoker as $$
declare
  current_profile uuid := public.current_profile_id();
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if current_profile is null then
    raise exception 'profile not found';
  end if;
  return query
    insert into public.subscriptions(
      profile_id,
      plan_id,
      plan_name,
      role,
      price,
      currency,
      duration,
      status,
      auto_renew,
      started_at,
      metadata
    ) values (
      current_profile,
      p_plan_id,
      p_plan_name,
      p_role,
      p_price,
      p_currency,
      p_duration,
      'pending',
      p_auto_renew,
      now(),
      p_metadata
    ) returning *;
end;
$$;

create or replace function public.create_payment(
  p_amount integer,
  p_method text,
  p_subscription_id uuid default null,
  p_listing_id uuid default null,
  p_currency text default 'KES',
  p_status public.payment_status default 'completed',
  p_transaction_id text default null,
  p_metadata jsonb default null
)
returns setof public.payments
language plpgsql security invoker as $$
declare
  current_profile uuid := public.current_profile_id();
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if current_profile is null then
    raise exception 'profile not found';
  end if;
  return query
    insert into public.payments(
      profile_id,
      subscription_id,
      listing_id,
      amount,
      currency,
      method,
      status,
      transaction_id,
      metadata,
      processed_at
    ) values (
      current_profile,
      p_subscription_id,
      p_listing_id,
      p_amount,
      p_currency,
      p_method,
      p_status,
      p_transaction_id,
      p_metadata,
      now()
    ) returning *;
end;
$$;

create or replace function public.cancel_subscription(
  p_subscription_id uuid
)
returns setof public.subscriptions
language plpgsql security invoker as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  return query
    update public.subscriptions
    set status = 'cancelled', cancelled_at = now(), updated_at = now()
    where id = p_subscription_id
      and profile_id = public.current_profile_id()
    returning *;
end;
$$;

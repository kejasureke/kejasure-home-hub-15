
# KejaSure Backend Build Plan

Wire the entire app to Lovable Cloud: auth + profiles, role management, listings across all segments, bookings, chat, payments (subscriptions/boosts only — no rent/escrow), reviews, KYC, notifications, saved searches, price alerts, disputes, reports, admin. Keep the current UI intact; swap local-storage stores for real data only where the user-facing screen already expects persistence.

## 1. Auth & Profiles

- Email/password + Google (default). Phone OTP flow keeps existing `otp-send` / `otp-verify` edge functions; on success, links phone to `auth.users` via edge function using service role.
- `profiles` (1:1 with `auth.users`): full_name, phone, avatar_url, county, preferred_language, kyc_tier (0/1/2/3), phone_verified, id_verified, business_verified, onboarding_completed.
- `user_roles` + `app_role` enum: `tenant | landlord | agency | host | service_provider | admin`. Multiple rows allowed (role switcher). `has_role()` security-definer function.
- Trigger `handle_new_user()` creates profile + default `tenant` role on signup.

## 2. Listings (all segments)

- `listings`: owner_id, segment (`rental | short_stay | commercial | corporate | service`), subcategory, title, description, price_kes, price_unit (`month | night | sqft | job`), bedrooms, bathrooms, sqft, county, subcounty, ward, estate, lat, lng, amenities (jsonb), status (`draft | active | rented | archived | rejected`), verification_status, boost_expires_at, view_count, created_at.
- `listing_images`: listing_id, url, sort_order, is_cover.
- `listing_videos`: listing_id, url, chapters (jsonb).
- `neighborhood_scores` (read-only reference): estate, safety, water, noise, transport, updated_at.
- `saved_listings` (favorites): user_id, listing_id.
- `recently_viewed`: user_id, listing_id, viewed_at.
- `price_history`: listing_id, price_kes, changed_at (trigger on listings update).
- `price_alerts`: user_id, listing_id, threshold_kes.
- `saved_searches`: user_id, name, filters (jsonb), notify.

## 3. Bookings & Requests

- `bookings`: listing_id, guest_id, host_id, type (`viewing | short_stay | service`), status (`requested | accepted | declined | cancelled | completed`), check_in, check_out, guests, message, contact_unlocked_at.
- `booking_events`: booking_id, event, actor_id, created_at (timeline stepper).
- RLS: guest and host see their own; contact info only exposed after `accepted`.

## 4. Chat

- `conversations`: participant_a, participant_b, listing_id?, last_message_at, muted_by (jsonb).
- `messages`: conversation_id, sender_id, body, attachment_url, read_at.
- Realtime enabled on `messages`. Contact-detail unmasking guarded server-side.

## 5. Payments (subscriptions + boosts only)

- `subscription_plans` seed table: role, tier, price_kes, listing_cap, features (jsonb).
- `subscriptions`: user_id, plan_id, status (`active | expired | cancelled`), starts_at, ends_at, mpesa_receipt.
- `boost_purchases`: listing_id, user_id, package, price_kes, expires_at, mpesa_receipt.
- Edge function `mpesa-stk-push` (mock/real toggle) + `mpesa-callback` webhook. **No rent, no deposits, no escrow.**

## 6. KYC & Trust

- `kyc_submissions`: user_id, tier, id_type, id_number, selfie_url, id_photo_url, status (`pending | approved | rejected`), reviewer_id, reviewed_at.
- `listing_verifications`: listing_id, photo_checks (jsonb), status.
- `reports`: reporter_id, target_type (`listing | user | message`), target_id, reason, notes, status.
- `disputes`: booking_id, opener_id, category, description, status, resolution.

## 7. Reviews

- `reviews`: reviewer_id, target_type (`listing | host | provider`), target_id, rating (1-5), body, photos (jsonb), helpful_count.
- `review_helpful`: review_id, user_id.

## 8. Notifications

- `notifications`: user_id, type, title, body, deep_link, read_at.
- Triggers: on booking status change, new message, price drop, KYC decision, subscription expiry.
- Edge function `push-notification` (Despia bridge webhook target — placeholder endpoint returning 200 for now; wired to insert row + emit realtime).

## 9. Admin

- `admin_actions` audit log: admin_id, action, target_type, target_id, meta.
- Admin RLS via `has_role(auth.uid(),'admin')` on all moderation queues.

## 10. Storage buckets

- `avatars` (public read, owner write)
- `listing-media` (public read, owner write, size cap)
- `kyc-docs` (private; only owner + admin read via signed URL edge function)
- `chat-attachments` (private; participants read via edge function)

## 11. Edge functions

- `otp-send`, `otp-verify` (exist)
- `link-phone-to-user`
- `mpesa-stk-push`, `mpesa-callback`
- `signed-media-url` (kyc-docs, chat-attachments)
- `expire-subscriptions` (cron via pg_cron or scheduled trigger)
- `expire-boosts` (same)

## 12. Frontend wiring

For each existing hook/store, replace localStorage layer with Supabase queries while keeping the same public API so components don't need refactoring:

- `useFavorites`, `useBookings`, `useSavedSearches`, `usePriceAlerts`, `useRecentlyViewed`, `useUserRole`, `useKYCStatus`, `useNotifications`, `useInAppNotifications`.
- `AuthFlow` writes phone/role to `profiles` after OTP.
- `ListingCRUD` writes to `listings` + uploads to `listing-media`.
- `ChatScreen` reads/writes `messages` with realtime subscription.
- `SubscriptionPlans` / `BoostListingFlow` call M-Pesa edge function.
- `AdminPanel` queries reports/disputes/kyc queues.

## 13. Rollout order (multiple migrations, one per domain)

1. Auth foundation: profiles, user_roles, has_role, handle_new_user trigger, storage buckets.
2. Listings + images + favorites + recently viewed + price history/alerts + saved searches.
3. Bookings + booking_events + conversations + messages (+ realtime).
4. Subscriptions + boosts + M-Pesa edge functions.
5. KYC + verifications + reports + disputes + reviews.
6. Notifications + triggers + scheduled cleanup functions.
7. Admin audit + moderation policies.
8. Frontend hook rewrites (grouped by domain to keep PRs reviewable).

## Technical notes

- Every `public` table ships with explicit GRANTs (authenticated + service_role; anon only on public-read tables like active `listings`, `reviews`, `neighborhood_scores`).
- Roles stored **only** in `user_roles` — never on `profiles`.
- All RLS policies use `has_role()` or `auth.uid()` — no recursive lookups.
- `updated_at` trigger on every mutable table.
- Contact-unlock logic enforced by RLS + view (`listings_public` hides owner phone until booking accepted).
- No client-side admin checks; admin role verified server-side.
- Session already persists in webview (Supabase client uses localStorage).

## Out of scope (per product model)

- Rent collection, deposits, escrow, wallet balances, peer-to-peer transfers.
- Any monetary flow other than KejaSure subscriptions and listing boosts.

## What I need from you before starting

1. Confirm this scope, or tell me to trim/expand.
2. Confirm I should **replace** the local-storage stores (favorites, bookings, saved searches, price alerts, recently viewed, notifications) with real DB persistence — existing local data will not be migrated.
3. M-Pesa: keep the current simulated STK flow, or wire real Daraja credentials now? (Real needs Consumer Key/Secret, Passkey, Shortcode.)
4. Google sign-in: OK to enable now with default redirect? (You'll add Client ID/Secret in the auth panel after.)

Once you confirm, I'll ship migrations in the order above, batching where safe, then wire the hooks screen-by-screen.

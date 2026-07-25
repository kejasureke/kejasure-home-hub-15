
-- 1) Restrict profiles SELECT to authenticated users only (hide phone/PII from anon)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- 2) Block self-service billing: clients may only insert 'pending' rows, never set receipts,
-- and cannot flip status to 'active'. Only service_role (server) can activate.
DROP POLICY IF EXISTS "Users insert own subs" ON public.subscriptions;
CREATE POLICY "Users insert own pending subs" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND mpesa_receipt IS NULL
    AND starts_at IS NULL
    AND ends_at IS NULL
  );

DROP POLICY IF EXISTS "Users cancel own subs" ON public.subscriptions;
CREATE POLICY "Users cancel own subs" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'cancelled'
  );

DROP POLICY IF EXISTS "Owners create own boosts" ON public.boost_purchases;
-- Remove direct client insert on boosts; activation must go through a trusted server function.
REVOKE INSERT ON public.boost_purchases FROM authenticated;

-- 3) Lock down SECURITY DEFINER helpers not needed via the API from signed-in users.
-- has_role() must remain callable from RLS policies (evaluated as the querying role),
-- so we keep EXECUTE for authenticated on has_role but revoke on trigger/maintenance helpers.
REVOKE EXECUTE ON FUNCTION public.purge_old_otp_attempts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_old_otp_verify_attempts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_conversation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_review_helpful() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_booking_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_booking_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.track_price_change() FROM PUBLIC, anon, authenticated;

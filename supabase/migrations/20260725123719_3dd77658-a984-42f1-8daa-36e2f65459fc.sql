
-- Revoke public EXECUTE on all SECURITY DEFINER functions we created; keep authenticated where needed.
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.track_price_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_booking_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bump_conversation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bump_review_helpful() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_booking_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_new_message() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_old_otp_attempts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_old_otp_verify_attempts() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies (runs as definer) — no need for anon/public EXECUTE
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Deny-by-default policies on OTP tables (only service_role bypasses RLS)
CREATE POLICY "Deny all otp_attempts" ON public.otp_attempts FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Deny all otp_verify_attempts" ON public.otp_verify_attempts FOR ALL USING (false) WITH CHECK (false);

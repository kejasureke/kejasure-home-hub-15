REVOKE ALL ON FUNCTION public.purge_old_otp_attempts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_otp_attempts() TO service_role;
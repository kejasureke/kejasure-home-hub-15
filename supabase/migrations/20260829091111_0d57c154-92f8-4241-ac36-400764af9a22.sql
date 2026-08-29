DROP POLICY IF EXISTS "No client access to sms_delivery_reports" ON public.sms_delivery_reports;
CREATE POLICY "No client access to sms_delivery_reports"
ON public.sms_delivery_reports
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "No client access to otp_codes" ON public.otp_codes;
CREATE POLICY "No client access to otp_codes"
ON public.otp_codes
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);
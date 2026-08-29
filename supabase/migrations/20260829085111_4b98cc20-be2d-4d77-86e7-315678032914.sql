-- 1. Move the role-check helper out of the API-exposed schema
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;
ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA private;
ALTER FUNCTION private.has_role(uuid, public.app_role) SET search_path = public;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- 2. Profiles: only the owner (or an admin) can read a profile row
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR private.has_role(auth.uid(), 'admin'));

-- 3. Roles: no client-side self-assignment; roles come from the signup trigger,
--    admins, or backend service-role code only
DROP POLICY IF EXISTS "Users can add own non-admin role" ON public.user_roles;
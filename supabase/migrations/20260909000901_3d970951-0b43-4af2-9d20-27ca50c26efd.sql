
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;

DROP POLICY "prof_read_verified" ON public.professional_profiles;
CREATE POLICY "prof_read_public" ON public.professional_profiles FOR SELECT TO anon
  USING (verified_status = 'approved');
CREATE POLICY "prof_read_auth" ON public.professional_profiles FOR SELECT TO authenticated
  USING (verified_status = 'approved' OR user_id = auth.uid() OR public.is_staff(auth.uid()));

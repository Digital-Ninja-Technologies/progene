
-- 1. Remove user INSERT on payment_history (only backend/service_role should write)
DROP POLICY IF EXISTS "Users can insert their own payment history" ON public.payment_history;

-- 2. Remove user INSERT/UPDATE on subscriptions (only backend webhooks should write)
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- 3. Add DELETE policy on branding_settings so owners can remove records
CREATE POLICY "Users can delete their own branding"
  ON public.branding_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Bind privilege-escalation trigger to profiles UPDATEs (function existed but trigger was missing)
DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();


-- 1) Prevent privilege escalation on profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service role (no auth.uid) to update anything
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium
     OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
     OR NEW.proposals_used IS DISTINCT FROM OLD.proposals_used
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
     OR NEW.anonymized IS DISTINCT FROM OLD.anonymized THEN
    RAISE EXCEPTION 'Not allowed to modify protected profile fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 2) Secure public proposal access via SECURITY DEFINER RPC
DROP POLICY IF EXISTS "Anyone can view public proposals" ON public.proposals;

CREATE OR REPLACE FUNCTION public.get_public_proposal(p_token text)
RETURNS TABLE (
  id uuid,
  project_type text,
  project_config jsonb,
  pricing_result jsonb,
  proposal_data jsonb,
  created_at timestamptz,
  client_signed_at timestamptz,
  client_signature text,
  branding_snapshot jsonb
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.project_type,
    p.project_config,
    p.pricing_result,
    p.proposal_data,
    p.created_at,
    p.client_signed_at,
    p.client_signature,
    p.branding_snapshot
  FROM public.proposals p
  WHERE p.share_token = p_token
    AND p.is_public = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_proposal(text) TO anon, authenticated;

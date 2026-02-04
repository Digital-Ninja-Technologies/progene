-- Add soft delete columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS anonymized BOOLEAN DEFAULT false;

-- Create account deletion function
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Anonymize profile
  UPDATE public.profiles
  SET 
    email = 'deleted_' || gen_random_uuid()::text || '@deleted.local',
    full_name = 'Deleted User',
    company_name = NULL,
    avatar_url = NULL,
    deleted_at = now(),
    anonymized = true
  WHERE user_id = v_user_id;
  
  -- Make proposals private and remove share tokens
  UPDATE public.proposals
  SET 
    is_public = false,
    share_token = NULL
  WHERE user_id = v_user_id;
  
  -- Delete related data
  DELETE FROM public.clients WHERE user_id = v_user_id;
  DELETE FROM public.branding_settings WHERE user_id = v_user_id;
  DELETE FROM public.time_entries WHERE user_id = v_user_id;
  DELETE FROM public.proposal_templates WHERE user_id = v_user_id;
  DELETE FROM public.subscriptions WHERE user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- Update RLS policy to hide deleted profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id AND (deleted_at IS NULL OR anonymized = false));
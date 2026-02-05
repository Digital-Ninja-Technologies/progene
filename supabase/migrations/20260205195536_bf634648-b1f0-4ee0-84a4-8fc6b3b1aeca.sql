-- Update the proposal limit check from 2 to 3 for free users
CREATE OR REPLACE FUNCTION public.check_proposal_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_profile RECORD;
  proposal_count INTEGER;
BEGIN
  -- Get user's profile
  SELECT is_premium, proposals_used 
  INTO user_profile
  FROM public.profiles 
  WHERE user_id = NEW.user_id;
  
  -- Premium users have unlimited
  IF user_profile.is_premium THEN
    RETURN NEW;
  END IF;
  
  -- Count existing proposals (more reliable than counter)
  SELECT COUNT(*) INTO proposal_count
  FROM public.proposals
  WHERE user_id = NEW.user_id;
  
  -- Check limit (3 for free users - updated from 2)
  IF proposal_count >= 3 THEN
    RAISE EXCEPTION 'Proposal limit reached. Upgrade to premium for unlimited proposals.';
  END IF;
  
  RETURN NEW;
END;
$function$;
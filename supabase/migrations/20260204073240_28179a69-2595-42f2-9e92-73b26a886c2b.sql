-- =====================================================
-- FIX 1: Enforce proposal limits at database level
-- =====================================================

-- Function to check proposal limit before insert
CREATE OR REPLACE FUNCTION public.check_proposal_limit()
RETURNS TRIGGER AS $$
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
  
  -- Check limit (2 for free users)
  IF proposal_count >= 2 THEN
    RAISE EXCEPTION 'Proposal limit reached. Upgrade to premium for unlimited proposals.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce limit before insert
CREATE TRIGGER enforce_proposal_limit
BEFORE INSERT ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION check_proposal_limit();

-- Function to auto-increment proposal counter atomically
CREATE OR REPLACE FUNCTION public.increment_proposal_counter()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET proposals_used = proposals_used + 1
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-increment after insert
CREATE TRIGGER auto_increment_proposals
AFTER INSERT ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION increment_proposal_counter();

-- =====================================================
-- FIX 2: Secure function for signing public proposals
-- =====================================================

-- Create a secure function for anonymous proposal signing
CREATE OR REPLACE FUNCTION public.sign_proposal(
  p_proposal_id UUID,
  p_client_signature TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_public BOOLEAN;
  v_already_signed BOOLEAN;
  trimmed_signature TEXT;
BEGIN
  -- Trim and validate signature
  trimmed_signature := trim(p_client_signature);
  
  IF trimmed_signature IS NULL OR length(trimmed_signature) = 0 THEN
    RAISE EXCEPTION 'Signature cannot be empty';
  END IF;
  
  IF length(trimmed_signature) > 100 THEN
    RAISE EXCEPTION 'Signature too long';
  END IF;
  
  -- Validate characters (only letters, spaces, hyphens, apostrophes)
  IF NOT trimmed_signature ~ '^[a-zA-Z\s\-''\.]+$' THEN
    RAISE EXCEPTION 'Invalid signature characters';
  END IF;
  
  -- Check if proposal is public and unsigned
  SELECT is_public, client_signed_at IS NOT NULL
  INTO v_is_public, v_already_signed
  FROM public.proposals
  WHERE id = p_proposal_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;
  
  IF NOT v_is_public THEN
    RAISE EXCEPTION 'Proposal is not public';
  END IF;
  
  IF v_already_signed THEN
    RAISE EXCEPTION 'Proposal already signed';
  END IF;
  
  -- Update only signature fields
  UPDATE public.proposals
  SET 
    client_signed_at = now(),
    client_signature = trimmed_signature
  WHERE id = p_proposal_id
    AND is_public = true
    AND client_signed_at IS NULL;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute to anonymous users
GRANT EXECUTE ON FUNCTION public.sign_proposal(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.sign_proposal(UUID, TEXT) TO authenticated;
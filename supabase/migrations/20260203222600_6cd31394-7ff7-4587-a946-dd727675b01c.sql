-- Fix function search path for generate_share_token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_token IS NULL THEN
    NEW.share_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix permissive RLS policy for proposal_views insert
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can create views" ON public.proposal_views;

-- Create a more secure policy - only allow inserts for public proposals
CREATE POLICY "Anyone can create views for public proposals" ON public.proposal_views 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.proposals WHERE proposals.id = proposal_views.proposal_id AND proposals.is_public = true)
);
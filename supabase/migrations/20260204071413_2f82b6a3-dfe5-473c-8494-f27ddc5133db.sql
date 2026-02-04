-- Add explicit DELETE policy to profiles table that denies all deletes
-- This documents the security decision and follows best practices
CREATE POLICY "Profiles cannot be deleted"
ON public.profiles
FOR DELETE
USING (false);

-- Add constraint on client_signature length in proposals table
ALTER TABLE public.proposals
ADD CONSTRAINT client_signature_length CHECK (length(client_signature) <= 100);
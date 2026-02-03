-- Add document_details column to store the customized proposal document info
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS document_details jsonb DEFAULT NULL;

-- Add UPDATE policy so users can update their own proposals
CREATE POLICY "Users can update their own proposals" 
ON public.proposals 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
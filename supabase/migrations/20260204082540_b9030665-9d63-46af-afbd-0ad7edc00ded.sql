-- Enable RLS on contact_submissions (if not already enabled)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Deny all anonymous access to contact_submissions
CREATE POLICY "Deny anonymous access to contact_submissions"
ON public.contact_submissions
FOR SELECT
TO anon
USING (false);

-- Deny authenticated users from reading (only service role via edge function should access)
CREATE POLICY "Deny authenticated access to contact_submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (false);

-- Deny public inserts (only edge function with service role can insert)
CREATE POLICY "Deny anonymous inserts to contact_submissions"
ON public.contact_submissions
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny authenticated inserts to contact_submissions"
ON public.contact_submissions
FOR INSERT
TO authenticated
WITH CHECK (false);
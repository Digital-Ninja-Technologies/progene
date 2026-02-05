-- Add explicit deny policies for rate_limits table
-- This table should only be accessed by service role via check_rate_limit function

-- Deny all SELECT access from authenticated and anonymous users
CREATE POLICY "Deny all read access to rate_limits"
ON public.rate_limits
FOR SELECT
TO authenticated, anon
USING (false);

-- Deny all INSERT access from authenticated and anonymous users  
CREATE POLICY "Deny all insert access to rate_limits"
ON public.rate_limits
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

-- Deny all UPDATE access from authenticated and anonymous users
CREATE POLICY "Deny all update access to rate_limits"
ON public.rate_limits
FOR UPDATE
TO authenticated, anon
USING (false);

-- Deny all DELETE access from authenticated and anonymous users
CREATE POLICY "Deny all delete access to rate_limits"
ON public.rate_limits
FOR DELETE
TO authenticated, anon
USING (false);
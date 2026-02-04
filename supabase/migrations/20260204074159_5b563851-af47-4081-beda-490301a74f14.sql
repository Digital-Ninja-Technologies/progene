-- Add branding_snapshot column to proposals for secure storage
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS branding_snapshot JSONB;

-- Create rate_limits table for tracking rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, action)
);

-- Enable RLS on rate_limits (service-role only access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create rate limit check function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_current_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current rate limit record
  SELECT request_count, window_start INTO v_current_count, v_window_start
  FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF NOT FOUND OR (now() - v_window_start) > (p_window_seconds || ' seconds')::INTERVAL THEN
    -- Reset window - insert or update with count 1
    INSERT INTO public.rate_limits (identifier, action, request_count, window_start)
    VALUES (p_identifier, p_action, 1, now())
    ON CONFLICT (identifier, action) 
    DO UPDATE SET request_count = 1, window_start = now();
    RETURN 1;
  ELSE
    -- Increment count
    UPDATE public.rate_limits
    SET request_count = request_count + 1
    WHERE identifier = p_identifier AND action = p_action;
    RETURN v_current_count + 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create index on rate_limits for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(identifier, action);

-- Create cleanup function for old rate limit entries (optional, for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
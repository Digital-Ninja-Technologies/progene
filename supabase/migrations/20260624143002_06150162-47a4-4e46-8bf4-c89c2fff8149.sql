CREATE TABLE public.polar_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  polar_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.polar_webhook_events TO service_role;

ALTER TABLE public.polar_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages Polar webhook events"
ON public.polar_webhook_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX idx_polar_webhook_events_polar_event_id
ON public.polar_webhook_events(polar_event_id);

CREATE INDEX idx_polar_webhook_events_event_type
ON public.polar_webhook_events(event_type);

CREATE TRIGGER update_polar_webhook_events_updated_at
BEFORE UPDATE ON public.polar_webhook_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
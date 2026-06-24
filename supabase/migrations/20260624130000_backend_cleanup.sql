-- ============================================================
-- 1. Grant check_rate_limit to authenticated and anon roles
--    Edge functions that use ANON_KEY call this RPC under the
--    caller's JWT role. Without this grant the RPC returns a
--    permission-denied error and rate limiting silently breaks.
-- ============================================================
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER)
  TO authenticated, anon;

GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits()
  TO authenticated;


-- ============================================================
-- 2. Schedule subscription-reminders to run daily at 08:00 UTC
--    Requires pg_cron extension (enabled in Supabase by default).
-- ============================================================
SELECT cron.schedule(
  'subscription-reminders-daily',
  '0 8 * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/subscription-reminders',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);


-- ============================================================
-- 3. Add UPDATE policy to proposals so owners can edit their
--    own proposals (title, public toggle, etc.) — was missing.
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'proposals'
      AND policyname = 'Users can update their own proposals'
  ) THEN
    CREATE POLICY "Users can update their own proposals"
    ON public.proposals
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END$$;

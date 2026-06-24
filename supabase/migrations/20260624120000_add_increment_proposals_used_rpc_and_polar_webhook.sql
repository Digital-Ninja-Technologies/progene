-- Expose increment_proposals_used as a callable RPC.
-- The auto_increment_proposals trigger already handles this after every INSERT
-- into proposals, but this function allows explicit calls if ever needed.
CREATE OR REPLACE FUNCTION public.increment_proposals_used(uid uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles SET proposals_used = proposals_used + 1 WHERE user_id = uid;
$$;

GRANT EXECUTE ON FUNCTION public.increment_proposals_used(uuid) TO authenticated;

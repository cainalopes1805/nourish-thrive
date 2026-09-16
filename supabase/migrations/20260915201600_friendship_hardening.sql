-- 1. CONSTRAINT FOR NO SELF FRIENDSHIP
ALTER TABLE public.friendships
ADD CONSTRAINT check_no_self_friendship CHECK (user_id_1 <> user_id_2);

-- 2. HARDENING get_public_profile
ALTER FUNCTION public.get_public_profile(uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated, anon;

-- 3. RPC FOR PENDING FRIEND REQUESTS
CREATE OR REPLACE FUNCTION get_pending_friend_requests()
RETURNS TABLE (
    friendship_id uuid,
    created_at timestamptz,
    sender_id uuid,
    sender_display_name text,
    sender_avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id AS friendship_id,
        f.created_at,
        p.id AS sender_id,
        p.display_name AS sender_display_name,
        p.avatar_url AS sender_avatar_url
    FROM public.friendships f
    JOIN public.profiles p ON p.id = f.action_user_id
    WHERE f.status = 'pending'
      AND f.action_user_id <> auth.uid()
      AND (f.user_id_1 = auth.uid() OR f.user_id_2 = auth.uid());
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_pending_friend_requests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pending_friend_requests() TO authenticated;

-- 4. HARDEN RLS FOR FRIENDSHIPS
DROP POLICY IF EXISTS "friendships_insert" ON public.friendships;
DROP POLICY IF EXISTS "friendships_update" ON public.friendships;

CREATE POLICY "friendships_insert" ON public.friendships FOR INSERT 
WITH CHECK (
    (auth.uid() = user_id_1 OR auth.uid() = user_id_2) 
    AND auth.uid() = action_user_id
    AND status = 'pending'
);

CREATE POLICY "friendships_update" ON public.friendships FOR UPDATE 
USING (
    (auth.uid() = user_id_1 OR auth.uid() = user_id_2)
)
WITH CHECK (
    (auth.uid() = user_id_1 OR auth.uid() = user_id_2)
    AND user_id_1 = (SELECT user_id_1 FROM public.friendships WHERE id = friendships.id)
    AND user_id_2 = (SELECT user_id_2 FROM public.friendships WHERE id = friendships.id)
    AND action_user_id = (SELECT action_user_id FROM public.friendships WHERE id = friendships.id)
    AND status = 'accepted'
    AND 'pending' = (SELECT status FROM public.friendships WHERE id = friendships.id)
    AND auth.uid() <> action_user_id
);

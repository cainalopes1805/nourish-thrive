-- 1. PROFILE UPDATES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS about_me text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS gender text;

-- Protect sensitive data by restricting the base table
DROP POLICY IF EXISTS "profiles_read" ON public.profiles;
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Create an RPC to safely fetch public profiles without exposing sensitive data
CREATE OR REPLACE FUNCTION get_public_profile(target_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    prof record;
    result json;
    show_location boolean;
    show_age boolean;
    show_nationality boolean;
BEGIN
    SELECT * INTO prof FROM public.profiles WHERE id = target_id;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Extract privacy preferences safely
    show_location := COALESCE((prof.privacy_preferences->>'show_location')::boolean, true);
    show_age := COALESCE((prof.privacy_preferences->>'show_age')::boolean, false);
    show_nationality := COALESCE((prof.privacy_preferences->>'show_nationality')::boolean, true);

    -- Construct the safe JSON
    result := json_build_object(
        'id', prof.id,
        'display_name', prof.display_name,
        'avatar_url', prof.avatar_url,
        'banner_url', prof.banner_url,
        'bio', prof.bio,
        'about_me', prof.about_me,
        'location', CASE WHEN show_location THEN prof.location ELSE NULL END,
        'date_of_birth', CASE WHEN show_age THEN prof.date_of_birth ELSE NULL END,
        'nationality', CASE WHEN show_nationality THEN prof.nationality ELSE NULL END,
        'privacy_preferences', prof.privacy_preferences,
        'interests', prof.interests
        -- gender is excluded entirely from the public view
    );
    
    RETURN result;
END;
$$;

-- 2. FRIENDSHIPS
CREATE TABLE IF NOT EXISTS public.friendships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id_2 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
    action_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure no duplicates regardless of direction
CREATE UNIQUE INDEX IF NOT EXISTS friendships_unique_idx ON public.friendships (
    LEAST(user_id_1, user_id_2), GREATEST(user_id_1, user_id_2)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friendships_select" ON public.friendships FOR SELECT 
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "friendships_insert" ON public.friendships FOR INSERT 
WITH CHECK (
    (auth.uid() = user_id_1 OR auth.uid() = user_id_2) 
    AND auth.uid() = action_user_id
);

CREATE POLICY "friendships_update" ON public.friendships FOR UPDATE 
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2)
WITH CHECK (
    (auth.uid() = user_id_1 OR auth.uid() = user_id_2) 
);

CREATE POLICY "friendships_delete" ON public.friendships FOR DELETE
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- 3. STORAGE
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles_media', 'profiles_media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage.objects
CREATE POLICY "profiles_media_select" ON storage.objects FOR SELECT 
USING (bucket_id = 'profiles_media');

CREATE POLICY "profiles_media_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'profiles_media' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "profiles_media_update" ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'profiles_media' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "profiles_media_delete" ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'profiles_media' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

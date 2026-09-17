-- The public profile RPC is intentionally the only source for identity data on
-- another member's profile. Include the public username without exposing any
-- additional private profile fields.
CREATE OR REPLACE FUNCTION public.get_public_profile(target_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    prof record;
    result json;
    show_location boolean;
    show_age boolean;
    show_nationality boolean;
    vis_interests text[];
BEGIN
    SELECT * INTO prof FROM public.profiles WHERE id = target_id;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    show_location := COALESCE((prof.privacy_preferences->>'show_location')::boolean, true);
    show_age := COALESCE((prof.privacy_preferences->>'show_age')::boolean, false);
    show_nationality := COALESCE((prof.privacy_preferences->>'show_nationality')::boolean, true);

    SELECT ARRAY(
        SELECT jsonb_array_elements_text(
            CASE WHEN jsonb_typeof(prof.privacy_preferences->'visible_interests') = 'array'
                THEN prof.privacy_preferences->'visible_interests'
                ELSE '[]'::jsonb
            END
        )
    ) INTO vis_interests;

    result := json_build_object(
        'id', prof.id,
        'display_name', prof.display_name,
        'username', prof.username,
        'avatar_url', prof.avatar_url,
        'banner_url', prof.banner_url,
        'bio', prof.bio,
        'about_me', prof.about_me,
        'location', CASE WHEN show_location THEN prof.location ELSE NULL END,
        'date_of_birth', CASE WHEN show_age THEN prof.date_of_birth ELSE NULL END,
        'nationality', CASE WHEN show_nationality THEN prof.nationality ELSE NULL END,
        'interests', (
            SELECT COALESCE(array_agg(i), '{}'::text[])
            FROM unnest(prof.interests) i
            WHERE i = ANY(vis_interests)
        )
    );

    RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated, anon;

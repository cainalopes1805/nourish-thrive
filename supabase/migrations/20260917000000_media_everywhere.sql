-- MEDIA EVERYWHERE
-- Adds image support to communities (banner + avatar) and lets community
-- creators manage their own community's media. Backfills example imagery
-- across communities, posts, articles, professional profiles and member
-- profiles so the product feels like a real, populated social network.

-- 1. COMMUNITIES: banner, avatar and ownership
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

GRANT UPDATE ON public.communities TO authenticated;

CREATE POLICY "communities_update_own" ON public.communities FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (created_by = auth.uid() OR public.is_staff(auth.uid()));

-- 2. EXAMPLE IMAGERY (deterministic placeholder photos, safe for demo use)
UPDATE public.communities SET
  banner_url = 'https://picsum.photos/seed/' || slug || '-banner/1200/400',
  avatar_url = 'https://picsum.photos/seed/' || slug || '-avatar/300/300'
WHERE banner_url IS NULL;

UPDATE public.articles SET
  cover_url = 'https://picsum.photos/seed/' || slug || '-cover/1200/630'
WHERE cover_url IS NULL;

UPDATE public.professional_profiles SET
  profile_photo = 'https://picsum.photos/seed/' || md5(coalesce(name, id::text)) || '/400/400'
WHERE profile_photo IS NULL;

-- ~40% of existing posts get a photo, deterministically, so the feed feels real
-- without every single post looking the same.
UPDATE public.posts SET
  image_url = 'https://picsum.photos/seed/post-' || id::text || '/1200/800'
WHERE image_url IS NULL
  AND (('x' || substr(md5(id::text), 1, 8))::bit(32)::int % 10) < 4;

UPDATE public.profiles SET
  avatar_url = 'https://picsum.photos/seed/' || id::text || '-avatar/400/400',
  banner_url = 'https://picsum.photos/seed/' || id::text || '-banner/1200/300'
WHERE avatar_url IS NULL;

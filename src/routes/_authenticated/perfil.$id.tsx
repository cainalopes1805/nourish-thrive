import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Flag,
  MapPin,
  Medal,
  MessageCircle,
  MoreHorizontal,
  Send,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { PostCard, type FeedPost } from "@/components/social/PostCard";
import { FriendshipButton } from "@/components/social/FriendshipButton";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/perfil/$id")({
  head: () => ({ meta: [{ title: "Perfil | Nourish Thrive" }] }),
  component: ProfilePage,
});

type PublicProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  about_me: string | null;
  location: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  interests: string[] | null;
};

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
  return age;
}

function ProfileAvatar({ profile, className = "size-28" }: { profile: PublicProfile; className?: string }) {
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-full border-4 border-card bg-primary/10 text-primary`}>
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt={`Foto de ${profile.display_name ?? "membro"}`} className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-3xl font-bold">
          {(profile.display_name ?? "?").charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const profileQuery = useQuery({
    queryKey: ["public-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_profile", { target_id: id });
      if (error) throw error;
      return data as PublicProfile | null;
    },
  });

  const activityQuery = useQuery({
    queryKey: ["profile-activity", id, user?.id],
    enabled: !!profileQuery.data,
    queryFn: async () => {
      const [postsResult, membershipsResult, followersResult, followingResult] = await Promise.all([
        supabase
          .from("posts")
          .select("id, title, body, post_type, tags, sensitive_topics, is_anonymous, is_professional_content, created_at, image_url, author_id, community_id, reactions(count), comments(count)")
          .eq("author_id", id)
          .eq("status", "published")
          .eq("is_anonymous", false)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase.from("community_members").select("community_id").eq("user_id", id),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", id),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", id),
      ]);
      if (postsResult.error) throw postsResult.error;
      if (membershipsResult.error) throw membershipsResult.error;

      const communityIds = Array.from(new Set((membershipsResult.data ?? []).map((m) => m.community_id)));
      const postCommunityIds = Array.from(new Set((postsResult.data ?? []).flatMap((post) => (post.community_id ? [post.community_id] : []))));
      const allCommunityIds = Array.from(new Set([...communityIds, ...postCommunityIds]));
      const { data: communities, error: communitiesError } = allCommunityIds.length
        ? await supabase.from("communities").select("id, name, slug, topic, avatar_url").in("id", allCommunityIds)
        : { data: [], error: null };
      if (communitiesError) throw communitiesError;

      const communityById = new Map((communities ?? []).map((community) => [community.id, community]));

      const likedPostIds = new Set<string>();
      const postRows = postsResult.data ?? [];
      if (user && postRows.length > 0) {
        const { data: myReactions } = await supabase
          .from("reactions")
          .select("post_id")
          .eq("user_id", user.id)
          .in(
            "post_id",
            postRows.map((p) => p.id),
          );
        for (const r of myReactions ?? []) likedPostIds.add(r.post_id);
      }

      const posts = postRows.map((post) => ({
        ...post,
        authorId: post.author_id,
        imageUrl: post.image_url,
        communityName: post.community_id ? communityById.get(post.community_id)?.name : null,
        reactions: post.reactions?.[0]?.count ?? 0,
        comments: post.comments?.[0]?.count ?? 0,
        hasReacted: likedPostIds.has(post.id),
      })) as FeedPost[];

      return {
        posts,
        communities: communityIds.map((communityId) => communityById.get(communityId)).filter(Boolean),
        followers: followersResult.count ?? 0,
        following: followingResult.count ?? 0,
      };
    },
  });

  if (profileQuery.isLoading) return <AppShell><CardSkeletonList count={3} /></AppShell>;
  if (profileQuery.isError || !profileQuery.data) {
    return <AppShell><ErrorState message="Não foi possível encontrar este perfil." onRetry={() => void profileQuery.refetch()} /></AppShell>;
  }

  const profile = profileQuery.data;
  const activity = activityQuery.data;
  const isOwnProfile = user?.id === profile.id;
  const age = calculateAge(profile.date_of_birth);
  const interests = Array.isArray(profile.interests) ? profile.interests : [];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <Link to="/feed" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Voltar ao feed
        </Link>

        <section className="surface-card overflow-hidden">
          <div className="relative h-40 bg-gradient-to-br from-deep via-primary to-warm sm:h-56">
            {profile.banner_url ? <img src={profile.banner_url} alt="Capa do perfil" className="size-full object-cover" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-deep/25 to-transparent" />
          </div>
          <div className="relative px-4 pb-5 sm:px-7 sm:pb-7">
            <div className="-mt-14 flex items-end justify-between gap-3 sm:-mt-16">
              <ProfileAvatar profile={profile} className="size-28 sm:size-32" />
              <div className="mb-1 flex gap-2">
                {isOwnProfile ? (
                  <Button asChild variant="outline" size="sm"><Link to="/meu-espaco"><Camera className="size-4" /> Editar perfil</Link></Button>
                ) : (
                  <>
                    <Button asChild variant="outline" size="icon" aria-label="Enviar mensagem"><Link to="/mensagens"><MessageCircle className="size-4" /></Link></Button>
                    <FriendshipButton targetId={profile.id} />
                    <Button variant="outline" size="icon" aria-label="Mais opções"><MoreHorizontal className="size-4" /></Button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{profile.display_name || "Membro Nourish Thrive"}</h1>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">Membro</span>
              </div>
              <p className="mt-1 text-sm font-medium text-muted-foreground">@{profile.username || "nourish"}</p>
              {profile.bio ? <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/85">{profile.bio}</p> : null}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
                {profile.location ? <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-primary" />{profile.location}</span> : null}
                {age !== null ? <span className="inline-flex items-center gap-1.5"><Calendar className="size-4 text-primary" />{age} anos</span> : null}
                {profile.nationality ? <span className="inline-flex items-center gap-1.5"><Flag className="size-4 text-primary" />{profile.nationality}</span> : null}
              </div>
              <div className="mt-5 flex gap-5 text-sm">
                <span><strong>{activity?.following ?? "—"}</strong> <span className="text-muted-foreground">seguindo</span></span>
                <span><strong>{activity?.followers ?? "—"}</strong> <span className="text-muted-foreground">seguidores</span></span>
              </div>
            </div>
          </div>
        </section>

        <Tabs defaultValue="posts" className="mt-6">
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-secondary/65 p-1">
            <TabsTrigger value="posts" className="py-2.5">Publicações</TabsTrigger>
            <TabsTrigger value="about" className="py-2.5">Sobre</TabsTrigger>
            <TabsTrigger value="communities" className="py-2.5">Comunidades</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-5 space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Publicações</h2><span className="text-sm text-muted-foreground">{activity?.posts.length ?? 0} visíveis</span></div>
            {activityQuery.isLoading ? <CardSkeletonList count={2} /> : null}
            {activityQuery.isError ? <ErrorState message="Não foi possível carregar as publicações." onRetry={() => void activityQuery.refetch()} /> : null}
            {activity && activity.posts.length === 0 ? <EmptyState title="Ainda não há publicações públicas" description="Publicações anônimas permanecem protegidas e não aparecem no perfil." /> : null}
            {activity?.posts.map((post) => <PostCard key={post.id} post={{ ...post, authorName: profile.display_name, authorAvatar: profile.avatar_url }} />)}
          </TabsContent>

          <TabsContent value="about" className="mt-5 grid gap-5 md:grid-cols-[1.45fr_1fr]">
            <section className="surface-card p-5 sm:p-6"><h2 className="text-lg font-bold">Sobre {profile.display_name?.split(" ")[0] || "este membro"}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{profile.about_me || "Esta pessoa ainda não compartilhou mais detalhes sobre sua jornada."}</p></section>
            <aside className="space-y-5">
              <section className="surface-card p-5"><h2 className="flex items-center gap-2 font-bold"><Medal className="size-5 text-warm" />Interesses</h2>{interests.length ? <div className="mt-4 flex flex-wrap gap-2">{interests.map((interest) => <span key={interest} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">#{interest}</span>)}</div> : <p className="mt-3 text-sm text-muted-foreground">Nenhum interesse público por enquanto.</p>}</section>
              <section className="rounded-xl border border-primary/15 bg-primary/5 p-5"><h2 className="font-bold">Espaço de apoio</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Converse com respeito e lembre-se: cada jornada alimentar é única.</p></section>
            </aside>
          </TabsContent>

          <TabsContent value="communities" className="mt-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Comunidades que participa</h2><Users className="size-5 text-primary" /></div>
            {activityQuery.isLoading ? <CardSkeletonList count={2} /> : null}
            {activity && activity.communities.length === 0 ? <EmptyState title="Nenhuma comunidade pública" description="As comunidades em que participa aparecerão aqui." /> : null}
            <div className="grid gap-3 sm:grid-cols-2">{activity?.communities.map((community) => community ? <Link key={community.id} to="/comunidades/$slug" params={{ slug: community.slug }} className="surface-card card-pop flex items-center gap-4 p-4"><div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 font-bold text-primary">{community.avatar_url ? <img src={community.avatar_url} alt="" className="size-full object-cover" /> : community.name.charAt(0)}</div><div className="min-w-0"><h3 className="truncate font-bold">{community.name}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{community.topic || "Nutrição e bem-estar"}</p></div><Send className="ml-auto size-4 shrink-0 text-primary" /></Link> : null)}</div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

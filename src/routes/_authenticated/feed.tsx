import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { PostCard, type FeedPost } from "@/components/social/PostCard";
import { POST_TYPES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({
    meta: [
      { title: "Seu feed de cuidado | Mesa Comum" },
      {
        name: "description",
        content: "Publicações da comunidade, conteúdos educativos e apoio, no seu ritmo.",
      },
      { property: "og:title", content: "Feed | Mesa Comum" },
      { property: "og:description", content: "Um feed calmo, sem gatilhos desnecessários." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const [type, setType] = useState<string>("");

  const recoveryMode = profile?.recovery_friendly_mode ?? false;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["feed", type, recoveryMode],
    queryFn: async () => {
      let q = supabase
        .from("posts")
        .select(
          "id, title, body, post_type, tags, sensitive_topics, is_anonymous, is_professional_content, created_at, community_id, image_url, author_id, reactions(count), comments(count)",
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(40);
      if (type) q = q.eq("post_type", type);
      const { data, error } = await q;
      if (error) throw error;
      const rows = data ?? [];

      const authorIds = Array.from(new Set(rows.map((p) => p.author_id)));
      const profilesById = new Map<string, { display_name: string; avatar_url: string | null }>();
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", authorIds);
        for (const p of profiles ?? []) profilesById.set(p.id, p);
      }

      const posts = rows.map((p: any) => ({
        ...p,
        authorId: p.author_id,
        authorName: profilesById.get(p.author_id)?.display_name,
        authorAvatar: profilesById.get(p.author_id)?.avatar_url,
        imageUrl: p.image_url,
        reactions: p.reactions?.[0]?.count ?? 0,
        comments: p.comments?.[0]?.count ?? 0,
      })) as (FeedPost & { community_id: string | null })[];
      return recoveryMode ? posts.filter((p) => p.sensitive_topics.length === 0) : posts;
    },
  });

  return (
    <AppShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Seu feed</h1>
          <p className="text-sm text-muted-foreground">
            {recoveryMode
              ? "Experiência protegida ativa: temas sensíveis estão ocultos."
              : "Conteúdos da comunidade e de profissionais verificados."}
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/criar">Publicar</Link>
        </Button>
      </header>

      <nav aria-label="Filtrar por tipo" className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setType("")}
          className={cn(
            "rounded-full border border-border px-3 py-1.5 text-sm",
            !type && "bg-secondary text-deep",
          )}
        >
          Tudo
        </button>
        {POST_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-sm",
              type === t.value && "bg-secondary text-deep",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {isLoading ? <CardSkeletonList count={4} /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="Nada por aqui ainda"
          description="Que tal começar uma conversa ou entrar em uma comunidade?"
          action={
            <Button asChild size="sm">
              <Link to="/comunidades">Ver comunidades</Link>
            </Button>
          }
        />
      ) : null}

      <div className="space-y-4">
        {data?.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      <div className="mt-8">
        <SafetyNote />
      </div>
    </AppShell>
  );
}

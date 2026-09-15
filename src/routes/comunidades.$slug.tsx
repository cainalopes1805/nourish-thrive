import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { PostCard, type FeedPost } from "@/components/social/PostCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/comunidades/$slug")({
  head: () => ({
    meta: [
      { title: "Comunidade | Mesa Comum" },
      {
        name: "description",
        content: "Publicações, dúvidas e apoio dentro de uma comunidade de cuidado alimentar.",
      },
      { property: "og:title", content: "Comunidade | Mesa Comum" },
      {
        property: "og:description",
        content: "Participe das conversas moderadas da Mesa Comum.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { slug } = Route.useParams();

  const community = useQuery({
    queryKey: ["community", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("id, slug, name, description, topic, is_sensitive")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const posts = useQuery({
    queryKey: ["community-posts", community.data?.id],
    enabled: !!community.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, title, body, post_type, tags, sensitive_topics, is_anonymous, is_professional_content, created_at",
        )
        .eq("community_id", community.data!.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as FeedPost[];
    },
  });

  if (community.isLoading) {
    return (
      <AppShell>
        <CardSkeletonList count={3} />
      </AppShell>
    );
  }

  if (community.isError || !community.data) {
    return (
      <AppShell>
        <ErrorState message="Comunidade não encontrada." onRetry={() => void community.refetch()} />
      </AppShell>
    );
  }

  const c = community.data;

  return (
    <AppShell>
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link to="/comunidades" className="hover:underline">
          Comunidades
        </Link>{" "}
        / <span className="text-foreground">{c.name}</span>
      </nav>

      <header className="surface-card mb-6 space-y-3 p-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{c.name}</h1>
        <p className="text-sm text-muted-foreground">{c.description}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/criar">Publicar nesta comunidade</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/feed">Ver feed geral</Link>
          </Button>
        </div>
        {c.is_sensitive ? (
          <SafetyNote>
            Esta comunidade trata de temas sensíveis. Cuide de você ao ler e comentar.
          </SafetyNote>
        ) : null}
      </header>

      {posts.isLoading ? <CardSkeletonList count={3} /> : null}
      {posts.data && posts.data.length === 0 ? (
        <EmptyState
          title="Ainda sem publicações"
          description="Seja a primeira pessoa a compartilhar algo por aqui."
          action={
            <Button asChild size="sm">
              <Link to="/criar">Criar publicação</Link>
            </Button>
          }
        />
      ) : null}

      <div className="space-y-4">
        {posts.data?.map((p) => (
          <PostCard key={p.id} post={{ ...p, communityName: c.name }} />
        ))}
      </div>
    </AppShell>
  );
}

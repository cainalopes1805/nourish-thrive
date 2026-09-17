import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PostCard, type FeedPost } from "@/components/social/PostCard";
import { ReportDialog } from "@/components/social/ReportDialog";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/publicacoes/$id")({
  head: () => ({
    meta: [
      { title: "Publicação | Mesa Comum" },
      {
        name: "description",
        content: "Leia a publicação e os comentários da comunidade de cuidado alimentar.",
      },
      { property: "og:title", content: "Publicação | Mesa Comum" },
      { property: "og:description", content: "Conversas moderadas sobre alimentação e cuidado." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const post = useQuery({
    queryKey: ["post", id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, title, body, post_type, tags, sensitive_topics, is_anonymous, is_professional_content, created_at, image_url, author_id, reactions(count), comments(count)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const p = data as any;

      let authorName: string | undefined;
      let authorAvatar: string | null | undefined;
      if (!p.is_anonymous) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", p.author_id)
          .maybeSingle();
        authorName = profile?.display_name;
        authorAvatar = profile?.avatar_url;
      }

      let hasReacted = false;
      if (user) {
        const { data: reaction } = await supabase
          .from("reactions")
          .select("id")
          .eq("post_id", p.id)
          .eq("user_id", user.id)
          .maybeSingle();
        hasReacted = !!reaction;
      }

      return {
        ...p,
        authorId: p.author_id,
        authorName,
        authorAvatar,
        imageUrl: p.image_url,
        reactions: p.reactions?.[0]?.count ?? 0,
        comments: p.comments?.[0]?.count ?? 0,
        hasReacted,
      } as FeedPost;
    },
  });

  const comments = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, body, is_anonymous, created_at, author_id")
        .eq("post_id", id)
        .eq("status", "published")
        .order("created_at");
      if (error) throw error;
      const rows = data ?? [];

      const authorIds = Array.from(new Set(rows.filter((c) => !c.is_anonymous).map((c) => c.author_id)));
      const profilesById = new Map<string, { display_name: string; avatar_url: string | null }>();
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", authorIds);
        for (const p of profiles ?? []) profilesById.set(p.id, p);
      }

      return rows.map((c) => ({
        ...c,
        authorName: c.is_anonymous ? null : profilesById.get(c.author_id)?.display_name,
        authorAvatar: c.is_anonymous ? null : profilesById.get(c.author_id)?.avatar_url,
      }));
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("auth");
      const { error } = await supabase.from("comments").insert({
        post_id: id,
        author_id: user.id,
        body: body.trim(),
        is_anonymous: anonymous,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      toast.success("Comentário publicado.");
      void queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
    onError: () => toast.error("Não foi possível comentar agora."),
  });

  if (post.isLoading) {
    return (
      <AppShell>
        <CardSkeletonList count={2} />
      </AppShell>
    );
  }

  if (post.isError || !post.data) {
    return (
      <AppShell>
        <ErrorState message="Publicação não encontrada." onRetry={() => void post.refetch()} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <PostCard post={post.data} />

        <div className="flex justify-end">
          <ReportDialog targetType="post" targetId={id} />
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Comentários</h2>

          {user ? (
            <div className="surface-card space-y-3 p-5">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escreva com cuidado. Evite números de peso, calorias e comparações."
                rows={4}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                Comentar anonimamente
              </label>
              <Button
                onClick={() => addComment.mutate()}
                disabled={body.trim().length < 2 || addComment.isPending}
              >
                Publicar comentário
              </Button>
            </div>
          ) : (
            <div className="surface-card p-5 text-sm">
              <Link to="/auth" className="font-semibold underline underline-offset-2">
                Entre na Mesa Comum
              </Link>{" "}
              para comentar e apoiar outras pessoas.
            </div>
          )}

          {comments.data && comments.data.length === 0 ? (
            <EmptyState title="Nenhum comentário ainda" description="Sua palavra pode acolher." />
          ) : null}

          <ul className="space-y-3">
            {comments.data?.map((c) => {
              const name = c.is_anonymous ? "Membro anônimo" : (c.authorName ?? "Membro");
              return (
                <li key={c.id} className="surface-card flex gap-3 p-4">
                  <div className="size-8 shrink-0 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {c.authorAvatar ? (
                      <img src={c.authorAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{name}</span> •{" "}
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm">{c.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <SafetyNote />
      </div>
    </AppShell>
  );
}

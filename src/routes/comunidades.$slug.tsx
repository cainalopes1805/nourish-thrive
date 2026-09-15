import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Info, MessageSquare, Utensils, Award } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { PostCard, type FeedPost } from "@/components/social/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { toggleCommunityMembership } from "@/lib/community";
import { toast } from "sonner";

export const Route = createFileRoute("/comunidades/$slug")({
  head: () => ({
    meta: [
      { title: "Comunidade | Mesa Comum" },
      { name: "description", content: "Publicações, dúvidas e apoio dentro de uma comunidade." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { slug } = Route.useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();

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

  const c = community.data;

  const members = useQuery({
    queryKey: ["community-members", c?.id],
    enabled: !!c?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select("id, user_id, profiles(id, display_name, avatar_url)")
        .eq("community_id", c!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const posts = useQuery({
    queryKey: ["community-posts", c?.id],
    enabled: !!c?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, title, body, post_type, tags, sensitive_topics, is_anonymous, is_professional_content, created_at, profiles(display_name)",
        )
        .eq("community_id", c!.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      // Map authorName
      return (data ?? []).map((p: any) => ({
        ...p,
        authorName: p.profiles?.display_name,
      })) as FeedPost[];
    },
  });

  const isMember = members.data?.some((m) => m.user_id === user?.id) || false;

  const toggleMembership = useMutation({
    mutationFn: async () => {
      if (!user || !c) return;
      await toggleCommunityMembership(c.id, user.id, isMember);
    },
    onSuccess: () => {
      toast.success(isMember ? "Você saiu da comunidade." : "Você agora participa da comunidade.");
      queryClient.invalidateQueries({ queryKey: ["community-members", c?.id] });
    },
    onError: () => toast.error("Não foi possível atualizar sua participação agora."),
  });

  if (community.isLoading) {
    return (
      <AppShell>
        <CardSkeletonList count={3} />
      </AppShell>
    );
  }

  if (community.isError || !c) {
    return (
      <AppShell>
        <ErrorState message="Comunidade não encontrada." onRetry={() => void community.refetch()} />
      </AppShell>
    );
  }

  const recipes = posts.data?.filter((p) => p.post_type === "receita") || [];
  const challenges = posts.data?.filter((p) => p.post_type === "desafio") || [];

  return (
    <AppShell>
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link to="/comunidades" className="hover:underline">
          Comunidades
        </Link>{" "}
        / <span className="text-foreground">{c.name}</span>
      </nav>

      {/* Banner / Cover */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-br from-primary/15 to-primary/5 rounded-t-xl overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative p-6 md:p-8 w-full text-foreground bg-gradient-to-t from-background to-transparent pt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">
                {c.name}
              </h1>
              {c.topic && (
                <p className="text-sm font-medium opacity-90 drop-shadow-sm">{c.topic}</p>
              )}
            </div>

            <div className="shrink-0">
              {user ? (
                <Button
                  onClick={() => toggleMembership.mutate()}
                  variant={isMember ? "outline" : "default"}
                  disabled={toggleMembership.isPending}
                >
                  {isMember ? "Sair da comunidade" : "Participar"}
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/auth">Faça login para participar</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b rounded-none h-auto p-0 space-x-6">
            <TabsTrigger
              value="geral"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2"
            >
              <Info className="size-4 mr-2" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="conversas"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2"
            >
              <MessageSquare className="size-4 mr-2" /> Conversas
            </TabsTrigger>
            {recipes.length > 0 && (
              <TabsTrigger
                value="receitas"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2"
              >
                <Utensils className="size-4 mr-2" /> Receitas
              </TabsTrigger>
            )}
            {challenges.length > 0 && (
              <TabsTrigger
                value="desafios"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2"
              >
                <Award className="size-4 mr-2" /> Desafios
              </TabsTrigger>
            )}
            <TabsTrigger
              value="membros"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2"
            >
              <Users className="size-4 mr-2" /> Membros ({members.data?.length || 0})
            </TabsTrigger>
          </TabsList>

          <div className="py-6">
            <TabsContent value="geral" className="space-y-6 mt-0">
              <div className="surface-card p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-bold">Sobre o grupo</h2>
                  <p className="mt-2 text-foreground/90 leading-relaxed whitespace-pre-line">
                    {c.description}
                  </p>
                </div>

                {c.is_sensitive && (
                  <SafetyNote>
                    Esta comunidade trata de temas sensíveis. Cuide de você ao ler e comentar.
                  </SafetyNote>
                )}
              </div>

              {/* Espaço reservado para quando o modelo suportar "Profissional responsável" */}
              {/* <div className="surface-card p-6 space-y-4">
                <h2 className="text-lg font-bold">Profissional responsável</h2>
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-muted overflow-hidden">
                    <img src={prof.profile_photo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold">{prof.name}</p>
                    <p className="text-sm text-muted-foreground">{prof.profession} • {prof.specialties.join(", ")}</p>
                  </div>
                </div>
              </div> */}
            </TabsContent>

            <TabsContent value="conversas" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Conversas da comunidade</h2>
                {user ? (
                  <Button asChild size="sm">
                    <Link to="/criar">Publicar na comunidade</Link>
                  </Button>
                ) : null}
              </div>

              {posts.isLoading ? <CardSkeletonList count={2} /> : null}

              {posts.data && posts.data.length === 0 ? (
                <EmptyState
                  title="Nada por aqui ainda"
                  description="Este grupo está começando. Seja uma das primeiras pessoas a compartilhar algo."
                />
              ) : (
                <div className="space-y-4">
                  {posts.data?.map((p) => (
                    <PostCard key={p.id} post={{ ...p, communityName: c.name }} />
                  ))}
                </div>
              )}
            </TabsContent>

            {recipes.length > 0 && (
              <TabsContent value="receitas" className="mt-0 space-y-6">
                <h2 className="text-lg font-bold">Receitas da comunidade</h2>
                <div className="space-y-4">
                  {recipes.map((p) => (
                    <PostCard key={p.id} post={{ ...p, communityName: c.name }} />
                  ))}
                </div>
              </TabsContent>
            )}

            {challenges.length > 0 && (
              <TabsContent value="desafios" className="mt-0 space-y-6">
                <h2 className="text-lg font-bold">Desafios da comunidade</h2>
                <div className="space-y-4">
                  {challenges.map((p) => (
                    <PostCard key={p.id} post={{ ...p, communityName: c.name }} />
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="membros" className="mt-0 space-y-6">
              <h2 className="text-lg font-bold">Membros ({members.data?.length || 0})</h2>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {members.data?.map((m) => {
                  const prof = m.profiles as any;
                  return (
                    <div key={m.id} className="surface-card p-4 flex items-center gap-3">
                      <div className="size-10 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center font-bold text-primary bg-primary/10">
                        {prof?.avatar_url ? (
                          <img
                            src={prof.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          prof?.display_name?.charAt(0).toUpperCase() || "?"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {prof?.display_name || "Membro anônimo"}
                        </p>
                        <p className="text-xs text-muted-foreground">Membro</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppShell>
  );
}

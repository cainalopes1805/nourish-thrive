import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { supabase } from "@/integrations/supabase/client";
import { CreateCommunityDialog } from "@/components/social/CreateCommunityDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/useSession";
import saudeMentalImg from "@/assets/saude-mental.jpg";

function communityImage(topic: string | null) {
  const normalizedTopic = topic?.toLowerCase() ?? "";
  if (normalizedTopic.includes("mental") || normalizedTopic.includes("recupera") || normalizedTopic.includes("relaç")) {
    return saudeMentalImg;
  }
  if (normalizedTopic.includes("segurança") || normalizedTopic.includes("rótul")) return "/images/themes/reading-labels.jpg";
  return "/images/themes/fresh-ingredients.jpg";
}

export const Route = createFileRoute("/comunidades")({
  head: () => ({
    meta: [
      { title: "Comunidades de cuidado alimentar | Mesa Comum" },
      {
        name: "description",
        content:
          "Grupos temáticos sobre alimentação, saúde mental, segurança alimentar e recuperação, com moderação ativa.",
      },
      { property: "og:title", content: "Comunidades | Mesa Comum" },
      {
        property: "og:description",
        content: "Encontre grupos de apoio e aprendizado sobre alimentação e cuidado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunitiesPage,
});

function CommunitiesPage() {
  const { user } = useSession();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select(
          "id, slug, name, description, topic, is_sensitive, banner_url, avatar_url, community_members(count)",
        )
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filteredData = data?.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <header className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Comunidades</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Encontre um grupo que combine com a sua jornada.
            </p>
          </div>
          {user ? (
            <CreateCommunityDialog>
              <Button>Criar comunidade</Button>
            </CreateCommunityDialog>
          ) : (
            <Button asChild>
              <Link to="/auth">Entre para criar comunidade</Link>
            </Button>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar comunidades..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {isLoading ? <CardSkeletonList count={4} /> : null}
      {isError ? <ErrorState onRetry={() => refetch()} /> : null}
      {data && data.length === 0 ? (
        <EmptyState title="Nenhuma comunidade disponível" description="Volte em breve." />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredData?.map((c, i) => {
          const membersCount = c.community_members?.[0]?.count || 0;
          return (
            <Link
              key={c.id}
              to="/comunidades/$slug"
              params={{ slug: c.slug }}
              style={{ animationDelay: `${Math.min(i * 60, 360)}ms` }}
              className="surface-card group flex flex-col overflow-hidden card-pop animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500"
            >
              <div className="relative h-24 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                <img
                  src={c.banner_url || communityImage(c.topic)}
                  alt={c.banner_url ? `Capa da comunidade ${c.name}` : "Alimentos frescos em uma mesa"}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-2 flex items-center gap-3">
                  <div className="-mt-9 size-12 shrink-0 overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 font-bold text-primary">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h2 className="flex-1 font-semibold">{c.name}</h2>
                  <Users className="size-4 text-deep shrink-0" aria-hidden="true" />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{c.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {c.topic ? <span className="font-medium text-foreground">{c.topic}</span> : null}
                  <span>•</span>
                  <span>
                    {membersCount} {membersCount === 1 ? "membro" : "membros"}
                  </span>
                </div>

                {c.is_sensitive ? (
                  <div className="mt-3">
                    <span className="inline-flex rounded-full bg-warm/25 px-2.5 py-1 text-[11px] font-semibold text-warm-foreground">
                      Tema sensível
                    </span>
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <SafetyNote />
      </div>
    </AppShell>
  );
}

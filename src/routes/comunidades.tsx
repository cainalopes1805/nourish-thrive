import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { supabase } from "@/integrations/supabase/client";

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
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("id, slug, name, description, topic, is_sensitive")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Comunidades</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Espaços temáticos com moderação ativa. Escolha por assunto e participe no seu ritmo.
        </p>
      </header>

      {isLoading ? <CardSkeletonList count={4} /> : null}
      {isError ? <ErrorState onRetry={() => refetch()} /> : null}
      {data && data.length === 0 ? (
        <EmptyState title="Nenhuma comunidade disponível" description="Volte em breve." />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((c) => (
          <Link
            key={c.id}
            to="/comunidades/$slug"
            params={{ slug: c.slug }}
            className="surface-card block p-5 transition-shadow hover:shadow-lift"
          >
            <div className="mb-2 flex items-center gap-2">
              <Users className="size-4 text-deep" aria-hidden="true" />
              <h2 className="font-semibold">{c.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{c.description}</p>
            {c.is_sensitive ? (
              <span className="mt-3 inline-flex rounded-full bg-warm/25 px-2.5 py-1 text-[11px] font-semibold text-warm-foreground">
                Tema sensível
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <SafetyNote />
      </div>
    </AppShell>
  );
}

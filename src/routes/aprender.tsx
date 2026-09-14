import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { LEARN_CATEGORIES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type LearnSearch = { categoria?: string };

export const Route = createFileRoute("/aprender")({
  validateSearch: (search: Record<string, unknown>): LearnSearch =>
    typeof search['categoria'] === "string" ? { categoria: search['categoria'] } : {},

  head: () => ({
    meta: [
      { title: "Biblioteca de educação alimentar | Mesa Comum" },
      {
        name: "description",
        content:
          "Conteúdos revisados sobre nutrição, segurança alimentar, relação com a comida e saúde mental, com fontes citadas.",
      },
      { property: "og:title", content: "Aprender | Mesa Comum" },
      {
        property: "og:description",
        content: "Artigos educativos com linguagem acessível e fontes institucionais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const { categoria } = Route.useSearch();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["articles", categoria ?? "todos"],
    queryFn: async () => {
      let q = supabase
        .from("articles")
        .select(
          "id, slug, title, summary, category, content_type, reading_minutes, reading_level, author_name, badge, published_at",
        )
        .order("published_at", { ascending: false });
      if (categoria) q = q.eq("category", categoria);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Aprender</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Conteúdos educativos com linguagem acessível, revisão profissional e fontes citadas.
        </p>
      </header>

      <nav aria-label="Categorias" className="mb-6 flex flex-wrap gap-2">
        <Link
          to="/aprender"
          search={{}}
          className={cn(
            "rounded-full border border-border px-3 py-1.5 text-sm",
            !categoria && "bg-secondary text-deep",
          )}
        >
          Todos
        </Link>
        {LEARN_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            to="/aprender"
            search={{ categoria: cat }}
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-sm",
              categoria === cat && "bg-secondary text-deep",
            )}
          >
            {cat}
          </Link>
        ))}
      </nav>

      {isLoading ? <CardSkeletonList count={4} /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="Nenhum conteúdo nesta categoria"
          description="Escolha outra categoria para continuar explorando."
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {data?.map((a) => (
          <Link
            key={a.id}
            to="/aprender/$slug"
            params={{ slug: a.slug }}
            className="surface-card block p-5 transition-shadow hover:shadow-lift"
          >
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="size-4" aria-hidden="true" />
              <span>{a.category}</span>
              <span aria-hidden="true">•</span>
              <span>{a.reading_minutes} min</span>
            </div>
            <h2 className="font-semibold leading-snug">{a.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{a.summary}</p>
            <p className="mt-3 text-xs text-muted-foreground">Por {a.author_name}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <SafetyNote />
      </div>
    </AppShell>
  );
}

import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { ArticleCard, type ArticlePreview } from "@/components/learn/ArticleCard";
import { LEARN_THEMES, learnThemeSlug } from "@/lib/learnThemes";
import { supabase } from "@/integrations/supabase/client";

type LearnSearch = { categoria?: string };

export const Route = createFileRoute("/aprender")({
  validateSearch: (search: Record<string, unknown>): LearnSearch =>
    typeof search["categoria"] === "string" ? { categoria: search["categoria"] } : {},

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
    queryKey: ["articles", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id, slug, title, summary, category, reading_minutes, author_name, badge, cover_url, published_at",
        )
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as (ArticlePreview & { published_at: string })[];
    },
  });

  useEffect(() => {
    if (!categoria) return undefined;
    const slug = learnThemeSlug(categoria);
    const el = document.getElementById(slug);
    if (!el) return undefined;
    const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => clearTimeout(t);
  }, [categoria, data]);

  const byCategory = new Map<string, ArticlePreview[]>();
  for (const a of data ?? []) {
    const list = byCategory.get(a.category) ?? [];
    list.push(a);
    byCategory.set(a.category, list);
  }

  return (
    <AppShell>
      <header className="relative mb-8 overflow-hidden rounded-3xl">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="gradient-warm-hero absolute inset-0 opacity-90" />
          <div className="absolute -top-10 -right-10 size-56 animate-float rounded-full bg-white/15 blur-3xl" />
        </div>
        <div className="space-y-3 p-6 text-primary-foreground md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Biblioteca de educação alimentar
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">Aprender</h1>
          <p className="max-w-2xl text-sm opacity-90 md:text-base">
            Conteúdos educativos organizados por tema, com linguagem acessível, revisão
            profissional e fontes citadas.
          </p>
        </div>
      </header>

      <nav aria-label="Ir para tema" className="mb-8 flex flex-wrap gap-2">
        {LEARN_THEMES.map((theme) => {
          const Icon = theme.icon;
          const count = byCategory.get(theme.category)?.length ?? 0;
          if (count === 0) return null;
          return (
            <a
              key={theme.slug}
              href={`#${theme.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-soft"
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {theme.title}
            </a>
          );
        })}
      </nav>

      {isLoading ? <CardSkeletonList count={4} /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}

      <div className="space-y-14">
        {LEARN_THEMES.map((theme) => {
          const articles = byCategory.get(theme.category) ?? [];
          if (articles.length === 0) return null;
          const Icon = theme.icon;

          return (
            <section key={theme.slug} id={theme.slug} className="scroll-mt-24">
              <div className="surface-card mb-5 flex flex-col overflow-hidden md:flex-row">
                <div className="relative h-36 w-full shrink-0 overflow-hidden md:h-auto md:w-64">
                  <img src={theme.cover} alt="" className="h-full w-full object-cover" />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${theme.accent} opacity-60 mix-blend-multiply`}
                  />
                </div>
                <div className="flex flex-1 items-center gap-4 p-6">
                  <span
                    className={`inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.accent} text-white shadow-glow`}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold">{theme.title}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${theme.badgeClass}`}>
                        {articles.length} {articles.length === 1 ? "artigo" : "artigos"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a, i) => (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    accentClass={theme.accent}
                    style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {data && data.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-2 p-10 text-center">
          <BookOpen className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium">Nenhum conteúdo publicado ainda.</p>
        </div>
      ) : null}

      <div className="mt-10">
        <SafetyNote />
      </div>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, ExternalLink, GraduationCap, Quote } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, ErrorState } from "@/components/common/states";
import { SafetyNote, VerifiedBadge } from "@/components/common/SafetyNote";
import { ArticleCard, type ArticlePreview } from "@/components/learn/ArticleCard";
import { LEARN_THEME_BY_CATEGORY } from "@/lib/learnThemes";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/aprender/$slug")({
  head: () => ({
    meta: [
      { title: "Conteúdo educativo | Mesa Comum" },
      {
        name: "description",
        content:
          "Artigo educativo sobre alimentação, saúde mental e cuidado, com fontes institucionais citadas.",
      },
      { property: "og:title", content: "Conteúdo educativo | Mesa Comum" },
      {
        property: "og:description",
        content: "Leitura acessível com revisão profissional e referências.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();

  const article = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const sources = useQuery({
    queryKey: ["article-sources", article.data?.id],
    enabled: !!article.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_sources")
        .select("id, citation, content_sources(name, organization, url, source_type)")
        .eq("article_id", article.data!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const moreFromTheme = useQuery({
    queryKey: ["article-theme-more", article.data?.category, article.data?.id],
    enabled: !!article.data?.category,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, summary, category, reading_minutes, author_name, badge, cover_url")
        .eq("category", article.data!.category)
        .neq("id", article.data!.id)
        .limit(3);
      if (error) throw error;
      return (data ?? []) as ArticlePreview[];
    },
  });

  if (article.isLoading) {
    return (
      <AppShell>
        <CardSkeletonList count={2} />
      </AppShell>
    );
  }

  if (article.isError || !article.data) {
    return (
      <AppShell>
        <ErrorState message="Conteúdo não encontrado." onRetry={() => void article.refetch()} />
      </AppShell>
    );
  }

  const a = article.data;
  const theme = LEARN_THEME_BY_CATEGORY[a.category];
  const Icon = theme?.icon ?? BookOpen;
  const accent = theme?.accent ?? "from-primary to-warm";
  const paragraphs = a.body.split(/\n{2,}/).filter(Boolean);
  const isVerifiedAuthor = a.author_type === "profissional_verificado";

  return (
    <AppShell>
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/aprender" className="hover:underline">
          Aprender
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/aprender" search={{ categoria: a.category }} className="hover:text-primary hover:underline">
          {a.category}
        </Link>
      </nav>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Magazine cover hero */}
        <div className="relative overflow-hidden rounded-3xl shadow-lift">
          {a.cover_url ? (
            <img src={a.cover_url} alt="" className="h-56 w-full object-cover md:h-80" />
          ) : (
            <div className={cn("h-56 w-full bg-gradient-to-br md:h-80", accent)} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-6 text-deep-foreground md:p-8">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
                theme?.badgeClass ?? "bg-primary/20 text-primary",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {a.category}
            </span>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight drop-shadow-sm md:text-4xl">
              {a.title}
            </h1>
          </div>
        </div>

        {/* Meta strip */}
        <div className="surface-card flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            {a.author_name}
            {isVerifiedAuthor ? <VerifiedBadge label="Verificado" /> : null}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {a.reading_minutes} min de leitura
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="size-4" aria-hidden="true" />
            Nível {a.reading_level}
          </span>
          <span>
            Publicado em {new Date(a.published_at).toLocaleDateString("pt-BR")}
          </span>
        </div>

        {a.sensitive_topics?.length ? (
          <div className="rounded-2xl border border-warm/40 bg-warm/15 px-5 py-4 text-sm text-warm-foreground">
            <p className="font-semibold">Este conteúdo menciona temas sensíveis</p>
            <p className="mt-1 text-xs opacity-90">
              ({a.sensitive_topics.join(", ")}). Leia com cuidado e pause se precisar.
            </p>
          </div>
        ) : null}

        {/* Lead / summary callout */}
        <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-primary-foreground shadow-glow", accent)}>
          <Quote className="absolute -right-2 -top-2 size-20 opacity-15" aria-hidden="true" />
          <p className="relative text-lg font-medium leading-relaxed">{a.summary}</p>
        </div>

        {/* Body */}
        <article className="surface-card space-y-4 p-6 md:p-8">
          <div className={cn("mb-2 h-1 w-16 rounded-full bg-gradient-to-r", accent)} />
          <div className="prose-mesa space-y-4 text-[15.5px] leading-relaxed text-foreground/90">
            {paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-extrabold first-letter:leading-[0.85] first-letter:text-primary" : undefined}>
                {p}
              </p>
            ))}
          </div>
        </article>

        {/* Author card */}
        <div className="surface-card flex items-center gap-4 p-5">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-primary-foreground",
              accent,
            )}
          >
            {a.author_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{a.author_name}</p>
              {isVerifiedAuthor ? <VerifiedBadge /> : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {isVerifiedAuthor ? "Profissional de saúde verificado" : "Equipe editorial Mesa Comum"}
            </p>
          </div>
        </div>

        {/* Sources */}
        <section aria-labelledby="fontes" className="surface-card p-6">
          <h2 id="fontes" className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <BookOpen className="size-4" aria-hidden="true" />
            Fontes e referências
          </h2>
          {sources.data && sources.data.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {sources.data.map((s) => {
                const src = s.content_sources as unknown as {
                  name: string;
                  organization: string | null;
                  url: string | null;
                } | null;
                return (
                  <li key={s.id} className="rounded-xl border border-border bg-sand/60 p-3 text-sm">
                    {src?.url ? (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        {src?.name}
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="font-medium">{src?.name ?? "Fonte"}</span>
                    )}
                    {src?.organization ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{src.organization}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Fontes em atualização.</p>
          )}
        </section>

        <SafetyNote />

        {/* More from this theme */}
        {moreFromTheme.data && moreFromTheme.data.length > 0 ? (
          <section className="pt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Mais sobre {a.category}</h2>
              <Link
                to="/aprender"
                search={{ categoria: a.category }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Ver tema completo
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moreFromTheme.data.map((rel, i) => (
                <ArticleCard
                  key={rel.id}
                  article={rel}
                  accentClass={accent}
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}

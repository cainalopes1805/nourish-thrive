import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <AppShell>
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link to="/aprender" className="hover:underline">
          Aprender
        </Link>{" "}
        / <span className="text-foreground">{a.category}</span>
      </nav>

      <article className="surface-card space-y-5 p-6 md:p-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-deep">
            {a.content_type} • {a.reading_minutes} min • leitura {a.reading_level}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
            {a.title}
          </h1>
          <p className="text-sm text-muted-foreground">{a.summary}</p>
          <p className="text-xs text-muted-foreground">
            Por {a.author_name} • publicado em{" "}
            {new Date(a.published_at).toLocaleDateString("pt-BR")}
          </p>
        </header>

        {a.sensitive_topics?.length ? (
          <p className="rounded-lg bg-warm/20 px-4 py-3 text-xs text-warm-foreground">
            Este conteúdo menciona temas sensíveis ({a.sensitive_topics.join(", ")}). Leia com
            cuidado e pause se precisar.
          </p>
        ) : null}

        <div className="prose-mesa whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
          {a.body}
        </div>

        <section aria-labelledby="fontes" className="border-t border-border pt-5">
          <h2 id="fontes" className="mb-3 text-sm font-semibold">
            Fontes
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {sources.data?.map((s) => {
              const src = s.content_sources as unknown as {
                name: string;
                organization: string | null;
                url: string | null;
              } | null;
              return (
                <li key={s.id}>
                  {src?.url ? (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      {src?.name}
                    </a>
                  ) : (
                    (src?.name ?? "Fonte")
                  )}
                  {src?.organization ? ` — ${src.organization}` : ""}
                  {s.citation ? `. ${s.citation}` : ""}
                </li>
              );
            })}
            {sources.data && sources.data.length === 0 ? <li>Fontes em atualização.</li> : null}
          </ul>
        </section>

        <SafetyNote />
      </article>
    </AppShell>
  );
}

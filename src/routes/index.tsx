import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  LifeBuoy,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";
import heroImg from "@/assets/hero-mesa.jpg";
import segurancaImg from "@/assets/seguranca.jpg";
import saudeMentalImg from "@/assets/saude-mental.jpg";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/AppShell";
import { DemoBadge, VerifiedBadge } from "@/components/common/SafetyNote";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mesa Comum — cuidar da alimentação é cuidar de você" },
      {
        name: "description",
        content:
          "Comunidade de cuidado alimentar: educação alimentar, segurança dos alimentos, saúde mental e profissionais de saúde verificados. Sem dieta e sem comparação de corpos.",
      },
      { property: "og:title", content: "Mesa Comum — comunidade de cuidado alimentar" },
      {
        property: "og:description",
        content: "Aprenda, compartilhe, encontre apoio e conecte-se a profissionais de saúde.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { data: communities } = useQuery({
    queryKey: ["landing-communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("id,slug,name,description")
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: articles } = useQuery({
    queryKey: ["landing-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id,slug,title,summary,category,badge,reading_minutes")
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: pros } = useQuery({
    queryKey: ["landing-pros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_profiles")
        .select("id,name,profession,location,specialties,is_demo")
        .eq("verified_status", "approved")
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/aprender">Aprender</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/profissionais">Profissionais</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container-page grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <Sprout className="size-3.5" aria-hidden="true" />
              {BRAND.tagline}
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] md:text-5xl">
              Cuidar da alimentação também é cuidar de você.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Aprenda, compartilhe, encontre apoio e conecte-se a profissionais de saúde.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Entrar na comunidade
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/profissionais">Encontrar profissional</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sem contagem de calorias, sem antes e depois, sem promessas de emagrecimento.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border shadow-lift">
            <img
              src={heroImg}
              alt="Três pessoas dividindo uma refeição caseira em uma mesa de madeira"
              width={1600}
              height={1104}
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <Section
          title="Comunidades para conversar com cuidado"
          description="Espaços moderados por tema, com regras claras de convivência."
          action={<Link to="/comunidades" className="text-sm font-semibold underline">Ver todas</Link>}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(communities ?? []).map((c) => (
              <Link
                key={c.id}
                to="/comunidades/$slug"
                params={{ slug: c.slug }}
                className="surface-card block p-5 transition-shadow hover:shadow-lift"
              >
                <Users className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          title="Conteúdos recomendados"
          description="Material educativo com autoria identificada e fontes citadas."
          action={<Link to="/aprender" className="text-sm font-semibold underline">Ir para a biblioteca</Link>}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {(articles ?? []).map((a) => (
              <Link
                key={a.id}
                to="/aprender/$slug"
                params={{ slug: a.slug }}
                className="surface-card flex flex-col gap-2 p-5 transition-shadow hover:shadow-lift"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {a.category}
                </span>
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.summary}</p>
                <span className="mt-auto pt-2 text-xs text-muted-foreground">
                  {a.badge} · {a.reading_minutes} min
                </span>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          title="Profissionais de saúde verificados"
          description="Perfis com conselho e registro profissional conferidos antes da publicação."
          action={<Link to="/profissionais" className="text-sm font-semibold underline">Buscar</Link>}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {(pros ?? []).map((p) => (
              <Link
                key={p.id}
                to="/profissionais/$id"
                params={{ id: p.id }}
                className="surface-card p-5 transition-shadow hover:shadow-lift"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <VerifiedBadge />
                  {p.is_demo ? <DemoBadge /> : null}
                </div>
                <h3 className="mt-3 font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.profession} · {p.location}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {(p.specialties ?? []).slice(0, 3).join(" · ")}
                </p>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Os perfis acima são de demonstração e não representam pessoas reais.
          </p>
        </Section>

        <section className="container-page grid gap-6 py-14 md:grid-cols-2">
          <article className="surface-card overflow-hidden">
            <img
              src={segurancaImg}
              alt="Bancada de cozinha com legumes frescos e verduras lavadas em um escorredor"
              width={1200}
              height={800}
              loading="lazy"
              className="h-52 w-full object-cover"
            />
            <div className="space-y-3 p-6">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-bold">Segurança alimentar no dia a dia</h2>
              <p className="text-sm text-muted-foreground">
                Higiene, contaminação cruzada, armazenamento, congelamento, validade e rotulagem —
                explicados de forma simples.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/aprender" search={{ categoria: "Segurança alimentar" }}>
                  Ver conteúdos
                </Link>
              </Button>
            </div>
          </article>
          <article className="surface-card overflow-hidden">
            <img
              src={saudeMentalImg}
              alt="Pessoa sentada junto à janela segurando uma caneca, em um momento tranquilo"
              width={1200}
              height={800}
              loading="lazy"
              className="h-52 w-full object-cover"
            />
            <div className="space-y-3 p-6">
              <HeartHandshake className="size-5 text-accent" aria-hidden="true" />
              <h2 className="text-xl font-bold">Saúde mental e relação com a comida</h2>
              <p className="text-sm text-muted-foreground">
                Fome, saciedade, culpa alimentar, imagem corporal e sinais de alerta — com apoio e
                sem julgamento.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/aprender" search={{ categoria: "Relação com a comida" }}>
                  Ver conteúdos
                </Link>
              </Button>
            </div>
          </article>
        </section>

        <Section title="Como funciona" description="Três passos simples.">
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              {
                t: "Crie sua conta",
                d: "Escolha um nome de exibição — ele pode ser diferente do seu nome legal.",
              },
              {
                t: "Escolha seus temas",
                d: "O feed se organiza pelos assuntos que fazem sentido para você, com controles de conteúdo sensível.",
              },
              {
                t: "Encontre apoio",
                d: "Converse na comunidade, leia conteúdo confiável e agende com profissionais verificados.",
              },
            ].map((s, i) => (
              <li key={s.t} className="surface-card p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-deep text-sm font-bold text-deep-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </Section>

        <section className="container-page py-14">
          <div className="surface-card flex flex-col items-start gap-4 bg-deep p-8 text-deep-foreground md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <LifeBuoy className="size-5" aria-hidden="true" /> Precisa de ajuda agora?
              </h2>
              <p className="max-w-xl text-sm opacity-85">
                O centro de ajuda reúne caminhos para encontrar profissionais, apoio emocional e
                orientação sobre serviços públicos em situações urgentes.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link to="/ajuda">Abrir centro de ajuda</Link>
            </Button>
          </div>
        </section>

        <Section
          title="Fontes e credibilidade"
          description="Conteúdo educativo referenciado em fontes oficiais e diretrizes profissionais."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Ministério da Saúde", "ANVISA", "Organização Mundial da Saúde", "Diretrizes clínicas e conselhos profissionais"].map(
              (s) => (
                <li key={s} className="surface-card flex items-center gap-2 p-4 text-sm">
                  <BookOpen className="size-4 text-primary" aria-hidden="true" />
                  {s}
                </li>
              ),
            )}
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="container-page space-y-3 text-sm text-muted-foreground">
          <Logo />
          <p className="max-w-2xl">
            A Mesa Comum é um espaço de educação alimentar e apoio comunitário. Não substitui
            atendimento médico, psicológico ou nutricional presencial quando necessário. Conteúdos e
            profissionais exibidos aqui são de demonstração.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacidade" className="underline underline-offset-2">
              Privacidade
            </Link>
            <Link to="/ajuda" className="underline underline-offset-2">
              Centro de ajuda
            </Link>
            <Link to="/aprender" className="underline underline-offset-2">
              Biblioteca
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

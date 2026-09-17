import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  LifeBuoy,
  Leaf,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
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
        .select("id,slug,name,description,banner_url,avatar_url")
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
        .select("id,slug,title,summary,category,badge,reading_minutes,cover_url")
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
        .select("id,name,profession,location,specialties,is_demo,profile_photo")
        .eq("verified_status", "approved")
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="container-page flex h-18 items-center justify-between py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link to="/comunidades">Comunidades</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/aprender">Aprender</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/profissionais">Profissionais</Link>
            </Button>
            <Button asChild size="sm" className="shadow-glow">
              <Link to="/auth">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-24 -left-24 size-[26rem] animate-float rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute top-1/3 -right-24 size-[24rem] animate-float-slower rounded-full bg-accent/25 blur-3xl" />
            <div className="absolute -bottom-32 left-1/4 size-[22rem] animate-float rounded-full bg-warm/20 blur-3xl" />
          </div>

          <div className="container-page grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.02fr_.98fr] lg:py-24">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3 py-1.5 text-xs font-bold text-primary shadow-soft">
                <Sprout className="size-3.5" aria-hidden="true" />
                {BRAND.tagline}
              </span>
              <h1 className="max-w-2xl text-5xl font-extrabold leading-[.98] tracking-[-.045em] md:text-6xl lg:text-7xl">
                Seu bem-estar{" "}
                <span className="font-serif italic font-medium text-primary">merece</span> uma mesa
                mais
                <span className="relative ml-3 inline-block text-primary">
                  gentil
                  <svg
                    className="absolute -bottom-2 left-0 h-2 w-full text-warm"
                    viewBox="0 0 160 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 9C38 2 102 1 158 7"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                .
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Informação confiável, conversas sem julgamento e profissionais verificados para
                cuidar da sua relação com a comida — do seu jeito.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="animate-pulse-glow">
                  <Link to="/auth">
                    Entrar na comunidade
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/profissionais">Encontrar profissional</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" /> Sem dietas restritivas
                </span>
                <span className="flex items-center gap-1.5">
                  <HeartHandshake className="size-3.5 text-primary" /> Espaço acolhedor
                </span>
              </div>
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-700 relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -inset-4 -z-10 rounded-[3rem] border border-primary/15 bg-primary/5 rotate-3" />
              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-card shadow-lift transition-transform duration-500 hover:-rotate-1 hover:scale-[1.02]">
                <img
                  src={heroImg}
                  alt="Três pessoas dividindo uma refeição caseira em uma mesa de madeira"
                  width={1600}
                  height={1104}
                  className="aspect-[4/4.2] h-full w-full object-cover md:aspect-[4/3.7]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/55 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-deep/85 p-4 text-deep-foreground backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warm text-deep">
                      <MessageCircleHeart className="size-5" />
                    </span>
                    <p className="text-sm font-semibold leading-snug">
                      "Aqui, comida deixou de ser uma cobrança e virou cuidado."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container-page pb-12 md:pb-16">
            <div className="hero-proof-grid rounded-3xl border border-border/80 bg-card/70 p-3 shadow-soft backdrop-blur-sm md:grid-cols-3 md:p-4">
              {[
                {
                  icon: Leaf,
                  title: "Sem fórmula pronta",
                  description: "Você encontra caminhos, não regras.",
                },
                {
                  icon: ShieldCheck,
                  title: "Cuidado que protege",
                  description: "Moderação e fontes identificadas.",
                },
                {
                  icon: Sparkles,
                  title: "Feito para a vida real",
                  description: "Apoio para cada fase da sua rotina.",
                },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-center gap-3 rounded-2xl p-3 md:px-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Section
          eyebrow="Encontre sua roda"
          title="Conversas que fazem bem"
          description="Espaços moderados por tema, com regras claras de convivência."
          action={
            <Link to="/comunidades" className="text-sm font-semibold underline">
              Ver todas
            </Link>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(communities ?? []).map((c, i) => (
              <Link
                key={c.id}
                to="/comunidades/$slug"
                params={{ slug: c.slug }}
                style={{ animationDelay: `${Math.min(i * 70, 350)}ms` }}
                className="surface-card group flex flex-col overflow-hidden card-pop animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500"
              >
                <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-warm/20">
                  {c.banner_url ? (
                    <img
                      src={c.banner_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="-mt-9 mb-2 flex items-center gap-3">
                    <div className="size-11 shrink-0 overflow-hidden rounded-full border-4 border-card bg-primary/15 shadow-sm">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-primary">
                          <Users className="size-4" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold">{c.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Para ler no seu ritmo"
          title="Conteúdos que acolhem e informam"
          description="Material educativo com autoria identificada e fontes citadas."
          action={
            <Link to="/aprender" className="text-sm font-semibold underline">
              Ir para a biblioteca
            </Link>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            {(articles ?? []).map((a, i) => (
              <Link
                key={a.id}
                to="/aprender/$slug"
                params={{ slug: a.slug }}
                style={{ animationDelay: `${Math.min(i * 70, 350)}ms` }}
                className="surface-card group flex flex-col overflow-hidden card-pop animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500"
              >
                {a.cover_url ? (
                  <div className="h-32 w-full overflow-hidden bg-muted">
                    <img
                      src={a.cover_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span className="inline-flex w-fit items-center rounded-full bg-accent/30 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                    {a.category}
                  </span>
                  <h3 className="font-semibold transition-colors group-hover:text-primary">
                    {a.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{a.summary}</p>
                  <span className="mt-auto pt-2 text-xs text-muted-foreground">
                    {a.badge} · {a.reading_minutes} min
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Quando você quiser ir além"
          title="Profissionais de saúde verificados"
          description="Perfis com conselho e registro profissional conferidos antes da publicação."
          action={
            <Link to="/profissionais" className="text-sm font-semibold underline">
              Buscar
            </Link>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            {(pros ?? []).map((p, i) => (
              <Link
                key={p.id}
                to="/profissionais/$id"
                params={{ id: p.id }}
                style={{ animationDelay: `${Math.min(i * 70, 350)}ms` }}
                className="surface-card group flex gap-4 p-5 card-pop animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500"
              >
                <div className="size-14 shrink-0 overflow-hidden rounded-full bg-primary/15 ring-2 ring-transparent transition-all group-hover:ring-primary/50">
                  {p.profile_photo ? (
                    <img
                      src={p.profile_photo}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <VerifiedBadge />
                    {p.is_demo ? <DemoBadge /> : null}
                  </div>
                  <h3 className="mt-1 font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {p.profession} · {p.location}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {(p.specialties ?? []).slice(0, 3).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Os perfis acima são de demonstração e não representam pessoas reais.
          </p>
        </Section>

        <section className="container-page grid gap-6 py-14 md:grid-cols-2">
          <article className="surface-card group card-pop overflow-hidden">
            <div className="relative h-52 w-full overflow-hidden">
              <img
                src={segurancaImg}
                alt="Bancada de cozinha com legumes frescos e verduras lavadas em um escorredor"
                width={1200}
                height={800}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/50 to-transparent" />
            </div>
            <div className="space-y-3 p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
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
          <article className="surface-card group card-pop overflow-hidden">
            <div className="relative h-52 w-full overflow-hidden">
              <img
                src={saudeMentalImg}
                alt="Pessoa sentada junto à janela segurando uma caneca, em um momento tranquilo"
                width={1200}
                height={800}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/50 to-transparent" />
            </div>
            <div className="space-y-3 p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent/30 text-accent-foreground">
                <HeartHandshake className="size-5" aria-hidden="true" />
              </span>
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

        <Section
          eyebrow="Comece com leveza"
          title="Um espaço que acompanha você"
          description="Três passos simples."
        >
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
              <li key={s.t} className="surface-card card-pop p-5">
                <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-warm text-sm font-bold text-primary-foreground shadow-glow">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </Section>

        <section className="container-page py-14">
          <div className="gradient-deep-panel surface-card flex flex-col items-start gap-4 border-0 p-8 text-deep-foreground shadow-glow md:flex-row md:items-center md:justify-between">
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
          eyebrow="Informação com responsabilidade"
          title="Fontes e credibilidade"
          description="Conteúdo educativo referenciado em fontes oficiais e diretrizes profissionais."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Ministério da Saúde",
              "ANVISA",
              "Organização Mundial da Saúde",
              "Diretrizes clínicas e conselhos profissionais",
            ].map((s) => (
              <li key={s} className="surface-card card-pop flex items-center gap-2 p-4 text-sm">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <BookOpen className="size-4" aria-hidden="true" />
                </span>
                {s}
              </li>
            ))}
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
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-bold tracking-[-.035em] md:text-4xl">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

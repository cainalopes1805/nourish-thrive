import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, Phone } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Centro de ajuda e apoio | Mesa Comum" },
      {
        name: "description",
        content:
          "Canais de apoio emocional, orientação sobre sofrimento com a alimentação e como pedir ajuda com segurança.",
      },
      { property: "og:title", content: "Centro de ajuda | Mesa Comum" },
      {
        property: "og:description",
        content: "Onde buscar apoio quando a relação com a comida está doendo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

const channels = [
  {
    name: "CVV — Centro de Valorização da Vida",
    detail: "Apoio emocional gratuito e sigiloso, 24 horas, pelo telefone 188 ou em cvv.org.br.",
  },
  {
    name: "SAMU — 192",
    detail: "Emergências de saúde com risco imediato à vida.",
  },
  {
    name: "CAPS da sua cidade",
    detail: "Atendimento público em saúde mental, incluindo transtornos alimentares.",
  },
  {
    name: "UBS — Unidade Básica de Saúde",
    detail: "Porta de entrada do SUS para avaliação nutricional e encaminhamentos.",
  },
];

function HelpPage() {
  return (
    <AppShell>
      <header className="mb-6 space-y-2">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          <LifeBuoy className="size-6 text-accent" aria-hidden="true" />
          Preciso de ajuda
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Se você está em sofrimento agora, você não precisa lidar com isso sozinho(a). A Mesa Comum
          não é um serviço de emergência, mas pode indicar caminhos.
        </p>
      </header>

      <section className="surface-card mb-6 space-y-3 border-l-4 border-accent p-6">
        <h2 className="text-lg font-semibold">Risco imediato</h2>
        <p className="text-sm text-foreground/90">
          Se houver risco de vida para você ou outra pessoa, procure atendimento de emergência
          imediatamente pelo <strong>192 (SAMU)</strong> ou vá ao serviço de urgência mais próximo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {channels.map((c, i) => (
          <article
            key={c.name}
            style={{ animationDelay: `${i * 60}ms` }}
            className="surface-card card-pop animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards p-5 duration-500"
          >
            <h3 className="flex items-center gap-3 font-semibold">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Phone className="size-4" aria-hidden="true" />
              </span>
              {c.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.detail}</p>
          </article>
        ))}
      </section>

      <section className="surface-card mt-6 space-y-3 p-6">
        <h2 className="text-lg font-semibold">Dentro da plataforma</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Você pode{" "}
            <Link to="/profissionais" className="underline underline-offset-2">
              falar com um profissional verificado
            </Link>{" "}
            e agendar uma consulta.
          </li>
          <li>
            Pode ativar a{" "}
            <Link to="/experiencia-protegida" className="underline underline-offset-2">
              experiência protegida
            </Link>{" "}
            para reduzir conteúdos sensíveis no seu feed.
          </li>
          <li>Pode denunciar qualquer publicação que incentive práticas perigosas.</li>
          <li>Pode publicar de forma anônima quando precisar de apoio.</li>
        </ul>
      </section>
    </AppShell>
  );
}

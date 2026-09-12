import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { SafetyNote } from "@/components/common/SafetyNote";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade e uso de dados | Mesa Comum" },
      {
        name: "description",
        content:
          "Como a Mesa Comum trata dados sensíveis de saúde, consentimento, anonimato e exclusão de conta.",
      },
      { property: "og:title", content: "Privacidade e dados | Mesa Comum" },
      {
        property: "og:description",
        content: "Transparência sobre dados de saúde, consentimento e controle do usuário.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const blocks = [
  {
    title: "Dados sensíveis de saúde",
    body: "Informações sobre alimentação, saúde mental e consultas são tratadas como dados sensíveis. Só ficam visíveis para você e, quando você escolhe, para o profissional com quem se conecta.",
  },
  {
    title: "Anonimato",
    body: "Você pode publicar e comentar de forma anônima na comunidade. O nome de exibição é separado da sua identidade legal, que só é usada em processos de verificação profissional.",
  },
  {
    title: "Consentimento",
    body: "Pedimos consentimento específico antes de compartilhar qualquer informação com profissionais e antes de tratar temas sensíveis. Você pode revogar a qualquer momento.",
  },
  {
    title: "Diário de cuidado",
    body: "O diário é privado por padrão. Ninguém da comunidade, da moderação ou da equipe vê o conteúdo do seu diário.",
  },
  {
    title: "Moderação e segurança",
    body: "Denúncias são analisadas por moderação humana. Registramos ações de moderação para auditoria, sem expor o conteúdo privado de terceiros.",
  },
  {
    title: "Exclusão e portabilidade",
    body: "Você pode solicitar a exportação ou a exclusão dos seus dados a partir do Meu espaço. A exclusão remove perfil, publicações, diário e histórico de mensagens.",
  },
];

function PrivacyPage() {
  return (
    <AppShell>
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Privacidade e dados</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cuidado com dados é parte do cuidado com pessoas. Aqui está, em linguagem simples, como
          tratamos suas informações.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map((b) => (
          <section key={b.title} className="surface-card p-5">
            <h2 className="font-semibold">{b.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <SafetyNote />
        <p className="text-sm text-muted-foreground">
          Dúvidas sobre segurança ou uso indevido? Comece pelo{" "}
          <Link to="/ajuda" className="underline underline-offset-2">
            centro de ajuda
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}

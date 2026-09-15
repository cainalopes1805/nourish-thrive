import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { POST_TYPES, SENSITIVE_TOPICS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useRoles } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/criar")({
  head: () => ({
    meta: [
      { title: "Criar publicação | Mesa Comum" },
      {
        name: "description",
        content:
          "Compartilhe uma experiência, dúvida, receita ou pedido de apoio com a comunidade.",
      },
      { property: "og:title", content: "Criar publicação | Mesa Comum" },
      { property: "og:description", content: "Publique com segurança e cuidado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePostPage,
});

function CreatePostPage() {
  const { user } = useSession();
  const { data: roles } = useRoles(user);
  const navigate = useNavigate();

  const [postType, setPostType] = useState<string>("experiencia");
  const [communityId, setCommunityId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const isPro = roles?.includes("verified_professional");

  const communities = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("id, name, slug")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  function toggleTopic(value: string) {
    setTopics((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    );
  }

  async function submit() {
    if (!user) return;
    if (body.trim().length < 10) {
      toast.error("Escreva um pouco mais para publicar.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        community_id: communityId || null,
        post_type: postType,
        title: title.trim() || null,
        body: body.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        is_anonymous: anonymous,
        is_professional_content: postType === "profissional" && !!isPro,
        sensitive_topics: topics,
        status: "published",
      })
      .select("id")
      .maybeSingle();
    setSaving(false);
    if (error || !data) {
      toast.error("Não foi possível publicar agora.");
      return;
    }
    toast.success("Publicação criada.");
    void navigate({ to: "/publicacoes/$id", params: { id: data.id } });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Criar publicação</h1>
          <p className="text-sm text-muted-foreground">
            Compartilhe o que faz sentido para você. Evite números de peso, calorias e comparações
            corporais.
          </p>
        </header>

        <div className="surface-card space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo de publicação</Label>
            <select
              id="tipo"
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {POST_TYPES.filter((t) => t.value !== "profissional" || isPro).map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.hint}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comunidade">Comunidade (opcional)</Label>
            <select
              id="comunidade"
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Sem comunidade</option>
              {communities.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título (opcional)</Label>
            <Input id="titulo" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="texto">Sua mensagem</Label>
            <Textarea
              id="texto"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Conte com suas palavras…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags separadas por vírgula</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="rotina, cozinha, apoio"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Este conteúdo menciona temas sensíveis?</legend>
            <div className="flex flex-wrap gap-2">
              {SENSITIVE_TOPICS.map((t) => (
                <label
                  key={t.value}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={topics.includes(t.value)}
                    onChange={() => toggleTopic(t.value)}
                    className="size-4 rounded border-input"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="size-4 rounded border-input"
            />
            Publicar anonimamente
          </label>

          <Button onClick={submit} disabled={saving} className="w-full">
            Publicar
          </Button>
        </div>

        <SafetyNote>
          Publicações que incentivam restrição severa, jejum extremo ou comparação corporal podem
          ser removidas pela moderação.
        </SafetyNote>
      </div>
    </AppShell>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INTERESTS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useRoles, useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/meu-espaco")({
  head: () => ({
    meta: [
      { title: "Meu espaço | Mesa Comum" },
      {
        name: "description",
        content: "Ajuste seu perfil, interesses, preferências de feed e controle dos seus dados.",
      },
      { property: "og:title", content: "Meu espaço | Mesa Comum" },
      { property: "og:description", content: "Seu perfil e suas preferências de cuidado." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MySpacePage,
});

function MySpacePage() {
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const { data: roles } = useRoles(user);
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setBio(profile.bio ?? "");
    setInterests(profile.interests ?? []);
  }, [profile]);

  const myPosts = useQuery({
    queryKey: ["my-posts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, body, created_at")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value],
    );
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim(), bio: bio.trim(), interests })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar o perfil.");
      return;
    }
    toast.success("Perfil atualizado.");
    void queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  return (
    <AppShell>
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Meu espaço</h1>
        <p className="text-sm text-muted-foreground">
          Seu nome de exibição é separado da sua identidade legal.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="surface-card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Perfil</h2>
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome de exibição</Label>
            <Input
              id="nome"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Sobre você (opcional)</Label>
            <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Interesses</legend>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(i)}
                    onChange={() => toggleInterest(i)}
                    className="size-4 rounded border-input"
                  />
                  {i}
                </label>
              ))}
            </div>
          </fieldset>
          <Button onClick={() => void save()} disabled={saving}>
            Salvar alterações
          </Button>
        </section>

        <aside className="space-y-4">
          <section className="surface-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Atalhos</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/diario" className="underline underline-offset-2">
                  Diário de cuidado
                </Link>
              </li>
              <li>
                <Link to="/experiencia-protegida" className="underline underline-offset-2">
                  Experiência protegida
                </Link>
              </li>
              <li>
                <Link to="/consultas" className="underline underline-offset-2">
                  Minhas consultas
                </Link>
              </li>
              <li>
                <Link to="/painel-profissional" className="underline underline-offset-2">
                  {roles?.includes("verified_professional")
                    ? "Painel profissional"
                    : "Sou profissional de saúde"}
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="underline underline-offset-2">
                  Privacidade e dados
                </Link>
              </li>
            </ul>
          </section>

          <section className="surface-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Suas publicações</h2>
            <ul className="space-y-2 text-sm">
              {myPosts.data?.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/publicacoes/$id"
                    params={{ id: p.id }}
                    className="underline underline-offset-2"
                  >
                    {p.title ?? `${p.body.slice(0, 40)}…`}
                  </Link>
                </li>
              ))}
              {myPosts.data && myPosts.data.length === 0 ? (
                <li className="text-muted-foreground">Você ainda não publicou nada.</li>
              ) : null}
            </ul>
          </section>
        </aside>
      </div>

      <div className="mt-8">
        <SafetyNote />
      </div>
    </AppShell>
  );
}

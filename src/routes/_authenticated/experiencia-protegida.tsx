import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SENSITIVE_TOPICS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/experiencia-protegida")({
  head: () => ({
    meta: [
      { title: "Experiência protegida | Mesa Comum" },
      {
        name: "description",
        content:
          "Reduza conteúdos sobre peso, calorias e comparação corporal e deixe o feed mais seguro para você.",
      },
      { property: "og:title", content: "Experiência protegida | Mesa Comum" },
      { property: "og:description", content: "Controle o que aparece no seu feed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProtectedExperiencePage,
});

function ProtectedExperiencePage() {
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const queryClient = useQueryClient();

  const [recovery, setRecovery] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setRecovery(!!profile.recovery_friendly_mode);
    const prefs = (profile.feed_preferences ?? {}) as { hidden_topics?: string[] };
    setHidden(prefs.hidden_topics ?? []);
  }, [profile]);

  function toggle(value: string) {
    setHidden((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    );
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        recovery_friendly_mode: recovery,
        feed_preferences: { hidden_topics: hidden },
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar suas preferências.");
      return;
    }
    toast.success("Preferências atualizadas.");
    void queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
            <ShieldCheck className="size-6 text-deep" aria-hidden="true" /> Experiência protegida
          </h1>
          <p className="text-sm text-muted-foreground">
            Você decide o que quer ver. Nada aqui é definitivo: pode mudar quando quiser.
          </p>
        </header>

        <section className="surface-card space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Modo amigável à recuperação</h2>
              <p className="text-sm text-muted-foreground">
                Oculta publicações marcadas com temas sensíveis e desativa conteúdos focados em
                estética corporal.
              </p>
            </div>
            <Switch
              checked={recovery}
              onCheckedChange={setRecovery}
              aria-label="Ativar modo amigável à recuperação"
            />
          </div>

          <fieldset className="space-y-2 border-t border-border pt-4">
            <legend className="text-sm font-medium">Temas que você prefere não ver</legend>
            <div className="flex flex-wrap gap-2">
              {SENSITIVE_TOPICS.map((t) => (
                <label
                  key={t.value}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={hidden.includes(t.value)}
                    onChange={() => toggle(t.value)}
                    className="size-4 rounded border-input"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <Button onClick={() => void save()} disabled={saving}>
            Salvar preferências
          </Button>
        </section>

        <SafetyNote />
      </div>
    </AppShell>
  );
}

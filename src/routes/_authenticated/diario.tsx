import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NotebookPen, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/diario")({
  head: () => ({
    meta: [
      { title: "Diário de cuidado | Mesa Comum" },
      {
        name: "description",
        content:
          "Um espaço privado para registrar humor, percepções sobre alimentação e pequenas conquistas.",
      },
      { property: "og:title", content: "Diário de cuidado | Mesa Comum" },
      { property: "og:description", content: "Registros privados, sem números e sem cobrança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JournalPage,
});

const moods = ["tranquilo", "cansado", "ansioso", "animado", "triste", "neutro"];

const moodClass: Record<string, string> = {
  tranquilo: "bg-primary/15 text-primary",
  cansado: "bg-secondary text-secondary-foreground",
  ansioso: "bg-destructive/15 text-destructive",
  animado: "bg-warm/25 text-warm-foreground",
  triste: "bg-deep/15 text-deep",
  neutro: "bg-muted text-muted-foreground",
};

function JournalPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [mood, setMood] = useState("neutro");
  const [eating, setEating] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [win, setWin] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const entries = useQuery({
    queryKey: ["journal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("care_journal_entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("care_journal_entries").insert({
      user_id: user.id,
      mood,
      eating_perception: eating.trim() || null,
      difficulty: difficulty.trim() || null,
      small_win: win.trim() || null,
      note: note.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar o registro.");
      return;
    }
    setEating("");
    setDifficulty("");
    setWin("");
    setNote("");
    toast.success("Registro salvo no seu diário privado.");
    void queryClient.invalidateQueries({ queryKey: ["journal", user.id] });
  }

  return (
    <AppShell>
      <header className="mb-6 space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          <NotebookPen className="size-6 text-deep" aria-hidden="true" /> Diário de cuidado
        </h1>
        <p className="text-sm text-muted-foreground">
          Totalmente privado. Sem peso, sem calorias, sem metas — só como você esteve.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="surface-card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Registro de hoje</h2>
          <div className="space-y-1.5">
            <Label>Como você está?</Label>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-all",
                    mood === m
                      ? cn("border-transparent shadow-glow", moodClass[m])
                      : "border-border hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="percepcao">Como foi sua relação com a comida hoje?</Label>
            <Input id="percepcao" value={eating} onChange={(e) => setEating(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dificuldade">Algo difícil</Label>
            <Input
              id="dificuldade"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="conquista">Uma pequena conquista</Label>
            <Input id="conquista" value={win} onChange={(e) => setWin(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nota">Notas livres</Label>
            <Textarea id="nota" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button onClick={() => void save()} disabled={saving}>
            Salvar registro
          </Button>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Seus registros</h2>
          {entries.isLoading ? <CardSkeletonList count={2} /> : null}
          {entries.data && entries.data.length === 0 ? (
            <EmptyState
              title="Seu diário está vazio"
              description="O primeiro registro pode ser só uma palavra."
            />
          ) : null}
          <ul className="space-y-3">
            {entries.data?.map((e, i) => (
              <li
                key={e.id}
                style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
                className="surface-card card-pop animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards space-y-2 p-4 duration-500"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                      moodClass[e.mood ?? ""] ?? "bg-muted text-muted-foreground",
                    )}
                  >
                    {e.mood}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                {e.eating_perception ? <p className="text-sm">{e.eating_perception}</p> : null}
                {e.difficulty ? (
                  <p className="text-sm text-muted-foreground">Difícil: {e.difficulty}</p>
                ) : null}
                {e.small_win ? (
                  <p className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    <Sparkles className="size-3.5" aria-hidden="true" /> {e.small_win}
                  </p>
                ) : null}
                {e.note ? <p className="whitespace-pre-line text-sm">{e.note}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8">
        <SafetyNote />
      </div>
    </AppShell>
  );
}

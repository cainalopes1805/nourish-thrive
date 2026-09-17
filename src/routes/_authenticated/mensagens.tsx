import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/mensagens")({
  head: () => ({
    meta: [
      { title: "Mensagens privadas | Mesa Comum" },
      {
        name: "description",
        content: "Converse em privado com pessoas da comunidade e profissionais verificados.",
      },
      { property: "og:title", content: "Mensagens | Mesa Comum" },
      { property: "og:description", content: "Conversas privadas com cuidado e segurança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");

  const conversations = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, user_a, user_b, is_clinical, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];

      const otherIds = Array.from(
        new Set(rows.map((c) => (c.user_a === user!.id ? c.user_b : c.user_a))),
      );
      const profilesById = new Map<string, { display_name: string; avatar_url: string | null }>();
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", otherIds);
        for (const p of profiles ?? []) profilesById.set(p.id, p);
      }

      return rows.map((c) => {
        const otherId = c.user_a === user!.id ? c.user_b : c.user_a;
        const other = profilesById.get(otherId);
        return { ...c, otherName: other?.display_name ?? "Membro", otherAvatar: other?.avatar_url };
      });
    },
  });

  const currentId = activeId ?? conversations.data?.[0]?.id ?? null;

  const messages = useQuery({
    queryKey: ["messages", currentId],
    enabled: !!currentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, body, sender_id, created_at")
        .eq("conversation_id", currentId!)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function send() {
    if (!currentId || !user || text.trim().length === 0) return;
    const { error } = await supabase.from("messages").insert({
      conversation_id: currentId,
      sender_id: user.id,
      body: text.trim(),
    });
    if (error) {
      toast.error("Não foi possível enviar a mensagem.");
      return;
    }
    setText("");
    void queryClient.invalidateQueries({ queryKey: ["messages", currentId] });
  }

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          <MessageCircle className="size-6 text-deep" aria-hidden="true" /> Mensagens
        </h1>
        <p className="text-sm text-muted-foreground">
          Conversas privadas. Mensagens clínicas seguem as regras de sigilo profissional.
        </p>
      </header>

      {conversations.isLoading ? <CardSkeletonList count={2} /> : null}
      {conversations.isError ? <ErrorState onRetry={() => void conversations.refetch()} /> : null}

      {conversations.data && conversations.data.length === 0 ? (
        <EmptyState
          title="Nenhuma conversa ainda"
          description="Conversas aparecem aqui quando você ou um profissional iniciam um contato."
        />
      ) : null}

      {conversations.data && conversations.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <ul className="surface-card divide-y divide-border p-2">
            {conversations.data.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-secondary",
                    currentId === c.id && "bg-secondary font-semibold text-deep",
                  )}
                >
                  <span className="size-9 shrink-0 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    {c.otherAvatar ? (
                      <img src={c.otherAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      c.otherName.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{c.otherName}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {c.is_clinical ? "Conversa clínica" : "Conversa"} • desde{" "}
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <section className="surface-card flex min-h-96 flex-col p-4">
            <ul className="flex-1 space-y-3 overflow-y-auto">
              {messages.data?.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    m.sender_id === user?.id
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {m.body}
                </li>
              ))}
              {messages.data && messages.data.length === 0 ? (
                <li className="text-sm text-muted-foreground">Nenhuma mensagem nesta conversa.</li>
              ) : null}
            </ul>
            <div className="mt-4 space-y-2">
              <Textarea
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva sua mensagem"
              />
              <Button onClick={() => void send()} disabled={!text.trim()}>
                Enviar
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="mt-8">
        <SafetyNote>
          Mensagens não substituem atendimento de urgência nem prescrição profissional.
        </SafetyNote>
      </div>
    </AppShell>
  );
}

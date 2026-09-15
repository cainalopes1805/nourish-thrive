import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { REPORT_CATEGORIES, STATUS_LABEL } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useRoles, useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/moderacao")({
  head: () => ({
    meta: [
      { title: "Moderação | Mesa Comum" },
      {
        name: "description",
        content: "Fila de denúncias com priorização de risco e registro de decisões.",
      },
      { property: "og:title", content: "Moderação | Mesa Comum" },
      { property: "og:description", content: "Revisão humana das denúncias da comunidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModerationPage,
});

const categoryLabel = Object.fromEntries(REPORT_CATEGORIES.map((c) => [c.value, c.label]));

function ModerationPage() {
  const { user } = useSession();
  const { data: roles, isLoading: rolesLoading } = useRoles(user);
  const queryClient = useQueryClient();
  const isStaff = roles?.some((r) => r === "moderator" || r === "admin");

  const reports = useQuery({
    queryKey: ["reports"],
    enabled: !!isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, target_type, target_id, category, details, risk_level, status, created_at")
        .order("risk_level", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function resolve(id: string, status: string, action: string) {
    if (!user) return;
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar a denúncia.");
      return;
    }
    await supabase.from("moderation_actions").insert({
      report_id: id,
      moderator_id: user.id,
      action,
    });
    toast.success("Decisão registrada.");
    void queryClient.invalidateQueries({ queryKey: ["reports"] });
  }

  if (rolesLoading) {
    return (
      <AppShell>
        <CardSkeletonList count={2} />
      </AppShell>
    );
  }

  if (!isStaff) {
    return (
      <AppShell>
        <EmptyState
          title="Área restrita"
          description="Esta página é exclusiva da equipe de moderação."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-6 space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          <Shield className="size-6 text-deep" aria-hidden="true" /> Moderação
        </h1>
        <p className="text-sm text-muted-foreground">
          Denúncias de risco alto aparecem primeiro. Toda decisão fica registrada para auditoria.
        </p>
      </header>

      {reports.isLoading ? <CardSkeletonList count={3} /> : null}
      {reports.isError ? <ErrorState onRetry={() => void reports.refetch()} /> : null}
      {reports.data && reports.data.length === 0 ? (
        <EmptyState title="Fila vazia" description="Nenhuma denúncia pendente no momento." />
      ) : null}

      <ul className="space-y-4">
        {reports.data?.map((r) => (
          <li key={r.id} className="surface-card space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={
                  r.risk_level === "high"
                    ? "rounded-full bg-accent/20 px-2.5 py-1 font-semibold text-accent"
                    : "rounded-full bg-secondary px-2.5 py-1 font-semibold text-secondary-foreground"
                }
              >
                {r.risk_level === "high" ? "Risco alto" : "Risco padrão"}
              </span>
              <span className="text-muted-foreground">
                {categoryLabel[r.category] ?? r.category} • {r.target_type} •{" "}
                {new Date(r.created_at).toLocaleDateString("pt-BR")}
              </span>
              <span className="ml-auto font-semibold">{STATUS_LABEL[r.status] ?? r.status}</span>
            </div>
            {r.details ? <p className="text-sm text-foreground/90">{r.details}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void resolve(r.id, "reviewing", "review_started")}
              >
                Em revisão
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void resolve(r.id, "approved", "content_kept")}
              >
                Manter conteúdo
              </Button>
              <Button size="sm" onClick={() => void resolve(r.id, "removed", "content_removed")}>
                Remover conteúdo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void resolve(r.id, "escalated", "escalated")}
              >
                Escalonar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}

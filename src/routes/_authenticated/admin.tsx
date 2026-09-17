import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRoles, useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo | Mesa Comum" },
      {
        name: "description",
        content: "Verificação de profissionais, métricas da comunidade e registros de auditoria.",
      },
      { property: "og:title", content: "Administração | Mesa Comum" },
      { property: "og:description", content: "Gestão da plataforma e verificação profissional." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useSession();
  const { data: roles, isLoading: rolesLoading } = useRoles(user);
  const queryClient = useQueryClient();
  const isStaff = roles?.some((r) => r === "moderator" || r === "admin");

  const requests = useQuery({
    queryKey: ["verification-requests"],
    enabled: !!isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verification_requests")
        .select("id, profession, council, registration_number, state, status, created_at, user_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const audit = useQuery({
    queryKey: ["audit-logs"],
    enabled: !!isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function review(id: string, status: string) {
    if (!user) return;
    const { error } = await supabase
      .from("verification_requests")
      .update({ status, reviewer_id: user.id })
      .eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar a solicitação.");
      return;
    }
    toast.success("Solicitação atualizada.");
    void queryClient.invalidateQueries({ queryKey: ["verification-requests"] });
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
        <EmptyState title="Área restrita" description="Esta página é exclusiva da administração." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          Painel administrativo
        </h1>
        <p className="text-sm text-muted-foreground">
          Verificação profissional e trilha de auditoria da plataforma.
        </p>
      </header>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-semibold">Solicitações de verificação</h2>
        {requests.isLoading ? <CardSkeletonList count={2} /> : null}
        {requests.data && requests.data.length === 0 ? (
          <EmptyState title="Nenhuma solicitação" />
        ) : null}
        <ul className="grid gap-3 sm:grid-cols-2">
          {requests.data?.map((r, i) => (
            <li
              key={r.id}
              style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
              className="surface-card card-pop animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards flex flex-wrap items-center gap-3 p-4 duration-500"
            >
              <div className="flex-1">
                <p className="font-medium">{r.profession}</p>
                <p className="text-sm text-muted-foreground">
                  {r.council} {r.registration_number}/{r.state} •{" "}
                  {new Date(r.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span
                className={
                  r.status === "pending"
                    ? "rounded-full bg-warm/25 px-3 py-1 text-xs font-semibold text-warm-foreground"
                    : r.status === "approved"
                      ? "rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary"
                      : "rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive"
                }
              >
                {r.status}
              </span>
              {r.status === "pending" ? (
                <div className="flex w-full gap-2">
                  <Button size="sm" className="flex-1" onClick={() => void review(r.id, "approved")}>
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => void review(r.id, "rejected")}
                  >
                    Recusar
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Auditoria recente</h2>
        <ul className="surface-card divide-y divide-border p-4 text-sm">
          {audit.data?.map((a) => (
            <li key={a.id} className="py-2">
              <span className="font-medium">{a.action}</span>{" "}
              <span className="text-muted-foreground">
                {a.entity_type} • {new Date(a.created_at).toLocaleString("pt-BR")}
              </span>
            </li>
          ))}
          {audit.data && audit.data.length === 0 ? (
            <li className="py-2 text-muted-foreground">Sem registros ainda.</li>
          ) : null}
        </ul>
      </section>
    </AppShell>
  );
}

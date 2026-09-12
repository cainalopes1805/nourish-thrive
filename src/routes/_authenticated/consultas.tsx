import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/consultas")({
  head: () => ({
    meta: [
      { title: "Minhas consultas | Mesa Comum" },
      {
        name: "description",
        content: "Acompanhe solicitações, confirmações e histórico de consultas com profissionais.",
      },
      { property: "og:title", content: "Consultas | Mesa Comum" },
      { property: "og:description", content: "Seus agendamentos com profissionais verificados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppointmentsPage,
});

const statusLabel: Record<string, string> = {
  requested: "Solicitada",
  confirmed: "Confirmada",
  completed: "Realizada",
  cancelled: "Cancelada",
};

function AppointmentsPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["appointments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, starts_at, modality, status, reason_note, professional_profiles(name, profession)",
        )
        .eq("patient_id", user!.id)
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function cancel(id: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      toast.error("Não foi possível cancelar.");
      return;
    }
    toast.success("Consulta cancelada.");
    void queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
  }

  return (
    <AppShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
            <CalendarDays className="size-6 text-deep" aria-hidden="true" /> Minhas consultas
          </h1>
          <p className="text-sm text-muted-foreground">
            Solicitações e atendimentos com profissionais verificados.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/profissionais">Agendar nova consulta</Link>
        </Button>
      </header>

      {isLoading ? <CardSkeletonList count={2} /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="Você ainda não tem consultas"
          description="Encontre um profissional e solicite um horário."
          action={
            <Button asChild size="sm">
              <Link to="/profissionais">Ver profissionais</Link>
            </Button>
          }
        />
      ) : null}

      <ul className="space-y-4">
        {data?.map((a) => {
          const pro = a.professional_profiles as unknown as {
            name: string;
            profession: string;
          } | null;
          return (
            <li key={a.id} className="surface-card flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-52 flex-1">
                <p className="font-semibold">{pro?.name ?? "Profissional"}</p>
                <p className="text-sm text-muted-foreground">{pro?.profession}</p>
                <p className="mt-1 text-sm">
                  {new Date(a.starts_at).toLocaleString("pt-BR")} • {a.modality}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {statusLabel[a.status] ?? a.status}
              </span>
              {a.status === "requested" || a.status === "confirmed" ? (
                <Button size="sm" variant="outline" onClick={() => void cancel(a.id)}>
                  Cancelar
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-8">
        <SafetyNote>
          Em caso de urgência, não espere pela consulta: procure atendimento imediato.
        </SafetyNote>
      </div>
    </AppShell>
  );
}

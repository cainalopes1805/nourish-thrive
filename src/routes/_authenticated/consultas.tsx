import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Video, MapPin, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

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

const statusBadgeClass: Record<string, string> = {
  requested: "bg-warm/25 text-warm-foreground",
  confirmed: "bg-primary/15 text-primary",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/15 text-destructive",
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

      <ul className="grid gap-4 sm:grid-cols-2">
        {data?.map((a, i) => {
          const pro = a.professional_profiles as unknown as {
            name: string;
            profession: string;
          } | null;
          return (
            <li
              key={a.id}
              style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
              className="surface-card card-pop animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards flex flex-col gap-3 p-5 duration-500"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-warm font-bold text-primary-foreground">
                    {(pro?.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold">{pro?.name ?? "Profissional"}</p>
                    <p className="text-xs text-muted-foreground">{pro?.profession}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                    statusBadgeClass[a.status] ?? "bg-secondary text-secondary-foreground",
                  )}
                >
                  {statusLabel[a.status] ?? a.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{new Date(a.starts_at).toLocaleString("pt-BR")}</span>
                <span className="inline-flex items-center gap-1">
                  {a.modality === "teleconsulta" ? (
                    <Video className="size-3.5" aria-hidden="true" />
                  ) : (
                    <MapPin className="size-3.5" aria-hidden="true" />
                  )}
                  {a.modality}
                </span>
              </div>
              {a.reason_note ? (
                <p className="text-sm text-foreground/80">{a.reason_note}</p>
              ) : null}
              {a.status === "requested" || a.status === "confirmed" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="self-start"
                  onClick={() => void cancel(a.id)}
                >
                  <X className="size-3.5" /> Cancelar
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

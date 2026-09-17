import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Video } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { DemoBadge, SafetyNote, VerifiedBadge } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/profissionais/$id")({
  head: () => ({
    meta: [
      { title: "Perfil profissional | Mesa Comum" },
      {
        name: "description",
        content:
          "Veja registro profissional, abordagem, serviços e horários disponíveis para agendamento.",
      },
      { property: "og:title", content: "Perfil profissional | Mesa Comum" },
      {
        property: "og:description",
        content: "Profissionais de saúde verificados na Mesa Comum.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfessionalPage,
});

function ProfessionalPage() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const pro = useQuery({
    queryKey: ["professional", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const services = useQuery({
    queryKey: ["professional-services", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_services")
        .select("*")
        .eq("professional_id", id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const slots = useQuery({
    queryKey: ["professional-slots", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_slots")
        .select("id, starts_at, ends_at, is_booked")
        .eq("professional_id", id)
        .eq("is_booked", false)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at")
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });

  const book = useMutation({
    mutationFn: async (slot: { id: string; starts_at: string }) => {
      if (!user) throw new Error("auth");
      const service = services.data?.[0];
      const { error } = await supabase.from("appointments").insert({
        patient_id: user.id,
        professional_id: id,
        service_id: service?.id ?? null,
        slot_id: slot.id,
        starts_at: slot.starts_at,
        modality: pro.data?.teleconsultation_enabled ? "teleconsulta" : "presencial",
        status: "requested",
      });
      if (error) throw error;
      await supabase.from("availability_slots").update({ is_booked: true }).eq("id", slot.id);
    },
    onSuccess: () => {
      toast.success("Solicitação de consulta enviada.");
      void queryClient.invalidateQueries({ queryKey: ["professional-slots", id] });
      void navigate({ to: "/consultas" });
    },
    onError: (e: Error) => {
      if (e.message === "auth") {
        void navigate({ to: "/auth" });
        return;
      }
      toast.error("Não foi possível agendar agora. Tente novamente.");
    },
  });

  if (pro.isLoading) {
    return (
      <AppShell>
        <CardSkeletonList count={2} />
      </AppShell>
    );
  }

  if (pro.isError || !pro.data) {
    return (
      <AppShell>
        <ErrorState message="Profissional não encontrado." onRetry={() => void pro.refetch()} />
      </AppShell>
    );
  }

  const p = pro.data;

  return (
    <AppShell>
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link to="/profissionais" className="hover:underline">
          Profissionais
        </Link>{" "}
        / <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <header className="surface-card space-y-3 p-6">
            <div className="flex items-start gap-4">
              <div className="size-20 shrink-0 overflow-hidden rounded-full bg-primary/10">
                {p.profile_photo ? (
                  <img src={p.profile_photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight">{p.name}</h1>
                  <VerifiedBadge />
                  {p.is_demo ? <DemoBadge /> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.profession}
                  {p.council && p.registration_number
                    ? ` • ${p.council} ${p.registration_number}${p.state ? `/${p.state}` : ""}`
                    : ""}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {p.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden="true" /> {p.location}
                    </span>
                  ) : null}
                  {p.teleconsultation_enabled ? (
                    <span className="inline-flex items-center gap-1">
                      <Video className="size-3.5" aria-hidden="true" /> Teleconsulta
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{p.bio}</p>
            {p.approach ? (
              <div>
                <h2 className="mt-2 text-sm font-semibold">Abordagem</h2>
                <p className="text-sm text-muted-foreground">{p.approach}</p>
              </div>
            ) : null}
            {p.specialties?.length ? (
              <ul className="flex flex-wrap gap-2">
                {p.specialties.map((s: string) => (
                  <li
                    key={s}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            ) : null}
          </header>

          <section className="surface-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Serviços</h2>
            {services.data?.length ? (
              <ul className="space-y-3">
                {services.data.map((s) => (
                  <li key={s.id} className="rounded-lg border border-border p-4">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.duration_minutes} min • {s.modality}
                      {s.price ? ` • R$ ${Number(s.price).toFixed(0)}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Serviços em atualização.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="surface-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Horários disponíveis</h2>
            {slots.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : null}
            {slots.data && slots.data.length === 0 ? (
              <EmptyState
                title="Sem horários abertos"
                description="Este profissional ainda não publicou novos horários."
              />
            ) : null}
            <ul className="space-y-2">
              {slots.data?.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm">
                    {new Date(s.starts_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={book.isPending}
                    onClick={() => book.mutate({ id: s.id, starts_at: s.starts_at })}
                  >
                    {user ? "Agendar" : "Entrar para agendar"}
                  </Button>
                </li>
              ))}
            </ul>
            <SafetyNote>
              O agendamento é uma solicitação. O profissional confirma o horário em seguida.
            </SafetyNote>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

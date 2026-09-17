import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState } from "@/components/common/states";
import { SafetyNote, VerifiedBadge } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROFESSIONS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useRoles, useSession } from "@/hooks/useSession";
import { ImageUploader } from "@/components/social/ImageUploader";
import { cn } from "@/lib/utils";

const appointmentStatusClass: Record<string, string> = {
  requested: "bg-warm/25 text-warm-foreground",
  confirmed: "bg-primary/15 text-primary",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

export const Route = createFileRoute("/_authenticated/painel-profissional")({
  head: () => ({
    meta: [
      { title: "Painel profissional | Mesa Comum" },
      {
        name: "description",
        content:
          "Solicite verificação de registro profissional, publique horários e acompanhe suas consultas.",
      },
      { property: "og:title", content: "Painel profissional | Mesa Comum" },
      {
        property: "og:description",
        content: "Ferramentas para profissionais de saúde verificados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProPanelPage,
});

function ProPanelPage() {
  const { user } = useSession();
  const { data: roles } = useRoles(user);
  const queryClient = useQueryClient();
  const isPro = roles?.includes("verified_professional");

  const [profession, setProfession] = useState(PROFESSIONS[0]!);
  const [council, setCouncil] = useState("");
  const [registration, setRegistration] = useState("");
  const [state, setState] = useState("");
  const [saving, setSaving] = useState(false);
  const [slotStart, setSlotStart] = useState("");

  const request = useQuery({
    queryKey: ["verification-request", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const myProfile = useQuery({
    queryKey: ["my-professional-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_profiles")
        .select("id, name, profession, verified_status, profile_photo")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function updatePhoto(url: string | null) {
    if (!myProfile.data?.id) return;
    const { error } = await supabase
      .from("professional_profiles")
      .update({ profile_photo: url })
      .eq("id", myProfile.data.id);
    if (error) {
      toast.error("Não foi possível salvar a foto agora.");
      return;
    }
    toast.success("Foto de perfil profissional atualizada.");
    void queryClient.invalidateQueries({ queryKey: ["my-professional-profile", user?.id] });
  }

  const appointments = useQuery({
    queryKey: ["pro-appointments", myProfile.data?.id],
    enabled: !!myProfile.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, starts_at, modality, status")
        .eq("professional_id", myProfile.data!.id)
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function submitRequest() {
    if (!user) return;
    if (!council.trim() || !registration.trim() || !state.trim()) {
      toast.error("Preencha conselho, número de registro e estado.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("verification_requests").insert({
      user_id: user.id,
      profession,
      council: council.trim(),
      registration_number: registration.trim(),
      state: state.trim().toUpperCase(),
      status: "pending",
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível enviar a solicitação.");
      return;
    }
    toast.success("Solicitação enviada para análise.");
    void queryClient.invalidateQueries({ queryKey: ["verification-request", user.id] });
  }

  async function addSlot() {
    if (!myProfile.data?.id || !slotStart) return;
    const starts = new Date(slotStart);
    const ends = new Date(starts.getTime() + 50 * 60 * 1000);
    const { error } = await supabase.from("availability_slots").insert({
      professional_id: myProfile.data.id,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
    });
    if (error) {
      toast.error("Não foi possível criar o horário.");
      return;
    }
    setSlotStart("");
    toast.success("Horário publicado.");
  }

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar a consulta.");
      return;
    }
    void queryClient.invalidateQueries({ queryKey: ["pro-appointments", myProfile.data?.id] });
  }

  return (
    <AppShell>
      <header className="mb-6 space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          <Stethoscope className="size-6 text-deep" aria-hidden="true" /> Painel profissional
        </h1>
        <p className="text-sm text-muted-foreground">
          Verificação de registro, agenda e acompanhamento de consultas.
        </p>
      </header>

      {!isPro ? (
        <section className="surface-card mb-6 space-y-4 p-6">
          <h2 className="text-lg font-semibold">Solicitar verificação</h2>
          {request.data ? (
            <p className="text-sm text-muted-foreground">
              Sua solicitação está com status <strong>{request.data.status}</strong>. Avisaremos
              quando a análise terminar.
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profissao-req">Profissão</Label>
              <select
                id="profissao-req"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {PROFESSIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="conselho">Conselho (CRN, CRM, CRP…)</Label>
              <Input id="conselho" value={council} onChange={(e) => setCouncil(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="registro">Número de registro</Label>
              <Input
                id="registro"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uf">Estado (UF)</Label>
              <Input
                id="uf"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => void submitRequest()} disabled={saving}>
            Enviar para análise
          </Button>
          <SafetyNote>
            Só perfis com registro verificado podem publicar conteúdo profissional e atender.
          </SafetyNote>
        </section>
      ) : null}

      {isPro && myProfile.data ? (
        <section className="surface-card mb-6 space-y-4 p-6">
          <h2 className="text-lg font-semibold">Foto de perfil profissional</h2>
          <p className="text-sm text-muted-foreground">
            Exibida na busca de profissionais e no seu perfil público.
          </p>
          <ImageUploader
            type="avatar"
            label="foto profissional"
            currentUrl={myProfile.data.profile_photo}
            onUploadComplete={updatePhoto}
            onRemove={() => updatePhoto(null)}
            className="h-32 w-32 rounded-full"
          />
        </section>
      ) : null}

      {isPro ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="surface-card space-y-4 p-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Publicar horário</h2>
              <VerifiedBadge />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slot">Início do atendimento</Label>
              <Input
                id="slot"
                type="datetime-local"
                value={slotStart}
                onChange={(e) => setSlotStart(e.target.value)}
              />
            </div>
            <Button onClick={() => void addSlot()} disabled={!slotStart}>
              Publicar horário
            </Button>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Consultas</h2>
            {appointments.isLoading ? <CardSkeletonList count={2} /> : null}
            {appointments.data && appointments.data.length === 0 ? (
              <EmptyState title="Nenhuma consulta ainda" />
            ) : null}
            <ul className="space-y-3">
              {appointments.data?.map((a, i) => (
                <li
                  key={a.id}
                  style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
                  className="surface-card card-pop animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards flex flex-wrap items-center gap-3 p-4 duration-500"
                >
                  <span className="flex-1 text-sm">
                    {new Date(a.starts_at).toLocaleString("pt-BR")} • {a.modality}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      appointmentStatusClass[a.status] ?? "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {a.status}
                  </span>
                  {a.status === "requested" ? (
                    <Button size="sm" onClick={() => void setStatus(a.id, "confirmed")}>
                      Confirmar
                    </Button>
                  ) : null}
                  {a.status === "confirmed" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void setStatus(a.id, "completed")}
                    >
                      Marcar como realizada
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}

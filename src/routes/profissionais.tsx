import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Video } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/states";
import { DemoBadge, SafetyNote, VerifiedBadge } from "@/components/common/SafetyNote";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROFESSIONS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profissionais")({
  head: () => ({
    meta: [
      { title: "Profissionais de saúde verificados | Mesa Comum" },
      {
        name: "description",
        content:
          "Encontre nutricionistas, médicos, psicólogos e psiquiatras verificados para atendimento presencial ou por teleconsulta.",
      },
      { property: "og:title", content: "Profissionais verificados | Mesa Comum" },
      {
        property: "og:description",
        content: "Busque por profissão, especialidade e modalidade de atendimento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfessionalsPage,
});

function ProfessionalsPage() {
  const [term, setTerm] = useState("");
  const [profession, setProfession] = useState("");
  const [teleOnly, setTeleOnly] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_profiles")
        .select(
          "id, name, profession, specialties, bio, location, teleconsultation_enabled, price_min, price_max, rating, verified_status, is_demo, languages, profile_photo",
        )
        .eq("verified_status", "approved")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((p) => {
    const t = term.trim().toLowerCase();
    const matchTerm =
      !t ||
      p.name.toLowerCase().includes(t) ||
      (p.specialties ?? []).some((s: string) => s.toLowerCase().includes(t)) ||
      (p.location ?? "").toLowerCase().includes(t);
    const matchProfession = !profession || p.profession === profession;
    const matchTele = !teleOnly || p.teleconsultation_enabled;
    return matchTerm && matchProfession && matchTele;
  });

  return (
    <AppShell>
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          Profissionais verificados
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Todos os perfis passam por verificação de registro profissional antes de aparecer aqui.
        </p>
      </header>

      <div className="surface-card mb-6 grid gap-4 p-5 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="busca">Buscar</Label>
          <Input
            id="busca"
            placeholder="Nome, especialidade ou cidade"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profissao">Profissão</Label>
          <select
            id="profissao"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Todas</option>
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={teleOnly}
              onChange={(e) => setTeleOnly(e.target.checked)}
              className="size-4 rounded border-input"
            />
            Somente teleconsulta
          </label>
        </div>
      </div>

      {isLoading ? <CardSkeletonList count={3} /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
      {data && filtered.length === 0 ? (
        <EmptyState
          title="Nenhum profissional encontrado"
          description="Ajuste os filtros para ampliar a busca."
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((p, i) => (
          <Link
            key={p.id}
            to="/profissionais/$id"
            params={{ id: p.id }}
            style={{ animationDelay: `${Math.min(i * 60, 360)}ms` }}
            className="surface-card group flex gap-4 p-5 card-pop animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500"
          >
            <div className="size-16 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-2 ring-transparent transition-all group-hover:ring-primary/50">
              {p.profile_photo ? (
                <img
                  src={p.profile_photo}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
                  {p.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{p.name}</h2>
                <VerifiedBadge />
                {p.is_demo ? <DemoBadge /> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.profession}</p>
              <p className="mt-2 line-clamp-3 text-sm text-foreground/85">{p.bio}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {p.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {p.location}
                  </span>
                ) : null}
                {p.teleconsultation_enabled ? (
                  <span className="inline-flex items-center gap-1">
                    <Video className="size-3.5" aria-hidden="true" />
                    Teleconsulta
                  </span>
                ) : null}
                {p.price_min ? <span>A partir de R$ {Number(p.price_min).toFixed(0)}</span> : null}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <SafetyNote>
          A Mesa Comum não realiza diagnósticos nem prescrições. O atendimento acontece diretamente
          com o profissional escolhido.
        </SafetyNote>
      </div>
    </AppShell>
  );
}

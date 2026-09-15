import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Flag, Calendar, Medal } from "lucide-react";
import { FriendshipButton } from "@/components/social/FriendshipButton";

export const Route = createFileRoute("/_authenticated/perfil/$id")({
  component: ProfilePage,
});

// Helper function to calculate age safely
function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function ProfilePage() {
  const { id } = Route.useParams();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-profile", id],
    queryFn: async () => {
      // Must use the RPC exclusively, protecting privacy.
      const { data, error } = await supabase.rpc("get_public_profile", {
        target_id: id,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    // The query will fail or return null if not found
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  // Handle invalid UUIDs or not found profiles
  if (error || !profile) {
    return (
      <AppShell>
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-2xl font-bold">Perfil não encontrado</h1>
          <p className="text-muted-foreground">
            O usuário que você está procurando não existe ou o link é inválido.
          </p>
          <Link to="/" className="text-primary hover:underline">
            Voltar ao início
          </Link>
        </div>
      </AppShell>
    );
  }

  // Safely parse JSON properties according to RPC contract
  const p = profile as any;
  const age = calculateAge(p.date_of_birth);
  const interests: string[] = Array.isArray(p.interests) ? p.interests : [];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header / Identidade */}
        <div className="surface-card overflow-hidden rounded-xl">
          {/* Banner */}
          <div className="h-48 w-full bg-muted relative">
            {p.banner_url ? (
              <img src={p.banner_url} alt="Capa" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/5" />
            )}
          </div>

          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <div className="h-32 w-32 rounded-full border-4 border-background bg-muted overflow-hidden">
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt={p.display_name || "Usuário"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-3xl">
                    {(p.display_name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info Space */}
            <div className="mt-20 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">{p.display_name || "Usuário do Mesa Comum"}</h1>
                <div className="shrink-0">
                  <FriendshipButton targetId={p.id} />
                </div>
              </div>

              {p.bio && <p className="text-muted-foreground text-sm max-w-2xl">{p.bio}</p>}

              {/* Informações Públicas (Location, Age, Nationality) */}
              <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                {p.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    <span>{p.location}</span>
                  </div>
                )}
                {age !== null && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    <span>{age} anos</span>
                  </div>
                )}
                {p.nationality && (
                  <div className="flex items-center gap-1.5">
                    <Flag className="size-4" />
                    <span>{p.nationality}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2 Columns Layout for content */}
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {/* Sobre mim */}
            {p.about_me && (
              <section className="surface-card p-6 space-y-3">
                <h2 className="text-lg font-semibold">Sobre mim</h2>
                <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {p.about_me}
                </div>
              </section>
            )}

            {/* Interesses Autorizados */}
            {interests.length > 0 && (
              <section className="surface-card p-6 space-y-3">
                <h2 className="text-lg font-semibold">Interesses</h2>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Conquistas (Estrutura pronta para o futuro) */}
            <section className="surface-card p-6 space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Medal className="size-5 text-primary" />
                Conquistas
              </h2>
              <div className="text-sm text-muted-foreground pt-2">
                Este espaço exibirá as conquistas e marcos alcançados na jornada.
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

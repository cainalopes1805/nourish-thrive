import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { SafetyNote } from "@/components/common/SafetyNote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INTERESTS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useRoles, useSession } from "@/hooks/useSession";
import { ImageUploader } from "@/components/social/ImageUploader";
import { FriendRequests } from "@/components/social/FriendRequests";

export const Route = createFileRoute("/_authenticated/meu-espaco")({
  head: () => ({
    meta: [
      { title: "Meu espaço | Mesa Comum" },
      {
        name: "description",
        content: "Ajuste seu perfil, interesses, preferências de feed e controle dos seus dados.",
      },
    ],
  }),
  component: MySpacePage,
});

const BIO_MAX_LENGTH = 160;
const ABOUT_ME_MAX_LENGTH = 500;

function MySpacePage() {
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const { data: roles } = useRoles(user);
  const queryClient = useQueryClient();

  // 1. Identidade
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  // 2. Apresentação
  const [bio, setBio] = useState("");
  const [aboutMe, setAboutMe] = useState("");

  // 3. Informações Pessoais
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [location, setLocation] = useState("");

  // 4. Interesses
  const [interests, setInterests] = useState<string[]>([]);

  // 5. Privacidade
  const [privacy, setPrivacy] = useState({
    show_location: true,
    show_age: false,
    show_nationality: true,
    visible_interests: [] as string[],
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setAvatarUrl(profile.avatar_url ?? null);
    setBannerUrl(profile.banner_url ?? null);
    setDisplayName(profile.display_name ?? "");
    setBio(profile.bio ?? "");
    setAboutMe(profile.about_me ?? "");
    setDateOfBirth(profile.date_of_birth ?? "");
    setGender(profile.gender ?? "");
    setNationality(profile.nationality ?? "");
    setLocation(profile.location ?? "");
    setInterests(profile.interests ?? []);

    // Parse privacy preferences safely
    const defaultPrivacy = {
      show_location: true,
      show_age: false,
      show_nationality: true,
      visible_interests: [],
    };
    const savedPrivacy =
      typeof profile.privacy_preferences === "object" && profile.privacy_preferences !== null
        ? (profile.privacy_preferences as Record<string, any>)
        : {};

    setPrivacy({
      show_location: savedPrivacy.show_location ?? defaultPrivacy.show_location,
      show_age: savedPrivacy.show_age ?? defaultPrivacy.show_age,
      show_nationality: savedPrivacy.show_nationality ?? defaultPrivacy.show_nationality,
      visible_interests: Array.isArray(savedPrivacy.visible_interests)
        ? savedPrivacy.visible_interests
        : defaultPrivacy.visible_interests,
    });
  }, [profile]);

  const myPosts = useQuery({
    queryKey: ["my-posts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, body, created_at")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value],
    );
  }

  function toggleVisibleInterest(value: string) {
    setPrivacy((prev) => ({
      ...prev,
      visible_interests: prev.visible_interests.includes(value)
        ? prev.visible_interests.filter((i) => i !== value)
        : [...prev.visible_interests, value],
    }));
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        bio: bio.trim(),
        about_me: aboutMe.trim(),
        location: location.trim(),
        date_of_birth: dateOfBirth || null,
        nationality: nationality.trim(),
        gender: gender.trim(),
        interests,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        privacy_preferences: privacy,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Não foi possível salvar o perfil.");
      // Check if it's a known error from missing columns (remote environment out of sync)
      if (error.message?.includes("column")) {
        toast.error(
          "Erro de ambiente remoto: a migration do banco de dados ainda não foi aplicada. Coluna não existe.",
        );
      }
      return;
    }
    toast.success("Perfil atualizado com sucesso!");
    void queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  return (
    <AppShell>
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Meu espaço</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie sua identidade, informações e privacidade.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* 1. Identidade */}
          <section className="surface-card space-y-4 p-6">
            <h2 className="text-lg font-semibold border-b pb-2">1. Identidade</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
              <div className="space-y-1.5">
                <Label>Capa do perfil (opcional)</Label>
                <ImageUploader
                  type="banner"
                  currentUrl={bannerUrl}
                  onUploadComplete={setBannerUrl}
                  className="h-32 w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Foto de perfil (opcional)</Label>
                <ImageUploader
                  type="avatar"
                  currentUrl={avatarUrl}
                  onUploadComplete={setAvatarUrl}
                  className="h-32 w-32 rounded-full mx-auto sm:mx-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome de exibição</Label>
              <Input
                id="nome"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome ou apelido"
              />
              <p className="text-xs text-muted-foreground">Separado da sua identidade legal.</p>
            </div>
          </section>

          {/* 2. Apresentação */}
          <section className="surface-card space-y-4 p-6">
            <h2 className="text-lg font-semibold border-b pb-2">2. Apresentação</h2>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label htmlFor="bio">Resumo (Bio)</Label>
                <span className="text-xs text-muted-foreground">
                  {bio.length}/{BIO_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id="bio"
                rows={2}
                maxLength={BIO_MAX_LENGTH}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Uma frase curta sobre você..."
              />
            </div>

            <div className="space-y-1.5 mt-4">
              <div className="flex justify-between">
                <Label htmlFor="about">Sobre mim</Label>
                <span className="text-xs text-muted-foreground">
                  {aboutMe.length}/{ABOUT_ME_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id="about"
                rows={5}
                maxLength={ABOUT_ME_MAX_LENGTH}
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Conte mais sobre sua história, experiências ou o que te traz à comunidade..."
              />
            </div>
          </section>

          {/* 3. Informações Pessoais */}
          <section className="surface-card space-y-4 p-6">
            <h2 className="text-lg font-semibold border-b pb-2">3. Informações Pessoais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="genero">Gênero</Label>
                <Input
                  id="genero"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  placeholder="Ex: Feminino, Masculino, Não-binário..."
                />
                <p className="text-[10px] text-muted-foreground">
                  Opcional. Nunca exibido publicamente.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nacionalidade">Nacionalidade</Label>
                <Input
                  id="nacionalidade"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="Sua nacionalidade"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cidade">Cidade/Localização</Label>
                <Input
                  id="cidade"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                />
              </div>
            </div>
          </section>

          {/* 4. Interesses */}
          <section className="surface-card space-y-4 p-6">
            <h2 className="text-lg font-semibold border-b pb-2">4. Interesses e Objetivos</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione os temas do seu interesse. Eles ajudam a personalizar seu feed.
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <label
                  key={i}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm cursor-pointer transition-colors ${interests.includes(i) ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(i)}
                    onChange={() => toggleInterest(i)}
                    className="hidden"
                  />
                  {i}
                </label>
              ))}
            </div>
          </section>

          {/* 5. Privacidade */}
          <section className="surface-card space-y-4 p-6">
            <h2 className="text-lg font-semibold border-b pb-2">
              5. Privacidade do Perfil Público
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Controle o que outros membros da comunidade podem ver no seu perfil. Suas preferências
              são garantidas pelo banco de dados.
            </p>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/30">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={privacy.show_age}
                  onChange={(e) => setPrivacy((p) => ({ ...p, show_age: e.target.checked }))}
                />
                <div>
                  <div className="font-medium text-sm">Mostrar Idade</div>
                  <div className="text-xs text-muted-foreground">
                    Calcula e exibe sua idade publicamente a partir da data de nascimento.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/30">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={privacy.show_location}
                  onChange={(e) => setPrivacy((p) => ({ ...p, show_location: e.target.checked }))}
                />
                <div>
                  <div className="font-medium text-sm">Mostrar Localização</div>
                  <div className="text-xs text-muted-foreground">Exibe sua cidade/localização.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/30">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={privacy.show_nationality}
                  onChange={(e) =>
                    setPrivacy((p) => ({ ...p, show_nationality: e.target.checked }))
                  }
                />
                <div>
                  <div className="font-medium text-sm">Mostrar Nacionalidade</div>
                  <div className="text-xs text-muted-foreground">Exibe sua nacionalidade.</div>
                </div>
              </label>

              {interests.length > 0 && (
                <div className="mt-4 p-3 border rounded-md">
                  <div className="font-medium text-sm mb-1">Interesses Visíveis</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Selecione quais dos seus interesses você quer exibir no seu perfil público:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-1.5 rounded bg-muted px-2 py-1 text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={privacy.visible_interests.includes(i)}
                          onChange={() => toggleVisibleInterest(i)}
                        />
                        {i}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="sticky bottom-4 z-10 flex justify-end bg-background/80 p-4 backdrop-blur-sm rounded-lg border shadow-sm">
            <Button onClick={() => void save()} disabled={saving} size="lg">
              {saving ? "Salvando..." : "Salvar todas as alterações"}
            </Button>
          </div>
        </div>

        {/* Sidebar maintains existing functionality */}
        <aside className="space-y-4 hidden lg:block">
          <section className="surface-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Solicitações de Amizade</h2>
            <FriendRequests />
          </section>

          <section className="surface-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Atalhos</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/diario" className="underline underline-offset-2">
                  Diário de cuidado
                </Link>
              </li>
              <li>
                <Link to="/experiencia-protegida" className="underline underline-offset-2">
                  Experiência protegida
                </Link>
              </li>
              <li>
                <Link to="/consultas" className="underline underline-offset-2">
                  Minhas consultas
                </Link>
              </li>
              <li>
                <Link to="/painel-profissional" className="underline underline-offset-2">
                  {roles?.includes("verified_professional")
                    ? "Painel profissional"
                    : "Sou profissional de saúde"}
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="underline underline-offset-2">
                  Privacidade e dados
                </Link>
              </li>
            </ul>
          </section>

          <section className="surface-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Suas publicações</h2>
            <ul className="space-y-2 text-sm">
              {myPosts.data?.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/publicacoes/$id"
                    params={{ id: p.id }}
                    className="underline underline-offset-2"
                  >
                    {p.title ?? `${p.body.slice(0, 40)}…`}
                  </Link>
                </li>
              ))}
              {myPosts.data && myPosts.data.length === 0 ? (
                <li className="text-muted-foreground">Você ainda não publicou nada.</li>
              ) : null}
            </ul>
          </section>
        </aside>
      </div>

      <div className="mt-8">
        <SafetyNote />
      </div>
    </AppShell>
  );
}

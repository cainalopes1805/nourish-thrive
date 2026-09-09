import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/layout/AppShell";
import { SafetyNote } from "@/components/common/SafetyNote";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta | Mesa Comum" },
      {
        name: "description",
        content:
          "Acesse a Mesa Comum para participar da comunidade de cuidado alimentar e falar com profissionais verificados.",
      },
      { property: "og:title", content: "Entrar na Mesa Comum" },
      {
        property: "og:description",
        content: "Um espaço seguro para aprender, compartilhar e encontrar apoio.",
      },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(255),
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres").max(72),
});

const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(2, "Informe um nome de exibição").max(60),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingConfirm, setPendingConfirm] = useState(false);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    toast.success("Bem-vindo(a) de volta");
    navigate({ to: "/feed" });
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
      displayName: form.get("displayName"),
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: parsed.data.displayName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }
    if (!data.session) {
      setPendingConfirm(true);
      return;
    }
    navigate({ to: "/interesses" });
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Não foi possível entrar com o Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/feed" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-deep p-12 text-deep-foreground lg:flex">
        <Logo />
        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-tight">
            Cuidar da alimentação também é cuidar de você.
          </h2>
          <p className="max-w-md text-sm opacity-85">
            Aqui não há contagem de calorias, comparação de corpos ou promessas de emagrecimento
            rápido. Há conversa, aprendizado e profissionais de saúde verificados.
          </p>
        </div>
        <p className="text-xs opacity-70">
          Conteúdo educativo. Não substitui atendimento de saúde presencial quando necessário.
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden">
            <Logo />
          </div>
          {pendingConfirm ? (
            <div className="surface-card space-y-3 p-6">
              <h1 className="text-xl font-bold">Confirme seu e-mail</h1>
              <p className="text-sm text-muted-foreground">
                Enviamos um link de confirmação. Depois de confirmar, volte aqui e entre com seu
                e-mail e senha.
              </p>
              <Button variant="outline" onClick={() => setPendingConfirm(false)}>
                Voltar
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="entrar">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entrar">Entrar</TabsTrigger>
                <TabsTrigger value="criar">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="entrar">
                <form onSubmit={handleSignIn} className="surface-card space-y-4 p-6" noValidate>
                  <h1 className="text-xl font-bold">Entrar na comunidade</h1>
                  <div className="space-y-2">
                    <Label htmlFor="email-in">E-mail</Label>
                    <Input id="email-in" name="email" type="email" autoComplete="email" required />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pass-in">Senha</Label>
                    <Input
                      id="pass-in"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="criar">
                <form onSubmit={handleSignUp} className="surface-card space-y-4 p-6" noValidate>
                  <h1 className="text-xl font-bold">Criar sua conta</h1>
                  <div className="space-y-2">
                    <Label htmlFor="name-up">Nome de exibição</Label>
                    <Input id="name-up" name="displayName" maxLength={60} required />
                    <p className="text-xs text-muted-foreground">
                      Pode ser diferente do seu nome legal.
                    </p>
                    {errors.displayName && (
                      <p className="text-xs text-destructive">{errors.displayName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-up">E-mail</Label>
                    <Input id="email-up" name="email" type="email" autoComplete="email" required />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pass-up">Senha</Label>
                    <Input
                      id="pass-up"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            Continuar com Google
          </Button>

          <SafetyNote />
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/" className="underline underline-offset-2">
              Voltar para a página inicial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

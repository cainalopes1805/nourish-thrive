import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  Home,
  LifeBuoy,
  MessageCircle,
  Plus,
  Stethoscope,
  User,
  Users,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useRoles, useProfile } from "@/hooks/useSession";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

const desktopNav = [
  { to: "/feed", label: "Feed" },
  { to: "/comunidades", label: "Comunidades" },
  { to: "/aprender", label: "Aprender" },
  { to: "/profissionais", label: "Profissionais" },
  { to: "/consultas", label: "Consultas" },
  { to: "/mensagens", label: "Mensagens" },
  { to: "/meu-espaco", label: "Meu espaço" },
] as const;

const mobileNav = [
  { to: "/feed", label: "Início", icon: Home },
  { to: "/comunidades", label: "Comunidades", icon: Users },
  { to: "/aprender", label: "Aprender", icon: BookOpen },
  { to: "/profissionais", label: "Profissionais", icon: Stethoscope },
  { to: "/meu-espaco", label: "Perfil", icon: User },
] as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label={`${BRAND.name} — início`}>
      <span className="flex size-8 items-center justify-center rounded-full bg-deep text-deep-foreground">
        <span className="size-3 rounded-full bg-warm" />
      </span>
      {!compact && <span className="text-lg font-extrabold tracking-tight">{BRAND.name}</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { user } = useSession();
  const { data: roles } = useRoles(user);
  const { data: profile } = useProfile(user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const isStaff = roles?.some((r) => r === "moderator" || r === "admin");
  const isPro = roles?.includes("verified_professional");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />
          <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
            {desktopNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground",
                  pathname.startsWith(item.to) &&
                    "bg-gradient-to-r from-primary to-warm text-primary-foreground shadow-glow",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/ajuda">
                <LifeBuoy className="size-4" aria-hidden="true" />
                Preciso de ajuda
              </Link>
            </Button>
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link to="/criar">
                <Plus className="size-4" aria-hidden="true" />
                Publicar
              </Link>
            </Button>
            {user ? (
              <Link
                to="/meu-espaco"
                aria-label="Meu espaço"
                className="hidden size-9 shrink-0 overflow-hidden rounded-full border border-border bg-primary/10 sm:flex items-center justify-center font-semibold text-primary hover:ring-2 hover:ring-primary/30 transition-shadow"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (profile?.display_name ?? user.email ?? "?").charAt(0).toUpperCase()
                )}
              </Link>
            ) : null}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir menu">
                  <Menu className="size-4" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
                <nav className="flex flex-col gap-1 p-4" aria-label="Menu completo">
                  {desktopNav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    to="/diario"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    Diário de cuidado
                  </Link>
                  <Link
                    to="/privacidade"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    Privacidade e dados
                  </Link>
                  <Link
                    to="/experiencia-protegida"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    Experiência protegida
                  </Link>
                  <Link
                    to="/painel-profissional"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    {isPro ? "Painel profissional" : "Sou profissional de saúde"}
                  </Link>
                  {isStaff ? (
                    <>
                      <Link
                        to="/moderacao"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                      >
                        <Shield className="size-4" aria-hidden="true" /> Moderação
                      </Link>
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                      >
                        Painel administrativo
                      </Link>
                    </>
                  ) : null}
                  <button
                    onClick={signOut}
                    className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-secondary"
                  >
                    <LogOut className="size-4" aria-hidden="true" /> Sair
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main id="conteudo" className="container-page py-6 md:py-10">
        {children}
      </main>

      <Link
        to="/criar"
        aria-label="Criar publicação"
        className="animate-pulse-glow fixed bottom-24 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-warm text-primary-foreground shadow-lift transition-transform hover:scale-105 md:hidden"
      >
        <Plus className="size-6" aria-hidden="true" />
      </Link>

      <nav
        aria-label="Navegação inferior"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors",
                    active && "text-primary",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export const shellIcons = { CalendarDays, MessageCircle };

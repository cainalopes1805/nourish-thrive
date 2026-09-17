import { Info, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SafetyNote({ children }: { children?: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-secondary/70 px-4 py-3 text-xs leading-relaxed text-secondary-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        {children ??
          "Conteúdo educativo. Não substitui avaliação, diagnóstico ou tratamento por profissional de saúde."}{" "}
        <Link to="/ajuda" className="underline underline-offset-2">
          Preciso de ajuda
        </Link>
      </span>
    </p>
  );
}

export function VerifiedBadge({ label = "Profissional verificado" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
      <ShieldCheck className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-warm/25 px-2.5 py-1 text-[11px] font-semibold text-warm-foreground">
      Demonstração
    </span>
  );
}

import {
  Apple,
  Brain,
  CalendarCheck,
  ChefHat,
  HeartHandshake,
  HeartPulse,
  ShieldCheck,
  Sprout,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { slugify } from "@/lib/community";
import seguranca from "@/assets/seguranca.jpg";
import saudeMental from "@/assets/saude-mental.jpg";

export type LearnTheme = {
  category: string;
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  badgeClass: string;
  cover: string;
};

export const LEARN_THEMES: LearnTheme[] = [
  {
    category: "Nutrição",
    slug: "nutricao",
    title: "Nutrição",
    description: "Nutrientes, energia e o que realmente compõe uma alimentação equilibrada.",
    icon: Apple,
    accent: "from-primary to-warm",
    badgeClass: "bg-primary/15 text-primary",
    cover: "https://picsum.photos/seed/tema-nutricao/900/600",
  },
  {
    category: "Segurança alimentar",
    slug: "seguranca-alimentar",
    title: "Segurança alimentar",
    description: "Higiene, armazenamento e preparo seguro para proteger quem você ama.",
    icon: ShieldCheck,
    accent: "from-deep to-primary",
    badgeClass: "bg-deep/15 text-deep",
    cover: seguranca,
  },
  {
    category: "Relação com a comida",
    slug: "relacao-com-a-comida",
    title: "Relação com a comida",
    description: "Fome, saciedade, culpa e autonomia alimentar — sem regras rígidas.",
    icon: HeartHandshake,
    accent: "from-accent to-primary",
    badgeClass: "bg-accent/30 text-accent-foreground",
    cover: "https://picsum.photos/seed/tema-relacao-com-a-comida/900/600",
  },
  {
    category: "Transtornos alimentares",
    slug: "transtornos-alimentares",
    title: "Transtornos alimentares",
    description: "Sinais de alerta, apoio e caminhos para buscar ajuda profissional.",
    icon: HeartPulse,
    accent: "from-destructive to-warm",
    badgeClass: "bg-destructive/15 text-destructive",
    cover: "https://picsum.photos/seed/tema-transtornos-alimentares/900/600",
  },
  {
    category: "Saúde mental",
    slug: "saude-mental",
    title: "Saúde mental",
    description: "Ansiedade, autoestima e o vínculo entre mente e alimentação.",
    icon: Brain,
    accent: "from-primary to-accent",
    badgeClass: "bg-primary/15 text-primary",
    cover: saudeMental,
  },
  {
    category: "Rotulagem",
    slug: "rotulagem",
    title: "Rotulagem",
    description: "Como ler rótulos e embalagens sem virar refém da contagem de calorias.",
    icon: Tag,
    accent: "from-warm to-accent",
    badgeClass: "bg-warm/30 text-warm-foreground",
    cover: "https://picsum.photos/seed/tema-rotulagem/900/600",
  },
  {
    category: "Cozinha",
    slug: "cozinha",
    title: "Cozinha",
    description: "Técnicas, organização e praticidade para cozinhar com confiança.",
    icon: ChefHat,
    accent: "from-deep to-warm",
    badgeClass: "bg-deep/15 text-deep",
    cover: "https://picsum.photos/seed/tema-cozinha/900/600",
  },
  {
    category: "Planejamento alimentar",
    slug: "planejamento-alimentar",
    title: "Planejamento alimentar",
    description: "Organização realista da semana, sem cardápio engessado.",
    icon: CalendarCheck,
    accent: "from-accent to-warm",
    badgeClass: "bg-accent/30 text-accent-foreground",
    cover: "https://picsum.photos/seed/tema-planejamento-alimentar/900/600",
  },
  {
    category: "Alimentação ao longo da vida",
    slug: "alimentacao-ao-longo-da-vida",
    title: "Alimentação ao longo da vida",
    description: "Da introdução alimentar à terceira idade: cuidados que mudam com o tempo.",
    icon: Sprout,
    accent: "from-primary to-deep",
    badgeClass: "bg-primary/15 text-primary",
    cover: "https://picsum.photos/seed/tema-alimentacao-ao-longo-da-vida/900/600",
  },
];

export const LEARN_THEME_BY_CATEGORY: Record<string, LearnTheme> = Object.fromEntries(
  LEARN_THEMES.map((t) => [t.category, t]),
);

export function learnThemeSlug(category: string): string {
  return LEARN_THEME_BY_CATEGORY[category]?.slug ?? slugify(category);
}

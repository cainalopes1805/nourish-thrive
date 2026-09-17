import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArticlePreview = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  reading_minutes: number;
  author_name: string;
  badge: string | null;
  cover_url: string | null;
};

export function ArticleCard({
  article,
  accentClass,
  style,
  className,
}: {
  article: ArticlePreview;
  accentClass?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <Link
      to="/aprender/$slug"
      params={{ slug: article.slug }}
      style={style}
      className={cn(
        "surface-card group flex flex-col overflow-hidden card-pop",
        "animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500",
        className,
      )}
    >
      <div className="relative h-32 w-full overflow-hidden bg-muted">
        {article.cover_url ? (
          <img
            src={article.cover_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={cn("h-full w-full bg-gradient-to-br", accentClass ?? "from-primary/30 to-warm/30")} />
        )}
        {article.badge ? (
          <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur">
            {article.badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-semibold leading-snug transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{article.summary}</p>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">Por {article.author_name}</span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {article.reading_minutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}

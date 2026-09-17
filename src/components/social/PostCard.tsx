import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { POST_TYPE_LABEL, POST_TYPE_BADGE_CLASS, POST_TYPE_ACCENT_CLASS } from "@/lib/constants";
import { VerifiedBadge } from "@/components/common/SafetyNote";
import { cn } from "@/lib/utils";
import saudeMentalImg from "@/assets/saude-mental.jpg";

export type FeedPost = {
  id: string;
  title: string | null;
  body: string;
  post_type: string;
  tags: string[];
  sensitive_topics: string[];
  is_anonymous: boolean;
  is_professional_content: boolean;
  created_at: string;
  authorId?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  communityName?: string | null;
  imageUrl?: string | null;
  reactions?: number;
  comments?: number;
};

const POST_FALLBACK_IMAGES: Record<string, string> = {
  receita: "/images/recipes/oatmeal.jpg",
  profissional: "/images/themes/fresh-ingredients.jpg",
  educativo: "/images/themes/reading-labels.jpg",
  saude_mental: saudeMentalImg,
  apoio: saudeMentalImg,
  experiencia: "/images/themes/fresh-ingredients.jpg",
  duvida: "/images/themes/reading-labels.jpg",
  enquete: "/images/themes/fresh-ingredients.jpg",
};

const POST_FALLBACK_ALT: Record<string, string> = {
  receita: "Aveia com frutas frescas",
  profissional: "Ingredientes frescos em uma mesa",
  educativo: "Pessoa lendo rótulos de alimentos",
  saude_mental: "Momento de cuidado e acolhimento",
  apoio: "Momento de cuidado e acolhimento",
  experiencia: "Ingredientes frescos em uma mesa",
  duvida: "Pessoa lendo rótulos de alimentos",
  enquete: "Ingredientes frescos em uma mesa",
};

function AuthorAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null | undefined;
}) {
  return (
    <div className="size-9 shrink-0 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

export function PostCard({ post }: { post: FeedPost }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const author = post.is_anonymous ? "Membro anônimo" : (post.authorName ?? "Membro");
  const showAvatarLink = !post.is_anonymous && post.authorId;
  const accent = POST_TYPE_ACCENT_CLASS[post.post_type] ?? "from-primary to-primary/60";
  const badgeClass = POST_TYPE_BADGE_CLASS[post.post_type] ?? "bg-secondary text-secondary-foreground";
  const bodyLimit = 300;
  const hasLongBody = post.body.length > bodyLimit;
  const displayedBody = isExpanded || !hasLongBody ? post.body : `${post.body.slice(0, bodyLimit).trimEnd()}…`;
  const imageUrl = post.imageUrl || POST_FALLBACK_IMAGES[post.post_type];
  const imageAlt = post.imageUrl ? "Imagem compartilhada na publicação" : POST_FALLBACK_ALT[post.post_type] || "Alimentação e bem-estar";

  return (
    <article className="surface-card relative space-y-3 overflow-hidden p-4 sm:p-5">
      <span className={cn("absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r", accent)} aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
        {showAvatarLink ? (
          <Link to="/perfil/$id" params={{ id: post.authorId! }} className="shrink-0">
            <AuthorAvatar name={author} avatarUrl={post.authorAvatar} />
          </Link>
        ) : (
          <AuthorAvatar name={author} avatarUrl={post.is_anonymous ? null : post.authorAvatar} />
        )}
        <div className="flex flex-wrap items-center gap-2">
          {showAvatarLink ? (
            <Link
              to="/perfil/$id"
              params={{ id: post.authorId! }}
              className="font-semibold text-foreground hover:underline"
            >
              {author}
            </Link>
          ) : (
            <span className="font-semibold text-foreground">{author}</span>
          )}
          {post.is_professional_content ? <VerifiedBadge /> : null}
          <span className={cn("rounded-full px-2 py-0.5 font-semibold", badgeClass)}>
            {POST_TYPE_LABEL[post.post_type] ?? post.post_type}
          </span>
          {post.communityName ? <span>em {post.communityName}</span> : null}
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString("pt-BR")}
          </time>
        </div>
      </div>

      {post.title ? (
        <h3 className="text-base font-semibold leading-snug">
          <Link to="/publicacoes/$id" params={{ id: post.id }} className="hover:underline">
            {post.title}
          </Link>
        </h3>
      ) : null}

      {post.sensitive_topics.length > 0 ? (
        <p className="rounded-lg bg-warm/20 px-3 py-2 text-xs text-warm-foreground">
          Este conteúdo menciona temas sensíveis ({post.sensitive_topics.join(", ")}).
        </p>
      ) : null}

      <div className="text-sm leading-relaxed text-foreground/90">
        <p className="whitespace-pre-line">{displayedBody}</p>
        {hasLongBody ? (
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            className="mt-1 font-semibold text-primary hover:underline"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Ver menos" : "Ver mais"}
          </button>
        ) : null}
      </div>

      {imageUrl ? (
        <Link
          to="/publicacoes/$id"
          params={{ id: post.id }}
          className="block overflow-hidden rounded-xl border border-border bg-muted"
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            loading="lazy"
            className="h-52 w-full object-cover transition-transform hover:scale-[1.02] sm:h-72"
          />
        </Link>
      ) : null}

      {post.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <li
              key={t}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
            >
              #{t}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-medium",
            (post.reactions ?? 0) > 0 && "text-destructive",
          )}
        >
          <Heart
            className={cn("size-4", (post.reactions ?? 0) > 0 && "fill-destructive")}
            aria-hidden="true"
          />{" "}
          {post.reactions ?? 0}
        </span>
        <Link
          to="/publicacoes/$id"
          params={{ id: post.id }}
          className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-primary"
        >
          <MessageCircle className="size-4" aria-hidden="true" /> {post.comments ?? 0} comentários
        </Link>
      </div>
    </article>
  );
}

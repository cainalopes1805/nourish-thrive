import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

export type ImageType = "avatar" | "banner" | "post" | "community-banner" | "community-avatar";

const DEFAULT_LABELS: Record<ImageType, { action: string; alt: string }> = {
  avatar: { action: "foto", alt: "foto de perfil" },
  banner: { action: "capa", alt: "capa" },
  post: { action: "imagem", alt: "imagem da publicação" },
  "community-banner": { action: "capa", alt: "capa da comunidade" },
  "community-avatar": { action: "ícone", alt: "ícone da comunidade" },
};

interface ImageUploaderProps {
  type: ImageType;
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  label?: string;
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploader({
  type,
  currentUrl,
  onUploadComplete,
  onRemove,
  className,
  label,
}: ImageUploaderProps) {
  const { user } = useSession();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validation 1: MIME Type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`Formato inválido. Use JPEG, PNG ou WEBP.`);
      return;
    }

    // Validation 2: File Size
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`A imagem não pode ultrapassar ${MAX_SIZE_MB}MB.`);
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      // Validation 3: Path strictly bound to user.id according to RLS Policy
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles_media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false, // We use unique names so no upsert needed
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles_media").getPublicUrl(filePath);

      toast.success("Imagem enviada com sucesso!");
      onUploadComplete(publicUrl);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Ocorreu um erro ao enviar a imagem. Verifique as permissões.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div
      className={cn(
        "relative group overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors",
        className,
      )}
    >
      {currentUrl ? (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={currentUrl}
            alt={label ?? DEFAULT_LABELS[type].alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 size-4" />
              Trocar
            </Button>
            {onRemove ? (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={onRemove}
                disabled={uploading}
                aria-label="Remover imagem"
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center h-full min-h-[120px]">
          <ImageIcon className="size-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            {label ? `Adicionar ${label}` : `Adicionar ${DEFAULT_LABELS[type].action}`}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 mb-3">
            JPEG/PNG/WEBP até {MAX_SIZE_MB}MB
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            Selecionar
          </Button>
        </div>
      )}

      {uploading && currentUrl && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-10">
          <Loader2 className="size-6 text-primary animate-spin" />
        </div>
      )}

      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
      />
    </div>
  );
}

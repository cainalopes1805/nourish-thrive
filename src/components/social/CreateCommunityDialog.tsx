import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { INTERESTS } from "@/lib/constants";
import { createCommunity } from "@/lib/community";
import { ImageUploader } from "@/components/social/ImageUploader";

export function CreateCommunityDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const n = name.trim();
      const d = description.trim();
      const t = topic.trim();

      if (!n || !d || !t) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }

      return createCommunity({ name: n, description: d, topic: t, bannerUrl, avatarUrl });
    },
    onSuccess: () => {
      toast.success("Comunidade criada com sucesso!");
      setOpen(false);
      setName("");
      setDescription("");
      setTopic("");
      setBannerUrl(null);
      setAvatarUrl(null);
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar comunidade.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar comunidade</DialogTitle>
          <DialogDescription>
            Crie um espaço seguro e focado para trocar experiências.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome da comunidade *
            </label>
            <Input
              id="name"
              placeholder="Ex: Receitas Fáceis"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição *
            </label>
            <Textarea
              id="description"
              placeholder="Sobre o que é este grupo?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium">
              Tópico principal *
            </label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                Selecione um tópico
              </option>
              {INTERESTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Capa da comunidade</label>
              <ImageUploader
                type="community-banner"
                currentUrl={bannerUrl}
                onUploadComplete={setBannerUrl}
                onRemove={() => setBannerUrl(null)}
                className="h-24 w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ícone</label>
              <ImageUploader
                type="community-avatar"
                currentUrl={avatarUrl}
                onUploadComplete={setAvatarUrl}
                onRemove={() => setAvatarUrl(null)}
                className="h-24 w-24 rounded-full"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Sem imagem, usamos um degradê de fundo automático.
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !name.trim() || !description.trim() || !topic.trim()}
          >
            {mutation.isPending ? "Criando..." : "Criar comunidade"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

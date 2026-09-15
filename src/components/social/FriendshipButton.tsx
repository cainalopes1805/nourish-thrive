import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UserPlus, UserCheck, UserMinus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FriendshipButtonProps {
  targetId: string;
}

export function FriendshipButton({ targetId }: FriendshipButtonProps) {
  const { user } = useSession();
  const queryClient = useQueryClient();

  // If viewing own profile or unauthenticated, don't show the button
  if (!user || user.id === targetId) {
    return null;
  }

  const queryKey = ["friendship", user.id, targetId];

  const { data: friendship, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .or(
          `and(user_id_1.eq.${user.id},user_id_2.eq.${targetId}),and(user_id_1.eq.${targetId},user_id_2.eq.${user.id})`,
        )
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!targetId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const sendRequest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("friendships").insert({
        user_id_1: user.id,
        user_id_2: targetId,
        status: "pending",
        action_user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Solicitação enviada!");
      invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao enviar solicitação.");
    },
  });

  const acceptRequest = useMutation({
    mutationFn: async () => {
      if (!friendship) throw new Error("No friendship to accept");
      const { error } = await supabase
        .from("friendships")
        .update({
          status: "accepted",
          action_user_id: user.id,
        })
        .eq("id", friendship.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Solicitação aceita!");
      invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao aceitar.");
    },
  });

  const removeFriendship = useMutation({
    mutationFn: async () => {
      if (!friendship) throw new Error("No friendship to remove");
      const { error } = await supabase.from("friendships").delete().eq("id", friendship.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ação concluída.");
      invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover.");
    },
  });

  if (isLoading) {
    return (
      <Button variant="outline" disabled size="sm">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Carregando...
      </Button>
    );
  }

  const isPendingMutations =
    sendRequest.isPending || acceptRequest.isPending || removeFriendship.isPending;

  // Sem relação
  if (!friendship) {
    return (
      <Button onClick={() => sendRequest.mutate()} disabled={isPendingMutations} size="sm">
        <UserPlus className="mr-2 size-4" />
        Adicionar aos amigos
      </Button>
    );
  }

  // Relação pendente
  if (friendship.status === "pending") {
    // Fui eu que enviei
    if (friendship.action_user_id === user.id) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isPendingMutations} size="sm">
              Solicitação enviada
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => removeFriendship.mutate()}
            >
              Cancelar solicitação
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Foi a outra pessoa que enviou
    return (
      <div className="flex items-center gap-2">
        <Button onClick={() => acceptRequest.mutate()} disabled={isPendingMutations} size="sm">
          Aceitar
        </Button>
        <Button
          variant="outline"
          onClick={() => removeFriendship.mutate()}
          disabled={isPendingMutations}
          size="sm"
        >
          Recusar
        </Button>
      </div>
    );
  }

  // Aceito (Amigos)
  if (friendship.status === "accepted") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isPendingMutations} size="sm">
            <UserCheck className="mr-2 size-4" />
            Amigos
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive cursor-pointer"
            onClick={() => removeFriendship.mutate()}
          >
            <UserMinus className="mr-2 size-4" />
            Desfazer amizade
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}

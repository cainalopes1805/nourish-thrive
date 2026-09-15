import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, UserPlus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export function FriendRequests() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["friend-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Find all pending where user_id_1 or user_id_2 is user, AND action_user_id is NOT user
      // meaning the other person sent the request.
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          id,
          user_id_1,
          user_id_2,
          action_user_id,
          created_at
        `)
        .eq("status", "pending")
        .neq("action_user_id", user!.id)
        .or(`user_id_1.eq.${user!.id},user_id_2.eq.${user!.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // For each request, fetch the other person's profile
      const requestsWithProfiles = await Promise.all(
        data.map(async (req) => {
          const otherId = req.user_id_1 === user!.id ? req.user_id_2 : req.user_id_1;
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, display_name, avatar_url")
            .eq("id", otherId)
            .single();
            
          return {
            ...req,
            profile,
          };
        })
      );

      return requestsWithProfiles;
    },
  });

  const acceptRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .update({
          status: "accepted",
          action_user_id: user!.id,
        })
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Solicitação aceita!");
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      // Invalidate friendships globally just in case
      queryClient.invalidateQueries({ queryKey: ["friendship"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao aceitar.");
    },
  });

  const declineRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friendship"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao recusar.");
    },
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhuma solicitação pendente.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {requests.map((req) => (
        <li key={req.id} className="flex flex-col gap-2 p-2 border rounded-md bg-muted/20">
          <Link 
            to="/perfil/$id" 
            params={{ id: req.profile?.id || "" }}
            className="flex items-center gap-2 hover:underline"
          >
            <div className="size-8 rounded-full bg-muted overflow-hidden shrink-0">
              {req.profile?.avatar_url ? (
                <img src={req.profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                  {(req.profile?.display_name || "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-medium truncate">
              {req.profile?.display_name || "Usuário"}
            </span>
          </Link>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="w-full h-7 text-xs"
              disabled={acceptRequest.isPending || declineRequest.isPending}
              onClick={() => acceptRequest.mutate(req.id)}
            >
              <Check className="mr-1 size-3" />
              Aceitar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-7 text-xs"
              disabled={acceptRequest.isPending || declineRequest.isPending}
              onClick={() => declineRequest.mutate(req.id)}
            >
              <X className="mr-1 size-3" />
              Recusar
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

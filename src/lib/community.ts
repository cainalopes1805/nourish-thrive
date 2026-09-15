import { supabase } from "@/integrations/supabase/client";

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // remove accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export async function createCommunity(data: { name: string; description: string; topic: string }) {
  const { data: userResp } = await supabase.auth.getUser();
  if (!userResp.user) throw new Error("Usuário não autenticado");
  const userId = userResp.user.id;

  const slug = slugify(data.name) + "-" + Math.random().toString(36).substring(2, 6);

  const { data: community, error: createError } = await supabase
    .from("communities")
    .insert({
      name: data.name,
      description: data.description,
      topic: data.topic,
      slug,
      is_sensitive: false,
    })
    .select()
    .single();

  if (createError) throw createError;

  // Auto join o criador (evitando duplicação caso click duplo)
  const { count } = await supabase
    .from("community_members")
    .select("*", { count: "exact", head: true })
    .match({ community_id: community.id, user_id: userId });

  if (count === 0) {
    const { error: joinError } = await supabase.from("community_members").insert({
      community_id: community.id,
      user_id: userId,
    });
    if (joinError) throw joinError;
  }

  return community;
}

export async function toggleCommunityMembership(
  communityId: string,
  userId: string,
  isMember: boolean,
) {
  if (isMember) {
    const { error } = await supabase
      .from("community_members")
      .delete()
      .match({ community_id: communityId, user_id: userId });
    if (error) throw error;
  } else {
    // Check if not already a member
    const { count } = await supabase
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .match({ community_id: communityId, user_id: userId });

    if (count === 0) {
      const { error } = await supabase.from("community_members").insert({
        community_id: communityId,
        user_id: userId,
      });
      if (error) throw error;
    }
  }
}

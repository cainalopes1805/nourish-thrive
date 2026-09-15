import { Database } from "@/integrations/supabase/types";

export type BaseProfessional = Database["public"]["Tables"]["professional_profiles"]["Row"];

export interface ProfessionalReputation {
  score: number;
  positiveRatings: number;
  negativeRatings: number;
  helpfulAnswers: number;
  communityPosts: number;
  recipesPublished: number;
  communitiesManaged: number;
  weeklyThemeParticipation: number;
}

export interface ProfessionalMember extends BaseProfessional {
  reputation?: ProfessionalReputation;
}

// Estrutura de pesos preparada para calibragem futura
// Permite evitar "farming" limitando ganhos ou ajustando o peso por ação
export const REPUTATION_WEIGHTS = {
  positiveRating: 10,
  negativeRating: -5,
  helpfulAnswer: 5,
  communityPost: 2, // Pode ter limite diário futuramente
  recipePublished: 8,
  communityManaged: 20,
  weeklyThemeParticipation: 15,
};

/**
 * Função centralizada para calcular a pontuação de reputação de um profissional.
 * Deve ser utilizada sempre que a pontuação precisar ser exibida ou reavaliada.
 */
export function calculateProfessionalScore(stats: Omit<ProfessionalReputation, "score">): number {
  let score = 0;

  // Cálculo baseado nos pesos
  score += (stats.positiveRatings || 0) * REPUTATION_WEIGHTS.positiveRating;
  score += (stats.negativeRatings || 0) * REPUTATION_WEIGHTS.negativeRating;
  score += (stats.helpfulAnswers || 0) * REPUTATION_WEIGHTS.helpfulAnswer;
  score += (stats.communityPosts || 0) * REPUTATION_WEIGHTS.communityPost;
  score += (stats.recipesPublished || 0) * REPUTATION_WEIGHTS.recipePublished;
  score += (stats.communitiesManaged || 0) * REPUTATION_WEIGHTS.communityManaged;
  score += (stats.weeklyThemeParticipation || 0) * REPUTATION_WEIGHTS.weeklyThemeParticipation;

  // Garante que o score nunca seja negativo
  return Math.max(0, score);
}

export const BRAND = {
  name: "Mesa Comum",
  tagline: "Comunidade de cuidado alimentar",
  disclaimer:
    "Conteúdo educativo. Não substitui avaliação, diagnóstico ou tratamento por profissional de saúde.",
};

export const POST_TYPES = [
  { value: "experiencia", label: "Experiência", hint: "Contar algo que você viveu" },
  { value: "duvida", label: "Dúvida", hint: "Perguntar para a comunidade" },
  { value: "receita", label: "Receita", hint: "Compartilhar um preparo" },
  { value: "educativo", label: "Conteúdo educativo", hint: "Explicar um tema" },
  { value: "profissional", label: "Conteúdo profissional", hint: "Somente profissionais verificados" },
  { value: "saude_mental", label: "Saúde mental e relação com a comida", hint: "Tema sensível" },
  { value: "apoio", label: "Pedido de apoio", hint: "Você quer ser ouvido(a)" },
  { value: "enquete", label: "Enquete", hint: "Perguntar com opções" },
] as const;

export type PostType = (typeof POST_TYPES)[number]["value"];

export const POST_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  POST_TYPES.map((t) => [t.value, t.label]),
);

export const SENSITIVE_TOPICS = [
  { value: "peso", label: "Peso" },
  { value: "calorias", label: "Calorias" },
  { value: "antes_depois", label: "Antes e depois" },
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "dieta_restritiva", label: "Dietas restritivas" },
  { value: "comparacao_corporal", label: "Comparação corporal" },
] as const;

export const INTERESTS = [
  "Alimentação saudável",
  "Relação com a comida",
  "Recuperação",
  "Receitas e cozinha",
  "Alimentação econômica",
  "Alimentação vegetariana",
  "Saúde mental",
  "Alimentação infantil",
  "Alimentação e esporte",
  "Segurança alimentar",
  "Rotulagem",
  "Planejamento alimentar",
];

export const LEARN_CATEGORIES = [
  "Nutrição",
  "Segurança alimentar",
  "Relação com a comida",
  "Transtornos alimentares",
  "Saúde mental",
  "Rotulagem",
  "Cozinha",
  "Planejamento alimentar",
  "Alimentação ao longo da vida",
];

export const PROFESSIONS = [
  "Nutricionista",
  "Médico",
  "Médica",
  "Psicóloga",
  "Psicólogo",
  "Psiquiatra",
  "Enfermeira",
  "Enfermeiro",
  "Outro profissional regulamentado",
];

export const REPORT_CATEGORIES = [
  { value: "desinformacao", label: "Desinformação" },
  { value: "conteudo_perigoso", label: "Conteúdo perigoso" },
  { value: "transtorno_alimentar", label: "Conteúdo pró-transtorno alimentar" },
  { value: "assedio", label: "Assédio" },
  { value: "odio", label: "Discurso de ódio" },
  { value: "sexual", label: "Conteúdo sexual inadequado" },
  { value: "fraude", label: "Fraude" },
  { value: "publicidade", label: "Publicidade irregular" },
  { value: "aconselhamento_medico", label: "Aconselhamento médico indevido" },
  { value: "seguranca_alimentar", label: "Segurança alimentar perigosa" },
];

export const HIGH_RISK_CATEGORIES = [
  "conteudo_perigoso",
  "transtorno_alimentar",
  "aconselhamento_medico",
];

export const REPORT_STATUSES = ["pending", "reviewing", "approved", "removed", "escalated"] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  reviewing: "Em revisão",
  approved: "Mantido",
  removed: "Removido",
  escalated: "Escalonado",
};

-- LEARN LIBRARY EXPANSION
-- Fills out every "Aprender" theme with real example articles (previously
-- "Saúde mental" and "Cozinha" had none, and several other themes had only
-- one article), and gives each new article a cover image so the redesigned
-- magazine-style learn pages have enough content to feel like a real library.

INSERT INTO public.articles
  (slug, title, summary, body, author_name, author_type, category, content_type, reading_level, reading_minutes, badge, cover_url) VALUES

('ansiedade-e-compulsao-alimentar',
 'Ansiedade e compulsão alimentar: entendendo a conexão',
 'Comer em resposta a emoções difíceis é comum e não é falta de força de vontade — entenda o ciclo e quando buscar apoio.',
 E'A ansiedade e a compulsão alimentar frequentemente andam juntas. Comer em resposta a emoções difíceis — tédio, estresse, solidão — é uma experiência humana comum e não é sinal de fraqueza ou falta de força de vontade.\n\nO ciclo costuma ser assim: a emoção desconfortável aparece, comer traz alívio imediato, e depois vem a culpa — que, por sua vez, alimenta mais ansiedade. Interromper esse ciclo raramente é sobre "ter mais disciplina".\n\nAlgumas perguntas que ajudam a se observar sem julgamento: Estou com fome física ou emocional? O que eu sentia minutos antes de comer? Existe outra forma de cuidar dessa emoção agora?\n\nQuando os episódios são frequentes, intensos ou vêm acompanhados de sofrimento importante, buscar acompanhamento psicológico faz diferença real. Não é sobre força de vontade — é sobre entender o que está por trás.',
 'Dra. Camila Alves (demonstração)', 'profissional_verificado', 'Saúde mental', 'artigo', 'intermediario', 7, 'Conteúdo profissional',
 'https://picsum.photos/seed/ansiedade-e-compulsao-alimentar-cover/1200/630'),

('autoestima-e-imagem-corporal',
 'Autoestima e imagem corporal: além do espelho',
 'O espelho carrega mais do que aparência: comparação, humor e mensagens que aprendemos sobre o corpo. Um olhar mais gentil é possível.',
 E'A forma como nos vemos no espelho raramente reflete só o que está ali — carrega também humor, comparação social e mensagens que ouvimos a vida inteira sobre o que é um corpo "aceitável".\n\nRedes sociais tendem a mostrar corpos editados e momentos selecionados, o que distorce a régua de comparação. Perceber isso já ajuda a suavizar a autocrítica.\n\nUm exercício simples: em vez de avaliar o corpo pela aparência, observe o que ele permite fazer no seu dia — caminhar até o mercado, abraçar alguém, dormir depois de um dia cheio.\n\nSe pensamentos sobre o corpo ocupam grande parte do seu dia e atrapalham sua rotina, isso merece escuta profissional, não apenas "pensamento positivo".',
 'Dra. Camila Alves (demonstração)', 'profissional_verificado', 'Saúde mental', 'artigo', 'introdutorio', 6, 'Conteúdo profissional',
 'https://picsum.photos/seed/autoestima-e-imagem-corporal-cover/1200/630'),

('tecnicas-basicas-que-economizam-tempo',
 'Técnicas básicas de cozinha que economizam tempo',
 'Pequenos hábitos de organização que fazem qualquer refeição sair mais rápido, sem precisar de técnica avançada.',
 E'Você não precisa de técnica de chef para comer bem em casa — só de alguns hábitos que economizam tempo todos os dias.\n\nMise en place: separe e corte os ingredientes antes de ligar o fogo. Parece óbvio, mas evita pausas no meio do preparo.\n\nRefogados-base: cebola e alho refogados em quantidade, congelados em porções, adiantam qualquer prato depois.\n\nUma panela, dois cozimentos: enquanto o arroz cozinha, use o tempo para lavar e temperar o próximo item. Cozinhar deixa de ser sequencial e vira paralelo.\n\nAfiar a faca regularmente também reduz o tempo de corte pela metade — e é mais seguro do que uma faca cega.',
 'Equipe editorial Mesa Comum', 'equipe', 'Cozinha', 'guia', 'introdutorio', 5, 'Baseado em fonte confiável',
 'https://picsum.photos/seed/tecnicas-basicas-que-economizam-tempo-cover/1200/630'),

('despensa-organizada-passo-a-passo',
 'Como montar uma despensa organizada',
 'Organizar grãos, temperos e validade facilita decidir o que cozinhar nos dias mais corridos.',
 E'Uma despensa organizada facilita decidir o que cozinhar nos dias corridos.\n\nBase de grãos e leguminosas: arroz, feijão, lentilha, grão-de-bico. Eles têm validade longa e resolvem refeição em qualquer emergência.\n\nTemperos secos à vista: quando você vê o que tem, usa mais variedade. Potes transparentes e etiquetados ajudam.\n\nRegra de rotação: itens novos vão para trás, os mais antigos ficam na frente. Assim nada vence esquecido no fundo do armário.\n\nUma prateleira "quase vencendo": separe ali o que precisa ser consumido logo — reduz desperdício e ainda dá ideia pronta para a próxima refeição.',
 'Equipe editorial Mesa Comum', 'equipe', 'Cozinha', 'guia', 'introdutorio', 6, 'Baseado em fonte confiável',
 'https://picsum.photos/seed/despensa-organizada-passo-a-passo-cover/1200/630'),

('macronutrientes-para-que-servem',
 'Proteína, carboidrato e gordura: para que servem',
 'Carboidratos, proteínas e gorduras têm papéis diferentes e complementares — nenhum precisa ser eliminado.',
 E'Os três macronutrientes têm papéis complementares — nenhum deles é vilão isolado.\n\nCarboidratos são a principal fonte de energia rápida para o corpo e o cérebro. Estão em arroz, pão, frutas, tubérculos.\n\nProteínas participam da construção e reparo de tecidos — músculos, pele, cabelo. Vêm de carnes, ovos, leguminosas, laticínios e combinações vegetais.\n\nGorduras são essenciais para hormônios, absorção de vitaminas e proteção de órgãos. Azeite, castanhas, abacate e peixes são boas fontes.\n\nUma alimentação variada, com esses três grupos presentes ao longo do dia, tende a ser suficiente para a maioria das pessoas — sem precisar calcular gramas.',
 'Equipe editorial Mesa Comum', 'equipe', 'Nutrição', 'artigo', 'introdutorio', 6, 'Baseado em fonte confiável',
 'https://picsum.photos/seed/macronutrientes-para-que-servem-cover/1200/630'),

('tabela-nutricional-o-que-importa',
 'Tabela nutricional: o que realmente importa',
 'Nem todo número da tabela nutricional merece a mesma atenção — veja o que realmente ajuda na escolha.',
 E'A tabela nutricional traz muitos números, mas nem todos precisam da sua atenção o tempo todo.\n\nPorção: os valores da tabela se referem a uma porção definida pelo fabricante, que pode ser menor do que você realmente come. Vale conferir antes de comparar produtos.\n\nSódio, açúcares adicionados e gorduras saturadas costumam ser os itens mais relevantes para observar com atenção, especialmente em produtos ultraprocessados.\n\nA lista de ingredientes complementa a tabela: ela mostra a origem dos nutrientes, não só a quantidade.\n\nVocê não precisa decorar números. Usar a tabela como apoio ocasional, não como regra diária, já é suficiente para fazer escolhas mais informadas.',
 'Equipe editorial Mesa Comum', 'equipe', 'Rotulagem', 'artigo', 'introdutorio', 6, 'Baseado em fonte confiável',
 'https://picsum.photos/seed/tabela-nutricional-o-que-importa-cover/1200/630'),

('lista-de-compras-inteligente',
 'Lista de compras inteligente: economize tempo e dinheiro',
 'Organizar a lista por seção e partir das refeições da semana evita gastos por impulso e idas extras ao mercado.',
 E'Uma lista de compras bem pensada evita duas armadilhas comuns: gastar mais do que o planejado e voltar do mercado sem o que realmente precisa.\n\nOrganize por seção do mercado (hortifruti, mercearia, laticínios) para não ficar voltando de corredor em corredor.\n\nParta das refeições da semana, não do corredor: decida três ou quatro preparações-base e liste os ingredientes a partir delas.\n\nEvite ir ao mercado com fome — é um dos fatores mais associados a compras por impulso.\n\nDeixe uma margem para "itens de oportunidade", como uma fruta da estação mais barata naquele dia. Flexibilidade também é planejamento.',
 'Equipe editorial Mesa Comum', 'equipe', 'Planejamento alimentar', 'guia', 'introdutorio', 5, 'Baseado em fonte confiável',
 'https://picsum.photos/seed/lista-de-compras-inteligente-cover/1200/630'),

('introducao-alimentar-primeiros-passos',
 'Introdução alimentar do bebê: primeiros passos com segurança',
 'Introdução alimentar é um processo gradual e individual — sempre acompanhado por pediatra ou nutricionista.',
 E'A introdução alimentar costuma começar por volta dos seis meses, sempre orientada por um pediatra que acompanha o desenvolvimento da criança.\n\nOferecer alimentos amassados ou em pedaços macios (conforme orientação profissional) ajuda a criança a desenvolver a mastigação e a explorar texturas.\n\nRepetir a oferta de um alimento novo, mesmo após recusa, é normal — pode levar diversas exposições até a aceitação.\n\nEvite forçar quantidade. O apetite de bebês varia dia a dia, e isso é esperado, não motivo de preocupação.\n\nCada família e cada bebê têm um ritmo. Consulte sempre o pediatra ou nutricionista que acompanha a criança para orientações individualizadas.',
 'Dra. Mariana Costa (demonstração)', 'profissional_verificado', 'Alimentação ao longo da vida', 'artigo', 'intermediario', 7, 'Conteúdo profissional',
 'https://picsum.photos/seed/introducao-alimentar-primeiros-passos-cover/1200/630')

ON CONFLICT (slug) DO NOTHING;

-- Link the new articles to relevant sources, following the same
-- category-based pattern used for the original seed articles.
INSERT INTO public.article_sources (article_id, source_id, citation)
SELECT a.id, s.id, s.name FROM public.articles a JOIN public.content_sources s ON s.source_type = 'diretriz_clinica'
WHERE a.category = 'Saúde mental'
ON CONFLICT DO NOTHING;

INSERT INTO public.article_sources (article_id, source_id, citation)
SELECT a.id, s.id, s.name FROM public.articles a JOIN public.content_sources s ON s.organization = 'Ministério da Saúde'
WHERE a.slug IN ('tecnicas-basicas-que-economizam-tempo','despensa-organizada-passo-a-passo','macronutrientes-para-que-servem','lista-de-compras-inteligente','introducao-alimentar-primeiros-passos')
ON CONFLICT DO NOTHING;

INSERT INTO public.article_sources (article_id, source_id, citation)
SELECT a.id, s.id, s.name FROM public.articles a JOIN public.content_sources s ON s.organization = 'ANVISA'
WHERE a.slug = 'tabela-nutricional-o-que-importa'
ON CONFLICT DO NOTHING;

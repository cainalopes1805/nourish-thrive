-- SEED DEMO FEED CONTENT
-- Creates a handful of demonstration member accounts (email-confirmed, with an
-- unusable password) so the feed, comments and reactions have realistic example
-- content instead of showing up empty on a fresh install.

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'ana.demo@example.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Ana Beatriz"}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ana.demo@example.com');

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'joao.demo@example.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"João Pedro"}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'joao.demo@example.com');

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'marina.demo@example.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Marina Duarte"}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marina.demo@example.com');

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'carlos.demo@example.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Carlos Eduardo"}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'carlos.demo@example.com');

-- profiles/user_roles rows for these accounts already exist via the
-- on_auth_user_created trigger; just mark their bio as a demo account.
UPDATE public.profiles SET bio = 'Conta de demonstração da comunidade.'
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN
  ('ana.demo@example.com','joao.demo@example.com','marina.demo@example.com','carlos.demo@example.com')
) AND bio IS NULL;

-- Join demo accounts to the communities their posts belong to.
INSERT INTO public.community_members (community_id, user_id)
SELECT c.id, u.id FROM public.communities c, auth.users u
WHERE (c.slug, u.email) IN (
  ('recuperacao','ana.demo@example.com'),
  ('saude-mental','ana.demo@example.com'),
  ('receitas-e-cozinha','joao.demo@example.com'),
  ('alimentacao-economica','joao.demo@example.com'),
  ('relacao-com-a-comida','marina.demo@example.com'),
  ('alimentacao-vegetariana','marina.demo@example.com'),
  ('alimentacao-e-esporte','carlos.demo@example.com'),
  ('alimentacao-saudavel','carlos.demo@example.com')
);

-- POSTS
INSERT INTO public.posts (author_id, community_id, post_type, title, body, tags, is_anonymous, is_professional_content, created_at)
SELECT u.id, c.id, 'experiencia',
  'Um ano desde que parei de contar calorias',
  'Faz um ano que decidi parar de anotar tudo o que comia. No começo deu medo de "perder o controle", mas percebi que o controle que eu tinha era só ansiedade disfarçada.\n\nHoje eu como quando sinto fome e paro quando sinto satisfação — na maioria dos dias, pelo menos. Ainda tem dias difíceis, mas comparado a antes é outro mundo.',
  ARRAY['recuperacao','marcos'], false, false, now() - interval '3 days'
FROM auth.users u, public.communities c WHERE u.email = 'ana.demo@example.com' AND c.slug = 'recuperacao';

INSERT INTO public.posts (author_id, community_id, post_type, title, body, tags, is_anonymous, is_professional_content, created_at)
SELECT u.id, c.id, 'apoio',
  'Semana difícil, queria só desabafar',
  'Essa semana o pensamento sobre corpo voltou mais forte. Não tô pedindo conselho, só queria escrever em algum lugar que entende, sem julgamento. Amanhã tenho consulta e vou levar isso pra conversar.',
  ARRAY['apoio'], true, false, now() - interval '1 day'
FROM auth.users u, public.communities c WHERE u.email = 'ana.demo@example.com' AND c.slug = 'saude-mental';

INSERT INTO public.posts (author_id, community_id, post_type, title, body, tags, is_anonymous, is_professional_content, created_at)
SELECT u.id, c.id, 'receita',
  'Feijoada rápida de panela de pressão (30 min)',
  'Pra quem tem pouco tempo durante a semana:\n\n1 xícara de feijão preto (deixe de molho na véspera)\nMeia cebola, 2 dentes de alho, folha de louro\nTempero a gosto (cominho, pimenta do reino)\n\nRefogue cebola e alho, adicione o feijão escorrido e água até cobrir 2 dedos acima. Pressão por 25 minutos. Fica leve e rende pra 3 dias.',
  ARRAY['receita','economico','feijao'], false, false, now() - interval '5 days'
FROM auth.users u, public.communities c WHERE u.email = 'joao.demo@example.com' AND c.slug = 'receitas-e-cozinha';

INSERT INTO public.posts (author_id, community_id, post_type, title, body, tags, is_anonymous, is_professional_content, created_at)
SELECT u.id, c.id, 'educativo',
  'Como montei um cardápio de R$15/dia',
  'Café: pão caseiro + ovo + fruta da época.\nAlmoço/janta: arroz, feijão, um vegetal refogado e proteína (ovo, frango de vez em quando ou leguminosa).\n\nO segredo foi comprar direto na feira no fim da feira (preço mais baixo) e cozinhar em maior quantidade pra render mais dias.',
  ARRAY['economico','planejamento'], false, false, now() - interval '6 days'
FROM auth.users u, public.communities c WHERE u.email = 'joao.demo@example.com' AND c.slug = 'alimentacao-economica';

INSERT INTO public.posts (author_id, community_id, post_type, title, body, tags, is_anonymous, is_professional_content, created_at)
SELECT u.id, c.id, 'duvida',
  'Como vocês lidam com o \"e se eu comer demais\"?',
  'Tô tentando praticar alimentação intuitiva mas o medo de "comer demais" ainda trava minhas escolhas em festas e jantares fora. Alguém já passou por isso e tem alguma dica do que ajudou?',
  ARRAY['alimentacao-intuitiva','duvida'], false, false, now() - interval '2 days'
FROM auth.users u, public.communities c WHERE u.email = 'marina.demo@example.com' AND c.slug = 'relacao-com-a-comida';

INSERT INTO public.posts (author_id, community_id, post_type, title, body, tags, is_anonymous, is_professional_content, created_at)
SELECT u.id, c.id, 'experiencia',
  'Trocas vegetarianas que funcionaram pra mim',
  'Virei vegetariana há 8 meses. As trocas que mais me ajudaram: lentilha no lugar de carne moída em molhos, grão de bico assado como snack, e tofu marinado por pelo menos 20 minutos antes de grelhar (faz toda diferença no sabor).',
  ARRAY['vegetariana','trocas'], false, false, now() - interval '8 days'
FROM auth.users u, public.communities c WHERE u.email = 'marina.demo@example.com' AND c.slug = 'alimentacao-vegetariana';

INSERT INTO public.posts (author_id, community_id, post_type, title, body, tags, is_anonymous, is_professional_content, created_at)
SELECT u.id, c.id, 'experiencia',
  'Treino e alimentação sem obsessão',
  'Depois de anos associando treino a "compensar o que comi", esse ano decidi separar as duas coisas. Treino porque gosto de como me sinto, como porque sinto fome. Levou tempo pra desconstruir, mas hoje consigo treinar sem pensar em comida como recompensa ou punição.',
  ARRAY['esporte','rotina'], false, false, now() - interval '4 days'
FROM auth.users u, public.communities c WHERE u.email = 'carlos.demo@example.com' AND c.slug = 'alimentacao-e-esporte';

INSERT INTO public.posts (author_id, community_id, post_type, title, body, tags, is_anonymous, is_professional_content, created_at)
SELECT u.id, c.id, 'enquete',
  'O que vocês priorizam pra comer melhor no dia a dia?',
  'Curioso pra saber da comunidade: entre tempo, dinheiro e variedade, o que mais pesa na hora de decidir o que cozinhar durante a semana? Comenta aí o que funciona pra você.',
  ARRAY['rotina','enquete'], false, false, now() - interval '12 hours'
FROM auth.users u, public.communities c WHERE u.email = 'carlos.demo@example.com' AND c.slug = 'alimentacao-saudavel';

-- COMMENTS
INSERT INTO public.comments (post_id, author_id, body, created_at)
SELECT p.id, u.id, 'Que orgulho de ler isso. Um ano é muito tempo de trabalho interno, parabéns pela sua caminhada.', now() - interval '2 days'
FROM public.posts p, auth.users u
WHERE p.title = 'Um ano desde que parei de contar calorias' AND u.email = 'marina.demo@example.com';

INSERT INTO public.comments (post_id, author_id, body, created_at)
SELECT p.id, u.id, 'Obrigada por compartilhar mesmo nos dias difíceis. Espero que a consulta amanhã ajude.', now() - interval '20 hours'
FROM public.posts p, auth.users u
WHERE p.title = 'Semana difícil, queria só desabafar' AND u.email = 'joao.demo@example.com';

INSERT INTO public.comments (post_id, author_id, body, created_at)
SELECT p.id, u.id, 'Testei essa receita ontem, ficou ótima! Usei um pouco de laranja no tempero também.', now() - interval '4 days'
FROM public.posts p, auth.users u
WHERE p.title = 'Feijoada rápida de panela de pressão (30 min)' AND u.email = 'carlos.demo@example.com';

INSERT INTO public.comments (post_id, author_id, body, created_at)
SELECT p.id, u.id, 'O que mais me ajudou foi comer bem antes de sair de casa, assim eu chego sem fome extrema no evento.', now() - interval '1 day'
FROM public.posts p, auth.users u
WHERE p.title = 'Como vocês lidam com o "e se eu comer demais"?' AND u.email = 'ana.demo@example.com';

INSERT INTO public.comments (post_id, author_id, body, created_at)
SELECT p.id, u.id, 'Grão de bico assado é vício bom, faço toda semana aqui em casa também.', now() - interval '7 days'
FROM public.posts p, auth.users u
WHERE p.title = 'Trocas vegetarianas que funcionaram pra mim' AND u.email = 'joao.demo@example.com';

-- REACTIONS
INSERT INTO public.reactions (post_id, user_id, kind)
SELECT p.id, u.id, 'support' FROM public.posts p, auth.users u
WHERE p.title = 'Um ano desde que parei de contar calorias'
  AND u.email IN ('joao.demo@example.com','marina.demo@example.com','carlos.demo@example.com');

INSERT INTO public.reactions (post_id, user_id, kind)
SELECT p.id, u.id, 'support' FROM public.posts p, auth.users u
WHERE p.title = 'Semana difícil, queria só desabafar'
  AND u.email IN ('joao.demo@example.com','marina.demo@example.com','carlos.demo@example.com');

INSERT INTO public.reactions (post_id, user_id, kind)
SELECT p.id, u.id, 'support' FROM public.posts p, auth.users u
WHERE p.title = 'Feijoada rápida de panela de pressão (30 min)'
  AND u.email IN ('ana.demo@example.com','marina.demo@example.com');

INSERT INTO public.reactions (post_id, user_id, kind)
SELECT p.id, u.id, 'support' FROM public.posts p, auth.users u
WHERE p.title = 'Trocas vegetarianas que funcionaram pra mim'
  AND u.email IN ('ana.demo@example.com','joao.demo@example.com','carlos.demo@example.com');

INSERT INTO public.reactions (post_id, user_id, kind)
SELECT p.id, u.id, 'support' FROM public.posts p, auth.users u
WHERE p.title = 'Treino e alimentação sem obsessão'
  AND u.email IN ('ana.demo@example.com','marina.demo@example.com');

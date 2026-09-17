-- SOCIAL FEATURE EXAMPLES
-- Populates every remaining social feature with example data so a reviewer
-- browsing the demo community accounts sees a fully lived-in social network:
-- friendships (accepted + pending), private messages, booked appointments,
-- a private care journal, saved posts and a pending professional
-- verification request.
--
-- Also: "dúvida" (question) posts stay text-only in the redesigned feed, so
-- clear any image accidentally assigned to them by the earlier random media
-- backfill.

UPDATE public.posts SET image_url = NULL WHERE post_type = 'duvida' AND image_url IS NOT NULL;

-- FRIENDSHIPS (accepted + one pending, to exercise the friend-request UI)
INSERT INTO public.friendships (user_id_1, user_id_2, status, action_user_id) VALUES
('4ae369cd-de75-49cf-bccc-b999830af8a9','1ab98fe5-f7fb-4894-b795-589e18b0ffe4','accepted','4ae369cd-de75-49cf-bccc-b999830af8a9'),
('4ae369cd-de75-49cf-bccc-b999830af8a9','5e2a8940-f60f-43b7-ba98-4e4361a226a5','accepted','5e2a8940-f60f-43b7-ba98-4e4361a226a5'),
('44bac8fd-d50e-4f4b-8c72-058e704e90f2','9c64ca53-ecd4-4319-9f1a-9ceb984ccded','accepted','44bac8fd-d50e-4f4b-8c72-058e704e90f2'),
('1ab98fe5-f7fb-4894-b795-589e18b0ffe4','b32a5d56-cc60-4081-ade1-82e652775625','pending','1ab98fe5-f7fb-4894-b795-589e18b0ffe4')
ON CONFLICT DO NOTHING;

-- PRIVATE MESSAGES
INSERT INTO public.conversations (id, user_a, user_b, is_clinical) VALUES
('cc000001-0000-4000-8000-000000000001','4ae369cd-de75-49cf-bccc-b999830af8a9','1ab98fe5-f7fb-4894-b795-589e18b0ffe4', false),
('cc000001-0000-4000-8000-000000000002','4aeb9f92-4582-4dd0-b313-e651ff890a3b','072c2130-a7a8-4ecd-a777-7c1b974d3aeb', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.messages (conversation_id, sender_id, body, created_at) VALUES
('cc000001-0000-4000-8000-000000000001','4ae369cd-de75-49cf-bccc-b999830af8a9','Oi! Vi seu post sobre o macarrão do seu filho, aqui em casa foi igual até uns meses atrás', now() - interval '2 days'),
('cc000001-0000-4000-8000-000000000001','1ab98fe5-f7fb-4894-b795-589e18b0ffe4','Sério? Me conta o que funcionou pra vocês, tô sem ideias aqui', now() - interval '2 days' + interval '20 minutes'),
('cc000001-0000-4000-8000-000000000001','4ae369cd-de75-49cf-bccc-b999830af8a9','Deixei ele ajudar a montar o prato dele, tipo escolher entre duas opções. Não resolveu tudo mas ajudou bastante', now() - interval '2 days' + interval '35 minutes'),
('cc000001-0000-4000-8000-000000000001','1ab98fe5-f7fb-4894-b795-589e18b0ffe4','Vou tentar essa semana, obrigado por compartilhar', now() - interval '1 day'),
('cc000001-0000-4000-8000-000000000002','4aeb9f92-4582-4dd0-b313-e651ff890a3b','Oi, tudo bem? Essa semana tive um dia mais difícil, mas segui firme nas refeições', now() - interval '3 days'),
('cc000001-0000-4000-8000-000000000002','072c2130-a7a8-4ecd-a777-7c1b974d3aeb','Que bom que você conseguiu seguir mesmo no dia difícil. Isso é muito importante. Quer trazer isso pra nossa próxima sessão?', now() - interval '3 days' + interval '3 hours'),
('cc000001-0000-4000-8000-000000000002','4aeb9f92-4582-4dd0-b313-e651ff890a3b','Sim, por favor. Obrigada por perguntar', now() - interval '3 days' + interval '4 hours')
ON CONFLICT DO NOTHING;

-- APPOINTMENTS (confirmed, completed and requested, to cover every status)
INSERT INTO public.appointments (patient_id, professional_id, starts_at, modality, status, reason_note) VALUES
('4aeb9f92-4582-4dd0-b313-e651ff890a3b','393e9199-805b-402e-b008-d2786488b7ea', now() + interval '3 days' + interval '14 hours', 'teleconsulta', 'confirmed', 'Acompanhamento contínuo em recuperação.'),
('9c64ca53-ecd4-4319-9f1a-9ceb984ccded','0ba4d5aa-2dfd-4a41-b2e2-d4a1c3dfeb23', now() - interval '10 days', 'presencial', 'completed', 'Orientação sobre segurança alimentar na cozinha coletiva.'),
('b32a5d56-cc60-4081-ade1-82e652775625','071ccd29-ab28-4ca1-99aa-1bc82c53dc92', now() + interval '6 days' + interval '9 hours', 'teleconsulta', 'requested', 'Dúvidas sobre alimentação antes e depois de corridas.')
ON CONFLICT DO NOTHING;

-- CARE JOURNAL (private entries for demo accounts)
INSERT INTO public.care_journal_entries (user_id, mood, eating_perception, difficulty, small_win, note, created_at) VALUES
('4aeb9f92-4582-4dd0-b313-e651ff890a3b','ansioso','Comi as três refeições, mesmo sem muita vontade.','Pensamento sobre peso voltou à tarde.','Liguei pra minha irmã em vez de ficar sozinha com o pensamento.',NULL, now() - interval '1 day'),
('4aeb9f92-4582-4dd0-b313-e651ff890a3b','tranquilo','Dia mais leve, comi com calma no almoço.',NULL,'Consegui cozinhar sem pressa.','Pequenas vitórias contam.', now() - interval '4 days'),
('4ae369cd-de75-49cf-bccc-b999830af8a9','animado','Cozinhei uma receita nova e gostei do resultado.',NULL,'Segui a receita nova até o fim.',NULL, now() - interval '2 days')
ON CONFLICT DO NOTHING;

-- SAVED POSTS
INSERT INTO public.saved_posts (post_id, user_id)
SELECT p.id, u FROM public.posts p
CROSS JOIN unnest(array['1ab98fe5-f7fb-4894-b795-589e18b0ffe4','5e2a8940-f60f-43b7-ba98-4e4361a226a5']::uuid[]) u
WHERE p.id IN (
  'aa000001-0000-4000-8000-000000000007',
  'aa000001-0000-4000-8000-000000000012',
  'aa000001-0000-4000-8000-000000000019'
)
ON CONFLICT DO NOTHING;

-- PROFESSIONAL VERIFICATION REQUEST (pending, to populate the admin queue)
INSERT INTO public.verification_requests (user_id, profession, council, registration_number, state, status) VALUES
('b32a5d56-cc60-4081-ade1-82e652775625','Nutricionista','CRN','112233-DEMO','RS','pending')
ON CONFLICT DO NOTHING;

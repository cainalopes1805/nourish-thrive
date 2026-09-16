update public.profiles set bio = 'Aprendendo a cozinhar mais em casa e a ter paciência comigo.', interests = array['Alimentação saudável','Receitas e cozinha','Relação com a comida'], onboarded = true where id = '4ae369cd-de75-49cf-bccc-b999830af8a9';
update public.profiles set bio = 'Pai de duas crianças, tentando montar rotina alimentar sem brigas.', interests = array['Alimentação infantil','Planejamento alimentar'], onboarded = true where id = '1ab98fe5-f7fb-4894-b795-589e18b0ffe4';
update public.profiles set bio = 'Em recuperação. Aqui para ouvir e ser ouvida, sem números.', interests = array['Recuperação','Saúde mental','Relação com a comida'], recovery_friendly_mode = true, onboarded = true where id = '4aeb9f92-4582-4dd0-b313-e651ff890a3b';
update public.profiles set bio = 'Cozinho para a semana toda no domingo. Gosto de comida simples.', interests = array['Alimentação econômica','Planejamento alimentar'], onboarded = true where id = '5e2a8940-f60f-43b7-ba98-4e4361a226a5';
update public.profiles set bio = 'Vegetariana há seis anos, ainda descobrindo combinações novas.', interests = array['Alimentação vegetariana','Receitas e cozinha'], onboarded = true where id = '44bac8fd-d50e-4f4b-8c72-058e704e90f2';
update public.profiles set bio = 'Corro aos fins de semana e quero entender melhor alimentação e esporte.', interests = array['Alimentação e esporte','Alimentação saudável'], onboarded = true where id = 'b32a5d56-cc60-4081-ade1-82e652775625';
update public.profiles set bio = 'Trabalho com cozinha coletiva e me preocupo com segurança dos alimentos.', interests = array['Segurança alimentar','Rotulagem'], onboarded = true where id = '9c64ca53-ecd4-4319-9f1a-9ceb984ccded';
update public.profiles set bio = 'Aposentado, aprendendo a cozinhar depois dos 60.', interests = array['Alimentação saudável','Receitas e cozinha'], onboarded = true where id = 'ee2ce917-7bae-41ff-9ddd-cc31b764199e';
update public.profiles set bio = 'Nutricionista. Escrevo sobre comida de verdade, sem dieta restritiva.', onboarded = true where id = 'cd33da15-5e1b-4b91-95c8-5f57abe3bd3e';
update public.profiles set bio = 'Médico de família. Foco em prevenção e cuidado contínuo.', onboarded = true where id = '5150939d-b164-43df-9ffc-f9aaad4f3413';
update public.profiles set bio = 'Psicóloga. Trabalho com relação com a comida e imagem corporal.', onboarded = true where id = '072c2130-a7a8-4ecd-a777-7c1b974d3aeb';
update public.profiles set bio = 'Psiquiatra. Atendo quadros alimentares e ansiedade.', onboarded = true where id = '52a50c9c-3067-4e30-945b-7a0d4a77dae5';
update public.profiles set bio = 'Enfermeira. Educação em saúde e segurança alimentar.', onboarded = true where id = '4b042657-e0da-41d7-97fc-ab5c453abd73';

update public.professional_profiles set user_id = 'cd33da15-5e1b-4b91-95c8-5f57abe3bd3e' where id = '071ccd29-ab28-4ca1-99aa-1bc82c53dc92';
update public.professional_profiles set user_id = '5150939d-b164-43df-9ffc-f9aaad4f3413' where id = 'cda89e38-f97f-4208-bbe8-bfb502e874f6';
update public.professional_profiles set user_id = '072c2130-a7a8-4ecd-a777-7c1b974d3aeb' where id = '393e9199-805b-402e-b008-d2786488b7ea';
update public.professional_profiles set user_id = '52a50c9c-3067-4e30-945b-7a0d4a77dae5' where id = 'acc4ec3d-66ea-4844-96f1-b3bf12aabbfc';
update public.professional_profiles set user_id = '4b042657-e0da-41d7-97fc-ab5c453abd73' where id = '0ba4d5aa-2dfd-4a41-b2e2-d4a1c3dfeb23';

insert into public.user_roles (user_id, role)
select u, 'verified_professional'::app_role from unnest(array[
  'cd33da15-5e1b-4b91-95c8-5f57abe3bd3e','5150939d-b164-43df-9ffc-f9aaad4f3413',
  '072c2130-a7a8-4ecd-a777-7c1b974d3aeb','52a50c9c-3067-4e30-945b-7a0d4a77dae5',
  '4b042657-e0da-41d7-97fc-ab5c453abd73']::uuid[]) u
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select u, 'member'::app_role from unnest(array[
  '4ae369cd-de75-49cf-bccc-b999830af8a9','1ab98fe5-f7fb-4894-b795-589e18b0ffe4',
  '4aeb9f92-4582-4dd0-b313-e651ff890a3b','5e2a8940-f60f-43b7-ba98-4e4361a226a5',
  '44bac8fd-d50e-4f4b-8c72-058e704e90f2','b32a5d56-cc60-4081-ade1-82e652775625',
  '9c64ca53-ecd4-4319-9f1a-9ceb984ccded','ee2ce917-7bae-41ff-9ddd-cc31b764199e']::uuid[]) u
on conflict (user_id, role) do nothing;

insert into public.community_members (community_id, user_id)
select c.id, u
from public.communities c
cross join unnest(array[
  '4ae369cd-de75-49cf-bccc-b999830af8a9','1ab98fe5-f7fb-4894-b795-589e18b0ffe4',
  '4aeb9f92-4582-4dd0-b313-e651ff890a3b','5e2a8940-f60f-43b7-ba98-4e4361a226a5',
  '44bac8fd-d50e-4f4b-8c72-058e704e90f2','b32a5d56-cc60-4081-ade1-82e652775625',
  '9c64ca53-ecd4-4319-9f1a-9ceb984ccded','ee2ce917-7bae-41ff-9ddd-cc31b764199e',
  'cd33da15-5e1b-4b91-95c8-5f57abe3bd3e','072c2130-a7a8-4ecd-a777-7c1b974d3aeb']::uuid[]) u
where (('x' || substr(md5(c.id::text || u::text), 1, 8))::bit(32)::int % 10) between 0 and 5
on conflict do nothing;

insert into public.posts (id, author_id, community_id, post_type, title, body, tags, is_anonymous, is_professional_content, sensitive_topics, created_at) values
('aa000001-0000-4000-8000-000000000001','4ae369cd-de75-49cf-bccc-b999830af8a9','89f3f060-982d-4884-b890-042565d26d9f','experiencia','Voltei a fazer o almoço em casa',E'Depois de meses pedindo comida quase todo dia, decidi voltar a cozinhar no almoço.\n\nComecei simples: arroz, feijão, um refogado e uma salada que eu já deixo lavada. Não é bonito, mas me deixa mais tranquila e economizei bastante no mês.\n\nO que me ajudou foi parar de tentar fazer tudo perfeito.',array['cozinhar-em-casa','rotina'],false,false,'{}', now() - interval '2 hours'),
('aa000001-0000-4000-8000-000000000002','cd33da15-5e1b-4b91-95c8-5f57abe3bd3e','89f3f060-982d-4884-b890-042565d26d9f','profissional','Comida de verdade antes de qualquer suplemento',E'Recebo muita pergunta sobre suplementos. Na maior parte das vezes, a conversa começa antes disso: como estão as refeições no dia a dia, o sono, a rotina e o acesso aos alimentos.\n\nSuplementação tem indicação, e ela é individual. Antes de comprar qualquer coisa vista em rede social, vale conversar com um profissional que acompanhe o seu caso.\n\nConteúdo educativo, não substitui consulta.',array['nutricao','suplementos'],false,true,'{}', now() - interval '6 hours'),
('aa000001-0000-4000-8000-000000000003','4aeb9f92-4582-4dd0-b313-e651ff890a3b','dfaa4c21-8a50-4ed3-b850-30b73b1352f7','apoio','Dia difícil, mas não desisti',E'Hoje foi um daqueles dias em que a cabeça não ajuda. Consegui fazer as três refeições mesmo assim, com apoio da minha irmã.\n\nNão quero conselhos de dieta, só queria registrar aqui que deu pra atravessar o dia.',array['recuperacao','apoio'],true,false,array['peso'], now() - interval '1 day'),
('aa000001-0000-4000-8000-000000000004','9c64ca53-ecd4-4319-9f1a-9ceb984ccded','689bd5b0-87cd-489d-a465-0d13d0b7d8f0','educativo','Cinco erros comuns na geladeira',E'Trabalho com cozinha coletiva e vejo sempre os mesmos deslizes:\n\n1. Carne crua na prateleira de cima, pingando em alimento pronto.\n2. Comida quente guardada em panela grande, que demora demais para esfriar.\n3. Porta da geladeira usada para leite (é a parte mais quente).\n4. Sobras sem data.\n5. Verdura lavada guardada molhada.\n\nNenhum deles é frescura: são as causas mais comuns de contaminação em casa.',array['seguranca-alimentar','geladeira'],false,false,'{}', now() - interval '1 day 3 hours'),
('aa000001-0000-4000-8000-000000000005','1ab98fe5-f7fb-4894-b795-589e18b0ffe4','083f1e04-4502-4acd-8bfc-f6a0272c82f5','duvida','Criança que só quer macarrão: insisto ou deixo?',E'Meu filho de 5 anos recusa quase tudo que não seja macarrão. Já tentei esconder legumes no molho e ele percebe.\n\nAlguém passou por isso? Tenho medo de transformar a mesa num campo de batalha.',array['alimentacao-infantil','seletividade'],false,false,'{}', now() - interval '2 days'),
('aa000001-0000-4000-8000-000000000006','072c2130-a7a8-4ecd-a777-7c1b974d3aeb','2092f90f-3edf-43c7-8dab-2488bd4d4362','profissional','Culpa depois de comer: o que costuma estar por trás',E'A culpa alimentar raramente é sobre o alimento em si. Em geral ela aparece quando existe uma régua muito rígida sobre o que é "certo" comer.\n\nUm exercício que costumo propor: em vez de julgar a escolha, descrever o contexto. Estava com fome há quanto tempo? Como foi o dia? Estava sozinho?\n\nSe a culpa é frequente e atrapalha sua vida, procurar acompanhamento psicológico faz diferença.',array['saude-mental','culpa-alimentar'],false,true,'{}', now() - interval '2 days 5 hours'),
('aa000001-0000-4000-8000-000000000007','5e2a8940-f60f-43b7-ba98-4e4361a226a5','a71b6dc4-3855-4e4f-956d-2a5f9410abbd','receita','Feijão temperado que rende a semana inteira',E'Ingredientes: 500 g de feijão carioca, 1 cebola, 4 dentes de alho, 2 folhas de louro, azeite, sal.\n\nModo de fazer: deixe o feijão de molho por 8 horas e descarte a água. Cozinhe na pressão por 25 minutos com o louro. Refogue cebola e alho no azeite, junte duas conchas de feijão amassado e devolva à panela. Cozinhe mais 10 minutos sem tampa.\n\nDivido em potes e congelo. Sai bem barato por porção.',array['receita','economia'],false,false,'{}', now() - interval '3 days'),
('aa000001-0000-4000-8000-000000000008','44bac8fd-d50e-4f4b-8c72-058e704e90f2','cf114cc6-ca52-48d9-8e8f-96b07280cc1b','experiencia','Seis anos sem carne: o que mudou na prática',E'A parte difícil não foi parar de comer carne, foi aprender a montar um prato que sustenta.\n\nHoje penso sempre em três coisas: uma leguminosa (feijão, grão-de-bico, lentilha), um cereal e alguma coisa colorida. Quando falta tempo, ovo resolve.\n\nFiz acompanhamento para checar B12 e ferro, recomendo muito.',array['vegetariano','rotina'],false,false,'{}', now() - interval '3 days 8 hours'),
('aa000001-0000-4000-8000-000000000009','b32a5d56-cc60-4081-ade1-82e652775625','2b8f3e02-de86-4dce-b070-1a21d682e6e4','duvida','Comer antes ou depois da corrida?',E'Corro cedo, umas 6h, e nunca sei se como antes. Quando corro em jejum fico tonto no fim.\n\nComo vocês fazem em treinos curtos, de 5 a 8 km?',array['esporte','corrida'],false,false,'{}', now() - interval '4 days'),
('aa000001-0000-4000-8000-000000000010','ee2ce917-7bae-41ff-9ddd-cc31b764199e','97f6d93c-8214-4ad8-9cea-7704bd6aa648','experiencia','Aprendendo a cozinhar aos 67',E'Minha esposa sempre cozinhou. Depois que ela ficou doente, precisei aprender.\n\nComecei com ovo mexido e sopa. Hoje faço arroz soltinho e um frango assado razoável. Escrevo aqui porque talvez tenha mais gente na mesma situação e com vergonha de perguntar.',array['cozinha','recomeco'],false,false,'{}', now() - interval '5 days'),
('aa000001-0000-4000-8000-000000000011','4ae369cd-de75-49cf-bccc-b999830af8a9','2092f90f-3edf-43c7-8dab-2488bd4d4362','enquete','O que mais atrapalha sua alimentação na semana?',E'Escolhi enquete porque queria entender se é só comigo.\n\nOpções: (a) falta de tempo, (b) cansaço no fim do dia, (c) dinheiro, (d) não saber o que cozinhar.\n\nComenta a letra e, se quiser, conta um pouco.',array['rotina'],false,false,'{}', now() - interval '5 days 6 hours'),
('aa000001-0000-4000-8000-000000000012','4b042657-e0da-41d7-97fc-ab5c453abd73','689bd5b0-87cd-489d-a465-0d13d0b7d8f0','profissional','Quanto tempo a comida pode ficar fora da geladeira',E'A faixa entre 5 °C e 60 °C é onde as bactérias se multiplicam mais rápido. Como regra prática, comida pronta não deve ficar mais de 2 horas em temperatura ambiente — 1 hora em dias muito quentes.\n\nPara resfriar rápido, divida em recipientes rasos em vez de guardar a panela inteira.\n\nOrientação geral de educação em saúde.',array['seguranca-alimentar'],false,true,'{}', now() - interval '6 days'),
('aa000001-0000-4000-8000-000000000013','4aeb9f92-4582-4dd0-b313-e651ff890a3b','e3996eaf-b195-4f59-8639-d64fade2d7d6','saude_mental','Parei de me pesar e a semana ficou mais leve',E'Tirei a balança do banheiro no mês passado, com apoio da minha psicóloga.\n\nNão foi mágico, mas a manhã deixou de começar com um veredito. Escrevo sem números de propósito.',array['saude-mental','recuperacao'],false,false,array['peso','comparacao_corporal'], now() - interval '7 days'),
('aa000001-0000-4000-8000-000000000014','5150939d-b164-43df-9ffc-f9aaad4f3413','89f3f060-982d-4884-b890-042565d26d9f','profissional','Quando procurar ajuda profissional',E'Alguns sinais que merecem avaliação: perda ou ganho de peso rápido sem explicação, cansaço persistente, episódios de comer com sensação de descontrole, evitar refeições com outras pessoas, uso de laxantes ou remédios por conta própria.\n\nProcure uma unidade de saúde ou um profissional de confiança. Em situação de risco imediato, procure emergência.',array['prevencao','saude'],false,true,'{}', now() - interval '8 days'),
('aa000001-0000-4000-8000-000000000015','9c64ca53-ecd4-4319-9f1a-9ceb984ccded','97f6d93c-8214-4ad8-9cea-7704bd6aa648','receita','Sopa de legumes com o que tiver na gaveta',E'Refogue cebola e alho, junte tudo que estiver perto de passar do ponto (cenoura, abobrinha, batata, talos), cubra com água, sal e uma folha de louro.\n\nCozinhe 20 minutos e amasse parte dos legumes para engrossar. Rende muito e evita desperdício.',array['receita','desperdicio'],false,false,'{}', now() - interval '9 days'),
('aa000001-0000-4000-8000-000000000016','1ab98fe5-f7fb-4894-b795-589e18b0ffe4','a71b6dc4-3855-4e4f-956d-2a5f9410abbd','experiencia','Feira no fim do dia mudou meu orçamento',E'Descobri que na última hora da feira o preço cai bastante. Volto com sacola cheia por menos da metade.\n\nO truque é ir com a lista pronta para não levar coisa que vai estragar.',array['economia','feira'],false,false,'{}', now() - interval '10 days'),
('aa000001-0000-4000-8000-000000000017','44bac8fd-d50e-4f4b-8c72-058e704e90f2','2092f90f-3edf-43c7-8dab-2488bd4d4362','duvida','Como vocês lidam com comentários sobre o prato?',E'Em almoço de família sempre tem alguém comentando o que eu como ou deixo de comer. Fico sem resposta na hora.\n\nQueria ouvir como vocês respondem sem virar discussão.',array['convivio','limites'],false,false,'{}', now() - interval '11 days'),
('aa000001-0000-4000-8000-000000000018','b32a5d56-cc60-4081-ade1-82e652775625','89f3f060-982d-4884-b890-042565d26d9f','experiencia','Marmita no trabalho depois de um ano',E'Comecei levando duas vezes por semana para não me frustrar. Hoje levo quase todo dia.\n\nO que funcionou: cozinhar no domingo, congelar em porções e ter sempre um plano B na geladeira.',array['marmita','planejamento'],false,false,'{}', now() - interval '12 days'),
('aa000001-0000-4000-8000-000000000019','52a50c9c-3067-4e30-945b-7a0d4a77dae5','e3996eaf-b195-4f59-8639-d64fade2d7d6','profissional','Ansiedade e alimentação: uma via de mão dupla',E'Ansiedade altera apetite em direções diferentes: algumas pessoas perdem a fome, outras comem para aliviar a tensão. As duas respostas são comuns e não são falta de força de vontade.\n\nTratar o quadro ansioso costuma melhorar a relação com a comida. O caminho inclui acompanhamento, sono e rede de apoio — às vezes medicação, sempre com avaliação individual.',array['saude-mental','ansiedade'],false,true,'{}', now() - interval '13 days'),
('aa000001-0000-4000-8000-000000000020','ee2ce917-7bae-41ff-9ddd-cc31b764199e','689bd5b0-87cd-489d-a465-0d13d0b7d8f0','duvida','Dá para congelar comida já temperada?',E'Fiz uma panela grande de frango desfiado temperado. Posso congelar assim ou é melhor congelar sem tempero?\n\nNunca sei quanto tempo dura no congelador.',array['congelamento'],false,false,'{}', now() - interval '14 days')
on conflict (id) do nothing;

insert into public.comments (post_id, author_id, body, is_anonymous, created_at) values
('aa000001-0000-4000-8000-000000000001','5e2a8940-f60f-43b7-ba98-4e4361a226a5','Isso de largar a perfeição foi o que mudou aqui também. Arroz, feijão e ovo já é refeição.',false, now() - interval '1 hour'),
('aa000001-0000-4000-8000-000000000001','ee2ce917-7bae-41ff-9ddd-cc31b764199e','Deixar a salada lavada é o truque. Anotado.',false, now() - interval '40 minutes'),
('aa000001-0000-4000-8000-000000000003','4ae369cd-de75-49cf-bccc-b999830af8a9','Estou aqui lendo e torcendo por você. Atravessar o dia já é bastante.',false, now() - interval '20 hours'),
('aa000001-0000-4000-8000-000000000003','072c2130-a7a8-4ecd-a777-7c1b974d3aeb','Obrigada por compartilhar. Registrar os dias difíceis também faz parte do processo.',false, now() - interval '18 hours'),
('aa000001-0000-4000-8000-000000000004','1ab98fe5-f7fb-4894-b795-589e18b0ffe4','O do leite na porta eu fazia sem saber. Mudei hoje.',false, now() - interval '22 hours'),
('aa000001-0000-4000-8000-000000000005','cd33da15-5e1b-4b91-95c8-5f57abe3bd3e','Seletividade nessa idade é comum. Costuma ajudar oferecer o alimento novo junto de algo já aceito, sem obrigar a comer, e repetir a oferta em outros dias.',false, now() - interval '1 day 20 hours'),
('aa000001-0000-4000-8000-000000000005','44bac8fd-d50e-4f4b-8c72-058e704e90f2','Aqui melhorou quando a criança passou a ajudar a preparar.',false, now() - interval '1 day 12 hours'),
('aa000001-0000-4000-8000-000000000007','9c64ca53-ecd4-4319-9f1a-9ceb984ccded','Amassar um pouco do feijão engrossa o caldo sem precisar de mais nada. Boa receita.',false, now() - interval '2 days'),
('aa000001-0000-4000-8000-000000000009','5150939d-b164-43df-9ffc-f9aaad4f3413','Para treinos curtos, muita gente vai bem com algo leve antes. Tontura recorrente merece avaliação, vale conversar com um profissional.',false, now() - interval '3 days'),
('aa000001-0000-4000-8000-000000000010','4ae369cd-de75-49cf-bccc-b999830af8a9','Que texto bonito. Bem-vindo à cozinha!',false, now() - interval '4 days'),
('aa000001-0000-4000-8000-000000000011','b32a5d56-cc60-4081-ade1-82e652775625','(b) cansaço. Chego em casa sem energia para picar nada.',false, now() - interval '5 days'),
('aa000001-0000-4000-8000-000000000011','1ab98fe5-f7fb-4894-b795-589e18b0ffe4','(d) aqui. Tenho comida em casa e mesmo assim travo.',false, now() - interval '4 days 20 hours'),
('aa000001-0000-4000-8000-000000000013','4ae369cd-de75-49cf-bccc-b999830af8a9','Guardei a minha em cima do armário faz um mês. Semana mais leve mesmo.',true, now() - interval '6 days'),
('aa000001-0000-4000-8000-000000000017','ee2ce917-7bae-41ff-9ddd-cc31b764199e','Costumo responder "obrigado, está ótimo assim" e mudo de assunto.',false, now() - interval '10 days'),
('aa000001-0000-4000-8000-000000000020','4b042657-e0da-41d7-97fc-ab5c453abd73','Pode congelar temperado. Resfrie rápido, divida em porções pequenas e use em até três meses.',false, now() - interval '13 days');

insert into public.reactions (post_id, user_id, kind)
select p.id, u, 'support'
from public.posts p
cross join unnest(array[
  '4ae369cd-de75-49cf-bccc-b999830af8a9','1ab98fe5-f7fb-4894-b795-589e18b0ffe4',
  '4aeb9f92-4582-4dd0-b313-e651ff890a3b','5e2a8940-f60f-43b7-ba98-4e4361a226a5',
  '44bac8fd-d50e-4f4b-8c72-058e704e90f2','b32a5d56-cc60-4081-ade1-82e652775625',
  '9c64ca53-ecd4-4319-9f1a-9ceb984ccded','ee2ce917-7bae-41ff-9ddd-cc31b764199e',
  'cd33da15-5e1b-4b91-95c8-5f57abe3bd3e']::uuid[]) u
where p.author_id <> u
  and (('x' || substr(md5(p.id::text || u::text), 1, 8))::bit(32)::int % 10) between 0 and 5
on conflict do nothing;

insert into public.follows (follower_id, following_id)
select a, b from (
  select a, b from unnest(array[
    '4ae369cd-de75-49cf-bccc-b999830af8a9','1ab98fe5-f7fb-4894-b795-589e18b0ffe4',
    '5e2a8940-f60f-43b7-ba98-4e4361a226a5','44bac8fd-d50e-4f4b-8c72-058e704e90f2',
    'b32a5d56-cc60-4081-ade1-82e652775625','9c64ca53-ecd4-4319-9f1a-9ceb984ccded']::uuid[]) a
  cross join unnest(array[
    'cd33da15-5e1b-4b91-95c8-5f57abe3bd3e','072c2130-a7a8-4ecd-a777-7c1b974d3aeb',
    '5150939d-b164-43df-9ffc-f9aaad4f3413']::uuid[]) b
) s
on conflict do nothing;

insert into public.reports (reporter_id, target_type, target_id, category, details, risk_level, status)
values
('4ae369cd-de75-49cf-bccc-b999830af8a9','post','aa000001-0000-4000-8000-000000000011','desinformacao','Exemplo de denúncia de demonstração para testar a fila de moderação.','low','pending'),
('9c64ca53-ecd4-4319-9f1a-9ceb984ccded','post','aa000001-0000-4000-8000-000000000013','transtorno_alimentar','Exemplo de denúncia de alto risco (demonstração).','high','pending');
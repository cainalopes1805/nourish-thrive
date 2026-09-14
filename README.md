# Nourish & Thrive

Crie uma plataforma web responsiva, moderna e production-ready focada em alimentação saudável, educação alimentar, segurança alimentar, saúde mental, prevenção e apoio relacionado à alimentação.

NOME PROVISÓRIO DO PRODUTO:
[CRIAR UM NOME DE MARCA PROVISÓRIO E FÁCIL DE SUBSTITUIR]

CONCEITO:
A plataforma deve funcionar como uma comunidade de cuidado alimentar que conecta pessoas da comunidade com nutricionistas, médicos, psicólogos, psiquiatras e outros profissionais de saúde devidamente verificados.

O objetivo NÃO é criar uma rede social focada em emagrecimento, estética corporal ou contagem de calorias.

O posicionamento deve ser:
“Um espaço seguro para aprender, compartilhar experiências, encontrar apoio e acessar profissionais de saúde.”

PRINCÍPIOS DO PRODUTO:

1. Alimentação é mais do que calorias e nutrientes.
2. Evitar cultura de dieta e comparação corporal.
3. Não incentivar restrição extrema, jejum perigoso, purgação, compulsão ou comportamentos alimentares prejudiciais.
4. Valorizar alimentação adequada, diversidade, segurança alimentar, cultura, autonomia, habilidades culinárias e bem-estar.
5. Conteúdo profissional deve ser claramente identificado.
6. Profissionais devem possuir verificação profissional.
7. Dados de saúde e informações clínicas devem ficar separados dos dados sociais.
8. Privacidade e segurança devem ser tratadas desde a arquitetura.
9. A plataforma não substitui atendimento médico, psicológico ou nutricional presencial quando este for necessário.
10. IA nunca deve diagnosticar, prescrever medicamentos, interpretar fotos corporais ou criar planos extremos de emagrecimento.

STACK:

* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase Realtime
* Supabase Edge Functions

ARQUITETURA:
Criar a aplicação preparada para produção, com componentes reutilizáveis, tipagem forte, tratamento de erros, loading states, empty states, validação de formulários, acessibilidade e arquitetura modular.

RESPONSIVIDADE:
A aplicação deve ser mobile-first e funcionar perfeitamente em:

* smartphone
* tablet
* desktop

NAVEGAÇÃO PRINCIPAL:
Desktop:

* Feed
* Comunidades
* Aprender
* Profissionais
* Consultas
* Mensagens
* Meu espaço

Mobile:
usar navegação inferior com:

* Início
* Comunidades
* Aprender
* Profissionais
* Perfil

Adicionar botão flutuante/ação principal para criação de conteúdo.

USUÁRIOS:
Criar os seguintes papéis:

1. member
2. verified_professional
3. moderator
4. admin

A autorização nunca deve depender apenas de lógica frontend.
Implementar controle de acesso no backend e Row Level Security no Supabase.

PERFIL DE USUÁRIO:
Campos:

* display_name
* username
* avatar
* bio
* interests
* preferred_topics
* privacy_preferences
* feed_preferences
* recovery_friendly_mode
* created_at

Permitir nome de exibição separado de identidade legal.

PERFIL PROFISSIONAL:
Campos:

* name
* profession
* council
* registration_number
* state
* specialties
* bio
* approach
* languages
* consultation_types
* location
* teleconsultation_enabled
* profile_photo
* verified_status

Criar fluxo de verificação profissional:

* solicitação
* envio de dados profissionais
* análise
* aprovação
* reprovação
* revisão
* selo “Profissional verificado”

Documentos de verificação nunca devem ficar públicos.

COMUNIDADE:
Criar:

* posts
* comments
* reactions
* saved posts
* follows
* communities
* community members
* reports

TIPOS DE POST:

* experiência
* dúvida
* receita
* conteúdo educativo
* conteúdo profissional
* saúde mental/relação com alimentação
* pedido de apoio
* enquete

Ao criar um post, perguntar:
“O que você quer compartilhar?”

Permitir:

* texto
* imagens
* links
* tags
* comunidade
* postagem anônima para a comunidade

POST ANÔNIMO:
Quando ativado, o autor deve aparecer publicamente apenas como:
“Anônimo”

A plataforma deve manter a identidade internamente para segurança, auditoria e moderação.

FEED:
Criar dois modos:

1. Para você
2. Seguindo

O algoritmo NÃO deve priorizar conteúdo simplesmente por engajamento.

Priorizar:

* qualidade educacional
* conteúdo profissional
* diversidade
* relevância temática
* conteúdo seguro
* respostas úteis
* fontes confiáveis

Reduzir recomendação de:

* antes/depois
* comparação corporal
* desafios extremos
* perda rápida de peso
* conteúdo pró-transtorno alimentar
* conteúdo de restrição extrema
* conteúdo excessivamente focado em calorias

Adicionar controles:

* “Não tenho interesse”
* “Silenciar tema”
* “Ocultar conteúdo semelhante”
* “Denunciar”
* “Bloquear usuário”

Adicionar opção “Por que estou vendo isso?” para transparência do feed.

RECOVERY-FRIENDLY MODE:
Criar uma configuração chamada:
“Experiência protegida”

Opções para esconder/reduzir:

* peso
* calorias
* antes e depois
* emagrecimento
* dietas restritivas
* comparação corporal

Quando ativado, o feed deve priorizar:

* recuperação
* relação saudável com comida
* saúde mental
* apoio
* alimentação regular
* educação alimentar
* conteúdo profissional

NÃO criar recursos de streak relacionados a peso, dieta ou calorias.

DIÁRIO DE CUIDADO:
Criar área privada para o usuário registrar:

* humor
* percepção da alimentação
* dificuldade
* pequenas conquistas
* notas pessoais

Não utilizar gamificação baseada em peso ou calorias.

Exemplos de registros:
“Hoje consegui fazer uma refeição mesmo estando ansioso.”
“Cozinhei pela primeira vez esta semana.”
“Foi difícil comer hoje.”

COMUNIDADES:
Criar comunidades iniciais:

* Alimentação saudável
* Relação com a comida
* Recuperação
* Receitas e cozinha
* Alimentação econômica
* Alimentação vegetariana
* Saúde mental
* Alimentação infantil
* Alimentação e esporte
* Segurança alimentar

APRENDER:
Criar biblioteca de conteúdos com:

* artigos
* vídeos
* guias
* fontes científicas
* conteúdos profissionais

Categorias:

* Nutrição
* Segurança alimentar
* Relação com a comida
* Transtornos alimentares
* Saúde mental
* Rotulagem
* Cozinha
* Planejamento alimentar
* Alimentação ao longo da vida

Cada conteúdo deve possuir:

* título
* resumo
* autor
* tipo de autor
* data
* categoria
* fontes
* referências
* nível de leitura

Adicionar selo:
“Conteúdo profissional”
ou
“Baseado em fonte confiável”

FONTES:
Criar tabela content_sources.

Uma publicação profissional pode citar:

* Ministério da Saúde
* ANVISA
* OMS
* artigos científicos
* diretrizes clínicas
* conselhos profissionais

Não inventar referências.

SEGURANÇA ALIMENTAR:
Criar uma área educativa com conteúdos sobre:

* higiene
* lavagem das mãos
* contaminação cruzada
* armazenamento
* refrigeração
* congelamento
* validade
* descongelamento
* preparo
* segurança de alimentos
* rotulagem
* alergênicos

RELAÇÃO COM A COMIDA:
Criar conteúdos sobre:

* fome
* saciedade
* alimentação emocional
* ansiedade
* culpa alimentar
* imagem corporal
* comportamento alimentar
* autonomia alimentar

TRANSTORNOS ALIMENTARES:
Criar uma área dedicada e cuidadosamente moderada.

Conteúdos:

* sinais de alerta
* quando procurar ajuda
* recuperação
* apoio familiar
* alimentação e saúde mental
* informações gerais sobre anorexia, bulimia, compulsão alimentar e outros transtornos

A plataforma deve deixar claro que conteúdo educativo não substitui avaliação clínica.

Não fornecer instruções detalhadas de purgação, restrição extrema, jejum perigoso ou outros comportamentos prejudiciais.

PROFISSIONAIS:
Criar buscador de profissionais.

Filtros:

* profissão
* especialidade
* localização
* teleconsulta
* atendimento presencial
* faixa de preço
* disponibilidade
* idiomas
* temas de atuação

PROFISSÕES INICIAIS:

* Nutricionista
* Médico
* Psicólogo
* Psiquiatra
* Enfermeiro
* Outros profissionais regulamentados

Cada profissional deve possuir:

* selo de verificação
* especialidades
* descrição
* modalidade de atendimento
* localização
* agenda
* serviços
* avaliação
* botão “Agendar”

AGENDAMENTO:
Criar:

* serviços
* disponibilidade
* horários
* reserva
* confirmação
* cancelamento
* lembretes
* histórico

Fluxo:
Profissional → Serviço → Horário → Dados necessários → Consentimento → Pagamento → Confirmação

A arquitetura deve permitir integração futura com sistemas de teleatendimento.

CONSULTAS:
Separar completamente consultas e informações clínicas do conteúdo social.

Criar:

* appointments
* consultations
* secure_messages
* consultation_notes
* consents

O profissional só pode acessar informações dos pacientes relacionados a ele.
O usuário só pode acessar os próprios registros.
Acesso administrativo deve ser restrito e auditado.

MENSAGENS:
Criar sistema de mensagens privado entre:

* usuário e profissional
* usuários da comunidade, caso permitido

Permitir configuração para que profissionais escolham se aceitam mensagens.

Não misturar mensagens clínicas com chat público.

MODERAÇÃO:
Criar sistema de:

* denúncia
* bloqueio
* ocultação
* revisão
* escalonamento
* histórico de ações

Criar painel de moderação.

Categorias de denúncia:

* desinformação
* conteúdo perigoso
* transtorno alimentar
* assédio
* discurso de ódio
* conteúdo sexual inadequado
* fraude
* publicidade irregular
* aconselhamento médico indevido
* segurança alimentar perigosa

Criar estados:
pending
reviewing
approved
removed
escalated

IA pode auxiliar a classificação e priorização, mas decisões críticas devem permitir revisão humana.

CONTEÚDO DE ALTO RISCO:
Criar mecanismo para sinalizar e revisar conteúdo contendo:

* incentivo a autoagressão
* incentivo a purgação
* incentivo à restrição extrema
* venda de medicamentos
* prescrição médica por usuários
* conteúdo pró-transtorno alimentar
* instruções potencialmente perigosas

Criar interface específica de revisão.

CENTRO DE AJUDA:
Criar botão:
“Preciso de ajuda”

Opções:

* Quero encontrar um profissional
* Estou preocupado(a) com minha alimentação
* Estou passando por sofrimento emocional
* Preciso de ajuda urgente

Para situações de emergência, mostrar orientação para buscar serviços públicos apropriados.

PRIVACIDADE:
Implementar Privacy by Design.

Dados de saúde devem ser tratados como sensíveis.

Minimizar a coleta.

Nunca armazenar informações clínicas desnecessárias em tabelas sociais.

Separar:
social_profile
clinical_data
professional_verification_data

Criar:

* privacy_preferences
* consent_records
* audit_logs

Permitir:

* alteração de dados
* exclusão de conta
* exportação dos dados
* gerenciamento de consentimentos

SEGURANÇA:

* Supabase RLS em todas as tabelas sensíveis
* autenticação server-side
* autorização server-side
* nenhum secret no frontend
* Edge Functions para lógica sensível
* validação no backend
* sanitização de conteúdo
* proteção contra XSS
* proteção contra abuso de uploads
* rate limiting quando aplicável
* logs de auditoria para ações administrativas
* buckets privados para documentos sensíveis

IA:
Adicionar arquitetura para um assistente de educação alimentar, mas não ativar diagnóstico ou prescrição.

A IA pode:

* explicar conceitos
* resumir artigos
* encontrar conteúdos
* sugerir perguntas para profissionais
* ajudar na navegação
* auxiliar moderação

A IA NÃO pode:

* diagnosticar transtornos
* prescrever medicamentos
* prescrever dietas clínicas individualizadas sem profissional
* recomendar restrições perigosas
* analisar corpo/fotos para determinar saúde
* informar que alguém possui ou não um transtorno alimentar
* substituir profissional de saúde

Todas as chamadas de IA devem ocorrer por Edge Functions, utilizando secrets no backend.

DESIGN SYSTEM:
Visual acolhedor, elegante, moderno e profissional.

Evitar aparência de academia, suplemento ou aplicativo de emagrecimento.

Paleta:

* background: #FAF8F3
* primary: #6F8F7A
* dark: #24463A
* accent: #C98268
* warm accent: #E4B85F
* text: #24312C

Tipografia:

* Manrope ou Inter

Visual:

* bastante espaço em branco
* hierarquia tipográfica clara
* bordas suaves
* cards discretos
* fotos reais de alimentação e convivência
* acessibilidade AA
* foco visível
* contraste adequado

Não usar imagens centradas em corpos perfeitos, balanças, fitas métricas ou antes/depois como elemento visual principal.

HOME PAGE:
Hero:
“Cuidar da alimentação também é cuidar de você.”

Subtexto:
“Aprenda, compartilhe, encontre apoio e conecte-se a profissionais de saúde.”

CTAs:
“Entrar na comunidade”
“Encontrar profissional”

Seções:

* comunidades
* conteúdos recomendados
* profissionais
* segurança alimentar
* saúde mental
* como funciona
* ajuda
* fontes e credibilidade

TELAS:
Criar pelo menos:

1. Landing page
2. Login
3. Cadastro
4. Escolha de interesses
5. Home/feed
6. Criar post
7. Post detalhado
8. Comunidade
9. Lista de comunidades
10. Biblioteca/aprender
11. Artigo
12. Buscar profissionais
13. Perfil profissional
14. Agenda
15. Confirmação de consulta
16. Minhas consultas
17. Mensagens
18. Meu espaço
19. Configurações de privacidade
20. Recovery-friendly mode
21. Centro de ajuda
22. Sistema de denúncias
23. Painel de moderação
24. Painel administrativo
25. Painel profissional

DADOS DE DEMONSTRAÇÃO:
Criar conteúdo fictício claramente identificado como demonstração.
Não usar dados reais de pacientes ou profissionais.
Criar profissionais de demonstração como:

* Dra. Mariana Costa — Nutricionista verificada
* Dr. Rafael Mendes — Médico de demonstração
* Dra. Camila Alves — Psicóloga de demonstração

Não apresentar profissionais fictícios como profissionais reais.

QUALIDADE:
Implementar:

* loading skeletons
* empty states
* error states
* toasts
* confirmações
* formulários acessíveis
* validações
* responsive design
* navegação por teclado
* alt text
* SEO básico
* metadata
* sitemap
* estrutura semântica

IMPORTANTE:
Não construir apenas uma interface estática.

Criar banco Supabase e relacionamentos necessários.
Criar autenticação.
Criar RLS.
Criar APIs/queries.
Criar estados de usuário.
Criar permissões.
Criar estrutura de moderação.
Criar estrutura de agendamento.
Criar estrutura de conteúdo.
Criar estrutura de profissionais.
Criar estrutura de fontes.

Antes de implementar funcionalidades complexas, organize a arquitetura de dados e os papéis de usuário.

Priorize segurança, privacidade, acessibilidade e experiência do usuário.

O resultado deve parecer um produto de health-tech profissional, humano e confiável — não uma rede social genérica e não um aplicativo de dieta.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7894c5f4-e78e-4d92-9c65-d03366fb7f0d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

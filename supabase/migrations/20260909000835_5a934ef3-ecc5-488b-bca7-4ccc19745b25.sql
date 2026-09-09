
-- ROLES
CREATE TYPE public.app_role AS ENUM ('member','verified_professional','moderator','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Pessoa da comunidade',
  username text UNIQUE,
  avatar_url text,
  bio text,
  interests text[] NOT NULL DEFAULT '{}',
  preferred_topics text[] NOT NULL DEFAULT '{}',
  privacy_preferences jsonb NOT NULL DEFAULT '{"profile_visibility":"community","allow_messages":true,"show_activity":false}'::jsonb,
  feed_preferences jsonb NOT NULL DEFAULT '{"muted_topics":[],"default_tab":"for_you"}'::jsonb,
  recovery_friendly_mode boolean NOT NULL DEFAULT false,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('moderator','admin'))
$$;

CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1) || '_' || substr(NEW.id::text,1,4))
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id,'member') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PROFESSIONALS
CREATE TABLE public.professional_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  profession text NOT NULL,
  council text,
  registration_number text,
  state text,
  specialties text[] NOT NULL DEFAULT '{}',
  bio text,
  approach text,
  languages text[] NOT NULL DEFAULT '{}',
  consultation_types text[] NOT NULL DEFAULT '{}',
  location text,
  teleconsultation_enabled boolean NOT NULL DEFAULT true,
  profile_photo text,
  price_min numeric,
  price_max numeric,
  accepts_messages boolean NOT NULL DEFAULT true,
  rating numeric,
  verified_status text NOT NULL DEFAULT 'pending',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_profiles TO authenticated;
GRANT SELECT ON public.professional_profiles TO anon;
GRANT ALL ON public.professional_profiles TO service_role;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prof_read_verified" ON public.professional_profiles FOR SELECT
  USING (verified_status = 'approved' OR user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "prof_insert_own" ON public.professional_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "prof_update_own" ON public.professional_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profession text NOT NULL,
  council text NOT NULL,
  registration_number text NOT NULL,
  state text NOT NULL,
  document_path text,
  status text NOT NULL DEFAULT 'pending',
  reviewer_id uuid,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.verification_requests TO authenticated;
GRANT ALL ON public.verification_requests TO service_role;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vr_read" ON public.verification_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "vr_insert_own" ON public.verification_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "vr_update_staff" ON public.verification_requests FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- COMMUNITIES
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  topic text,
  is_sensitive boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.communities TO anon, authenticated;
GRANT ALL ON public.communities TO service_role;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "communities_read" ON public.communities FOR SELECT USING (true);

CREATE TABLE public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.community_members TO authenticated;
GRANT ALL ON public.community_members TO service_role;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cm_read" ON public.community_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "cm_write_own" ON public.community_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "cm_delete_own" ON public.community_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- POSTS
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  post_type text NOT NULL DEFAULT 'experiencia',
  title text,
  body text NOT NULL,
  image_url text,
  link_url text,
  tags text[] NOT NULL DEFAULT '{}',
  is_anonymous boolean NOT NULL DEFAULT false,
  is_professional_content boolean NOT NULL DEFAULT false,
  sensitive_topics text[] NOT NULL DEFAULT '{}',
  quality_score int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_read" ON public.posts FOR SELECT TO authenticated
  USING (status = 'published' OR author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_read" ON public.comments FOR SELECT TO authenticated
  USING (status = 'published' OR author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'support',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, kind)
);
GRANT SELECT, INSERT, DELETE ON public.reactions TO authenticated;
GRANT ALL ON public.reactions TO service_role;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_read" ON public.reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "reactions_write_own" ON public.reactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "reactions_delete_own" ON public.reactions FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.saved_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_posts TO authenticated;
GRANT ALL ON public.saved_posts TO service_role;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_own" ON public.saved_posts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_read" ON public.follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "follows_write_own" ON public.follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE TO authenticated USING (follower_id = auth.uid());

CREATE TABLE public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, blocked_id)
);
GRANT SELECT, INSERT, DELETE ON public.user_blocks TO authenticated;
GRANT ALL ON public.user_blocks TO service_role;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocks_own" ON public.user_blocks FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- CONTENT LIBRARY
CREATE TABLE public.content_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization text,
  url text,
  source_type text NOT NULL DEFAULT 'orgao_oficial',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_sources TO anon, authenticated;
GRANT ALL ON public.content_sources TO service_role;
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sources_read" ON public.content_sources FOR SELECT USING (true);

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  body text NOT NULL,
  author_name text NOT NULL,
  author_type text NOT NULL DEFAULT 'equipe',
  category text NOT NULL,
  content_type text NOT NULL DEFAULT 'artigo',
  reading_level text NOT NULL DEFAULT 'introdutorio',
  reading_minutes int NOT NULL DEFAULT 5,
  badge text,
  cover_url text,
  sensitive_topics text[] NOT NULL DEFAULT '{}',
  published_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles_read" ON public.articles FOR SELECT USING (true);

CREATE TABLE public.article_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.content_sources(id) ON DELETE CASCADE,
  citation text,
  UNIQUE (article_id, source_id)
);
GRANT SELECT ON public.article_sources TO anon, authenticated;
GRANT ALL ON public.article_sources TO service_role;
ALTER TABLE public.article_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "article_sources_read" ON public.article_sources FOR SELECT USING (true);

-- SCHEDULING
CREATE TABLE public.professional_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes int NOT NULL DEFAULT 50,
  price numeric,
  modality text NOT NULL DEFAULT 'teleconsulta',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_services TO authenticated;
GRANT SELECT ON public.professional_services TO anon;
GRANT ALL ON public.professional_services TO service_role;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_read" ON public.professional_services FOR SELECT USING (true);
CREATE POLICY "services_manage_own" ON public.professional_services FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.professional_profiles p WHERE p.id = professional_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.professional_profiles p WHERE p.id = professional_id AND p.user_id = auth.uid()));

CREATE TABLE public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_booked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_slots TO authenticated;
GRANT SELECT ON public.availability_slots TO anon;
GRANT ALL ON public.availability_slots TO service_role;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "slots_read" ON public.availability_slots FOR SELECT USING (true);
CREATE POLICY "slots_manage_own" ON public.availability_slots FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.professional_profiles p WHERE p.id = professional_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.professional_profiles p WHERE p.id = professional_id AND p.user_id = auth.uid()));

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.professional_services(id) ON DELETE SET NULL,
  slot_id uuid REFERENCES public.availability_slots(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  modality text NOT NULL DEFAULT 'teleconsulta',
  status text NOT NULL DEFAULT 'confirmed',
  reason_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appt_read" ON public.appointments FOR SELECT TO authenticated
  USING (patient_id = auth.uid() OR EXISTS (SELECT 1 FROM public.professional_profiles p WHERE p.id = professional_id AND p.user_id = auth.uid()));
CREATE POLICY "appt_insert_own" ON public.appointments FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "appt_update" ON public.appointments FOR UPDATE TO authenticated
  USING (patient_id = auth.uid() OR EXISTS (SELECT 1 FROM public.professional_profiles p WHERE p.id = professional_id AND p.user_id = auth.uid()))
  WITH CHECK (patient_id = auth.uid() OR EXISTS (SELECT 1 FROM public.professional_profiles p WHERE p.id = professional_id AND p.user_id = auth.uid()));

CREATE TABLE public.consultation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.consultation_notes TO authenticated;
GRANT ALL ON public.consultation_notes TO service_role;
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_prof_only" ON public.consultation_notes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.professional_profiles p WHERE p.id = professional_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.professional_profiles p WHERE p.id = professional_id AND p.user_id = auth.uid()));

CREATE TABLE public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  granted boolean NOT NULL DEFAULT true,
  context text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.consent_records TO authenticated;
GRANT ALL ON public.consent_records TO service_role;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consents_own" ON public.consent_records FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- MESSAGES
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_clinical boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_a, user_b, is_clinical)
);
GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_read_member" ON public.conversations FOR SELECT TO authenticated USING (user_a = auth.uid() OR user_b = auth.uid());
CREATE POLICY "conv_insert_member" ON public.conversations FOR INSERT TO authenticated WITH CHECK (user_a = auth.uid() OR user_b = auth.uid());

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_read_member" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.user_a = auth.uid() OR c.user_b = auth.uid())));
CREATE POLICY "msg_insert_member" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.user_a = auth.uid() OR c.user_b = auth.uid())));

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- CARE JOURNAL
CREATE TABLE public.care_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood text,
  eating_perception text,
  difficulty text,
  small_win text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.care_journal_entries TO authenticated;
GRANT ALL ON public.care_journal_entries TO service_role;
ALTER TABLE public.care_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journal_own" ON public.care_journal_entries FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- MODERATION
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  category text NOT NULL,
  details text,
  risk_level text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pending',
  reviewer_id uuid,
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_read" ON public.reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reports_update_staff" ON public.reports FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.reports(id) ON DELETE SET NULL,
  moderator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.moderation_actions TO authenticated;
GRANT ALL ON public.moderation_actions TO service_role;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modact_staff" ON public.moderation_actions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "modact_insert_staff" ON public.moderation_actions FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND moderator_id = auth.uid());

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_read_admin" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

CREATE TABLE public.feed_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal text NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  topic text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.feed_signals TO authenticated;
GRANT ALL ON public.feed_signals TO service_role;
ALTER TABLE public.feed_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signals_own" ON public.feed_signals FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SEED
INSERT INTO public.communities (slug, name, description, topic, is_sensitive) VALUES
 ('alimentacao-saudavel','Alimentação saudável','Comida de verdade, variedade e rotina possível.','nutricao',false),
 ('relacao-com-a-comida','Relação com a comida','Fome, saciedade, culpa e autonomia alimentar.','relacao',false),
 ('recuperacao','Recuperação','Espaço cuidadoso de apoio à recuperação.','recuperacao',true),
 ('receitas-e-cozinha','Receitas e cozinha','Habilidades culinárias e receitas do dia a dia.','cozinha',false),
 ('alimentacao-economica','Alimentação econômica','Comer bem gastando pouco.','economia',false),
 ('alimentacao-vegetariana','Alimentação vegetariana','Trocas, combinações e dúvidas.','vegetariana',false),
 ('saude-mental','Saúde mental','Ansiedade, sofrimento emocional e apoio.','saude_mental',true),
 ('alimentacao-infantil','Alimentação infantil','Introdução alimentar e rotina das crianças.','infantil',false),
 ('alimentacao-e-esporte','Alimentação e esporte','Energia, rotina e movimento sem culpa.','esporte',false),
 ('seguranca-alimentar','Segurança alimentar','Higiene, armazenamento e preparo seguro.','seguranca',false);

INSERT INTO public.content_sources (name, organization, url, source_type) VALUES
 ('Guia Alimentar para a População Brasileira','Ministério da Saúde','https://www.gov.br/saude','orgao_oficial'),
 ('Boas práticas para serviços de alimentação (RDC 216)','ANVISA','https://www.gov.br/anvisa','regulamentacao'),
 ('Healthy diet fact sheet','Organização Mundial da Saúde','https://www.who.int','orgao_oficial'),
 ('Rotulagem nutricional frontal (RDC 429)','ANVISA','https://www.gov.br/anvisa','regulamentacao'),
 ('Diretrizes sobre transtornos alimentares','Conselhos profissionais de saúde',NULL,'diretriz_clinica');

INSERT INTO public.professional_profiles
 (name, profession, council, registration_number, state, specialties, bio, approach, languages, consultation_types, location, teleconsultation_enabled, price_min, price_max, rating, verified_status, is_demo) VALUES
 ('Dra. Mariana Costa (demonstração)','Nutricionista','CRN','000000-DEMO','SP',ARRAY['Comportamento alimentar','Alimentação vegetariana','Educação alimentar'],'Perfil de demonstração. Atua com educação alimentar e relação saudável com a comida.','Cuidado sem dieta restritiva, foco em autonomia.',ARRAY['Português','Inglês'],ARRAY['teleconsulta','presencial'],'São Paulo, SP',true,120,240,4.9,'approved',true),
 ('Dr. Rafael Mendes (demonstração)','Médico','CRM','000000-DEMO','RJ',ARRAY['Clínica médica','Saúde preventiva'],'Perfil de demonstração. Acompanhamento clínico geral com olhar preventivo.','Escuta ampliada e decisões compartilhadas.',ARRAY['Português'],ARRAY['teleconsulta'],'Rio de Janeiro, RJ',true,200,320,4.8,'approved',true),
 ('Dra. Camila Alves (demonstração)','Psicóloga','CRP','000000-DEMO','MG',ARRAY['Transtornos alimentares','Ansiedade','Imagem corporal'],'Perfil de demonstração. Apoio psicológico com foco em relação com a comida.','Abordagem cognitivo-comportamental e acolhimento.',ARRAY['Português'],ARRAY['teleconsulta','presencial'],'Belo Horizonte, MG',true,150,250,5.0,'approved',true),
 ('Dr. Paulo Ferreira (demonstração)','Psiquiatra','CRM','000000-DEMO','RS',ARRAY['Saúde mental','Transtornos alimentares'],'Perfil de demonstração. Avaliação e acompanhamento em saúde mental.','Cuidado integrado com equipe multiprofissional.',ARRAY['Português','Espanhol'],ARRAY['teleconsulta'],'Porto Alegre, RS',true,250,400,4.7,'approved',true),
 ('Enf. Beatriz Lima (demonstração)','Enfermeira','COREN','000000-DEMO','BA',ARRAY['Educação em saúde','Segurança alimentar'],'Perfil de demonstração. Educação em saúde e orientação em segurança alimentar.','Orientação prática e acessível.',ARRAY['Português'],ARRAY['teleconsulta','presencial'],'Salvador, BA',true,90,150,4.6,'approved',true);

INSERT INTO public.professional_services (professional_id, name, description, duration_minutes, price, modality)
SELECT p.id, 'Primeira consulta', 'Conversa inicial para entender contexto, rotina e objetivos de cuidado.', 60, COALESCE(p.price_min,150), 'teleconsulta' FROM public.professional_profiles p WHERE p.is_demo;
INSERT INTO public.professional_services (professional_id, name, description, duration_minutes, price, modality)
SELECT p.id, 'Retorno / acompanhamento', 'Sessão de acompanhamento para ajustar o cuidado.', 40, COALESCE(p.price_min,100), 'teleconsulta' FROM public.professional_profiles p WHERE p.is_demo;

INSERT INTO public.availability_slots (professional_id, starts_at, ends_at)
SELECT p.id, d.ts, d.ts + interval '1 hour'
FROM public.professional_profiles p
CROSS JOIN LATERAL (
  SELECT (date_trunc('day', now()) + (n || ' days')::interval + (h || ' hours')::interval) AS ts
  FROM generate_series(1,7) n, unnest(ARRAY[9,11,14,16]) h
) d
WHERE p.is_demo;

INSERT INTO public.articles (slug,title,summary,body,author_name,author_type,category,content_type,reading_level,reading_minutes,badge) VALUES
 ('higiene-e-preparo-seguro','Higiene e preparo seguro dos alimentos','Lavagem das mãos, contaminação cruzada e cuidados básicos no preparo diário.','Lavar as mãos com água e sabão antes de manipular alimentos é a medida mais simples e eficaz para reduzir contaminação.\n\nSepare tábuas e utensílios para alimentos crus e prontos para consumo, evitando contaminação cruzada. Higienize frutas, legumes e verduras em água corrente e, quando indicado, faça a desinfecção conforme orientação sanitária.\n\nCozinhe bem carnes, ovos e pescados. Mantenha alimentos quentes bem quentes e frios bem frios: a faixa entre 5°C e 60°C favorece a multiplicação de microrganismos.','Equipe editorial Mesa Comum','equipe','Segurança alimentar','guia','introdutorio',6,'Baseado em fonte confiável'),
 ('armazenamento-refrigeracao-congelamento','Armazenamento, refrigeração e congelamento','Como guardar, congelar e descongelar alimentos com segurança.','Guarde alimentos perecíveis sob refrigeração o quanto antes. Identifique potes com data de preparo e respeite prazos de validade.\n\nCongelamento conserva o alimento, mas não elimina microrganismos. Descongele sob refrigeração, em micro-ondas ou como parte do cozimento — nunca em temperatura ambiente por longos períodos. Não recongele alimentos crus que já foram descongelados.','Equipe editorial Mesa Comum','equipe','Segurança alimentar','guia','introdutorio',5,'Baseado em fonte confiável'),
 ('rotulagem-como-ler','Como ler rótulos sem virar contagem de calorias','Entenda lista de ingredientes, rotulagem frontal e alergênicos.','A lista de ingredientes vem em ordem decrescente de quantidade: os primeiros itens são os que mais aparecem no produto.\n\nA rotulagem nutricional frontal sinaliza alto teor de açúcar adicionado, gorduras saturadas e sódio. Ela é uma informação de apoio à escolha, não uma regra moral sobre o que você pode comer.\n\nAlergênicos precisam estar declarados. Se você convive com alergia alimentar, leia sempre o rótulo, inclusive de produtos já conhecidos, porque fórmulas mudam.','Equipe editorial Mesa Comum','equipe','Rotulagem','artigo','introdutorio',7,'Baseado em fonte confiável'),
 ('fome-e-saciedade','Fome e saciedade: reaprendendo a escutar o corpo','Sinais de fome, saciedade e por que eles se confundem com emoções.','Fome e saciedade são sinais fisiológicos que podem ficar confusos após longos períodos de restrição, rotinas irregulares ou sofrimento emocional.\n\nComer em intervalos regulares ajuda a reduzir episódios de fome extrema. Perceber o corpo sem julgamento é uma habilidade que se treina com tempo e, muitas vezes, com apoio profissional.','Dra. Camila Alves (demonstração)','profissional_verificado','Relação com a comida','artigo','intermediario',8,'Conteúdo profissional'),
 ('culpa-alimentar','Culpa alimentar e alimentação emocional','Comida não é mérito nem punição.','Classificar alimentos como "proibidos" tende a aumentar a culpa e o descontrole percebido. Uma relação mais tranquila com a comida costuma vir da regularidade e da permissão, não da vigilância.\n\nAlimentação emocional é comum e não é um defeito de caráter. Quando ela se torna a principal forma de lidar com emoções difíceis, buscar apoio psicológico faz diferença.','Dra. Camila Alves (demonstração)','profissional_verificado','Relação com a comida','artigo','introdutorio',6,'Conteúdo profissional'),
 ('sinais-de-alerta-transtornos','Sinais de alerta em transtornos alimentares','Quando procurar ajuda profissional.','Alguns sinais merecem atenção: restrição importante de alimentos, medo intenso de ganhar peso, episódios de compulsão, comportamentos compensatórios, isolamento nas refeições e sofrimento persistente com o corpo.\n\nEste conteúdo é educativo e não substitui avaliação clínica. Procurar um profissional de saúde é o caminho seguro — quanto mais cedo, melhor o prognóstico.','Dr. Paulo Ferreira (demonstração)','profissional_verificado','Transtornos alimentares','artigo','intermediario',9,'Conteúdo profissional'),
 ('apoio-familiar-recuperacao','Como apoiar alguém em recuperação','O que ajuda, o que atrapalha.','Evite comentários sobre corpo, peso e quantidade de comida. Ofereça companhia nas refeições, escute sem tentar resolver e ajude a manter o vínculo com a equipe de saúde.\n\nRecuperação não é linear. Recaídas fazem parte do processo e não apagam o que já foi conquistado.','Dra. Camila Alves (demonstração)','profissional_verificado','Transtornos alimentares','guia','introdutorio',6,'Conteúdo profissional'),
 ('planejamento-refeicoes','Planejamento alimentar possível para a semana','Organização realista, sem regras rígidas.','Planejar não é seguir cardápio fechado. Comece escolhendo três preparações-base da semana e organize compras a partir delas.\n\nDeixe alternativas rápidas disponíveis para os dias difíceis. Comer algo simples é melhor do que não comer.','Equipe editorial Mesa Comum','equipe','Planejamento alimentar','guia','introdutorio',5,'Baseado em fonte confiável'),
 ('comer-bem-gastando-pouco','Comer bem gastando pouco','Alimentos regionais, sazonais e aproveitamento integral.','Alimentos da estação costumam custar menos e ter melhor qualidade. Leguminosas, ovos e vegetais regionais são opções acessíveis e nutritivas.\n\nAproveitar talos, folhas e sobras com segurança reduz desperdício e custo, desde que respeitando cuidados de higiene e armazenamento.','Equipe editorial Mesa Comum','equipe','Nutrição','artigo','introdutorio',5,'Baseado em fonte confiável'),
 ('alimentacao-ao-longo-da-vida','Alimentação ao longo da vida','Infância, adolescência, gestação, vida adulta e envelhecimento.','As necessidades mudam ao longo da vida. Na infância, o foco é formar repertório e vínculo positivo com a comida. Na adolescência, atenção ao discurso sobre corpo. No envelhecimento, atenção a proteína, hidratação e prazer nas refeições.\n\nEm todas as fases, orientação individualizada deve vir de profissional de saúde.','Dra. Mariana Costa (demonstração)','profissional_verificado','Alimentação ao longo da vida','artigo','intermediario',7,'Conteúdo profissional');

INSERT INTO public.article_sources (article_id, source_id, citation)
SELECT a.id, s.id, s.name FROM public.articles a JOIN public.content_sources s ON s.organization = 'ANVISA'
WHERE a.category IN ('Segurança alimentar','Rotulagem');
INSERT INTO public.article_sources (article_id, source_id, citation)
SELECT a.id, s.id, s.name FROM public.articles a JOIN public.content_sources s ON s.organization = 'Ministério da Saúde'
WHERE a.category IN ('Nutrição','Planejamento alimentar','Alimentação ao longo da vida');
INSERT INTO public.article_sources (article_id, source_id, citation)
SELECT a.id, s.id, s.name FROM public.articles a JOIN public.content_sources s ON s.source_type = 'diretriz_clinica'
WHERE a.category IN ('Transtornos alimentares','Relação com a comida');

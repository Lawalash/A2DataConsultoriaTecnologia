-- ==========================================
-- A2 DATA - SCHEMA INICIAL
-- ==========================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABELA: site_settings
-- ==========================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_key TEXT UNIQUE NOT NULL DEFAULT 'default',
  brand_name TEXT NOT NULL,
  main_whatsapp TEXT,
  email TEXT,
  instagram TEXT,
  location TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABELA: solutions
-- ==========================================
CREATE TABLE IF NOT EXISTS solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  segment TEXT,
  description TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  monthly_price NUMERIC,
  implementation_price NUMERIC,
  trial_days INTEGER,
  cancellation_text TEXT,
  cover_image_url TEXT,
  hero_image_url TEXT,
  video_thumbnail_url TEXT,
  video_provider TEXT,
  video_url TEXT,
  video_embed_url TEXT,
  has_video BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABELA: cases
-- ==========================================
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  segment TEXT,
  summary TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  cover_image_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  video_thumbnail_url TEXT,
  demo_url TEXT,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABELA: leads
-- ==========================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  solution_interest TEXT,
  message TEXT,
  source_page TEXT,
  status TEXT DEFAULT 'novo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_status_leads CHECK (status IN ('novo', 'em_contato', 'convertido', 'descartado'))
);

-- ==========================================
-- INSERT INICIAL (CONFIGURAÇÕES)
-- ==========================================
INSERT INTO site_settings (site_key, brand_name, main_whatsapp, location, email, instagram)
VALUES (
  'default',
  'A2 Data',
  '(83) 99372-5984',
  'Campina Grande/PB',
  'contato@a2data.com.br',
  '@a2data_'
) ON CONFLICT (site_key) DO NOTHING;

-- ==========================================
-- TRIGGERS DE UPDATE_AT
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_site_settings_modtime ON site_settings;
CREATE TRIGGER update_site_settings_modtime BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_solutions_modtime ON solutions;
CREATE TRIGGER update_solutions_modtime BEFORE UPDATE ON solutions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_cases_modtime ON cases;
CREATE TRIGGER update_cases_modtime BEFORE UPDATE ON cases FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- RLS (ROW LEVEL SECURITY)
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura (SELECT Público)
CREATE POLICY "Permitir leitura publica de configuracoes" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Permitir leitura publica de solucoes ativas" ON solutions FOR SELECT USING (is_published = true);
CREATE POLICY "Permitir leitura publica de cases ativos" ON cases FOR SELECT USING (is_published = true);

-- Políticas de Escrita (INSERT Público no Formulário)
CREATE POLICY "Permitir insercao anonima de leads" ON leads FOR INSERT WITH CHECK (status = 'novo');

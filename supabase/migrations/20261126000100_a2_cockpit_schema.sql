-- ============================================================================
-- Migration 001: A2 Data Cockpit Schema + Master Admin RLS
-- Projeto: A2DATASITE (poosjrfdtcszcmxmptuq)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Controle exclusivo do Admin Master (impede acesso de futuros usuários /cliente)
CREATE TABLE IF NOT EXISTS public.a2_admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.a2_admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_a2_master_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.a2_admin_users a
    JOIN auth.users u ON u.id = auth.uid()
    WHERE a.is_active = true
      AND (
        (a.user_id IS NOT NULL AND a.user_id = u.id)
        OR (
          lower(a.email) = lower(coalesce(u.email, ''))
          AND u.email_confirmed_at IS NOT NULL
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_a2_master_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_a2_master_admin() TO authenticated;

CREATE POLICY "a2_admin_users_master_read"
  ON public.a2_admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_a2_master_admin());

-- Helper genérico de updated_at
CREATE OR REPLACE FUNCTION public.a2_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Projetos monitorados pela A2 Data
CREATE TABLE IF NOT EXISTS public.a2_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  integration_type text NOT NULL CHECK (integration_type IN ('supabase', 'manual_offline')),
  supabase_url text,
  secret_key_ref text,
  health_status text NOT NULL DEFAULT 'unknown'
    CHECK (health_status IN ('online', 'degraded', 'offline', 'manual', 'unknown')),
  last_health_check_at timestamptz,
  last_health_latency_ms integer,
  last_health_error text,
  is_system_blocked boolean NOT NULL DEFAULT false,
  block_reason text,
  total_clients_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Clientes / Contratos por projeto
CREATE TABLE IF NOT EXISTS public.a2_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.a2_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  whatsapp text,
  monthly_fee_cents integer NOT NULL DEFAULT 0 CHECK (monthly_fee_cents >= 0),
  due_day smallint NOT NULL DEFAULT 10 CHECK (due_day BETWEEN 1 AND 31),
  payment_status text NOT NULL DEFAULT 'active'
    CHECK (payment_status IN ('active', 'overdue', 'blocked')),
  is_system_blocked boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_a2_clients_project_id ON public.a2_clients(project_id);
CREATE INDEX IF NOT EXISTS idx_a2_clients_payment_status ON public.a2_clients(payment_status);

-- Trigger para manter a2_projects.total_clients_count sempre atualizado
CREATE OR REPLACE FUNCTION public.a2_sync_project_clients_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    UPDATE public.a2_projects
    SET total_clients_count = (SELECT count(*)::integer FROM public.a2_clients WHERE project_id = NEW.project_id)
    WHERE id = NEW.project_id;
  END IF;

  IF TG_OP IN ('DELETE', 'UPDATE') AND (TG_OP = 'DELETE' OR OLD.project_id IS DISTINCT FROM NEW.project_id) THEN
    UPDATE public.a2_projects
    SET total_clients_count = (SELECT count(*)::integer FROM public.a2_clients WHERE project_id = OLD.project_id)
    WHERE id = OLD.project_id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_a2_clients_count ON public.a2_clients;
CREATE TRIGGER trg_a2_clients_count
  AFTER INSERT OR UPDATE OF project_id OR DELETE ON public.a2_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.a2_sync_project_clients_count();

-- 4. Esteira de Melhorias (Kanban)
CREATE TABLE IF NOT EXISTS public.a2_improvements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.a2_projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'developed', 'delivered')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  position integer NOT NULL DEFAULT 0,
  target_date date,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_a2_improvements_status ON public.a2_improvements(status, position);
CREATE INDEX IF NOT EXISTS idx_a2_improvements_project_id ON public.a2_improvements(project_id);

CREATE OR REPLACE FUNCTION public.a2_sync_improvement_delivered_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN
    NEW.delivered_at = now();
  ELSIF NEW.status <> 'delivered' THEN
    NEW.delivered_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_a2_improvements_delivered_at ON public.a2_improvements;
CREATE TRIGGER trg_a2_improvements_delivered_at
  BEFORE INSERT OR UPDATE OF status ON public.a2_improvements
  FOR EACH ROW
  EXECUTE FUNCTION public.a2_sync_improvement_delivered_at();

-- 5. Logs de cobrança WhatsApp e ações de bloqueio/saúde
CREATE TABLE IF NOT EXISTS public.a2_billing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.a2_projects(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.a2_clients(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN (
    'whatsapp_d3', 'whatsapp_due', 'whatsapp_block', 'whatsapp_custom',
    'system_block', 'system_unblock', 'health_check'
  )),
  channel text NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'supabase_bridge')),
  recipient_whatsapp text,
  message_preview text,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped', 'executed')),
  external_message_id text,
  error_detail text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  executed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_a2_billing_logs_created_at ON public.a2_billing_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_a2_billing_logs_project_id ON public.a2_billing_logs(project_id);

-- 6. Templates do Robô de Cobrança (D-3, Vencimento e Bloqueio)
CREATE TABLE IF NOT EXISTS public.a2_billing_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE CHECK (template_key IN ('d_minus_3', 'due_today', 'block_notice')),
  label text NOT NULL,
  body text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Triggers updated_at
DROP TRIGGER IF EXISTS trg_a2_projects_updated ON public.a2_projects;
CREATE TRIGGER trg_a2_projects_updated
  BEFORE UPDATE ON public.a2_projects
  FOR EACH ROW EXECUTE FUNCTION public.a2_set_updated_at();

DROP TRIGGER IF EXISTS trg_a2_clients_updated ON public.a2_clients;
CREATE TRIGGER trg_a2_clients_updated
  BEFORE UPDATE ON public.a2_clients
  FOR EACH ROW EXECUTE FUNCTION public.a2_set_updated_at();

DROP TRIGGER IF EXISTS trg_a2_improvements_updated ON public.a2_improvements;
CREATE TRIGGER trg_a2_improvements_updated
  BEFORE UPDATE ON public.a2_improvements
  FOR EACH ROW EXECUTE FUNCTION public.a2_set_updated_at();

DROP TRIGGER IF EXISTS trg_a2_billing_templates_updated ON public.a2_billing_templates;
CREATE TRIGGER trg_a2_billing_templates_updated
  BEFORE UPDATE ON public.a2_billing_templates
  FOR EACH ROW EXECUTE FUNCTION public.a2_set_updated_at();

-- RLS estrito ao Admin Master em todas as tabelas
ALTER TABLE public.a2_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a2_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a2_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a2_billing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a2_billing_templates ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.a2_admin_users, public.a2_projects, public.a2_clients,
  public.a2_improvements, public.a2_billing_logs, public.a2_billing_templates FROM PUBLIC, anon;

CREATE POLICY "a2_projects_master_all" ON public.a2_projects
  FOR ALL TO authenticated
  USING (public.is_a2_master_admin())
  WITH CHECK (public.is_a2_master_admin());

CREATE POLICY "a2_clients_master_all" ON public.a2_clients
  FOR ALL TO authenticated
  USING (public.is_a2_master_admin())
  WITH CHECK (public.is_a2_master_admin());

CREATE POLICY "a2_improvements_master_all" ON public.a2_improvements
  FOR ALL TO authenticated
  USING (public.is_a2_master_admin())
  WITH CHECK (public.is_a2_master_admin());

CREATE POLICY "a2_billing_logs_master_all" ON public.a2_billing_logs
  FOR ALL TO authenticated
  USING (public.is_a2_master_admin())
  WITH CHECK (public.is_a2_master_admin());

CREATE POLICY "a2_billing_templates_master_all" ON public.a2_billing_templates
  FOR ALL TO authenticated
  USING (public.is_a2_master_admin())
  WITH CHECK (public.is_a2_master_admin());

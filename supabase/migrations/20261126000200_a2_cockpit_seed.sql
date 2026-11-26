-- ============================================================================
-- Migration 002: A2 Data Cockpit Initial Seed (Idempotente)
-- ============================================================================

-- 1. Admin Master
INSERT INTO public.a2_admin_users (email, is_active)
VALUES ('lvtlawalash1@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

UPDATE public.a2_admin_users a
SET user_id = u.id
FROM auth.users u
WHERE lower(u.email) = lower(a.email)
  AND (a.user_id IS NULL OR a.user_id <> u.id);

-- 2. Projetos monitorados
INSERT INTO public.a2_projects (
  slug, name, category, integration_type, supabase_url, secret_key_ref, health_status
) VALUES
  (
    'qbom-gelo-e-brasa',
    'Q BOM Gelo & Brasa',
    'Food Service / Comandas',
    'supabase',
    'https://kgsyxhogqgkofiadybxm.supabase.co',
    'PROJECT_KEY_QBOM',
    'unknown'
  ),
  (
    'ilpi-a2-datapoint',
    'ILPI (A2 DataPoint)',
    'Saúde / Gestão de ILPI',
    'supabase',
    'https://vnbvqlwqoifruuirsjpk.supabase.co',
    'PROJECT_KEY_ILPI',
    'unknown'
  ),
  (
    'vitoria-nails',
    'Vitória Nails',
    'Beleza / Studio Nails',
    'supabase',
    'https://fdzuzvliomxklfggholo.supabase.co',
    'PROJECT_KEY_VITORIA_NAILS',
    'unknown'
  ),
  (
    'alves-barber-club',
    'Alves Barber Club',
    'Barbearia / Agendamento',
    'supabase',
    'https://huazpxlaxvujqdoikpnb.supabase.co',
    'PROJECT_KEY_ALVES_BARBER',
    'unknown'
  ),
  (
    'rv-acaiteria',
    'RV Açaíteria',
    'Operação Própria / Delivery',
    'supabase',
    'https://iwnuqdgkpmekaameklrb.supabase.co',
    'PROJECT_KEY_RV_ACAITERIA',
    'unknown'
  ),
  (
    'tatuagem',
    'Tatuagem',
    'Estúdio / Gestão',
    'manual_offline',
    NULL,
    NULL,
    'manual'
  ),
  (
    'daniele-offline',
    'Daniele Offline',
    'Varejo / MiniBox Local',
    'manual_offline',
    NULL,
    NULL,
    'manual'
  )
ON CONFLICT (slug) DO NOTHING;

-- 3. Clientes iniciais (idempotente por project_id + lower(name))
INSERT INTO public.a2_clients (
  project_id, name, whatsapp, monthly_fee_cents, due_day, payment_status, is_system_blocked, notes
)
SELECT
  p.id,
  v.client_name,
  NULL,
  v.fee_cents,
  v.due_day,
  'active',
  false,
  v.notes
FROM (
  VALUES
    ('qbom-gelo-e-brasa', 'Léo', 11990, 30, 'Contrato mensal Q BOM Gelo & Brasa'),
    ('ilpi-a2-datapoint', 'Karol (Aconchego dos Avós)', 14990, 10, 'ILPI Aconchego dos Avós — A2 DataPoint'),
    ('alves-barber-club', 'Alves Barber', 8990, 10, 'Barbearia Alves Barber Club'),
    ('tatuagem', 'Studio de Tatuagem', 6990, 10, 'Operação inicialmente em modo manual/offline'),
    ('daniele-offline', 'Super Box Daniele', 8990, 15, 'Sistema local offline A2 MiniBox'),
    ('vitoria-nails', 'Studio Barboza Nails', 0, 10, 'Valor editável no painel'),
    ('rv-acaiteria', 'RV Açaíteria (Operação Própria)', 0, 10, 'Operação própria A2 Data / RV')
) AS v(slug, client_name, fee_cents, due_day, notes)
JOIN public.a2_projects p ON p.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1
  FROM public.a2_clients c
  WHERE c.project_id = p.id
    AND lower(c.name) = lower(v.client_name)
);

-- 4. Templates do Robô de Cobrança WhatsApp
INSERT INTO public.a2_billing_templates (template_key, label, body, is_active)
VALUES
  (
    'd_minus_3',
    'Lembrete Preventivo (D-3)',
    'Olá, {{client_name}}! Tudo bem? Passando para lembrar com antecedência que a mensalidade do sistema {{project_name}} ({{amount}}) vence no dia {{due_day}}. Qualquer dúvida estou à disposição. — A2 Data',
    true
  ),
  (
    'due_today',
    'Aviso de Vencimento (Hoje)',
    'Olá, {{client_name}}! Sua mensalidade do sistema {{project_name}} no valor de {{amount}} vence hoje (dia {{due_day}}). Assim que realizar o pagamento, por favor nos envie o comprovante para mantermos sua licença em dia. — A2 Data',
    true
  ),
  (
    'block_notice',
    'Aviso de Bloqueio / Suspensão',
    'Olá, {{client_name}}. Identificamos pendência na mensalidade do sistema {{project_name}} ({{amount}}, vencimento dia {{due_day}}). Motivo: {{reason}}. O acesso do sistema foi suspenso temporariamente e será restabelecido imediatamente após a regularização. — A2 Data',
    true
  )
ON CONFLICT (template_key) DO NOTHING;

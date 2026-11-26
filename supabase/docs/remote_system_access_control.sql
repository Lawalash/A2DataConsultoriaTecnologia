-- ============================================================================
-- A2 Data — Contrato Remoto de Controle de Acesso (`system_access_control`)
--
-- Aplicar este script nos 5 projetos Supabase clientes quando desejar ativar
-- o monitoramento e bloqueio/desbloqueio remoto pelo Cockpit A2 Data:
--   1. qbomgeloebrasa   (https://kgsyxhogqgkofiadybxm.supabase.co)
--   2. a2-datapoint     (https://vnbvqlwqoifruuirsjpk.supabase.co)
--   3. studiobarbozanails (https://fdzuzvliomxklfggholo.supabase.co)
--   4. alvesbarberclub  (https://huazpxlaxvujqdoikpnb.supabase.co)
--   5. rvacaiteria      (https://iwnuqdgkpmekaameklrb.supabase.co)
--
-- Segurança:
--   - Leitura (SELECT) liberada para anon/authenticated (para o app cliente
--     verificar se o sistema está bloqueado no startup ou via Realtime).
--   - Escrita (INSERT/UPDATE/DELETE) bloqueada para anon/authenticated.
--     Apenas a Edge Function `admin-project-bridge` (via service_role) altera.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_access_control (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  is_blocked boolean NOT NULL DEFAULT false,
  block_reason text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.system_access_control (id, is_blocked, block_reason)
VALUES (true, false, NULL)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.system_access_control ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.system_access_control FROM PUBLIC;
GRANT SELECT ON public.system_access_control TO anon, authenticated;
GRANT ALL ON public.system_access_control TO service_role;

DROP POLICY IF EXISTS "system_access_control_public_read" ON public.system_access_control;
CREATE POLICY "system_access_control_public_read"
  ON public.system_access_control
  FOR SELECT
  TO anon, authenticated
  USING (true);

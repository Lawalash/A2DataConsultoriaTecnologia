-- ============================================================================
-- Migration 004: Bucket público campaign-media + auditoria de campanhas
-- ============================================================================

-- Bucket público (leitura aberta p/ a Evolution API baixar o MP4 pela URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-media',
  'campaign-media',
  true,
  52428800, -- 50 MB
  ARRAY['video/mp4', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Escrita restrita ao Admin Master; leitura pública via URL pública do bucket
DROP POLICY IF EXISTS "campaign_media_public_read" ON storage.objects;
CREATE POLICY "campaign_media_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'campaign-media');

DROP POLICY IF EXISTS "campaign_media_master_insert" ON storage.objects;
CREATE POLICY "campaign_media_master_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'campaign-media' AND public.is_a2_master_admin());

DROP POLICY IF EXISTS "campaign_media_master_update" ON storage.objects;
CREATE POLICY "campaign_media_master_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'campaign-media' AND public.is_a2_master_admin())
  WITH CHECK (bucket_id = 'campaign-media' AND public.is_a2_master_admin());

DROP POLICY IF EXISTS "campaign_media_master_delete" ON storage.objects;
CREATE POLICY "campaign_media_master_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'campaign-media' AND public.is_a2_master_admin());

-- Permitir o novo tipo de ação nos logs de auditoria
ALTER TABLE public.a2_billing_logs
  DROP CONSTRAINT IF EXISTS a2_billing_logs_action_type_check;

ALTER TABLE public.a2_billing_logs
  ADD CONSTRAINT a2_billing_logs_action_type_check CHECK (action_type IN (
    'whatsapp_d3', 'whatsapp_due', 'whatsapp_block', 'whatsapp_custom',
    'whatsapp_campaign',
    'system_block', 'system_unblock', 'health_check'
  ));

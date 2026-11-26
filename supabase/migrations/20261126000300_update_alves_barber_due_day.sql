-- ============================================================================
-- Migration 003: Atualizar dia de vencimento do Alves Barber para dia 25
-- ============================================================================

UPDATE public.a2_clients c
SET due_day = 25
FROM public.a2_projects p
WHERE c.project_id = p.id
  AND p.slug = 'alves-barber-club'
  AND lower(c.name) = lower('Alves Barber');

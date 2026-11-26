import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { AdminAuthError, requireMasterAdmin } from '../_shared/adminAuth.ts';

interface BridgePayload {
  project_id?: string;
  action?: 'health_check' | 'toggle_block';
  blocked?: boolean;
  reason?: string;
  client_id?: string;
}

interface RemoteAccessRow {
  is_blocked: boolean;
  block_reason: string | null;
  updated_at?: string;
}

function normalizeUrl(rawUrl: string | null): string {
  return String(rawUrl ?? '').trim().replace(/\/$/, '');
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 8000,
): Promise<Response> {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Método não permitido.' }, 405);
  }

  try {
    const { adminClient, user } = await requireMasterAdmin(req);
    const body = (await req.json().catch(() => null)) as BridgePayload | null;

    if (!body?.project_id || !body?.action) {
      return jsonResponse(
        { ok: false, error: 'Campos obrigatórios: project_id e action.' },
        400,
      );
    }

    if (body.action !== 'health_check' && body.action !== 'toggle_block') {
      return jsonResponse(
        { ok: false, error: 'Action inválida. Use health_check ou toggle_block.' },
        400,
      );
    }

    const { data: project, error: projErr } = await adminClient
      .from('a2_projects')
      .select('*')
      .eq('id', body.project_id)
      .single();

    if (projErr || !project) {
      return jsonResponse({ ok: false, error: 'Projeto não encontrado.' }, 404);
    }

    // 1. Projetos manuais / offline não possuem ponte Supabase remota
    if (project.integration_type === 'manual_offline') {
      if (body.action === 'health_check') {
        const nowIso = new Date().toISOString();
        const { data: updated } = await adminClient
          .from('a2_projects')
          .update({
            health_status: 'manual',
            last_health_check_at: nowIso,
            last_health_latency_ms: null,
            last_health_error: null,
          })
          .eq('id', project.id)
          .select('*')
          .single();

        await adminClient.from('a2_billing_logs').insert({
          project_id: project.id,
          client_id: body.client_id ?? null,
          action_type: 'health_check',
          channel: 'supabase_bridge',
          status: 'executed',
          message_preview: 'Projeto manual/offline verificado localmente.',
          metadata: { integration_type: 'manual_offline' },
          executed_by: user.id,
        });

        return jsonResponse({
          ok: true,
          project: updated ?? project,
          mode: 'manual_offline',
          message: 'Projeto em modo manual/offline.',
        });
      }

      const nextBlocked = Boolean(body.blocked);
      const nextReason = nextBlocked
        ? (body.reason?.trim() || 'Pendência administrativa / financeira')
        : null;

      const { data: updatedProj } = await adminClient
        .from('a2_projects')
        .update({
          is_system_blocked: nextBlocked,
          block_reason: nextReason,
        })
        .eq('id', project.id)
        .select('*')
        .single();

      if (body.client_id) {
        await adminClient
          .from('a2_clients')
          .update({
            is_system_blocked: nextBlocked,
            payment_status: nextBlocked ? 'blocked' : 'active',
          })
          .eq('id', body.client_id)
          .eq('project_id', project.id);
      } else {
        await adminClient
          .from('a2_clients')
          .update({
            is_system_blocked: nextBlocked,
            payment_status: nextBlocked ? 'blocked' : 'active',
          })
          .eq('project_id', project.id);
      }

      await adminClient.from('a2_billing_logs').insert({
        project_id: project.id,
        client_id: body.client_id ?? null,
        action_type: nextBlocked ? 'system_block' : 'system_unblock',
        channel: 'supabase_bridge',
        status: 'executed',
        message_preview: nextBlocked
          ? `Bloqueio manual registrado. Motivo: ${nextReason}`
          : 'Desbloqueio manual registrado.',
        metadata: { integration_type: 'manual_offline', blocked: nextBlocked },
        executed_by: user.id,
      });

      return jsonResponse({
        ok: true,
        project: updatedProj ?? project,
        mode: 'manual_offline',
        blocked: nextBlocked,
        message: nextBlocked
          ? 'Status marcado como bloqueado (operação manual/offline).'
          : 'Status marcado como desbloqueado (operação manual/offline).',
      });
    }

    // 2. Projetos Supabase remotos
    const remoteUrl = normalizeUrl(project.supabase_url);
    const secretRef = String(project.secret_key_ref ?? '').trim();

    if (!remoteUrl || !secretRef) {
      return jsonResponse(
        {
          ok: false,
          error: 'Projeto sem supabase_url ou secret_key_ref configurado.',
        },
        422,
      );
    }

    const remoteServiceKey = (Deno.env.get(secretRef) ?? '').trim();
    if (!remoteServiceKey) {
      return jsonResponse(
        {
          ok: false,
          code: 'SECRET_MISSING',
          secret_key_ref: secretRef,
          error: `Secret "${secretRef}" não configurada no backend do A2DATASITE. Rode: supabase secrets set ${secretRef}=<SERVICE_ROLE_KEY>`,
        },
        422,
      );
    }

    const remoteHeaders: Record<string, string> = {
      apikey: remoteServiceKey,
      Authorization: `Bearer ${remoteServiceKey}`,
      'Content-Type': 'application/json',
    };

    // 2A. Health Check remoto
    if (body.action === 'health_check') {
      const startedAt = performance.now();
      const nowIso = new Date().toISOString();

      let healthStatus: 'online' | 'degraded' | 'offline' = 'offline';
      let healthError: string | null = null;
      let remoteBlocked = project.is_system_blocked;
      let remoteReason = project.block_reason;

      try {
        const res = await fetchWithTimeout(
          `${remoteUrl}/rest/v1/system_access_control?select=is_blocked,block_reason,updated_at&limit=1`,
          { method: 'GET', headers: remoteHeaders },
          8000,
        );

        const raw = await res.text();
        let parsed: unknown = null;
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch {
          parsed = null;
        }

        if (res.ok && Array.isArray(parsed)) {
          healthStatus = 'online';
          const row = parsed[0] as RemoteAccessRow | undefined;
          if (row) {
            remoteBlocked = Boolean(row.is_blocked);
            remoteReason = row.block_reason ?? null;
          }
        } else {
          const errObj = parsed as { code?: string; message?: string } | null;
          const missingTable =
            res.status === 404 ||
            errObj?.code === '42P01' ||
            errObj?.code === 'PGRST205' ||
            /system_access_control/i.test(errObj?.message ?? '');

          if (missingTable) {
            // Fallback: verificar se o projeto Supabase remoto está vivo via /auth/v1/health
            const authRes = await fetchWithTimeout(
              `${remoteUrl}/auth/v1/health`,
              { method: 'GET', headers: { apikey: remoteServiceKey } },
              6000,
            ).catch(() => null);

            if (authRes?.ok) {
              healthStatus = 'degraded';
              healthError =
                'Supabase online, mas a tabela system_access_control ainda não foi aplicada neste projeto.';
            } else {
              healthStatus = 'offline';
              healthError = `Falha na consulta remota (HTTP ${res.status}).`;
            }
          } else {
            healthStatus = 'offline';
            healthError = errObj?.message || `HTTP ${res.status} ao consultar projeto remoto.`;
          }
        }
      } catch (err) {
        healthStatus = 'offline';
        healthError =
          err instanceof Error ? err.message : 'Timeout ou erro de rede ao conectar no Supabase remoto.';
      }

      const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));

      const { data: updatedProj } = await adminClient
        .from('a2_projects')
        .update({
          health_status: healthStatus,
          last_health_check_at: nowIso,
          last_health_latency_ms: latencyMs,
          last_health_error: healthError,
          is_system_blocked: remoteBlocked,
          block_reason: remoteReason,
        })
        .eq('id', project.id)
        .select('*')
        .single();

      await adminClient.from('a2_billing_logs').insert({
        project_id: project.id,
        client_id: body.client_id ?? null,
        action_type: 'health_check',
        channel: 'supabase_bridge',
        status: healthStatus === 'offline' ? 'failed' : 'executed',
        message_preview: `Health check: ${healthStatus} (${latencyMs}ms)`,
        error_detail: healthError,
        metadata: { health_status: healthStatus, latency_ms: latencyMs },
        executed_by: user.id,
      });

      return jsonResponse({
        ok: healthStatus !== 'offline',
        project: updatedProj ?? project,
        health_status: healthStatus,
        latency_ms: latencyMs,
        error: healthError,
      });
    }

    // 2B. Toggle Block remoto (PATCH/UPSERT em system_access_control)
    const nextBlocked = Boolean(body.blocked);
    const nextReason = nextBlocked
      ? (body.reason?.trim() || 'Pendência financeira junto à A2 Data')
      : null;

    const upsertRes = await fetchWithTimeout(
      `${remoteUrl}/rest/v1/system_access_control?on_conflict=id`,
      {
        method: 'POST',
        headers: {
          ...remoteHeaders,
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          id: true,
          is_blocked: nextBlocked,
          block_reason: nextReason,
          updated_at: new Date().toISOString(),
        }),
      },
      9000,
    );

    const upsertText = await upsertRes.text();
    let upsertJson: unknown = null;
    try {
      upsertJson = upsertText ? JSON.parse(upsertText) : null;
    } catch {
      upsertJson = null;
    }

    if (!upsertRes.ok) {
      const errObj = upsertJson as { code?: string; message?: string } | null;
      const errMsg =
        errObj?.code === '42P01' || errObj?.code === 'PGRST205' || upsertRes.status === 404
          ? 'A tabela system_access_control não existe no Supabase deste cliente. Aplique supabase/docs/remote_system_access_control.sql primeiro.'
          : errObj?.message || `Falha remota HTTP ${upsertRes.status}`;

      await adminClient.from('a2_billing_logs').insert({
        project_id: project.id,
        client_id: body.client_id ?? null,
        action_type: nextBlocked ? 'system_block' : 'system_unblock',
        channel: 'supabase_bridge',
        status: 'failed',
        message_preview: `Tentativa de ${nextBlocked ? 'bloqueio' : 'desbloqueio'} remoto falhou.`,
        error_detail: errMsg,
        executed_by: user.id,
      });

      return jsonResponse({ ok: false, error: errMsg }, 422);
    }

    const { data: updatedProj } = await adminClient
      .from('a2_projects')
      .update({
        health_status: 'online',
        last_health_check_at: new Date().toISOString(),
        last_health_error: null,
        is_system_blocked: nextBlocked,
        block_reason: nextReason,
      })
      .eq('id', project.id)
      .select('*')
      .single();

    const clientUpdate = {
      is_system_blocked: nextBlocked,
      payment_status: nextBlocked ? 'blocked' : 'active',
    };

    if (body.client_id) {
      await adminClient
        .from('a2_clients')
        .update(clientUpdate)
        .eq('id', body.client_id)
        .eq('project_id', project.id);
    } else {
      await adminClient
        .from('a2_clients')
        .update(clientUpdate)
        .eq('project_id', project.id);
    }

    await adminClient.from('a2_billing_logs').insert({
      project_id: project.id,
      client_id: body.client_id ?? null,
      action_type: nextBlocked ? 'system_block' : 'system_unblock',
      channel: 'supabase_bridge',
      status: 'executed',
      message_preview: nextBlocked
        ? `Sistema bloqueado remotamente. Motivo: ${nextReason}`
        : 'Sistema desbloqueado remotamente.',
      metadata: { blocked: nextBlocked, reason: nextReason },
      executed_by: user.id,
    });

    return jsonResponse({
      ok: true,
      project: updatedProj ?? project,
      blocked: nextBlocked,
      reason: nextReason,
      message: nextBlocked
        ? 'Sistema bloqueado com sucesso no Supabase remoto.'
        : 'Sistema desbloqueado com sucesso no Supabase remoto.',
    });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return jsonResponse({ ok: false, error: err.message }, err.status);
    }
    return jsonResponse(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Erro interno em admin-project-bridge.',
      },
      500,
    );
  }
});

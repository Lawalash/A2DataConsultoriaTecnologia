import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { AdminAuthError, requireMasterAdmin } from '../_shared/adminAuth.ts';
import { checkEvolutionInstance, sendEvolutionText } from '../_shared/evolution.ts';

type TemplateKey = 'd_minus_3' | 'due_today' | 'block_notice' | 'custom';

interface NotifyPayload {
  action?: 'send' | 'check_instance';
  project_id?: string;
  client_id?: string;
  template_key?: TemplateKey;
  custom_message?: string;
  reason?: string;
}

function formatBRLFromCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format((cents || 0) / 100);
}

function mapTemplateToActionType(key: TemplateKey) {
  switch (key) {
    case 'd_minus_3':
      return 'whatsapp_d3';
    case 'due_today':
      return 'whatsapp_due';
    case 'block_notice':
      return 'whatsapp_block';
    default:
      return 'whatsapp_custom';
  }
}

function renderMessage(
  templateBody: string,
  vars: {
    client_name: string;
    project_name: string;
    amount: string;
    due_day: string;
    reason: string;
  },
): string {
  return templateBody
    .replaceAll('{{client_name}}', vars.client_name)
    .replaceAll('{{project_name}}', vars.project_name)
    .replaceAll('{{amount}}', vars.amount)
    .replaceAll('{{due_day}}', vars.due_day)
    .replaceAll('{{reason}}', vars.reason);
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
    const body = (await req.json().catch(() => null)) as NotifyPayload | null;

    if (body?.action === 'check_instance') {
      const status = await checkEvolutionInstance();
      return jsonResponse(status, status.ok ? 200 : 200);
    }

    if (!body?.client_id || !body?.project_id) {
      return jsonResponse(
        { ok: false, error: 'Campos obrigatórios: project_id e client_id.' },
        400,
      );
    }

    const templateKey: TemplateKey = body.template_key ?? 'due_today';

    const [{ data: client, error: clientErr }, { data: project, error: projErr }] =
      await Promise.all([
        adminClient.from('a2_clients').select('*').eq('id', body.client_id).single(),
        adminClient.from('a2_projects').select('*').eq('id', body.project_id).single(),
      ]);

    if (clientErr || !client) {
      return jsonResponse({ ok: false, error: 'Cliente não encontrado.' }, 404);
    }
    if (projErr || !project) {
      return jsonResponse({ ok: false, error: 'Projeto não encontrado.' }, 404);
    }

    let messageText = (body.custom_message ?? '').trim();

    if (templateKey !== 'custom' && !messageText) {
      const { data: tpl, error: tplErr } = await adminClient
        .from('a2_billing_templates')
        .select('*')
        .eq('template_key', templateKey)
        .single();

      if (tplErr || !tpl) {
        return jsonResponse(
          { ok: false, error: `Template "${templateKey}" não encontrado.` },
          404,
        );
      }
      messageText = tpl.body;
    }

    if (!messageText) {
      return jsonResponse({ ok: false, error: 'Mensagem de cobrança vazia.' }, 400);
    }

    const finalMessage = renderMessage(messageText, {
      client_name: client.name,
      project_name: project.name,
      amount: formatBRLFromCents(client.monthly_fee_cents),
      due_day: String(client.due_day ?? 10),
      reason: (body.reason || project.block_reason || 'Mensalidade em aberto').trim(),
    });

    const actionType = mapTemplateToActionType(templateKey);
    const phone = (client.whatsapp ?? '').trim();

    if (!phone) {
      await adminClient.from('a2_billing_logs').insert({
        project_id: project.id,
        client_id: client.id,
        action_type: actionType,
        channel: 'whatsapp',
        recipient_whatsapp: null,
        message_preview: finalMessage.slice(0, 500),
        status: 'skipped',
        error_detail: 'Cliente sem número de WhatsApp cadastrado.',
        executed_by: user.id,
      });

      return jsonResponse(
        { ok: false, error: 'Cliente não possui WhatsApp cadastrado.' },
        422,
      );
    }

    const sendRes = await sendEvolutionText({
      to: phone,
      text: finalMessage,
      linkPreview: false,
    });

    const logStatus = sendRes.ok ? 'sent' : sendRes.skipped ? 'skipped' : 'failed';

    await adminClient.from('a2_billing_logs').insert({
      project_id: project.id,
      client_id: client.id,
      action_type: actionType,
      channel: 'whatsapp',
      recipient_whatsapp: phone,
      message_preview: finalMessage.slice(0, 500),
      status: logStatus,
      external_message_id: sendRes.messageId ?? null,
      error_detail: sendRes.error ?? null,
      metadata: { template_key: templateKey },
      executed_by: user.id,
    });

    if (!sendRes.ok) {
      return jsonResponse(
        {
          ok: false,
          status: logStatus,
          error: sendRes.error || 'Falha ao enviar mensagem via Evolution API.',
        },
        sendRes.skipped ? 422 : 502,
      );
    }

    return jsonResponse({
      ok: true,
      status: 'sent',
      messageId: sendRes.messageId ?? null,
      preview: finalMessage,
    });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return jsonResponse({ ok: false, error: err.message }, err.status);
    }
    return jsonResponse(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Erro interno em admin-billing-notify.',
      },
      500,
    );
  }
});

import { supabase } from '../lib/supabaseClient';

export const formatBRL = (cents = 0) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format((Number(cents) || 0) / 100);

export const centsToBRLInput = (cents = 0) =>
  ((Number(cents) || 0) / 100).toFixed(2).replace('.', ',');

export const parseBRLToCents = (rawValue) => {
  const str = String(rawValue ?? '').trim();
  if (!str) return 0;
  const cleaned = str.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num * 100);
};

export const formatDateTimeBR = (iso) => {
  if (!iso) return 'Nunca';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

export const formatDateBR = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const normalized = dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr;
    return new Date(normalized).toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
};

export const renderTemplatePreview = (body, { client, project, reason } = {}) => {
  if (!body) return '';
  return body
    .replaceAll('{{client_name}}', client?.name || 'Cliente')
    .replaceAll('{{project_name}}', project?.name || 'Sistema A2 Data')
    .replaceAll('{{amount}}', formatBRL(client?.monthly_fee_cents || 0))
    .replaceAll('{{due_day}}', String(client?.due_day ?? 10))
    .replaceAll('{{reason}}', reason || project?.block_reason || 'Mensalidade em aberto');
};

export const isMissingSchemaError = (err) => {
  if (!err) return false;
  const msg = String(err.message || err.details || '');
  return (
    err.code === '42P01' ||
    err.code === 'PGRST205' ||
    err.status === 404 ||
    /does not exist|schema cache|could not find the table/i.test(msg)
  );
};

async function extractFunctionError(error) {
  if (!error) return 'Erro desconhecido na Edge Function.';
  if (error.context && typeof error.context.json === 'function') {
    try {
      const payload = await error.context.json();
      if (payload?.error) return payload.error;
    } catch {
      // fallback below
    }
  }
  return error.message || 'Falha ao chamar Edge Function.';
}

async function invokeEdgeFunction(name, body) {
  if (!supabase) throw new Error('Supabase não configurado neste ambiente.');
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    const msg = await extractFunctionError(error);
    throw new Error(msg);
  }
  if (data && data.ok === false && data.error) {
    throw new Error(data.error);
  }
  return data;
}

export const cockpitService = {
  async checkIsMasterAdmin() {
    if (!supabase) return { allowed: false, missingSchema: false };
    const { data, error } = await supabase.rpc('is_a2_master_admin');
    if (error) {
      if (isMissingSchemaError(error) || error.code === '42883' || error.code === 'PGRST202') {
        return { allowed: false, missingSchema: true, error };
      }
      return { allowed: false, missingSchema: false, error };
    }
    return { allowed: Boolean(data), missingSchema: false };
  },

  async fetchCockpitSnapshot() {
    if (!supabase) throw new Error('Supabase não configurado.');
    const [projRes, cliRes, impRes, logRes, tplRes] = await Promise.all([
      supabase.from('a2_projects').select('*').order('created_at', { ascending: true }),
      supabase.from('a2_clients').select('*').order('created_at', { ascending: true }),
      supabase
        .from('a2_improvements')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('a2_billing_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(120),
      supabase.from('a2_billing_templates').select('*').order('template_key', { ascending: true }),
    ]);

    const firstErr = projRes.error || cliRes.error || impRes.error || logRes.error || tplRes.error;
    if (firstErr) throw firstErr;

    return {
      projects: projRes.data ?? [],
      clients: cliRes.data ?? [],
      improvements: impRes.data ?? [],
      logs: logRes.data ?? [],
      templates: tplRes.data ?? [],
    };
  },

  // Projects CRUD
  async saveProject(project, id = null) {
    if (!supabase) throw new Error('Supabase não configurado.');
    const payload = {
      slug: project.slug.trim().toLowerCase(),
      name: project.name.trim(),
      category: project.category.trim(),
      integration_type: project.integration_type,
      supabase_url: project.integration_type === 'supabase' ? project.supabase_url?.trim() || null : null,
      secret_key_ref: project.integration_type === 'supabase' ? project.secret_key_ref?.trim() || null : null,
    };
    if (!id) {
      payload.health_status = project.integration_type === 'manual_offline' ? 'manual' : 'unknown';
    }
    const query = id
      ? supabase.from('a2_projects').update(payload).eq('id', id).select('*').single()
      : supabase.from('a2_projects').insert([payload]).select('*').single();
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async deleteProject(id) {
    if (!supabase) throw new Error('Supabase não configurado.');
    const { error } = await supabase.from('a2_projects').delete().eq('id', id);
    if (error) throw error;
  },

  // Clients CRUD
  async saveClient(client, id = null) {
    if (!supabase) throw new Error('Supabase não configurado.');
    const payload = {
      project_id: client.project_id,
      name: client.name.trim(),
      whatsapp: client.whatsapp?.trim() || null,
      monthly_fee_cents: Number(client.monthly_fee_cents) || 0,
      due_day: Math.min(31, Math.max(1, Number(client.due_day) || 10)),
      payment_status: client.payment_status || 'active',
      is_system_blocked: Boolean(client.is_system_blocked),
      notes: client.notes?.trim() || null,
    };
    const query = id
      ? supabase.from('a2_clients').update(payload).eq('id', id).select('*').single()
      : supabase.from('a2_clients').insert([payload]).select('*').single();
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateClientStatus(id, paymentStatus) {
    if (!supabase) throw new Error('Supabase não configurado.');
    const { data, error } = await supabase
      .from('a2_clients')
      .update({
        payment_status: paymentStatus,
        is_system_blocked: paymentStatus === 'blocked',
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteClient(id) {
    if (!supabase) throw new Error('Supabase não configurado.');
    const { error } = await supabase.from('a2_clients').delete().eq('id', id);
    if (error) throw error;
  },

  // Improvements Kanban CRUD
  async saveImprovement(item, id = null) {
    if (!supabase) throw new Error('Supabase não configurado.');
    const payload = {
      project_id: item.project_id || null,
      title: item.title.trim(),
      description: item.description?.trim() || '',
      status: item.status || 'pending',
      priority: item.priority || 'medium',
      target_date: item.target_date || null,
    };
    if (item.delivered_at !== undefined) {
      payload.delivered_at = item.delivered_at || null;
    }
    const query = id
      ? supabase.from('a2_improvements').update(payload).eq('id', id).select('*').single()
      : supabase.from('a2_improvements').insert([payload]).select('*').single();
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateImprovementStatus(id, status) {
    if (!supabase) throw new Error('Supabase não configurado.');
    const { data, error } = await supabase
      .from('a2_improvements')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteImprovement(id) {
    if (!supabase) throw new Error('Supabase não configurado.');
    const { error } = await supabase.from('a2_improvements').delete().eq('id', id);
    if (error) throw error;
  },

  // Billing templates
  async saveBillingTemplate(id, updates) {
    if (!supabase) throw new Error('Supabase não configurado.');
    const { data, error } = await supabase
      .from('a2_billing_templates')
      .update({
        label: updates.label,
        body: updates.body,
        is_active: updates.is_active,
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  // Edge Functions
  checkProjectHealth(projectId) {
    return invokeEdgeFunction('admin-project-bridge', {
      project_id: projectId,
      action: 'health_check',
    });
  },

  toggleProjectBlock({ projectId, blocked, reason, clientId }) {
    return invokeEdgeFunction('admin-project-bridge', {
      project_id: projectId,
      action: 'toggle_block',
      blocked: Boolean(blocked),
      reason: reason || '',
      ...(clientId ? { client_id: clientId } : {}),
    });
  },

  sendWhatsAppBilling({ projectId, clientId, templateKey, customMessage, reason }) {
    return invokeEdgeFunction('admin-billing-notify', {
      action: 'send',
      project_id: projectId,
      client_id: clientId,
      template_key: templateKey,
      ...(customMessage ? { custom_message: customMessage } : {}),
      ...(reason ? { reason } : {}),
    });
  },

  checkEvolutionStatus() {
    return invokeEdgeFunction('admin-billing-notify', {
      action: 'check_instance',
    });
  },
};

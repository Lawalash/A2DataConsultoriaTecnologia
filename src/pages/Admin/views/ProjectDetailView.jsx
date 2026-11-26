import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Database,
  Edit3,
  HardDrive,
  Lock,
  MessageCircle,
  Plus,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  Wifi,
  X,
} from 'lucide-react';
import {
  centsToBRLInput,
  cockpitService,
  formatBRL,
  formatDateTimeBR,
  parseBRLToCents,
  renderTemplatePreview,
} from '../../../services/cockpitService';

const PAYMENT_LABELS = {
  active: { label: 'Em dia', tone: 'success' },
  overdue: { label: 'Em atraso', tone: 'warning' },
  blocked: { label: 'Bloqueado', tone: 'danger' },
};

const HEALTH_META = {
  online: { label: 'Online', tone: 'success' },
  degraded: { label: 'Sem tabela system_access_control', tone: 'warning' },
  offline: { label: 'Offline / Erro', tone: 'danger' },
  manual: { label: 'Operação Manual / Offline', tone: 'neutral' },
  unknown: { label: 'Ainda não testado', tone: 'muted' },
};

const ProjectDetailView = ({
  projects,
  selectedProjectId,
  clients,
  logs,
  templates,
  onSelectProject,
  onBackDashboard,
  onRefresh,
  onNotify,
}) => {
  const project = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || projects[0] || null,
    [projects, selectedProjectId],
  );

  const [testingHealth, setTestingHealth] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('Mensalidade vencida — aguardando regularização');
  const [togglingBlock, setTogglingBlock] = useState(false);

  // Client Modal
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState({
    name: '',
    whatsapp: '',
    monthly_fee_brl: '0,00',
    due_day: 10,
    payment_status: 'active',
    notes: '',
  });
  const [savingClient, setSavingClient] = useState(false);

  // Project Edit Modal
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState(null);
  const [savingProject, setSavingProject] = useState(false);

  // WhatsApp Billing Modal
  const [notifyClient, setNotifyClient] = useState(null);
  const [notifyTemplateKey, setNotifyTemplateKey] = useState('due_today');
  const [customMessage, setCustomMessage] = useState('');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  if (!project) {
    return (
      <div className="cockpit__view">
        <div className="cockpit-empty">
          <Database size={36} />
          <h3>Nenhum projeto cadastrado</h3>
          <p>Volte ao Dashboard Executivo para cadastrar o primeiro projeto.</p>
          <button type="button" className="cockpit-btn cockpit-btn--primary" onClick={onBackDashboard}>
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const projectClients = clients.filter((c) => c.project_id === project.id);
  const projectLogs = logs.filter((l) => l.project_id === project.id).slice(0, 8);
  const health = HEALTH_META[project.health_status] || HEALTH_META.unknown;
  const isSupabase = project.integration_type === 'supabase';
  const totalProjectMrr = projectClients.reduce((acc, c) => acc + (c.monthly_fee_cents || 0), 0);

  const handleTestConnection = async () => {
    setTestingHealth(true);
    try {
      const res = await cockpitService.checkProjectHealth(project.id);
      await onRefresh();
      if (res.health_status === 'online') {
        onNotify(`Conexão OK (${res.latency_ms}ms) em ${project.name}.`, 'success');
      } else if (res.health_status === 'degraded') {
        onNotify(res.error || 'Supabase ativo, mas falta criar system_access_control.', 'warning');
      } else if (res.mode === 'manual_offline') {
        onNotify('Projeto configurado em modo Manual / Offline.', 'info');
      } else {
        onNotify(res.error || 'Projeto offline ou inacessível.', 'error');
      }
    } catch (err) {
      await onRefresh();
      onNotify(err.message || 'Erro ao testar conexão.', 'error');
    } finally {
      setTestingHealth(false);
    }
  };

  const handleConfirmToggleBlock = async (e) => {
    e.preventDefault();
    setTogglingBlock(true);
    try {
      const nextBlocked = !project.is_system_blocked;
      const res = await cockpitService.toggleProjectBlock({
        projectId: project.id,
        blocked: nextBlocked,
        reason: nextBlocked ? blockReason : '',
      });
      await onRefresh();
      setBlockModalOpen(false);
      onNotify(
        res.message || (nextBlocked ? 'Sistema bloqueado.' : 'Sistema desbloqueado.'),
        nextBlocked ? 'warning' : 'success',
      );
    } catch (err) {
      onNotify(err.message || 'Erro ao executar comando de bloqueio.', 'error');
    } finally {
      setTogglingBlock(false);
    }
  };

  const openClientCreate = () => {
    setEditingClient(null);
    setClientForm({
      name: '',
      whatsapp: '',
      monthly_fee_brl: '0,00',
      due_day: 10,
      payment_status: 'active',
      notes: '',
    });
    setClientModalOpen(true);
  };

  const openClientEdit = (cli) => {
    setEditingClient(cli);
    setClientForm({
      name: cli.name || '',
      whatsapp: cli.whatsapp || '',
      monthly_fee_brl: centsToBRLInput(cli.monthly_fee_cents),
      due_day: cli.due_day || 10,
      payment_status: cli.payment_status || 'active',
      notes: cli.notes || '',
    });
    setClientModalOpen(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    setSavingClient(true);
    try {
      await cockpitService.saveClient(
        {
          project_id: project.id,
          name: clientForm.name,
          whatsapp: clientForm.whatsapp,
          monthly_fee_cents: parseBRLToCents(clientForm.monthly_fee_brl),
          due_day: clientForm.due_day,
          payment_status: clientForm.payment_status,
          is_system_blocked: clientForm.payment_status === 'blocked',
          notes: clientForm.notes,
        },
        editingClient?.id || null,
      );
      setClientModalOpen(false);
      await onRefresh();
      onNotify(
        editingClient ? 'Cliente atualizado com sucesso.' : 'Cliente vinculado ao projeto.',
        'success',
      );
    } catch (err) {
      onNotify(err.message || 'Erro ao salvar cliente.', 'error');
    } finally {
      setSavingClient(false);
    }
  };

  const handleDeleteClient = async (cli) => {
    if (!window.confirm(`Remover "${cli.name}" de ${project.name}?`)) return;
    try {
      await cockpitService.deleteClient(cli.id);
      await onRefresh();
      onNotify('Cliente removido.', 'info');
    } catch (err) {
      onNotify(err.message || 'Erro ao remover cliente.', 'error');
    }
  };

  const handleQuickPaymentStatus = async (cli, nextStatus) => {
    try {
      await cockpitService.updateClientStatus(cli.id, nextStatus);
      await onRefresh();
      onNotify(`Status financeiro de ${cli.name} atualizado.`, 'success');
    } catch (err) {
      onNotify(err.message || 'Erro ao atualizar status.', 'error');
    }
  };

  const openEditProject = () => {
    setProjectForm({
      name: project.name,
      slug: project.slug,
      category: project.category,
      integration_type: project.integration_type,
      supabase_url: project.supabase_url || '',
      secret_key_ref: project.secret_key_ref || '',
    });
    setEditProjectOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      await cockpitService.saveProject(projectForm, project.id);
      setEditProjectOpen(false);
      await onRefresh();
      onNotify('Configurações do projeto atualizadas.', 'success');
    } catch (err) {
      onNotify(err.message || 'Erro ao atualizar projeto.', 'error');
    } finally {
      setSavingProject(false);
    }
  };

  const openWhatsAppModal = (cli) => {
    setNotifyClient(cli);
    setNotifyTemplateKey(project.is_system_blocked ? 'block_notice' : 'due_today');
    setCustomMessage('');
  };

  const activeTemplateObj = templates.find((t) => t.template_key === notifyTemplateKey);
  const previewMessage = notifyClient
    ? notifyTemplateKey === 'custom'
      ? renderTemplatePreview(customMessage, { client: notifyClient, project, reason: project.block_reason })
      : renderTemplatePreview(activeTemplateObj?.body || '', {
          client: notifyClient,
          project,
          reason: project.block_reason,
        })
    : '';

  const handleSendWhatsApp = async (e) => {
    e.preventDefault();
    if (!notifyClient) return;
    setSendingWhatsApp(true);
    try {
      await cockpitService.sendWhatsAppBilling({
        projectId: project.id,
        clientId: notifyClient.id,
        templateKey: notifyTemplateKey,
        customMessage: notifyTemplateKey === 'custom' ? customMessage : undefined,
        reason: project.block_reason || undefined,
      });
      await onRefresh();
      setNotifyClient(null);
      onNotify(`Cobrança WhatsApp enviada para ${notifyClient.name}.`, 'success');
    } catch (err) {
      await onRefresh();
      onNotify(err.message || 'Falha ao enviar WhatsApp.', 'error');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  return (
    <div className="cockpit__view animate-in">
      <div className="cockpit__topbar-nav">
        <button type="button" className="cockpit-btn cockpit-btn--ghost cockpit-btn--sm" onClick={onBackDashboard}>
          <ArrowLeft size={15} />
          <span>Voltar ao Dashboard</span>
        </button>

        <div className="cockpit__project-switcher">
          <label>Projeto ativo:</label>
          <select value={project.id} onChange={(e) => onSelectProject(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Header do Projeto */}
      <div className="cockpit-detail-hero">
        <div className="cockpit-detail-hero__info">
          <div className="cockpit-project-card__badges">
            <span className={`cockpit-pill cockpit-pill--${health.tone}`}>
              <span className="cockpit-dot" />
              {health.label}
            </span>
            <span className="cockpit-pill cockpit-pill--subtle">
              {isSupabase ? <Database size={12} /> : <HardDrive size={12} />}
              {isSupabase ? 'Supabase Bridge' : 'Manual / Offline'}
            </span>
            {project.is_system_blocked && (
              <span className="cockpit-pill cockpit-pill--danger">
                <Lock size={12} />
                Sistema Bloqueado
              </span>
            )}
          </div>
          <h1 className="cockpit__title">{project.name}</h1>
          <p className="cockpit__subtitle">
            {project.category} · MRR do projeto: <strong>{formatBRL(totalProjectMrr)}</strong>
          </p>
        </div>

        <div className="cockpit-detail-hero__actions">
          <button type="button" className="cockpit-btn cockpit-btn--ghost" onClick={openEditProject}>
            <Edit3 size={15} />
            <span>Editar Projeto</span>
          </button>
          <button
            type="button"
            className="cockpit-btn cockpit-btn--ghost"
            onClick={handleTestConnection}
            disabled={testingHealth}
          >
            <Wifi size={15} className={testingHealth ? 'spin' : ''} />
            <span>{testingHealth ? 'Testando...' : 'Testar Conexão'}</span>
          </button>
          <button
            type="button"
            className={`cockpit-btn ${
              project.is_system_blocked ? 'cockpit-btn--success' : 'cockpit-btn--danger'
            }`}
            onClick={() => {
              setBlockReason(project.block_reason || 'Mensalidade vencida — aguardando regularização');
              setBlockModalOpen(true);
            }}
          >
            {project.is_system_blocked ? <Unlock size={15} /> : <Lock size={15} />}
            <span>{project.is_system_blocked ? 'Desbloquear Sistema' : 'Bloquear Sistema'}</span>
          </button>
        </div>
      </div>

      {/* Telemetria de Conexão */}
      <div className="cockpit-telemetry-grid">
        <div className="cockpit-panel">
          <span className="cockpit-panel__label">Endpoint Supabase</span>
          <strong className="cockpit-panel__value cockpit-mono">
            {project.supabase_url || 'Operação local / sem nuvem'}
          </strong>
        </div>
        <div className="cockpit-panel">
          <span className="cockpit-panel__label">Secret de Integração (Backend)</span>
          <strong className="cockpit-panel__value cockpit-mono">
            {project.secret_key_ref || 'Não requerida'}
          </strong>
        </div>
        <div className="cockpit-panel">
          <span className="cockpit-panel__label">Última Verificação / Latência</span>
          <strong className="cockpit-panel__value">
            {formatDateTimeBR(project.last_health_check_at)}
            {project.last_health_latency_ms ? ` (${project.last_health_latency_ms}ms)` : ''}
          </strong>
        </div>
      </div>

      {project.last_health_error && (
        <div className="cockpit-banner cockpit-banner--warning">
          <ShieldAlert size={18} />
          <div>
            <strong>Diagnóstico da última checagem:</strong> {project.last_health_error}
          </div>
        </div>
      )}

      {/* Lista de Clientes Vinculados */}
      <section className="cockpit__section">
        <div className="cockpit__section-head">
          <h2>Clientes & Mensalidades ({projectClients.length})</h2>
          <button type="button" className="cockpit-btn cockpit-btn--primary cockpit-btn--sm" onClick={openClientCreate}>
            <Plus size={15} />
            <span>Adicionar Cliente</span>
          </button>
        </div>

        <div className="cockpit-table-card">
          <table className="cockpit-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>WhatsApp</th>
                <th>Mensalidade</th>
                <th>Vencimento</th>
                <th>Status Financeiro</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {projectClients.map((cli) => {
                const payMeta = PAYMENT_LABELS[cli.payment_status] || PAYMENT_LABELS.active;
                return (
                  <tr key={cli.id}>
                    <td>
                      <div className="cockpit-table__primary">{cli.name}</div>
                      {cli.notes && <div className="cockpit-table__sub">{cli.notes}</div>}
                    </td>
                    <td className="cockpit-mono">
                      {cli.whatsapp || <span className="cockpit-muted">Não informado</span>}
                    </td>
                    <td>
                      <strong>{formatBRL(cli.monthly_fee_cents)}</strong>
                    </td>
                    <td>Dia {cli.due_day}</td>
                    <td>
                      <select
                        className={`cockpit-status-select cockpit-status-select--${payMeta.tone}`}
                        value={cli.payment_status}
                        onChange={(e) => handleQuickPaymentStatus(cli, e.target.value)}
                      >
                        <option value="active">Em dia</option>
                        <option value="overdue">Em atraso</option>
                        <option value="blocked">Bloqueado</option>
                      </select>
                    </td>
                    <td>
                      <div className="cockpit-row-actions">
                        <button
                          type="button"
                          className="cockpit-btn cockpit-btn--whatsapp cockpit-btn--xs"
                          onClick={() => openWhatsAppModal(cli)}
                          title="Enviar Cobrança WhatsApp"
                        >
                          <MessageCircle size={14} />
                          <span>Cobrar WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          className="cockpit-icon-btn"
                          onClick={() => openClientEdit(cli)}
                          title="Editar Cliente"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          className="cockpit-icon-btn cockpit-icon-btn--danger"
                          onClick={() => handleDeleteClient(cli)}
                          title="Remover Cliente"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {projectClients.length === 0 && (
                <tr>
                  <td colSpan="6" className="cockpit-table__empty">
                    Nenhum cliente vinculado a este projeto ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Logs Recentes do Projeto */}
      <section className="cockpit__section">
        <div className="cockpit__section-head">
          <h2>Auditoria Recente do Projeto</h2>
        </div>
        <div className="cockpit-table-card">
          <table className="cockpit-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Ação</th>
                <th>Status</th>
                <th>Resumo</th>
              </tr>
            </thead>
            <tbody>
              {projectLogs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTimeBR(log.created_at)}</td>
                  <td className="cockpit-mono">{log.action_type}</td>
                  <td>
                    <span
                      className={`cockpit-pill cockpit-pill--${
                        log.status === 'sent' || log.status === 'executed'
                          ? 'success'
                          : log.status === 'failed'
                          ? 'danger'
                          : 'warning'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="cockpit-table__sub">
                    {log.error_detail || log.message_preview || '—'}
                  </td>
                </tr>
              ))}
              {projectLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="cockpit-table__empty">
                    Nenhuma execução registrada para este projeto ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Confirmar Bloqueio / Desbloqueio */}
      {blockModalOpen && (
        <div className="cockpit-modal-backdrop" onClick={() => setBlockModalOpen(false)}>
          <div className="cockpit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cockpit-modal__head">
              <h3>
                {project.is_system_blocked
                  ? `Desbloquear ${project.name}?`
                  : `Bloquear ${project.name}?`}
              </h3>
              <button type="button" className="cockpit-icon-btn" onClick={() => setBlockModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConfirmToggleBlock} className="cockpit-form">
              <div className={`cockpit-banner ${project.is_system_blocked ? 'cockpit-banner--info' : 'cockpit-banner--danger'}`}>
                {project.is_system_blocked ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                <div>
                  {project.is_system_blocked
                    ? 'O acesso operacional será restabelecido imediatamente no banco remoto e os clientes vinculados voltarão para o status ativo.'
                    : isSupabase
                    ? 'A Edge Function enviará is_blocked = true para system_access_control no Supabase remoto deste cliente.'
                    : 'Este projeto é manual/offline. O bloqueio será registrado no Cockpit e refletido no status financeiro dos clientes vinculados.'}
                </div>
              </div>

              {!project.is_system_blocked && (
                <div className="cockpit-field">
                  <label>Motivo do Bloqueio (exibido/registrado na licença)</label>
                  <input
                    type="text"
                    required
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Ex: Mensalidade vencida há mais de 5 dias"
                  />
                </div>
              )}

              <div className="cockpit-modal__foot">
                <button
                  type="button"
                  className="cockpit-btn cockpit-btn--ghost"
                  onClick={() => setBlockModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`cockpit-btn ${
                    project.is_system_blocked ? 'cockpit-btn--success' : 'cockpit-btn--danger'
                  }`}
                  disabled={togglingBlock}
                >
                  {togglingBlock
                    ? 'Executando...'
                    : project.is_system_blocked
                    ? 'Confirmar Desbloqueio'
                    : 'Confirmar Bloqueio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Criar / Editar Cliente */}
      {clientModalOpen && (
        <div className="cockpit-modal-backdrop" onClick={() => setClientModalOpen(false)}>
          <div className="cockpit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cockpit-modal__head">
              <h3>{editingClient ? 'Editar Cliente' : 'Novo Cliente Vinculado'}</h3>
              <button type="button" className="cockpit-icon-btn" onClick={() => setClientModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveClient} className="cockpit-form">
              <div className="cockpit-form-grid">
                <div className="cockpit-field cockpit-field--full">
                  <label>Nome do Cliente / Responsável *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  />
                </div>
                <div className="cockpit-field">
                  <label>WhatsApp (DDD + Número)</label>
                  <input
                    type="text"
                    value={clientForm.whatsapp}
                    onChange={(e) => setClientForm({ ...clientForm, whatsapp: e.target.value })}
                    placeholder="83999999999"
                  />
                </div>
                <div className="cockpit-field">
                  <label>Mensalidade (R$) *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.monthly_fee_brl}
                    onChange={(e) => setClientForm({ ...clientForm, monthly_fee_brl: e.target.value })}
                    placeholder="119,90"
                  />
                </div>
                <div className="cockpit-field">
                  <label>Dia do Vencimento *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={clientForm.due_day}
                    onChange={(e) => setClientForm({ ...clientForm, due_day: e.target.value })}
                  />
                </div>
                <div className="cockpit-field">
                  <label>Status Financeiro</label>
                  <select
                    value={clientForm.payment_status}
                    onChange={(e) => setClientForm({ ...clientForm, payment_status: e.target.value })}
                  >
                    <option value="active">Em dia</option>
                    <option value="overdue">Em atraso</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
                <div className="cockpit-field cockpit-field--full">
                  <label>Observações</label>
                  <textarea
                    rows={3}
                    value={clientForm.notes}
                    onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                    placeholder="Detalhes do contrato, combinados ou forma de pagamento..."
                  />
                </div>
              </div>
              <div className="cockpit-modal__foot">
                <button
                  type="button"
                  className="cockpit-btn cockpit-btn--ghost"
                  onClick={() => setClientModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="cockpit-btn cockpit-btn--primary" disabled={savingClient}>
                  {savingClient ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Projeto */}
      {editProjectOpen && projectForm && (
        <div className="cockpit-modal-backdrop" onClick={() => setEditProjectOpen(false)}>
          <div className="cockpit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cockpit-modal__head">
              <h3>Editar Projeto</h3>
              <button type="button" className="cockpit-icon-btn" onClick={() => setEditProjectOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProject} className="cockpit-form">
              <div className="cockpit-form-grid">
                <div className="cockpit-field">
                  <label>Nome *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  />
                </div>
                <div className="cockpit-field">
                  <label>Slug *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.slug}
                    onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                  />
                </div>
                <div className="cockpit-field">
                  <label>Categoria *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                  />
                </div>
                <div className="cockpit-field">
                  <label>Integração *</label>
                  <select
                    value={projectForm.integration_type}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, integration_type: e.target.value })
                    }
                  >
                    <option value="supabase">Supabase Remoto</option>
                    <option value="manual_offline">Manual / Offline</option>
                  </select>
                </div>
                {projectForm.integration_type === 'supabase' && (
                  <>
                    <div className="cockpit-field cockpit-field--full">
                      <label>URL do Supabase</label>
                      <input
                        type="url"
                        value={projectForm.supabase_url}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, supabase_url: e.target.value })
                        }
                      />
                    </div>
                    <div className="cockpit-field cockpit-field--full">
                      <label>Secret Name (Backend)</label>
                      <input
                        type="text"
                        value={projectForm.secret_key_ref}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, secret_key_ref: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="cockpit-modal__foot">
                <button
                  type="button"
                  className="cockpit-btn cockpit-btn--ghost"
                  onClick={() => setEditProjectOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="cockpit-btn cockpit-btn--primary" disabled={savingProject}>
                  {savingProject ? 'Salvando...' : 'Salvar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Disparo WhatsApp */}
      {notifyClient && (
        <div className="cockpit-modal-backdrop" onClick={() => setNotifyClient(null)}>
          <div className="cockpit-modal cockpit-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="cockpit-modal__head">
              <h3>Enviar Cobrança WhatsApp — {notifyClient.name}</h3>
              <button type="button" className="cockpit-icon-btn" onClick={() => setNotifyClient(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSendWhatsApp} className="cockpit-form">
              {!notifyClient.whatsapp && (
                <div className="cockpit-banner cockpit-banner--warning">
                  <Activity size={18} />
                  <div>
                    Este cliente ainda está sem WhatsApp cadastrado. Edite o cliente para informar o número antes de disparar.
                  </div>
                </div>
              )}

              <div className="cockpit-field">
                <label>Modelo de Mensagem</label>
                <div className="cockpit-template-tabs">
                  <button
                    type="button"
                    className={`cockpit-chip ${notifyTemplateKey === 'd_minus_3' ? 'cockpit-chip--active' : ''}`}
                    onClick={() => setNotifyTemplateKey('d_minus_3')}
                  >
                    Lembrete (D-3)
                  </button>
                  <button
                    type="button"
                    className={`cockpit-chip ${notifyTemplateKey === 'due_today' ? 'cockpit-chip--active' : ''}`}
                    onClick={() => setNotifyTemplateKey('due_today')}
                  >
                    Vencimento Hoje
                  </button>
                  <button
                    type="button"
                    className={`cockpit-chip ${notifyTemplateKey === 'block_notice' ? 'cockpit-chip--active' : ''}`}
                    onClick={() => setNotifyTemplateKey('block_notice')}
                  >
                    Aviso de Bloqueio
                  </button>
                  <button
                    type="button"
                    className={`cockpit-chip ${notifyTemplateKey === 'custom' ? 'cockpit-chip--active' : ''}`}
                    onClick={() => setNotifyTemplateKey('custom')}
                  >
                    Personalizada
                  </button>
                </div>
              </div>

              {notifyTemplateKey === 'custom' && (
                <div className="cockpit-field">
                  <label>Mensagem Personalizada</label>
                  <textarea
                    rows={4}
                    required
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Olá {{client_name}}, tudo bem?..."
                  />
                </div>
              )}

              <div className="cockpit-field">
                <label>Preview da Mensagem (Destino: {notifyClient.whatsapp || 'Sem número'})</label>
                <div className="cockpit-whatsapp-preview">
                  {previewMessage || 'Digite sua mensagem personalizada acima.'}
                </div>
              </div>

              <div className="cockpit-modal__foot">
                <button
                  type="button"
                  className="cockpit-btn cockpit-btn--ghost"
                  onClick={() => setNotifyClient(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cockpit-btn cockpit-btn--whatsapp"
                  disabled={sendingWhatsApp || !notifyClient.whatsapp || !previewMessage.trim()}
                >
                  <Send size={15} />
                  <span>{sendingWhatsApp ? 'Enviando...' : 'Disparar via Evolution API'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailView;

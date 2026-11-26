import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Database,
  DollarSign,
  HardDrive,
  Lock,
  Plus,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import { cockpitService, formatBRL, formatDateTimeBR } from '../../../services/cockpitService';

const HEALTH_META = {
  online: { label: 'Online', tone: 'success' },
  degraded: { label: 'Sem tabela remota', tone: 'warning' },
  offline: { label: 'Offline', tone: 'danger' },
  manual: { label: 'Offline / Manual', tone: 'neutral' },
  unknown: { label: 'Não testado', tone: 'muted' },
};

const EMPTY_PROJECT_FORM = {
  name: '',
  slug: '',
  category: '',
  integration_type: 'supabase',
  supabase_url: '',
  secret_key_ref: '',
};

const ExecutiveDashboard = ({
  projects,
  clients,
  improvements,
  onSelectProject,
  onRefresh,
  onNotify,
}) => {
  const [testingAll, setTestingAll] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM);
  const [savingProject, setSavingProject] = useState(false);

  // KPIs
  const activeMrrCents = clients
    .filter((c) => c.payment_status === 'active')
    .reduce((acc, c) => acc + (c.monthly_fee_cents || 0), 0);

  const overdueCents = clients
    .filter((c) => c.payment_status === 'overdue' || c.payment_status === 'blocked')
    .reduce((acc, c) => acc + (c.monthly_fee_cents || 0), 0);

  const overdueCount = clients.filter(
    (c) => c.payment_status === 'overdue' || c.payment_status === 'blocked',
  ).length;

  const blockedProjectsCount = projects.filter((p) => p.is_system_blocked).length;
  const supabaseProjects = projects.filter((p) => p.integration_type === 'supabase');
  const onlineProjectsCount = supabaseProjects.filter((p) => p.health_status === 'online').length;
  const openImprovementsCount = improvements.filter((i) => i.status !== 'delivered').length;

  const handleTestAllHealth = async () => {
    if (testingAll) return;
    setTestingAll(true);
    let okCount = 0;
    let errCount = 0;

    for (const proj of supabaseProjects) {
      try {
        await cockpitService.checkProjectHealth(proj.id);
        okCount += 1;
      } catch {
        errCount += 1;
      }
    }

    await onRefresh();
    setTestingAll(false);
    onNotify(
      errCount === 0
        ? `Saúde verificada em ${okCount} projeto(s) Supabase.`
        : `Checagem concluída: ${okCount} verificado(s), ${errCount} com alerta/secret pendente.`,
      errCount === 0 ? 'success' : 'warning',
    );
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      const created = await cockpitService.saveProject(projectForm);
      setShowNewModal(false);
      setProjectForm(EMPTY_PROJECT_FORM);
      await onRefresh();
      onNotify(`Projeto "${created.name}" criado com sucesso.`, 'success');
    } catch (err) {
      onNotify(err.message || 'Erro ao criar projeto.', 'error');
    } finally {
      setSavingProject(false);
    }
  };

  const handleNameChange = (name) => {
    const autoSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setProjectForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug ? prev.slug : autoSlug,
    }));
  };

  return (
    <div className="cockpit__view animate-in">
      <header className="cockpit__header">
        <div>
          <span className="cockpit__eyebrow">A2 Data · Central Executiva</span>
          <h1 className="cockpit__title">Dashboard Executivo</h1>
          <p className="cockpit__subtitle">
            Monitoramento unificado de receita recorrente, saúde das instâncias e operação de clientes.
          </p>
        </div>

        <div className="cockpit__header-actions">
          <button
            type="button"
            className="cockpit-btn cockpit-btn--ghost"
            onClick={handleTestAllHealth}
            disabled={testingAll || supabaseProjects.length === 0}
          >
            <RefreshCw size={16} className={testingAll ? 'spin' : ''} />
            <span>{testingAll ? 'Verificando...' : 'Testar Saúde (Todos)'}</span>
          </button>
          <button
            type="button"
            className="cockpit-btn cockpit-btn--primary"
            onClick={() => setShowNewModal(true)}
          >
            <Plus size={16} />
            <span>Novo Projeto</span>
          </button>
        </div>
      </header>

      {/* KPI Strip */}
      <section className="cockpit__kpis">
        <div className="cockpit-kpi cockpit-kpi--emerald">
          <div className="cockpit-kpi__top">
            <span className="cockpit-kpi__label">MRR Ativo</span>
            <DollarSign size={18} />
          </div>
          <strong className="cockpit-kpi__value">{formatBRL(activeMrrCents)}</strong>
          <span className="cockpit-kpi__meta">
            {clients.filter((c) => c.payment_status === 'active').length} contrato(s) em dia
          </span>
        </div>

        <div className={`cockpit-kpi ${overdueCents > 0 ? 'cockpit-kpi--danger' : 'cockpit-kpi--slate'}`}>
          <div className="cockpit-kpi__top">
            <span className="cockpit-kpi__label">Valor em Atraso / Bloq.</span>
            <AlertTriangle size={18} />
          </div>
          <strong className="cockpit-kpi__value">{formatBRL(overdueCents)}</strong>
          <span className="cockpit-kpi__meta">
            {overdueCount === 0 ? 'Inadimplência zerada' : `${overdueCount} cliente(s) pendente(s)`}
          </span>
        </div>

        <div className="cockpit-kpi cockpit-kpi--blue">
          <div className="cockpit-kpi__top">
            <span className="cockpit-kpi__label">Clientes Vinculados</span>
            <Users size={18} />
          </div>
          <strong className="cockpit-kpi__value">{clients.length}</strong>
          <span className="cockpit-kpi__meta">
            Distribuídos em {projects.length} projeto(s)
          </span>
        </div>

        <div className="cockpit-kpi cockpit-kpi--violet">
          <div className="cockpit-kpi__top">
            <span className="cockpit-kpi__label">Saúde & Esteira</span>
            <Activity size={18} />
          </div>
          <strong className="cockpit-kpi__value">
            {onlineProjectsCount}/{supabaseProjects.length} Online
          </strong>
          <span className="cockpit-kpi__meta">
            {blockedProjectsCount > 0
              ? `${blockedProjectsCount} bloqueado(s) · `
              : ''}
            {openImprovementsCount} melhoria(s) abertas
          </span>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="cockpit__section">
        <div className="cockpit__section-head">
          <h2>Sistemas & Operações Monitoradas</h2>
          <span className="cockpit__muted-count">Clique em um card para gerenciar conexão, clientes e bloqueio</span>
        </div>

        <div className="cockpit-projects-grid">
          {projects.map((proj) => {
            const projClients = clients.filter((c) => c.project_id === proj.id);
            const projMrr = projClients.reduce((acc, c) => acc + (c.monthly_fee_cents || 0), 0);
            const projOverdue = projClients
              .filter((c) => c.payment_status !== 'active')
              .reduce((acc, c) => acc + (c.monthly_fee_cents || 0), 0);
            const health = HEALTH_META[proj.health_status] || HEALTH_META.unknown;
            const isSupabase = proj.integration_type === 'supabase';

            return (
              <button
                key={proj.id}
                type="button"
                className={`cockpit-project-card ${proj.is_system_blocked ? 'cockpit-project-card--blocked' : ''}`}
                onClick={() => onSelectProject(proj.id)}
              >
                <div className="cockpit-project-card__head">
                  <div className="cockpit-project-card__badges">
                    <span className={`cockpit-pill cockpit-pill--${health.tone}`}>
                      <span className="cockpit-dot" />
                      {health.label}
                    </span>
                    <span className="cockpit-pill cockpit-pill--subtle">
                      {isSupabase ? <Database size={12} /> : <HardDrive size={12} />}
                      {isSupabase ? 'Supabase' : 'Offline/Manual'}
                    </span>
                  </div>
                  <ArrowUpRight size={17} className="cockpit-project-card__arrow" />
                </div>

                <div className="cockpit-project-card__body">
                  <h3>{proj.name}</h3>
                  <p>{proj.category}</p>
                </div>

                {proj.is_system_blocked && (
                  <div className="cockpit-project-card__alert">
                    <Lock size={13} />
                    <span>Sistema Bloqueado{proj.block_reason ? `: ${proj.block_reason}` : ''}</span>
                  </div>
                )}

                <div className="cockpit-project-card__footer">
                  <div>
                    <span className="cockpit-project-card__metric-label">Faturamento</span>
                    <strong className="cockpit-project-card__metric-value">
                      {formatBRL(projMrr)}
                    </strong>
                  </div>
                  <div>
                    <span className="cockpit-project-card__metric-label">Clientes</span>
                    <strong className="cockpit-project-card__metric-value">
                      {projClients.length || proj.total_clients_count || 0}
                    </strong>
                  </div>
                  <div>
                    <span className="cockpit-project-card__metric-label">Em atraso</span>
                    <strong
                      className={`cockpit-project-card__metric-value ${
                        projOverdue > 0 ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {projOverdue > 0 ? formatBRL(projOverdue) : 'Em dia'}
                    </strong>
                  </div>
                </div>

                <div className="cockpit-project-card__meta">
                  {proj.last_health_latency_ms ? `${proj.last_health_latency_ms}ms · ` : ''}
                  Checado: {formatDateTimeBR(proj.last_health_check_at)}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="cockpit-modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="cockpit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cockpit-modal__head">
              <h3>Cadastrar Novo Projeto</h3>
              <button type="button" className="cockpit-icon-btn" onClick={() => setShowNewModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="cockpit-form">
              <div className="cockpit-form-grid">
                <div className="cockpit-field">
                  <label>Nome do Projeto *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Studio Tatuagem Ink"
                  />
                </div>
                <div className="cockpit-field">
                  <label>Slug *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.slug}
                    onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                    placeholder="ex: studio-tatuagem-ink"
                  />
                </div>
                <div className="cockpit-field">
                  <label>Categoria / Nicho *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    placeholder="Ex: Estúdio / Agendamento"
                  />
                </div>
                <div className="cockpit-field">
                  <label>Tipo de Integração *</label>
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
                        placeholder="https://xyz.supabase.co"
                      />
                    </div>
                    <div className="cockpit-field cockpit-field--full">
                      <label>Nome da Secret (Deno.env)</label>
                      <input
                        type="text"
                        value={projectForm.secret_key_ref}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, secret_key_ref: e.target.value })
                        }
                        placeholder="PROJECT_KEY_NOVO"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="cockpit-modal__foot">
                <button
                  type="button"
                  className="cockpit-btn cockpit-btn--ghost"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cockpit-btn cockpit-btn--primary"
                  disabled={savingProject}
                >
                  {savingProject ? 'Salvando...' : 'Criar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboard;

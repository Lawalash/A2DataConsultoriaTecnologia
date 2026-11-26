import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Loader2,
  MessageSquare,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Server,
  Wifi,
  X,
} from 'lucide-react';
import {
  cockpitService,
  formatDateTimeBR,
  renderTemplatePreview,
} from '../../../services/cockpitService';

const TEMPLATE_VARIABLES = [
  '{{client_name}}',
  '{{project_name}}',
  '{{amount}}',
  '{{due_day}}',
  '{{reason}}',
];

const ACTION_LABELS = {
  whatsapp_d3: 'WhatsApp D-3',
  whatsapp_due: 'WhatsApp Vencimento',
  whatsapp_block: 'WhatsApp Bloqueio',
  whatsapp_custom: 'WhatsApp Custom',
  system_block: 'Bloqueio Sistema',
  system_unblock: 'Desbloqueio Sistema',
  health_check: 'Health Check',
};

const BillingSettingsView = ({ projects, clients, templates, logs, onRefresh, onNotify }) => {
  const [drafts, setDrafts] = useState({});
  const [savingKey, setSavingKey] = useState(null);
  const [evolutionStatus, setEvolutionStatus] = useState(null);
  const [checkingEvolution, setCheckingEvolution] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrData, setQrData] = useState(null);

  // Filters for logs
  const [logProjectFilter, setLogProjectFilter] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('');
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    const initial = {};
    templates.forEach((tpl) => {
      initial[tpl.template_key] = {
        id: tpl.id,
        label: tpl.label,
        body: tpl.body,
        is_active: tpl.is_active,
      };
    });
    setDrafts(initial);
  }, [templates]);

  const projectMap = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [projects]);

  const clientMap = useMemo(() => {
    const map = {};
    clients.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [clients]);

  const sampleClient = clients[0] || {
    name: 'Léo',
    monthly_fee_cents: 11990,
    due_day: 30,
  };
  const sampleProject = projects.find((p) => p.id === sampleClient.project_id) ||
    projects[0] || {
      name: 'Q BOM Gelo & Brasa',
      block_reason: 'Mensalidade vencida',
    };

  const handleCheckEvolution = async () => {
    setCheckingEvolution(true);
    try {
      const res = await cockpitService.checkEvolutionStatus();
      setEvolutionStatus(res);
      if (res.ok && res.state === 'open') {
        onNotify(`Evolution API conectada (${res.instanceName}).`, 'success');
      } else {
        onNotify(res.error || `Instância Evolution em estado: ${res.state}`, 'warning');
      }
    } catch (err) {
      setEvolutionStatus({ ok: false, state: 'error', error: err.message });
      onNotify(err.message || 'Erro ao verificar Evolution API.', 'error');
    } finally {
      setCheckingEvolution(false);
    }
  };

  const handleOpenQrModal = async () => {
    setQrModalOpen(true);
    setLoadingQr(true);
    try {
      const res = await cockpitService.getEvolutionQrCode();
      setQrData(res);
      if (res?.state === 'open') {
        setEvolutionStatus(res);
        onNotify(`WhatsApp conectado na instância ${res.instanceName}.`, 'success');
      }
    } catch (err) {
      setQrData({
        ok: false,
        configured: true,
        state: 'error',
        error: err.message || 'Erro ao buscar QR Code.',
      });
    } finally {
      setLoadingQr(false);
    }
  };

  const handleSaveTemplate = async (templateKey) => {
    const draft = drafts[templateKey];
    if (!draft) return;
    setSavingKey(templateKey);
    try {
      await cockpitService.saveBillingTemplate(draft.id, draft);
      await onRefresh();
      onNotify(`Template "${draft.label}" salvo.`, 'success');
    } catch (err) {
      onNotify(err.message || 'Erro ao salvar template.', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const appendVariable = (templateKey, variable) => {
    setDrafts((prev) => ({
      ...prev,
      [templateKey]: {
        ...prev[templateKey],
        body: `${prev[templateKey]?.body || ''} ${variable}`.trim(),
      },
    }));
  };

  const filteredLogs = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    return logs.filter((log) => {
      if (logProjectFilter && log.project_id !== logProjectFilter) return false;
      if (logStatusFilter && log.status !== logStatusFilter) return false;
      if (q) {
        const projName = (projectMap[log.project_id] || '').toLowerCase();
        const cliName = (clientMap[log.client_id] || '').toLowerCase();
        const preview = (log.message_preview || '').toLowerCase();
        const phone = (log.recipient_whatsapp || '').toLowerCase();
        if (
          !projName.includes(q) &&
          !cliName.includes(q) &&
          !preview.includes(q) &&
          !phone.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [logs, logProjectFilter, logStatusFilter, logSearch, projectMap, clientMap]);

  return (
    <div className="cockpit__view animate-in">
      <header className="cockpit__header">
        <div>
          <span className="cockpit__eyebrow">Automação & Auditoria</span>
          <h1 className="cockpit__title">Robô de Cobrança & Configurações</h1>
          <p className="cockpit__subtitle">
            Gerencie os templates WhatsApp (D-3, vencimento e bloqueio) e audite todos os disparos e bloqueios executados.
          </p>
        </div>

        <div className="cockpit__header-actions">
          <button
            type="button"
            className="cockpit-btn cockpit-btn--ghost"
            onClick={handleCheckEvolution}
            disabled={checkingEvolution}
          >
            {checkingEvolution ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Wifi size={15} />
            )}
            <span>{checkingEvolution ? 'Verificando...' : 'Testar Evolution API'}</span>
          </button>
        </div>
      </header>

      {/* Evolution API Connection Card */}
      <div className="cockpit-evolution-bar">
        <div className="cockpit-evolution-bar__info">
          <div className="cockpit-evolution-bar__icon">
            <Bot size={22} />
          </div>
          <div>
            <h3>Integração Evolution API (Secrets no Backend `A2DATASITE`)</h3>
            <p>
              As credenciais ficam isoladas nas Edge Functions via{' '}
              <code>EVOLUTION_API_URL</code>, <code>EVOLUTION_API_KEY</code> e{' '}
              <code>EVOLUTION_INSTANCE_NAME</code>.
            </p>
          </div>
        </div>

        <div className="cockpit-evolution-bar__actions">
          <div className="cockpit-evolution-bar__status">
            {evolutionStatus ? (
              <span
                className={`cockpit-pill cockpit-pill--${
                  evolutionStatus.ok && evolutionStatus.state === 'open'
                    ? 'success'
                    : evolutionStatus.configured === false
                    ? 'warning'
                    : 'danger'
                }`}
              >
                <span className="cockpit-dot" />
                {evolutionStatus.state === 'open'
                  ? `Conectada (${evolutionStatus.instanceName})`
                  : evolutionStatus.error || `Estado: ${evolutionStatus.state}`}
              </span>
            ) : (
              <span className="cockpit-pill cockpit-pill--muted">
                Clique em "Testar Evolution API" para validar
              </span>
            )}
          </div>

          <button
            type="button"
            className="cockpit-btn cockpit-btn--primary cockpit-btn--sm"
            onClick={handleOpenQrModal}
          >
            <QrCode size={15} />
            <span>Conectar / Gerar QR Code</span>
          </button>
        </div>
      </div>

      {/* Templates Editor */}
      <section className="cockpit__section">
        <div className="cockpit__section-head">
          <h2>Templates de Cobrança WhatsApp</h2>
          <div className="cockpit-vars-hint">
            Variáveis disponíveis:{' '}
            {TEMPLATE_VARIABLES.map((v) => (
              <code key={v}>{v}</code>
            ))}
          </div>
        </div>

        <div className="cockpit-templates-grid">
          {['d_minus_3', 'due_today', 'block_notice'].map((key) => {
            const draft = drafts[key];
            if (!draft) return null;

            return (
              <div key={key} className="cockpit-template-card">
                <div className="cockpit-template-card__head">
                  <div>
                    <span className="cockpit-mono cockpit-template-card__key">{key}</span>
                    <h3>{draft.label}</h3>
                  </div>
                  <label className="cockpit-switch">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.is_active)}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], is_active: e.target.checked },
                        }))
                      }
                    />
                    <span>{draft.is_active ? 'Ativo' : 'Pausado'}</span>
                  </label>
                </div>

                <textarea
                  rows={5}
                  value={draft.body}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], body: e.target.value },
                    }))
                  }
                />

                <div className="cockpit-template-card__chips">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="cockpit-chip cockpit-chip--xs"
                      onClick={() => appendVariable(key, v)}
                    >
                      + {v}
                    </button>
                  ))}
                </div>

                <div className="cockpit-template-card__preview">
                  <span>Preview ({sampleClient.name}):</span>
                  <p>
                    {renderTemplatePreview(draft.body, {
                      client: sampleClient,
                      project: sampleProject,
                      reason: 'Mensalidade vencida',
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  className="cockpit-btn cockpit-btn--primary cockpit-btn--sm"
                  onClick={() => handleSaveTemplate(key)}
                  disabled={savingKey === key}
                >
                  <Save size={14} />
                  <span>{savingKey === key ? 'Salvando...' : 'Salvar Template'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Logs de Cobrança & Ações */}
      <section className="cockpit__section">
        <div className="cockpit__section-head">
          <h2>Logs de Cobrança & Ações Remotas ({filteredLogs.length})</h2>
        </div>

        <div className="cockpit-filters-bar">
          <div className="cockpit-search-box">
            <Search size={15} />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Buscar por cliente, telefone ou conteúdo..."
            />
          </div>

          <select value={logProjectFilter} onChange={(e) => setLogProjectFilter(e.target.value)}>
            <option value="">Todos os Projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select value={logStatusFilter} onChange={(e) => setLogStatusFilter(e.target.value)}>
            <option value="">Todos os Status</option>
            <option value="sent">Enviado</option>
            <option value="executed">Executado</option>
            <option value="failed">Falhou</option>
            <option value="skipped">Ignorado</option>
          </select>
        </div>

        <div className="cockpit-table-card">
          <table className="cockpit-table">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Projeto / Cliente</th>
                <th>Ação</th>
                <th>Destino</th>
                <th>Status</th>
                <th>Mensagem / Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTimeBR(log.created_at)}</td>
                  <td>
                    <div className="cockpit-table__primary">
                      {projectMap[log.project_id] || 'Sistema'}
                    </div>
                    {log.client_id && (
                      <div className="cockpit-table__sub">{clientMap[log.client_id] || '—'}</div>
                    )}
                  </td>
                  <td>
                    <span className="cockpit-pill cockpit-pill--subtle">
                      {log.channel === 'whatsapp' ? <MessageSquare size={12} /> : <Server size={12} />}
                      {ACTION_LABELS[log.action_type] || log.action_type}
                    </span>
                  </td>
                  <td className="cockpit-mono">{log.recipient_whatsapp || '—'}</td>
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
                  <td className="cockpit-table__sub cockpit-log-msg">
                    {log.error_detail ? (
                      <span className="text-danger">{log.error_detail}</span>
                    ) : (
                      log.message_preview || '—'
                    )}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="cockpit-table__empty">
                    Nenhum registro encontrado nos logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Conectar / QR Code Evolution API */}
      {qrModalOpen && (
        <div className="cockpit-modal-backdrop" onClick={() => setQrModalOpen(false)}>
          <div className="cockpit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cockpit-modal__head">
              <h3>Conectar WhatsApp (Evolution API v2)</h3>
              <button type="button" className="cockpit-icon-btn" onClick={() => setQrModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="cockpit-form">
              {loadingQr ? (
                <div className="cockpit-loading-inline">
                  <Loader2 size={24} className="animate-spin" />
                  <span>Gerando QR Code na Evolution API...</span>
                </div>
              ) : qrData?.configured === false ? (
                <div className="cockpit-banner cockpit-banner--warning">
                  <AlertTriangle size={20} />
                  <div>
                    <strong>Evolution API ainda não configurada na VPS.</strong>
                    <p style={{ marginTop: '4px' }}>
                      Configure os Secrets <code>EVOLUTION_API_URL</code>,{' '}
                      <code>EVOLUTION_API_KEY</code> e <code>EVOLUTION_INSTANCE_NAME</code> no projeto Supabase{' '}
                      <code>A2DATASITE</code> para habilitar a geração do QR Code.
                    </p>
                  </div>
                </div>
              ) : qrData?.state === 'open' ? (
                <div className="cockpit-qr-connected">
                  <div className="cockpit-qr-connected__icon">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4>WhatsApp Conectado</h4>
                  <p>
                    A instância <code>{qrData.instanceName}</code> está com status{' '}
                    <strong>open</strong> e pronta para os disparos automáticos.
                  </p>
                </div>
              ) : qrData?.base64 || qrData?.pairingCode ? (
                <div className="cockpit-qr-box">
                  <p className="cockpit-qr-box__hint">
                    Abra o WhatsApp no celular → <strong>Dispositivos conectados</strong> →{' '}
                    <strong>Conectar dispositivo</strong> e escaneie o código abaixo:
                  </p>
                  {qrData.base64 && (
                    <img
                      className="cockpit-qr-img"
                      alt="QR Code WhatsApp Evolution API"
                      src={
                        qrData.base64.startsWith('data:image')
                          ? qrData.base64
                          : `data:image/png;base64,${qrData.base64}`
                      }
                    />
                  )}
                  {qrData.pairingCode && (
                    <div className="cockpit-qr-pairing">
                      <span>Código de pareamento:</span>
                      <strong>{qrData.pairingCode}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="cockpit-banner cockpit-banner--danger">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>Não foi possível obter o QR Code.</strong>
                    <p style={{ marginTop: '4px' }}>
                      {qrData?.error || `Estado retornado: ${qrData?.state || 'desconhecido'}`}
                    </p>
                  </div>
                </div>
              )}

              <div className="cockpit-modal__foot">
                <button
                  type="button"
                  className="cockpit-btn cockpit-btn--ghost"
                  onClick={() => setQrModalOpen(false)}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  className="cockpit-btn cockpit-btn--primary"
                  onClick={handleOpenQrModal}
                  disabled={loadingQr}
                >
                  {loadingQr ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <RefreshCw size={15} />
                  )}
                  <span>Atualizar QR Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSettingsView;

import React, { useEffect, useState } from 'react';
import { BarChart3, Briefcase, Edit, Loader2, Package, Plus, Save, Settings, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import staticSolutions from '../../../data/solutions';
import staticCases from '../../../data/cases';
import siteConfig from '../../../data/siteConfig';

const statusColors = {
  novo: '#3b82f6',
  em_contato: '#f59e0b',
  diagnostico: '#8b5cf6',
  proposta_enviada: '#ec4899',
  fechado: '#10b981',
  perdido: '#ef4444',
};

const statusLabels = {
  novo: 'Novo',
  em_contato: 'Em contato',
  diagnostico: 'Diagnóstico',
  proposta_enviada: 'Proposta Enviada',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

const LegacyShowcaseView = () => {
  const [subTab, setSubTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [casesData, setCasesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLegacyData = async () => {
    if (!supabase) {
      setCasesData(staticCases);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [{ data: leadsRes }, { data: casesRes }] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('cases').select('*').order('created_at', { ascending: false }),
      ]);
      if (leadsRes) setLeads(leadsRes);
      if (casesRes && casesRes.length > 0) {
        setCasesData(casesRes);
      } else {
        setCasesData(staticCases);
      }
    } catch (err) {
      console.error('Erro ao carregar dados da vitrine:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegacyData();
  }, []);

  const subTabs = [
    { id: 'leads', label: 'Propostas & Leads', icon: Users },
    { id: 'cases', label: 'Cases', icon: Briefcase },
    { id: 'solutions', label: 'Soluções', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'site', label: 'Dados da Vitrine', icon: Settings },
  ];

  return (
    <div className="cockpit__view animate-in">
      <header className="cockpit__header">
        <div>
          <span className="cockpit__eyebrow">Módulo Secundário · Site Institucional</span>
          <h1 className="cockpit__title">Vitrine & Leads</h1>
          <p className="cockpit__subtitle">
            Gestão preservada das propostas captadas na landing page, catálogo de soluções, cases e métricas do site.
          </p>
        </div>
      </header>

      <div className="cockpit-subtabs">
        {subTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`cockpit-chip ${subTab === id ? 'cockpit-chip--active' : ''}`}
            onClick={() => setSubTab(id)}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="cockpit-loading-inline">
          <Loader2 size={24} className="spin" /> Carregando dados da vitrine...
        </div>
      ) : (
        <>
          {subTab === 'leads' && <LegacyLeadsTab leads={leads} onUpdate={fetchLegacyData} />}
          {subTab === 'cases' && <LegacyCasesTab casesData={casesData} onUpdate={fetchLegacyData} />}
          {subTab === 'solutions' && <LegacySolutionsTab />}
          {subTab === 'analytics' && <LegacyAnalyticsTab leads={leads} />}
          {subTab === 'site' && <LegacySiteSettingsTab />}
        </>
      )}
    </div>
  );
};

const LegacyLeadsTab = ({ leads, onUpdate }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [solutionFilter, setSolutionFilter] = useState('');

  const updateStatus = async (id, newStatus) => {
    if (!supabase) return;
    await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    onUpdate();
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const updateLeadField = async (field, value) => {
    if (!supabase || !selectedLead) return;
    await supabase.from('leads').update({ [field]: value }).eq('id', selectedLead.id);
    setSelectedLead({ ...selectedLead, [field]: value });
    onUpdate();
  };

  const openWhatsApp = (whatsapp) => {
    const cleanNumber = String(whatsapp || '').replace(/\D/g, '');
    updateLeadField('last_contact_at', new Date().toISOString());
    window.open(`https://wa.me/55${cleanNumber}`, '_blank');
  };

  if (selectedLead) {
    return (
      <div className="animate-in">
        <div className="cockpit__section-head">
          <button
            type="button"
            className="cockpit-btn cockpit-btn--ghost cockpit-btn--sm"
            onClick={() => setSelectedLead(null)}
          >
            ← Voltar para lista
          </button>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={selectedLead.status}
              onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
              className="admin__status-select"
            >
              {Object.entries(statusLabels).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="cockpit-btn cockpit-btn--whatsapp cockpit-btn--sm"
              onClick={() => openWhatsApp(selectedLead.whatsapp)}
            >
              WhatsApp
            </button>
          </div>
        </div>

        <div className="cockpit-panel" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Proposta: {selectedLead.proposal_id || 'Sem ID'}</h3>
          <div className="lead-detail-grid">
            <div className="lead-detail-item">
              <label>Nome do Contato</label>
              <p>{selectedLead.name}</p>
            </div>
            <div className="lead-detail-item">
              <label>WhatsApp</label>
              <p>{selectedLead.whatsapp}</p>
            </div>
            <div className="lead-detail-item">
              <label>Negócio / Instituição</label>
              <p>{selectedLead.business_name || 'Não informado'}</p>
            </div>
            <div className="lead-detail-item">
              <label>Cidade</label>
              <p>{selectedLead.city || 'Não informada'}</p>
            </div>
            <div className="lead-detail-item">
              <label>Solução de Interesse</label>
              <p>
                <strong>{selectedLead.solution_interest}</strong>
              </p>
            </div>
            <div className="lead-detail-item">
              <label>Data da Solicitação</label>
              <p>{new Date(selectedLead.created_at).toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <div className="lead-detail-full">
            <label>Mensagem / Respostas da Triagem</label>
            <pre className="lead-message-box">{selectedLead.message}</pre>
          </div>
        </div>

        <div className="cockpit-panel">
          <div className="cockpit-form-grid">
            <div className="cockpit-field cockpit-field--full">
              <label>Próxima Ação</label>
              <input
                type="text"
                value={selectedLead.next_action || ''}
                onChange={(e) => setSelectedLead({ ...selectedLead, next_action: e.target.value })}
                onBlur={(e) => updateLeadField('next_action', e.target.value)}
                placeholder="Ex: Ligar na sexta-feira às 14h"
              />
            </div>
            <div className="cockpit-field cockpit-field--full">
              <label>Observações Internas</label>
              <textarea
                rows={4}
                value={selectedLead.notes || ''}
                onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })}
                onBlur={(e) => updateLeadField('notes', e.target.value)}
                placeholder="Anotações sobre a negociação..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      (l.proposal_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.business_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchSolution = solutionFilter ? l.solution_interest === solutionFilter : true;
    return matchSearch && matchSolution;
  });

  const uniqueSolutions = [...new Set(leads.map((l) => l.solution_interest).filter(Boolean))];

  return (
    <div>
      <div className="cockpit-filters-bar">
        <input
          type="text"
          placeholder="Buscar ID ou Nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={solutionFilter} onChange={(e) => setSolutionFilter(e.target.value)}>
          <option value="">Todas as Soluções</option>
          {uniqueSolutions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="admin__pipeline">
        {Object.keys(statusLabels).map((statusKey) => {
          const colLeads = filteredLeads.filter((l) => l.status === statusKey);
          return (
            <div key={statusKey} className="admin__pipeline-col">
              <div className="pipeline-col-header" style={{ borderBottomColor: statusColors[statusKey] }}>
                <h3>{statusLabels[statusKey]}</h3>
                <span className="pipeline-count">{colLeads.length}</span>
              </div>
              <div className="pipeline-col-body">
                {colLeads.map((lead) => (
                  <div key={lead.id} className="pipeline-card" onClick={() => setSelectedLead(lead)}>
                    <div className="pipeline-card-id">{lead.proposal_id || 'Sem ID'}</div>
                    <div className="pipeline-card-name">{lead.name}</div>
                    <div className="pipeline-card-sol">{lead.solution_interest}</div>
                    <div className="pipeline-card-date">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LegacyCasesTab = ({ casesData, onUpdate }) => {
  const [editingCase, setEditingCase] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({});

  const handleEdit = (c) => {
    setEditingCase(c);
    setIsCreating(false);
    setFormData({
      slug: c.slug || '',
      title: c.title || c.name || '',
      segment: c.segment || '',
      summary: c.summary || c.shortDescription || '',
      description: c.description || c.longDescription || '',
      features: Array.isArray(c.features) ? c.features.join(', ') : '',
      tech_stack: Array.isArray(c.tech_stack)
        ? c.tech_stack.join(', ')
        : Array.isArray(c.technologies)
        ? c.technologies.join(', ')
        : '',
      cover_image_url: c.cover_image_url || c.coverImage || '',
      video_url: c.video_url || '',
      demo_url: c.demo_url || '',
      display_order: c.display_order || 0,
      is_published: c.is_published !== false,
    });
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingCase({});
    setFormData({
      slug: '',
      title: '',
      segment: '',
      summary: '',
      description: '',
      features: '',
      tech_stack: '',
      cover_image_url: '',
      video_url: '',
      demo_url: '',
      display_order: 0,
      is_published: true,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      const payload = {
        ...formData,
        features: formData.features.split(',').map((s) => s.trim()).filter(Boolean),
        tech_stack: formData.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (isCreating) {
        await supabase.from('cases').insert([payload]);
      } else {
        await supabase.from('cases').update(payload).eq('id', editingCase.id);
      }
      setEditingCase(null);
      setIsCreating(false);
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar case.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este case?')) return;
    if (!supabase) return;
    await supabase.from('cases').delete().eq('id', id);
    setEditingCase(null);
    onUpdate();
  };

  if (editingCase !== null) {
    return (
      <form onSubmit={handleSave} className="cockpit-panel cockpit-form">
        <div className="cockpit__section-head">
          <h3>{isCreating ? 'Novo Case' : 'Editar Case'}</h3>
          <button
            type="button"
            className="cockpit-btn cockpit-btn--ghost cockpit-btn--sm"
            onClick={() => {
              setEditingCase(null);
              setIsCreating(false);
            }}
          >
            Cancelar
          </button>
        </div>
        <div className="cockpit-form-grid">
          <div className="cockpit-field">
            <label>Título *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="cockpit-field">
            <label>Slug *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>
          <div className="cockpit-field">
            <label>Segmento *</label>
            <input
              type="text"
              required
              value={formData.segment}
              onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
            />
          </div>
          <div className="cockpit-field">
            <label>Ordem</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 0 })
              }
            />
          </div>
          <div className="cockpit-field cockpit-field--full">
            <label>Resumo Curto *</label>
            <textarea
              rows={2}
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </div>
          <div className="cockpit-field cockpit-field--full">
            <label>Descrição Completa</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button type="submit" className="cockpit-btn cockpit-btn--primary cockpit-btn--sm">
            <Save size={15} /> Salvar
          </button>
          {!isCreating && editingCase.id && (
            <button
              type="button"
              className="cockpit-btn cockpit-btn--danger-ghost cockpit-btn--sm"
              onClick={() => handleDelete(editingCase.id)}
            >
              Excluir
            </button>
          )}
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="cockpit__section-head">
        <h2>Cases Publicados</h2>
        <button type="button" className="cockpit-btn cockpit-btn--primary cockpit-btn--sm" onClick={handleCreateNew}>
          <Plus size={15} /> Novo Case
        </button>
      </div>
      <div className="admin__list">
        {casesData.map((c) => (
          <div key={c.id || c.slug} className="admin__list-item">
            <div className="admin__list-info">
              <h3>{c.title || c.name}</h3>
              <p>{c.segment}</p>
            </div>
            <span className="cockpit-pill cockpit-pill--success">
              {c.is_published !== false ? 'Publicado' : 'Oculto'}
            </span>
            <button type="button" className="cockpit-icon-btn" onClick={() => handleEdit(c)}>
              <Edit size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const LegacySolutionsTab = () => {
  const [solutionsData, setSolutionsData] = useState([]);

  useEffect(() => {
    if (!supabase) {
      setSolutionsData(staticSolutions);
      return;
    }
    supabase
      .from('solutions')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setSolutionsData(data && data.length > 0 ? data : staticSolutions);
      });
  }, []);

  return (
    <div className="admin__list">
      {solutionsData.map((s) => (
        <div key={s.id || s.slug} className="admin__list-item">
          <div className="admin__list-info">
            <h3>{s.name}</h3>
            <p>{s.audience}</p>
          </div>
          <span className="cockpit-pill cockpit-pill--success">
            {s.is_published === false ? 'Oculto' : 'Ativo'}
          </span>
        </div>
      ))}
    </div>
  );
};

const LegacyAnalyticsTab = ({ leads }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from('analytics_events')
      .select('*')
      .then(({ data }) => {
        if (data) setEvents(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="cockpit-loading-inline">
        <Loader2 size={24} className="spin" /> Carregando analytics...
      </div>
    );
  }

  const pageViews = events.filter((e) => e.event_type === 'page_view').length;
  const whatsappClicks = events.filter((e) => e.event_label === 'whatsapp_proposal_send').length;
  const conversionRate = pageViews > 0 ? ((leads.length / pageViews) * 100).toFixed(1) : 0;

  return (
    <div className="cockpit__kpis">
      <div className="cockpit-kpi cockpit-kpi--blue">
        <span className="cockpit-kpi__label">Visitas de Página</span>
        <strong className="cockpit-kpi__value">{pageViews}</strong>
      </div>
      <div className="cockpit-kpi cockpit-kpi--emerald">
        <span className="cockpit-kpi__label">Propostas Geradas</span>
        <strong className="cockpit-kpi__value">{leads.length}</strong>
      </div>
      <div className="cockpit-kpi cockpit-kpi--violet">
        <span className="cockpit-kpi__label">Conversão Visita → Lead</span>
        <strong className="cockpit-kpi__value">{conversionRate}%</strong>
      </div>
      <div className="cockpit-kpi cockpit-kpi--slate">
        <span className="cockpit-kpi__label">Cliques WhatsApp</span>
        <strong className="cockpit-kpi__value">{whatsappClicks}</strong>
      </div>
    </div>
  );
};

const LegacySiteSettingsTab = () => (
  <div className="cockpit-panel">
    <div className="cockpit-form-grid">
      <div className="cockpit-field">
        <label>WhatsApp Principal</label>
        <input type="text" defaultValue={siteConfig.contact.whatsapp.displayNumber} readOnly />
      </div>
      <div className="cockpit-field">
        <label>E-mail Comercial</label>
        <input type="email" defaultValue={siteConfig.contact.email} readOnly />
      </div>
      <div className="cockpit-field">
        <label>Instagram</label>
        <input type="text" defaultValue={siteConfig.contact.instagram.handle} readOnly />
      </div>
      <div className="cockpit-field">
        <label>Localização</label>
        <input type="text" defaultValue={siteConfig.contact.location} readOnly />
      </div>
    </div>
  </div>
);

export default LegacyShowcaseView;

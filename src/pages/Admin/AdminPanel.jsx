import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Briefcase, Users, Settings, Plus, Eye, Edit, BarChart3, Lock, LogOut, Loader2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import staticSolutions from '../../data/solutions';
import staticCases from '../../data/cases';
import siteConfig from '../../data/siteConfig';
import './AdminPanel.css';

const statusColors = {
  'novo': '#3b82f6',
  'em_contato': '#f59e0b',
  'diagnostico': '#8b5cf6',
  'proposta_enviada': '#ec4899',
  'fechado': '#10b981',
  'perdido': '#ef4444',
};

const statusLabels = {
  'novo': 'Novo',
  'em_contato': 'Em contato',
  'diagnostico': 'Diagnóstico',
  'proposta_enviada': 'Proposta Enviada',
  'fechado': 'Fechado',
  'perdido': 'Perdido'
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Global Data
  const [leads, setLeads] = useState([]);
  const [casesData, setCasesData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Check initial session
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAuthenticated(true);
          fetchData();
        }
      });
    }
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch Leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (leadsData) setLeads(leadsData);

      // Fetch Cases
      const { data: dbCases, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (dbCases && dbCases.length > 0) {
        setCasesData(dbCases);
      } else {
        setCasesData(staticCases); // Fallback if no DB cases
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      if (loginForm.password === '123321') {
        setIsAuthenticated(true);
        return;
      }
      setLoginError('Senha incorreta (Mock: use 123321)');
      return;
    }

    setIsLoading(true);
    setLoginError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });

    setIsLoading(false);
    if (error) {
      setLoginError('Credenciais inválidas');
    } else if (data.session) {
      setIsAuthenticated(true);
      fetchData();
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <form className="admin-login__form glass-card" onSubmit={handleLogin}>
          <div className="admin-login__header">
            <Lock size={32} className="admin-login__icon" />
            <h2>Acesso Restrito</h2>
            <p>Faça login para acessar o painel</p>
          </div>
          {loginError && <div className="admin-login__error">{loginError}</div>}
          <div className="admin-login__field">
            <label>E-mail</label>
            <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required placeholder="admin@a2data.com.br" />
          </div>
          <div className="admin-login__field">
            <label>Senha</label>
            <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isLoading} className="btn btn-primary admin-login__btn">
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'solutions', label: 'Soluções', icon: Package },
    { id: 'cases', label: 'Cases', icon: Briefcase },
    { id: 'leads', label: 'Propostas & Leads', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="admin">
      {/* Sidebar */}
      <aside className="admin__sidebar">
        <div className="admin__sidebar-header">
          <span className="admin__logo-a2">A2</span>
          <span className="admin__logo-data">Admin</span>
        </div>
        <nav className="admin__nav">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`admin__nav-item ${activeTab === id ? 'admin__nav-item--active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="admin__logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </aside>

      {/* Main */}
      <main className="admin__main">
        {loadingData ? (
          <div className="admin__loading"><Loader2 size={32} className="spin" /> Carregando dados reais...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardTab leads={leads} casesData={casesData} />}
            {activeTab === 'solutions' && <SolutionsTab />}
            {activeTab === 'cases' && <CasesTab casesData={casesData} onUpdate={fetchData} />}
            {activeTab === 'leads' && <LeadsTab leads={leads} onUpdate={fetchData} />}
            {activeTab === 'analytics' && <AnalyticsTab leads={leads} />}
            {activeTab === 'settings' && <SettingsTab />}
          </>
        )}
      </main>
    </div>
  );
};

const DashboardTab = ({ leads, casesData }) => {
  const conversoes = leads.filter(l => l.status === 'fechado').length;
  const taxaConversao = leads.length > 0 ? Math.round((conversoes / leads.length) * 100) : 0;
  
  return (
    <div className="admin__content animate-in">
      <h1 className="admin__title">Olá, Ricardo! 👋</h1>
      <p className="admin__subtitle">Visão geral da vitrine A2 Data em tempo real</p>

      <div className="admin__cards">
        <div className="admin__card">
          <Package size={24} className="admin__card-icon" />
          <div>
            <span className="admin__card-value">{staticSolutions.length}</span>
            <span className="admin__card-label">Soluções Ativas</span>
          </div>
        </div>
        <div className="admin__card">
          <Briefcase size={24} className="admin__card-icon" />
          <div>
            <span className="admin__card-value">{casesData.length}</span>
            <span className="admin__card-label">Cases Publicados</span>
          </div>
        </div>
        <div className="admin__card">
          <Users size={24} className="admin__card-icon" />
          <div>
            <span className="admin__card-value">{leads.length}</span>
            <span className="admin__card-label">Propostas Totais</span>
          </div>
        </div>
        <div className="admin__card">
          <BarChart3 size={24} className="admin__card-icon" />
          <div>
            <span className="admin__card-value">{taxaConversao}%</span>
            <span className="admin__card-label">Taxa de Conversão</span>
          </div>
        </div>
      </div>

      <div className="admin__recent">
        <h2>Últimas Solicitações</h2>
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr><th>ID Proposta</th><th>Nome</th><th>Solução</th><th>Status</th><th>Data</th></tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id}>
                  <td><strong>{lead.proposal_id || '—'}</strong></td>
                  <td>{lead.name}</td>
                  <td>{lead.solution_interest}</td>
                  <td><span className="admin__status" style={{ background: statusColors[lead.status] + '20', color: statusColors[lead.status] }}>{statusLabels[lead.status] || lead.status}</span></td>
                  <td>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Nenhum lead encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const LeadsTab = ({ leads, onUpdate }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [solutionFilter, setSolutionFilter] = useState('');
  
  const updateStatus = async (id, newStatus) => {
    if (!supabase) return;
    try {
      await supabase.from('leads').update({ status: newStatus }).eq('id', id);
      onUpdate();
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateLeadField = async (field, value) => {
    if (!supabase || !selectedLead) return;
    try {
      await supabase.from('leads').update({ [field]: value }).eq('id', selectedLead.id);
      setSelectedLead({ ...selectedLead, [field]: value });
      onUpdate();
    } catch(e) {
      console.error(e);
    }
  };

  const openWhatsApp = (whatsapp) => {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    updateLeadField('last_contact_at', new Date().toISOString());
    window.open(`https://wa.me/55${cleanNumber}`, '_blank');
  };

  const copyId = () => {
    navigator.clipboard.writeText(selectedLead.proposal_id);
    alert('ID copiado!');
  };

  if (selectedLead) {
    return (
      <div className="admin__content animate-in">
        <div className="admin__content-header">
          <div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedLead(null)} style={{marginBottom: '16px'}}>← Voltar para lista</button>
            <h1 className="admin__title">Proposta: {selectedLead.proposal_id || 'Sem ID'}</h1>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn btn-secondary btn-sm" onClick={copyId}>Copiar ID</button>
            <select 
              value={selectedLead.status} 
              onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
              className="admin__status-select"
            >
              {Object.entries(statusLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <button className="btn btn-whatsapp" onClick={() => openWhatsApp(selectedLead.whatsapp)}>
              WhatsApp
            </button>
          </div>
        </div>
        
        <div className="admin__lead-details glass-card" style={{marginBottom: '20px'}}>
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
              <p><strong>{selectedLead.solution_interest}</strong></p>
            </div>
            <div className="lead-detail-item">
              <label>Data da Solicitação</label>
              <p>{new Date(selectedLead.created_at).toLocaleString('pt-BR')}</p>
            </div>
            <div className="lead-detail-item">
              <label>Último Contato</label>
              <p>{selectedLead.last_contact_at ? new Date(selectedLead.last_contact_at).toLocaleString('pt-BR') : 'Ainda não contatado'}</p>
            </div>
          </div>
          
          <div className="lead-detail-full" style={{marginTop: '20px'}}>
            <label>Mensagem / Respostas da Triagem</label>
            <pre className="lead-message-box">{selectedLead.message}</pre>
          </div>
        </div>

        <div className="admin__settings-grid glass-card" style={{padding: '24px'}}>
          <div className="admin__setting admin__setting--full">
            <label>Próxima Ação</label>
            <input 
              type="text" 
              value={selectedLead.next_action || ''} 
              onChange={e => setSelectedLead({...selectedLead, next_action: e.target.value})}
              onBlur={e => updateLeadField('next_action', e.target.value)}
              placeholder="Ex: Ligar na sexta-feira às 14h" 
            />
          </div>
          <div className="admin__setting admin__setting--full">
            <label>Observações Internas</label>
            <textarea 
              value={selectedLead.notes || ''} 
              onChange={e => setSelectedLead({...selectedLead, notes: e.target.value})}
              onBlur={e => updateLeadField('notes', e.target.value)}
              rows={4} 
              placeholder="Anotações sobre a negociação..." 
            />
          </div>
        </div>
      </div>
    );
  }

  // Filter Logic
  const filteredLeads = leads.filter(l => {
    const matchSearch = (l.proposal_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (l.business_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchSolution = solutionFilter ? l.solution_interest === solutionFilter : true;
    return matchSearch && matchSolution;
  });

  const uniqueSolutions = [...new Set(leads.map(l => l.solution_interest).filter(Boolean))];

  return (
    <div className="admin__content animate-in">
      <div className="admin__content-header">
        <h1 className="admin__title">Pipeline de Propostas</h1>
        <div style={{display: 'flex', gap: '12px'}}>
          <input 
            type="text" 
            placeholder="Buscar ID ou Nome..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-light)', color: 'white'}}
          />
          <select 
            value={solutionFilter} 
            onChange={e => setSolutionFilter(e.target.value)}
            style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-light)', color: 'white'}}
          >
            <option value="">Todas as Soluções</option>
            {uniqueSolutions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      
      <div className="admin__pipeline">
        {Object.keys(statusLabels).map(statusKey => {
          const colLeads = filteredLeads.filter(l => l.status === statusKey);
          return (
            <div key={statusKey} className="admin__pipeline-col glass-card">
              <div className="pipeline-col-header" style={{borderBottomColor: statusColors[statusKey]}}>
                <h3>{statusLabels[statusKey]}</h3>
                <span className="pipeline-count">{colLeads.length}</span>
              </div>
              <div className="pipeline-col-body">
                {colLeads.map(lead => (
                  <div key={lead.id} className="pipeline-card" onClick={() => setSelectedLead(lead)}>
                    <div className="pipeline-card-id">{lead.proposal_id || 'Sem ID'}</div>
                    <div className="pipeline-card-name">{lead.name}</div>
                    <div className="pipeline-card-sol">{lead.solution_interest}</div>
                    <div className="pipeline-card-date">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</div>
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

const CasesTab = ({ casesData, onUpdate }) => {
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
      tech_stack: Array.isArray(c.tech_stack) ? c.tech_stack.join(', ') : (Array.isArray(c.technologies) ? c.technologies.join(', ') : ''),
      cover_image_url: c.cover_image_url || c.coverImage || '',
      video_url: c.video_url || '',
      demo_url: c.demo_url || '',
      display_order: c.display_order || 0,
      is_published: c.is_published !== false
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
      is_published: true
    });
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Tem certeza que deseja excluir este case? Esta ação não pode ser desfeita.')) return;
    if (!supabase) return;
    try {
      await supabase.from('cases').delete().eq('id', id);
      onUpdate();
    } catch(err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      const payload = {
        ...formData,
        features: formData.features.split(',').map(s => s.trim()).filter(Boolean),
        tech_stack: formData.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
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
      alert('Erro ao salvar. Verifique se o slug é único.');
    }
  };

  if (editingCase !== null) {
    return (
      <div className="admin__content animate-in">
        <div className="admin__content-header">
          <h1 className="admin__title">{isCreating ? 'Novo Case' : 'Editar Case'}</h1>
          <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCase(null); setIsCreating(false); }}>Cancelar</button>
        </div>
        <form onSubmit={handleSave} className="admin__settings-grid glass-card" style={{padding: '24px', marginTop: '20px'}}>
          
          <div className="admin__setting">
            <label>Título *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="admin__setting">
            <label>Slug (URL amigável) *</label>
            <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required placeholder="ex: meu-novo-case" />
          </div>
          <div className="admin__setting">
            <label>Categoria / Segmento *</label>
            <input type="text" value={formData.segment} onChange={e => setFormData({...formData, segment: e.target.value})} required />
          </div>
          <div className="admin__setting">
            <label>Ordem de Exibição</label>
            <input type="number" value={formData.display_order} onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})} />
          </div>

          <div className="admin__setting admin__setting--full">
            <label>Resumo Curto *</label>
            <textarea value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} rows={2} required />
          </div>
          <div className="admin__setting admin__setting--full">
            <label>Descrição Completa</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} />
          </div>

          <div className="admin__setting">
            <label>Funcionalidades (separadas por vírgula)</label>
            <input type="text" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} placeholder="Agenda, Relatórios, etc" />
          </div>
          <div className="admin__setting">
            <label>Tech Stack (separadas por vírgula)</label>
            <input type="text" value={formData.tech_stack} onChange={e => setFormData({...formData, tech_stack: e.target.value})} placeholder="React, Supabase, Node" />
          </div>

          <div className="admin__setting">
            <label>URL Imagem de Capa</label>
            <input type="text" value={formData.cover_image_url} onChange={e => setFormData({...formData, cover_image_url: e.target.value})} placeholder="/assets/imagem.jpg ou https://..." />
          </div>
          <div className="admin__setting">
            <label>Link do Case (Demo)</label>
            <input type="url" value={formData.demo_url} onChange={e => setFormData({...formData, demo_url: e.target.value})} placeholder="https://..." />
          </div>
          <div className="admin__setting admin__setting--full">
            <label>Video URL (YouTube/Vimeo Embed)</label>
            <input type="url" value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} placeholder="https://..." />
          </div>

          <div className="admin__setting">
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
              <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} style={{width: 'auto', cursor: 'pointer'}} />
              Publicado (Visível no site)
            </label>
          </div>

          <div className="admin__setting admin__setting--full" style={{marginTop: '20px', display: 'flex', gap: '16px'}}>
            <button type="submit" className="btn btn-primary"><Save size={16} /> {isCreating ? 'Criar Case' : 'Salvar Alterações'}</button>
            {!isCreating && (
              <button type="button" className="btn btn-secondary" style={{color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)'}} onClick={() => handleDelete(editingCase.id)}>
                Excluir
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin__content animate-in">
      <div className="admin__content-header">
        <h1 className="admin__title">Gestão de Cases</h1>
        <button className="btn btn-primary btn-sm" onClick={handleCreateNew}><Plus size={16} /> Novo Case</button>
      </div>
      <div className="admin__list">
        {casesData.map((c) => (
          <div key={c.id || c.slug} className="admin__list-item glass-card">
            <div className="admin__list-info">
              <h3>{c.title || c.name}</h3>
              <p>{c.segment}</p>
            </div>
            {c.is_published !== false ? (
              <span className="badge badge-success">● Publicado</span>
            ) : (
              <span className="badge" style={{background: 'rgba(255,255,255,0.1)'}}>Oculto</span>
            )}
            <div className="admin__list-actions">
              <button className="admin__list-btn" title="Editar" onClick={() => handleEdit(c)}><Edit size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SolutionsTab = () => {
  const [solutionsData, setSolutionsData] = useState([]);
  const [editingSolution, setEditingSolution] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    if (!supabase) {
      setSolutionsData(staticSolutions);
      return;
    }
    const { data, error } = await supabase.from('solutions').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      setSolutionsData(staticSolutions);
    } else {
      if (data && data.length > 0) {
        setSolutionsData(data);
      } else {
        setSolutionsData(staticSolutions);
      }
    }
  };

  const handleEdit = (s) => {
    setEditingSolution(s);
    setIsCreating(false);
    setFormData({
      slug: s.slug || '',
      name: s.name || '',
      audience: s.audience || '',
      headline: s.headline || '',
      subheadline: s.subheadline || '',
      pricing: s.pricing ? JSON.stringify(s.pricing, null, 2) : '{}',
      features: Array.isArray(s.features) ? s.features.join(', ') : '',
      is_published: s.is_published !== false
    });
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingSolution({});
    setFormData({
      slug: '',
      name: '',
      audience: '',
      headline: '',
      subheadline: '',
      pricing: '{\n  "regularPrice": 0,\n  "launchPrice": 0\n}',
      features: '',
      is_published: true
    });
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Excluir esta solução?')) return;
    if (!supabase) return;
    try {
      await supabase.from('solutions').delete().eq('id', id);
      fetchSolutions();
    } catch(err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      let parsedPricing = {};
      try { parsedPricing = JSON.parse(formData.pricing); } catch(e) {}
      
      const payload = {
        ...formData,
        pricing: parsedPricing,
        features: formData.features.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (isCreating) {
        await supabase.from('solutions').insert([payload]);
      } else {
        await supabase.from('solutions').update(payload).eq('id', editingSolution.id);
      }
      setEditingSolution(null);
      setIsCreating(false);
      fetchSolutions();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar.');
    }
  };

  if (editingSolution !== null) {
    return (
      <div className="admin__content animate-in">
        <div className="admin__content-header">
          <h1 className="admin__title">{isCreating ? 'Nova Solução' : 'Editar Solução'}</h1>
          <button className="btn btn-secondary btn-sm" onClick={() => { setEditingSolution(null); setIsCreating(false); }}>Cancelar</button>
        </div>
        <form onSubmit={handleSave} className="admin__settings-grid glass-card" style={{padding: '24px', marginTop: '20px'}}>
          <div className="admin__setting">
            <label>Nome *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="admin__setting">
            <label>Slug (URL) *</label>
            <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
          </div>
          <div className="admin__setting admin__setting--full">
            <label>Público Alvo</label>
            <input type="text" value={formData.audience} onChange={e => setFormData({...formData, audience: e.target.value})} />
          </div>
          <div className="admin__setting admin__setting--full">
            <label>Headline (Descrição Principal)</label>
            <input type="text" value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} />
          </div>
          <div className="admin__setting admin__setting--full">
            <label>Subheadline</label>
            <textarea value={formData.subheadline} onChange={e => setFormData({...formData, subheadline: e.target.value})} rows={2} />
          </div>
          <div className="admin__setting">
            <label>Funcionalidades (separadas por vírgula)</label>
            <input type="text" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
          </div>
          <div className="admin__setting">
            <label>Preço (JSON)</label>
            <textarea value={formData.pricing} onChange={e => setFormData({...formData, pricing: e.target.value})} rows={3} style={{fontFamily: 'monospace'}} />
          </div>
          <div className="admin__setting">
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
              <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} />
              Publicado
            </label>
          </div>
          <div className="admin__setting admin__setting--full" style={{marginTop: '20px', display: 'flex', gap: '16px'}}>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Salvar</button>
            {!isCreating && editingSolution.id && (
              <button type="button" className="btn btn-secondary" style={{color: '#ef4444'}} onClick={() => handleDelete(editingSolution.id)}>Excluir</button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin__content animate-in">
      <div className="admin__content-header">
        <h1 className="admin__title">Soluções (Catálogo)</h1>
        <button className="btn btn-primary btn-sm" onClick={handleCreateNew}><Plus size={16} /> Nova Solução</button>
      </div>
      <div className="admin__list">
        {solutionsData.map((s) => (
          <div key={s.id || s.slug} className="admin__list-item glass-card">
            <div className="admin__list-info">
              <h3>{s.name}</h3>
              <p>{s.audience}</p>
            </div>
            {s.is_published === false ? (
              <span className="badge" style={{background: 'rgba(255,255,255,0.1)'}}>Oculto</span>
            ) : (
              <span className="badge badge-success">Ativo</span>
            )}
            <div className="admin__list-actions">
              <button className="admin__list-btn" title="Editar" onClick={() => handleEdit(s)}><Edit size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsTab = ({ leads }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!supabase) return setLoading(false);
      try {
        const { data } = await supabase.from('analytics_events').select('*');
        if (data) setEvents(data);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalProposals = leads.length;
  const conversoes = leads.filter(l => l.status === 'fechado').length;
  
  const pageViews = events.filter(e => e.event_type === 'page_view').length;
  const whatsappClicks = events.filter(e => e.event_label === 'whatsapp_proposal_send').length;
  
  const conversionRate = pageViews > 0 ? ((totalProposals / pageViews) * 100).toFixed(1) : 0;

  // Group by solution
  const solutionStats = {};
  leads.forEach(l => {
    const sol = l.solution_interest || 'Outros';
    if(!solutionStats[sol]) solutionStats[sol] = { generated: 0, closed: 0 };
    solutionStats[sol].generated++;
    if(l.status === 'fechado') solutionStats[sol].closed++;
  });

  return (
    <div className="admin__content animate-in">
      <h1 className="admin__title">Analytics de Performance</h1>
      
      {loading ? (
        <div style={{display:'flex',justifyContent:'center',padding:'40px'}}><Loader2 size={32} className="spin" style={{color:'var(--accent)'}}/></div>
      ) : (
        <>
          <div className="admin__cards" style={{marginTop: '24px'}}>
            <div className="admin__card">
              <div>
                <span className="admin__card-value">{pageViews}</span>
                <span className="admin__card-label">Visitas de Página</span>
              </div>
            </div>
            <div className="admin__card">
              <div>
                <span className="admin__card-value">{totalProposals}</span>
                <span className="admin__card-label">Propostas Geradas</span>
              </div>
            </div>
            <div className="admin__card">
              <div>
                <span className="admin__card-value">{conversionRate}%</span>
                <span className="admin__card-label">Conv. Visita → Proposta</span>
              </div>
            </div>
            <div className="admin__card">
              <div>
                <span className="admin__card-value">{whatsappClicks}</span>
                <span className="admin__card-label">Cliques no WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="admin__recent" style={{marginTop: '40px'}}>
            <h2>Performance por Solução</h2>
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Solução</th>
                    <th>Propostas Geradas</th>
                    <th>Fechamentos</th>
                    <th>Taxa de Fechamento</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(solutionStats).map(sol => {
                    const stats = solutionStats[sol];
                    const rate = stats.generated > 0 ? ((stats.closed / stats.generated) * 100).toFixed(1) : 0;
                    return (
                      <tr key={sol}>
                        <td><strong>{sol}</strong></td>
                        <td>{stats.generated}</td>
                        <td>{stats.closed}</td>
                        <td>{rate}%</td>
                      </tr>
                    );
                  })}
                  {Object.keys(solutionStats).length === 0 && (
                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Nenhuma métrica encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SettingsTab = () => (
  <div className="admin__content animate-in">
    <h1 className="admin__title">Configurações</h1>
    <div className="admin__settings-grid">
      <div className="admin__setting">
        <label>WhatsApp Principal</label>
        <input type="text" defaultValue={siteConfig.contact.whatsapp.displayNumber} readOnly />
      </div>
      <div className="admin__setting">
        <label>E-mail</label>
        <input type="email" defaultValue={siteConfig.contact.email} readOnly />
      </div>
      <div className="admin__setting">
        <label>Instagram</label>
        <input type="text" defaultValue={siteConfig.contact.instagram.handle} readOnly />
      </div>
      <div className="admin__setting">
        <label>Localização</label>
        <input type="text" defaultValue={siteConfig.contact.location} readOnly />
      </div>
    </div>
    <p className="admin__settings-note">⚠️ Configurações do banco de dados em implementação.</p>
  </div>
);

export default AdminPanel;

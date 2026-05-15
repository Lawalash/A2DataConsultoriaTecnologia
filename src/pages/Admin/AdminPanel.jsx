import React, { useState } from 'react';
import { LayoutDashboard, Package, Briefcase, Users, Settings, Plus, Eye, Edit, BarChart3, Lock, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import solutions from '../../data/solutions';
import cases from '../../data/cases';
import siteConfig from '../../data/siteConfig';
import './AdminPanel.css';

// Mock leads data
const mockLeads = [
  { id: 1, name: 'Maria Silva', whatsapp: '(83) 99999-0001', solution: 'Nail Designers', message: 'Quero saber mais sobre o sistema', date: '2026-05-10', status: 'Novo' },
  { id: 2, name: 'João Oliveira', whatsapp: '(83) 99999-0002', solution: 'A2 FORM Controller', message: 'Preciso de uma demo', date: '2026-05-09', status: 'Em contato' },
  { id: 3, name: 'Ana Costa', whatsapp: '(83) 99999-0003', solution: 'Nail Designers', message: 'Gostei do teste grátis', date: '2026-05-08', status: 'Convertido' },
];

const statusColors = {
  'Novo': '#3b82f6',
  'Em contato': '#f59e0b',
  'Convertido': '#10b981',
  'Descartado': '#ef4444',
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check initial session
  React.useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setIsAuthenticated(true);
      });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      // Mock login for offline dev if Supabase is not configured
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
    { id: 'leads', label: 'Leads', icon: Users },
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
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'solutions' && <SolutionsTab />}
        {activeTab === 'cases' && <CasesTab />}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
};

const DashboardTab = () => (
  <div className="admin__content">
    <h1 className="admin__title">Olá, Ricardo! 👋</h1>
    <p className="admin__subtitle">Visão geral da vitrine A2 Data</p>

    <div className="admin__cards">
      <div className="admin__card">
        <Package size={24} className="admin__card-icon" />
        <div>
          <span className="admin__card-value">{solutions.length}</span>
          <span className="admin__card-label">Soluções</span>
        </div>
      </div>
      <div className="admin__card">
        <Briefcase size={24} className="admin__card-icon" />
        <div>
          <span className="admin__card-value">{cases.length}</span>
          <span className="admin__card-label">Cases</span>
        </div>
      </div>
      <div className="admin__card">
        <Users size={24} className="admin__card-icon" />
        <div>
          <span className="admin__card-value">{mockLeads.length}</span>
          <span className="admin__card-label">Leads</span>
        </div>
      </div>
      <div className="admin__card">
        <BarChart3 size={24} className="admin__card-icon" />
        <div>
          <span className="admin__card-value">—</span>
          <span className="admin__card-label">Analytics</span>
        </div>
      </div>
    </div>

    <div className="admin__recent">
      <h2>Leads Recentes</h2>
      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr><th>Nome</th><th>Solução</th><th>Status</th><th>Data</th></tr>
          </thead>
          <tbody>
            {mockLeads.slice(0, 5).map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.solution}</td>
                <td><span className="admin__status" style={{ background: statusColors[lead.status] + '20', color: statusColors[lead.status] }}>{lead.status}</span></td>
                <td>{lead.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const SolutionsTab = () => (
  <div className="admin__content">
    <div className="admin__content-header">
      <h1 className="admin__title">Soluções</h1>
      <button className="btn btn-primary btn-sm"><Plus size={16} /> Nova Solução</button>
    </div>
    <div className="admin__list">
      {solutions.map((s) => (
        <div key={s.id} className="admin__list-item">
          <span className="admin__list-icon">{s.icon}</span>
          <div className="admin__list-info">
            <h3>{s.name}</h3>
            <p>{s.audience}</p>
          </div>
          <span className="admin__list-price">
            {s.pricing.launchPrice ? `R$ ${s.pricing.launchPrice.toFixed(2).replace('.', ',')}` : `R$ ${s.pricing.regularPrice.toFixed(2).replace('.', ',')}`}/mês
          </span>
          <div className="admin__list-actions">
            <button className="admin__list-btn" title="Editar"><Edit size={16} /></button>
            <button className="admin__list-btn" title="Visibilidade"><Eye size={16} /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CasesTab = () => (
  <div className="admin__content">
    <div className="admin__content-header">
      <h1 className="admin__title">Cases</h1>
      <button className="btn btn-primary btn-sm"><Plus size={16} /> Novo Case</button>
    </div>
    <div className="admin__list">
      {cases.map((c) => (
        <div key={c.id} className="admin__list-item">
          <div className="admin__list-info">
            <h3>{c.name}</h3>
            <p>{c.segment}</p>
          </div>
          <span className="badge badge-success">● {c.status}</span>
          <div className="admin__list-actions">
            <button className="admin__list-btn" title="Editar"><Edit size={16} /></button>
            <button className="admin__list-btn" title="Visibilidade"><Eye size={16} /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LeadsTab = () => (
  <div className="admin__content">
    <h1 className="admin__title">Leads</h1>
    <div className="admin__table-wrap">
      <table className="admin__table">
        <thead>
          <tr><th>Nome</th><th>WhatsApp</th><th>Solução</th><th>Mensagem</th><th>Data</th><th>Status</th></tr>
        </thead>
        <tbody>
          {mockLeads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.whatsapp}</td>
              <td>{lead.solution}</td>
              <td className="admin__table-msg">{lead.message}</td>
              <td>{lead.date}</td>
              <td><span className="admin__status" style={{ background: statusColors[lead.status] + '20', color: statusColors[lead.status] }}>{lead.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SettingsTab = () => (
  <div className="admin__content">
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
      <div className="admin__setting admin__setting--full">
        <label>SEO Title</label>
        <input type="text" defaultValue={siteConfig.seo.title} readOnly />
      </div>
      <div className="admin__setting admin__setting--full">
        <label>Meta Description</label>
        <textarea defaultValue={siteConfig.seo.description} readOnly rows={3} />
      </div>
    </div>
    <p className="admin__settings-note">⚠️ Edição habilitada em versão futura com integração ao banco de dados.</p>
  </div>
);

export default AdminPanel;

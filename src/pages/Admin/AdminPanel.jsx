import React, { useCallback, useEffect, useState } from 'react';
import {
  Bot,
  Briefcase,
  Columns3,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Server,
  ShieldAlert,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { cockpitService, isMissingSchemaError } from '../../services/cockpitService';
import ExecutiveDashboard from './views/ExecutiveDashboard';
import ProjectDetailView from './views/ProjectDetailView';
import ImprovementsKanbanView from './views/ImprovementsKanbanView';
import BillingSettingsView from './views/BillingSettingsView';
import LegacyShowcaseView from './views/LegacyShowcaseView';
import './AdminPanel.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Executivo', icon: LayoutDashboard },
  { id: 'project_detail', label: 'Projetos & Clientes', icon: Server },
  { id: 'kanban', label: 'Esteira de Melhorias', icon: Columns3 },
  { id: 'billing', label: 'Robô & Configurações', icon: Bot },
];

const AdminPanel = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Cockpit State
  const [loadingData, setLoadingData] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    window.clearTimeout(window.__a2ToastTimer);
    window.__a2ToastTimer = window.setTimeout(() => setToast(null), 5000);
  }, []);

  const loadCockpitData = useCallback(async () => {
    setLoadingData(true);
    try {
      const snapshot = await cockpitService.fetchCockpitSnapshot();
      setProjects(snapshot.projects);
      setClients(snapshot.clients);
      setImprovements(snapshot.improvements);
      setLogs(snapshot.logs);
      setTemplates(snapshot.templates);
      setSchemaMissing(false);
      setSelectedProjectId((prev) => prev || snapshot.projects[0]?.id || null);
    } catch (err) {
      if (isMissingSchemaError(err)) {
        setSchemaMissing(true);
      } else {
        showToast(err.message || 'Erro ao carregar dados do Cockpit.', 'error');
      }
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  const verifySessionAndLoad = useCallback(
    async (nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setIsMasterAdmin(false);
        setAuthChecking(false);
        return;
      }

      const check = await cockpitService.checkIsMasterAdmin();
      if (check.missingSchema) {
        setSchemaMissing(true);
        setIsMasterAdmin(true); // Permite visualizar o guia de setup se autenticado antes da migration
        setAuthChecking(false);
        return;
      }

      setIsMasterAdmin(check.allowed);
      setAuthChecking(false);
      if (check.allowed) {
        loadCockpitData();
      }
    },
    [loadCockpitData],
  );

  useEffect(() => {
    if (!supabase) {
      setAuthChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      verifySessionAndLoad(currentSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      verifySessionAndLoad(nextSession);
    });

    return () => subscription?.unsubscribe();
  }, [verifySessionAndLoad]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setLoginError('Supabase não configurado no .env.local.');
      return;
    }

    setLoggingIn(true);
    setLoginError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email.trim(),
      password: loginForm.password,
    });
    setLoggingIn(false);

    if (error) {
      setLoginError('Credenciais inválidas ou usuário não confirmado.');
      return;
    }

    if (data?.session) {
      verifySessionAndLoad(data.session);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setIsMasterAdmin(false);
  };

  const handleOpenProject = (projectId) => {
    setSelectedProjectId(projectId);
    setActiveView('project_detail');
  };

  if (authChecking) {
    return (
      <div className="cockpit-auth">
        <div className="cockpit-loading-inline">
          <Loader2 size={28} className="spin" /> Validando sessão segura...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="cockpit-auth">
        <form className="cockpit-auth__card" onSubmit={handleLogin}>
          <div className="cockpit-auth__head">
            <div className="cockpit-auth__badge">
              <Lock size={22} />
            </div>
            <h1>A2 Data · Cockpit</h1>
            <p>Acesso exclusivo para Administração Master</p>
          </div>

          {loginError && <div className="cockpit-auth__error">{loginError}</div>}

          <div className="cockpit-field">
            <label>E-mail Master</label>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder="lvtlawalash1@gmail.com"
            />
          </div>

          <div className="cockpit-field">
            <label>Senha</label>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loggingIn} className="cockpit-btn cockpit-btn--primary cockpit-auth__submit">
            {loggingIn ? 'Autenticando...' : 'Entrar no Cockpit'}
          </button>
        </form>
      </div>
    );
  }

  if (!isMasterAdmin) {
    return (
      <div className="cockpit-auth">
        <div className="cockpit-auth__card">
          <div className="cockpit-auth__head">
            <div className="cockpit-auth__badge cockpit-auth__badge--danger">
              <ShieldAlert size={24} />
            </div>
            <h1>Acesso Negado</h1>
            <p>
              O usuário <strong>{session.user?.email}</strong> não possui permissão de Admin Master em{' '}
              <code>a2_admin_users</code>.
            </p>
          </div>
          <button type="button" className="cockpit-btn cockpit-btn--ghost cockpit-auth__submit" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sair e trocar de conta</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cockpit">
      {/* Sidebar Fixa */}
      <aside className="cockpit__sidebar">
        <div className="cockpit__brand">
          <div className="cockpit__brand-mark">A2</div>
          <div>
            <strong>A2 Data</strong>
            <span>Cockpit Central</span>
          </div>
        </div>

        <nav className="cockpit__nav">
          <span className="cockpit__nav-group">Operação</span>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`cockpit__nav-item ${activeView === id ? 'cockpit__nav-item--active' : ''}`}
              onClick={() => setActiveView(id)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}

          <span className="cockpit__nav-group">Site Institucional</span>
          <button
            type="button"
            className={`cockpit__nav-item ${activeView === 'legacy' ? 'cockpit__nav-item--active' : ''}`}
            onClick={() => setActiveView('legacy')}
          >
            <Briefcase size={17} />
            <span>Vitrine & Leads</span>
          </button>
        </nav>

        <div className="cockpit__sidebar-foot">
          <div className="cockpit__user-badge" title={session.user?.email}>
            <span className="cockpit__user-dot" />
            <span>{session.user?.email}</span>
          </div>
          <button type="button" className="cockpit__logout" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="cockpit__main">
        {toast && (
          <div className={`cockpit-toast cockpit-toast--${toast.type}`}>
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)}>
              ×
            </button>
          </div>
        )}

        {schemaMissing ? (
          <div className="cockpit__view">
            <div className="cockpit-banner cockpit-banner--warning">
              <ShieldAlert size={20} />
              <div>
                <strong>Migrations do Cockpit ainda não aplicadas no Supabase A2DATASITE.</strong>
                <p style={{ marginTop: '6px' }}>
                  Execute os comandos em <code>DEPLOY_COCKPIT.md</code> (<code>supabase db push</code>) para criar as tabelas{' '}
                  <code>a2_projects</code>, <code>a2_clients</code>, <code>a2_improvements</code> e{' '}
                  <code>a2_billing_logs</code>.
                </p>
              </div>
              <button
                type="button"
                className="cockpit-btn cockpit-btn--ghost cockpit-btn--sm"
                onClick={loadCockpitData}
              >
                <RefreshCw size={14} /> Recarregar
              </button>
            </div>
            <LegacyShowcaseView />
          </div>
        ) : loadingData && projects.length === 0 ? (
          <div className="cockpit-loading-inline">
            <Loader2 size={28} className="spin" /> Carregando Cockpit A2 Data...
          </div>
        ) : (
          <>
            {activeView === 'dashboard' && (
              <ExecutiveDashboard
                projects={projects}
                clients={clients}
                improvements={improvements}
                onSelectProject={handleOpenProject}
                onRefresh={loadCockpitData}
                onNotify={showToast}
              />
            )}

            {activeView === 'project_detail' && (
              <ProjectDetailView
                projects={projects}
                selectedProjectId={selectedProjectId}
                clients={clients}
                logs={logs}
                templates={templates}
                onSelectProject={setSelectedProjectId}
                onBackDashboard={() => setActiveView('dashboard')}
                onRefresh={loadCockpitData}
                onNotify={showToast}
              />
            )}

            {activeView === 'kanban' && (
              <ImprovementsKanbanView
                projects={projects}
                improvements={improvements}
                onRefresh={loadCockpitData}
                onNotify={showToast}
              />
            )}

            {activeView === 'billing' && (
              <BillingSettingsView
                projects={projects}
                clients={clients}
                templates={templates}
                logs={logs}
                onRefresh={loadCockpitData}
                onNotify={showToast}
              />
            )}

            {activeView === 'legacy' && <LegacyShowcaseView />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { cockpitService, formatDateBR } from '../../../services/cockpitService';

const COLUMNS = [
  { key: 'pending', label: 'Pendente', color: '#64748b' },
  { key: 'in_progress', label: 'Em Andamento', color: '#3b82f6' },
  { key: 'developed', label: 'Desenvolvido', color: '#8b5cf6' },
  { key: 'delivered', label: 'Entregue', color: '#10b981' },
];

const PRIORITY_META = {
  low: { label: 'Baixa', tone: 'muted' },
  medium: { label: 'Média', tone: 'info' },
  high: { label: 'Alta', tone: 'warning' },
  urgent: { label: 'Urgente', tone: 'danger' },
};

const EMPTY_CARD = {
  project_id: '',
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  target_date: '',
  delivered_at: '',
};

const ImprovementsKanbanView = ({ projects, improvements, onRefresh, onNotify }) => {
  const [projectFilter, setProjectFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_CARD);
  const [saving, setSaving] = useState(false);

  const projectMap = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return improvements.filter((item) => {
      if (projectFilter && item.project_id !== projectFilter) return false;
      if (priorityFilter && item.priority !== priorityFilter) return false;
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !(item.description || '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [improvements, projectFilter, priorityFilter, search]);

  const openCreate = (defaultStatus = 'pending') => {
    setEditingItem(null);
    setForm({ ...EMPTY_CARD, status: defaultStatus });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      project_id: item.project_id || '',
      title: item.title || '',
      description: item.description || '',
      status: item.status || 'pending',
      priority: item.priority || 'medium',
      target_date: item.target_date || '',
      delivered_at: item.delivered_at ? item.delivered_at.slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        project_id: form.project_id || null,
        target_date: form.target_date || null,
        delivered_at:
          form.status === 'delivered' && form.delivered_at
            ? new Date(`${form.delivered_at}T12:00:00`).toISOString()
            : form.status === 'delivered'
            ? editingItem?.delivered_at || new Date().toISOString()
            : null,
      };
      await cockpitService.saveImprovement(payload, editingItem?.id || null);
      setModalOpen(false);
      await onRefresh();
      onNotify(
        editingItem ? 'Melhoria atualizada.' : 'Melhoria adicionada à esteira.',
        'success',
      );
    } catch (err) {
      onNotify(err.message || 'Erro ao salvar melhoria.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    if (!window.confirm(`Excluir "${editingItem.title}" da esteira?`)) return;
    try {
      await cockpitService.deleteImprovement(editingItem.id);
      setModalOpen(false);
      await onRefresh();
      onNotify('Card removido.', 'info');
    } catch (err) {
      onNotify(err.message || 'Erro ao excluir card.', 'error');
    }
  };

  const handleMoveStatus = async (item, nextStatus) => {
    if (item.status === nextStatus) return;
    try {
      await cockpitService.updateImprovementStatus(item.id, nextStatus);
      await onRefresh();
    } catch (err) {
      onNotify(err.message || 'Erro ao mover card.', 'error');
    }
  };

  const handleDropOnColumn = async (colKey) => {
    setDragOverCol(null);
    if (!draggedId) return;
    const item = improvements.find((i) => i.id === draggedId);
    setDraggedId(null);
    if (item && item.status !== colKey) {
      await handleMoveStatus(item, colKey);
    }
  };

  return (
    <div className="cockpit__view animate-in">
      <header className="cockpit__header">
        <div>
          <span className="cockpit__eyebrow">Roadmap & Entregas</span>
          <h1 className="cockpit__title">Esteira de Melhorias</h1>
          <p className="cockpit__subtitle">
            Arraste os cards entre as colunas ou clique para editar detalhes, prioridade e datas.
          </p>
        </div>

        <div className="cockpit__header-actions">
          <button
            type="button"
            className="cockpit-btn cockpit-btn--primary"
            onClick={() => openCreate('pending')}
          >
            <Plus size={16} />
            <span>Nova Melhoria</span>
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="cockpit-filters-bar">
        <div className="cockpit-search-box">
          <Search size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar melhoria por título ou descrição..."
          />
        </div>

        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="">Todos os Projetos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">Todas as Prioridades</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </div>

      {/* Board Kanban 4 Colunas Fixas */}
      <div className="cockpit-kanban">
        {COLUMNS.map((col, colIndex) => {
          const colItems = filtered.filter((item) => item.status === col.key);
          const nextCol = COLUMNS[colIndex + 1];

          return (
            <div
              key={col.key}
              className={`cockpit-kanban__col ${
                dragOverCol === col.key ? 'cockpit-kanban__col--dragover' : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col.key);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => {
                e.preventDefault();
                handleDropOnColumn(col.key);
              }}
            >
              <div className="cockpit-kanban__col-head" style={{ borderTopColor: col.color }}>
                <div className="cockpit-kanban__col-title">
                  <span className="cockpit-kanban__dot" style={{ background: col.color }} />
                  <h3>{col.label}</h3>
                  <span className="cockpit-kanban__count">{colItems.length}</span>
                </div>
                <button
                  type="button"
                  className="cockpit-icon-btn"
                  onClick={() => openCreate(col.key)}
                  title={`Adicionar em ${col.label}`}
                >
                  <Plus size={15} />
                </button>
              </div>

              <div className="cockpit-kanban__col-body">
                {colItems.map((item) => {
                  const proj = item.project_id ? projectMap[item.project_id] : null;
                  const prio = PRIORITY_META[item.priority] || PRIORITY_META.medium;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDraggedId(item.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverCol(null);
                      }}
                      className={`cockpit-kanban-card ${
                        draggedId === item.id ? 'cockpit-kanban-card--dragging' : ''
                      }`}
                      onClick={() => openEdit(item)}
                    >
                      <div className="cockpit-kanban-card__top">
                        <span className={`cockpit-pill cockpit-pill--${prio.tone}`}>{prio.label}</span>
                        {proj && <span className="cockpit-kanban-card__proj">{proj.name}</span>}
                      </div>

                      <h4 className="cockpit-kanban-card__title">{item.title}</h4>
                      {item.description && (
                        <p className="cockpit-kanban-card__desc">{item.description}</p>
                      )}

                      <div className="cockpit-kanban-card__foot">
                        <span className="cockpit-kanban-card__date">
                          {item.status === 'delivered' && item.delivered_at ? (
                            <>
                              <CheckCircle2 size={12} /> Entregue {formatDateBR(item.delivered_at)}
                            </>
                          ) : item.target_date ? (
                            <>
                              <Calendar size={12} /> Prev. {formatDateBR(item.target_date)}
                            </>
                          ) : (
                            <>Criado {formatDateBR(item.created_at)}</>
                          )}
                        </span>

                        {nextCol && (
                          <button
                            type="button"
                            className="cockpit-kanban-card__advance"
                            title={`Mover para ${nextCol.label}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveStatus(item, nextCol.key);
                            }}
                          >
                            <span>{nextCol.label}</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colItems.length === 0 && (
                  <div className="cockpit-kanban__empty">Arraste um card ou clique em +</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Criar / Editar Card */}
      {modalOpen && (
        <div className="cockpit-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="cockpit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cockpit-modal__head">
              <h3>{editingItem ? 'Editar Melhoria' : 'Nova Melhoria'}</h3>
              <button type="button" className="cockpit-icon-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="cockpit-form">
              <div className="cockpit-form-grid">
                <div className="cockpit-field cockpit-field--full">
                  <label>Título *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Relatório mensal em PDF com fechamento de caixa"
                  />
                </div>

                <div className="cockpit-field">
                  <label>Projeto Vinculado</label>
                  <select
                    value={form.project_id}
                    onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  >
                    <option value="">Geral / A2 Data</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cockpit-field">
                  <label>Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cockpit-field">
                  <label>Prioridade *</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div className="cockpit-field">
                  <label>Previsão de Entrega</label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                  />
                </div>

                {form.status === 'delivered' && (
                  <div className="cockpit-field cockpit-field--full">
                    <label>Data de Entrega</label>
                    <input
                      type="date"
                      value={form.delivered_at}
                      onChange={(e) => setForm({ ...form, delivered_at: e.target.value })}
                    />
                  </div>
                )}

                <div className="cockpit-field cockpit-field--full">
                  <label>Descrição / Escopo Técnico</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detalhe requisitos, regras de negócio ou observações de deploy..."
                  />
                </div>
              </div>

              <div className="cockpit-modal__foot cockpit-modal__foot--split">
                {editingItem ? (
                  <button
                    type="button"
                    className="cockpit-btn cockpit-btn--danger-ghost"
                    onClick={handleDelete}
                  >
                    <Trash2 size={15} />
                    <span>Excluir</span>
                  </button>
                ) : (
                  <span />
                )}
                <div className="cockpit-modal__foot-right">
                  <button
                    type="button"
                    className="cockpit-btn cockpit-btn--ghost"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="cockpit-btn cockpit-btn--primary" disabled={saving}>
                    {saving ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Criar Melhoria'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovementsKanbanView;

import React, { useMemo, useRef, useState } from 'react';
import { Loader2, Pause, Play, Plus, Send, Square, Trash2, Upload } from 'lucide-react';
import { cockpitService } from '../../../services/cockpitService';

const STATUS_META = {
  waiting: { label: 'Aguardando', tone: 'muted' },
  sending: { label: 'Enviando...', tone: 'info' },
  sent: { label: 'Enviado', tone: 'success' },
  error: { label: 'Erro', tone: 'danger' },
};

const DEFAULT_TEMPLATE =
  'Olá, {nome_studio}! Tudo bem? Gravei um vídeo rápido mostrando como o sistema da A2 Data pode organizar sua agenda, clientes e financeiro. Posso te explicar melhor?';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let idSeq = 0;
const nextId = () => `c${Date.now()}-${idSeq++}`;

const parseContacts = (raw) =>
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.search(/[;\t]/);
      if (idx === -1) return null;
      const name = line.slice(0, idx).trim();
      const phone = line.slice(idx + 1).trim();
      if (!name || phone.replace(/\D/g, '').length < 10) return null;
      return { id: nextId(), name, phone, status: 'waiting', error: '' };
    })
    .filter(Boolean);

const CampaignProspectingPanel = ({ onNotify }) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [rawContacts, setRawContacts] = useState('');
  const [contacts, setContacts] = useState([]);
  const [minDelay, setMinDelay] = useState(25);
  const [maxDelay, setMaxDelay] = useState(55);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const pausedRef = useRef(false);
  const cancelRef = useRef(false);

  const updateContact = (id, patch) =>
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const renderCaption = (name) => template.replaceAll('{nome_studio}', name || 'Studio');

  const stats = useMemo(() => {
    const total = contacts.length;
    const sent = contacts.filter((c) => c.status === 'sent').length;
    const failed = contacts.filter((c) => c.status === 'error').length;
    const pending = contacts.filter((c) => c.status === 'waiting').length;
    const done = sent + failed;
    return { total, sent, failed, pending, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [contacts]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'video/mp4') {
      onNotify('Envie um arquivo .mp4.', 'warning');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      onNotify('O vídeo excede o limite de 50 MB.', 'warning');
      return;
    }
    setUploading(true);
    try {
      const url = await cockpitService.uploadCampaignVideo(file);
      setMediaUrl(url);
      onNotify('Vídeo enviado para o Storage.', 'success');
    } catch (err) {
      onNotify(err.message || 'Erro no upload do vídeo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleImport = () => {
    const parsed = parseContacts(rawContacts);
    if (parsed.length === 0) {
      onNotify('Nenhuma linha válida. Use o formato: Nome do Studio; 83999999999', 'warning');
      return;
    }
    setContacts((prev) => [...prev, ...parsed]);
    setRawContacts('');
    onNotify(`${parsed.length} contato(s) adicionado(s).`, 'success');
  };

  const sendOne = async (contact) => {
    updateContact(contact.id, { status: 'sending', error: '' });
    try {
      await cockpitService.sendCampaignMedia({
        number: contact.phone,
        mediaUrl,
        caption: renderCaption(contact.name),
        fileName: 'apresentacao-a2data.mp4',
        contactName: contact.name,
      });
      updateContact(contact.id, { status: 'sent' });
      return true;
    } catch (err) {
      updateContact(contact.id, { status: 'error', error: err.message || 'Falha no envio' });
      return false;
    }
  };

  const ensureReady = () => {
    if (!mediaUrl.trim()) {
      onNotify('Informe ou envie o vídeo antes de disparar.', 'warning');
      return false;
    }
    if (!template.trim()) {
      onNotify('A mensagem não pode estar vazia.', 'warning');
      return false;
    }
    return true;
  };

  const handleTest = async () => {
    if (!ensureReady()) return;
    const first = contacts.find((c) => c.status !== 'sending');
    if (!first) {
      onNotify('Adicione ao menos um contato para o teste.', 'warning');
      return;
    }
    const ok = await sendOne(first);
    onNotify(ok ? `Teste enviado para ${first.name}.` : 'Falha no teste. Veja o erro na tabela.', ok ? 'success' : 'error');
  };

  const waitInterruptible = async (seconds) => {
    for (let remaining = seconds; remaining > 0; remaining -= 1) {
      if (cancelRef.current) return;
      setCountdown(remaining);
      await sleep(1000);
    }
    setCountdown(0);
  };

  const handleStart = async () => {
    if (running || !ensureReady()) return;
    const lo = Math.max(5, Number(minDelay) || 25);
    const hi = Math.max(lo, Number(maxDelay) || 55);
    const queue = contacts.filter((c) => c.status === 'waiting' || c.status === 'error');
    if (queue.length === 0) {
      onNotify('Nenhum contato pendente.', 'info');
      return;
    }

    cancelRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    setRunning(true);

    for (let i = 0; i < queue.length; i += 1) {
      while (pausedRef.current && !cancelRef.current) await sleep(400);
      if (cancelRef.current) break;

      await sendOne(queue[i]);

      if (i < queue.length - 1 && !cancelRef.current) {
        const wait = Math.round(lo + Math.random() * (hi - lo));
        await waitInterruptible(wait);
      }
    }

    setCountdown(0);
    setRunning(false);
    setPaused(false);
    onNotify(cancelRef.current ? 'Campanha cancelada.' : 'Campanha finalizada.', cancelRef.current ? 'warning' : 'success');
  };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

  const handleCancel = () => {
    cancelRef.current = true;
    pausedRef.current = false;
    setPaused(false);
  };

  return (
    <section className="cockpit__section">
      <div className="cockpit__section-head">
        <h2>Prospecção WhatsApp (Vídeo + Legenda)</h2>
        <span className="cockpit__muted-count">Envio sequencial com intervalo aleatório anti-ban</span>
      </div>

      <div className="cockpit-campaign-grid">
        <div className="cockpit-panel cockpit-campaign-col">
          <span className="cockpit-panel__label">1. Vídeo (MP4)</span>
          <label className="cockpit-btn cockpit-btn--ghost cockpit-btn--sm cockpit-upload-btn">
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            <span>{uploading ? 'Enviando...' : 'Subir arquivo .mp4'}</span>
            <input type="file" accept="video/mp4" onChange={handleUpload} disabled={uploading} hidden />
          </label>
          <div className="cockpit-field">
            <label>ou cole a URL pública (https)</label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://.../campaign-media/video.mp4"
            />
          </div>
          {mediaUrl && /^https:\/\//i.test(mediaUrl) && (
            <video className="cockpit-video-preview" src={mediaUrl} controls preload="metadata" />
          )}
        </div>

        <div className="cockpit-panel cockpit-campaign-col">
          <span className="cockpit-panel__label">2. Mensagem (use {'{nome_studio}'})</span>
          <textarea
            className="cockpit-campaign-textarea"
            rows={6}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
          <div className="cockpit-template-card__preview">
            <span>Preview ({contacts[0]?.name || 'Studio Exemplo'}):</span>
            <p>{renderCaption(contacts[0]?.name || 'Studio Exemplo')}</p>
          </div>
        </div>
      </div>

      <div className="cockpit-panel cockpit-campaign-contacts">
        <span className="cockpit-panel__label">3. Contatos (um por linha: Nome do Studio; 83999999999)</span>
        <textarea
          className="cockpit-campaign-textarea"
          rows={4}
          value={rawContacts}
          onChange={(e) => setRawContacts(e.target.value)}
          placeholder={'Studio Bela; 83999999999\nNails da Ana; 83988887777'}
        />
        <div className="cockpit-row-actions" style={{ justifyContent: 'flex-start' }}>
          <button type="button" className="cockpit-btn cockpit-btn--ghost cockpit-btn--sm" onClick={handleImport}>
            <Plus size={15} />
            <span>Adicionar contatos</span>
          </button>
          <button
            type="button"
            className="cockpit-btn cockpit-btn--ghost cockpit-btn--sm"
            onClick={() =>
              setContacts((prev) => [...prev, { id: nextId(), name: '', phone: '', status: 'waiting', error: '' }])
            }
          >
            <Plus size={15} />
            <span>Linha vazia</span>
          </button>
          {contacts.length > 0 && !running && (
            <button
              type="button"
              className="cockpit-btn cockpit-btn--danger-ghost cockpit-btn--sm"
              onClick={() => setContacts([])}
            >
              <Trash2 size={15} />
              <span>Limpar lista</span>
            </button>
          )}
        </div>

        <div className="cockpit-table-card">
          <table className="cockpit-table">
            <thead>
              <tr>
                <th>Nome do Studio</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => {
                const meta = STATUS_META[c.status];
                return (
                  <tr key={c.id}>
                    <td>
                      <input
                        className="cockpit-inline-input"
                        value={c.name}
                        disabled={running}
                        onChange={(e) => updateContact(c.id, { name: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="cockpit-inline-input cockpit-mono"
                        value={c.phone}
                        disabled={running}
                        onChange={(e) => updateContact(c.id, { phone: e.target.value })}
                      />
                    </td>
                    <td>
                      <span className={`cockpit-pill cockpit-pill--${meta.tone}`}>{meta.label}</span>
                      {c.error && <div className="cockpit-table__sub text-danger">{c.error}</div>}
                    </td>
                    <td>
                      <div className="cockpit-row-actions">
                        <button
                          type="button"
                          className="cockpit-icon-btn cockpit-icon-btn--danger"
                          disabled={running}
                          onClick={() => setContacts((prev) => prev.filter((x) => x.id !== c.id))}
                          title="Remover"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan="4" className="cockpit-table__empty">
                    Nenhum contato na lista.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cockpit-panel cockpit-campaign-controls">
        <span className="cockpit-panel__label">4. Controle anti-ban</span>
        <div className="cockpit-campaign-delay">
          <div className="cockpit-field">
            <label>Intervalo mín. (s)</label>
            <input type="number" min="5" value={minDelay} disabled={running} onChange={(e) => setMinDelay(e.target.value)} />
          </div>
          <div className="cockpit-field">
            <label>Intervalo máx. (s)</label>
            <input type="number" min="5" value={maxDelay} disabled={running} onChange={(e) => setMaxDelay(e.target.value)} />
          </div>
        </div>

        <div className="cockpit-progress">
          <div className="cockpit-progress__bar" style={{ width: `${stats.pct}%` }} />
        </div>
        <div className="cockpit-table__sub">
          {stats.sent} enviado(s) · {stats.failed} erro(s) · {stats.pending} aguardando — {stats.pct}%
          {running && countdown > 0 && !paused ? ` · próximo envio em ${countdown}s` : ''}
          {paused ? ' · pausado' : ''}
        </div>

        <div className="cockpit-row-actions" style={{ justifyContent: 'flex-start' }}>
          <button
            type="button"
            className="cockpit-btn cockpit-btn--ghost"
            onClick={handleTest}
            disabled={running || contacts.length === 0}
          >
            <Send size={15} />
            <span>Enviar Teste (1º contato)</span>
          </button>
          {!running ? (
            <button
              type="button"
              className="cockpit-btn cockpit-btn--whatsapp"
              onClick={handleStart}
              disabled={contacts.length === 0}
            >
              <Play size={15} />
              <span>Iniciar Campanha</span>
            </button>
          ) : (
            <>
              <button type="button" className="cockpit-btn cockpit-btn--ghost" onClick={togglePause}>
                {paused ? <Play size={15} /> : <Pause size={15} />}
                <span>{paused ? 'Retomar' : 'Pausar'}</span>
              </button>
              <button type="button" className="cockpit-btn cockpit-btn--danger" onClick={handleCancel}>
                <Square size={15} />
                <span>Cancelar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CampaignProspectingPanel;

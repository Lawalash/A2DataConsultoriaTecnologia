import React, { useState } from 'react';
import { Send, MessageCircle, MapPin, Mail, Phone, Loader2 } from 'lucide-react';
import siteConfig from '../../data/siteConfig';
import solutions from '../../data/solutions';
import { leadsService } from '../../services/leadsService';
import './ContactSection.css';

const ContactSection = () => {
  const [form, setForm] = useState({ name: '', whatsapp: '', solution: '', message: '' });
  const [status, setStatus] = useState({ loading: false, submitted: false, error: false });

  const whatsappLink = `https://wa.me/${siteConfig.contact.whatsapp.number}?text=${encodeURIComponent(siteConfig.contact.whatsapp.defaultMessage)}`;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, submitted: false, error: false });

    // 1. Enviar para Supabase via Service
    const response = await leadsService.createLead({
      name: form.name,
      whatsapp: form.whatsapp,
      solution_interest: form.solution || 'Não especificada',
      message: form.message,
      source_page: window.location.pathname,
    });

    if (!response.success) {
      console.error('Falha ao salvar lead:', response.error);
      // Fallback amigável: Mesmo com erro no BD, não vamos quebrar a experiência.
      // O usuário ainda será redirecionado pro WhatsApp abaixo.
    }

    setStatus({ loading: false, submitted: true, error: false });

    // 2. Redirecionar para WhatsApp (Fluxo Comercial)
    const msg = `Olá, Ricardo! Meu nome é ${form.name}.\nWhatsApp: ${form.whatsapp}\nSolução de interesse: ${form.solution || 'Não especificada'}\nMensagem: ${form.message}`;
    const link = `https://wa.me/${siteConfig.contact.whatsapp.number}?text=${encodeURIComponent(msg)}`;
    window.open(link, '_blank');

    setTimeout(() => setStatus(s => ({ ...s, submitted: false })), 4000);
  };

  return (
    <section id="contato" className="contact">
      <div className="container">
        <div className="contact__header">
          <span className="section-label">Contato</span>
          <h2 className="section-title">Vamos conversar sobre seu negócio</h2>
          <p className="section-subtitle">
            Quer entender qual solução faz sentido para o seu negócio? Fale com Ricardo no WhatsApp.
          </p>
        </div>

        <div className="contact__grid">
          {/* Form */}
          <form className="contact__form glass-card" onSubmit={handleSubmit}>
            <div className="contact__field">
              <label htmlFor="contact-name">Nome</label>
              <input id="contact-name" name="name" type="text" placeholder="Seu nome" value={form.name} onChange={handleChange} required />
            </div>
            <div className="contact__field">
              <label htmlFor="contact-whatsapp">WhatsApp</label>
              <input id="contact-whatsapp" name="whatsapp" type="tel" placeholder="(00) 00000-0000" value={form.whatsapp} onChange={handleChange} required />
            </div>
            <div className="contact__field">
              <label htmlFor="contact-solution">Solução de interesse</label>
              <select id="contact-solution" name="solution" value={form.solution} onChange={handleChange}>
                <option value="">Selecione...</option>
                {solutions.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
                <option value="Outra">Outra / Não sei</option>
              </select>
            </div>
            <div className="contact__field">
              <label htmlFor="contact-message">Mensagem</label>
              <textarea id="contact-message" name="message" placeholder="Conte um pouco sobre sua necessidade..." rows={4} value={form.message} onChange={handleChange} />
            </div>
            <button type="submit" disabled={status.loading} className={`btn btn-primary btn-lg contact__submit ${status.submitted ? 'contact__submit--sent' : ''}`}>
              {status.loading ? <Loader2 size={16} className="contact__spinner" /> : <Send size={16} />}
              <span>{status.loading ? 'Enviando...' : status.submitted ? 'Redirecionando...' : 'Enviar via WhatsApp'}</span>
            </button>
          </form>

          {/* Info */}
          <div className="contact__info">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact__info-card glass-card">
              <div className="contact__info-icon"><MessageCircle size={22} /></div>
              <div>
                <span className="contact__info-label">WhatsApp</span>
                <span className="contact__info-value">{siteConfig.contact.whatsapp.displayNumber}</span>
              </div>
            </a>

            <a href={`mailto:${siteConfig.contact.email}`} className="contact__info-card glass-card">
              <div className="contact__info-icon"><Mail size={22} /></div>
              <div>
                <span className="contact__info-label">E-mail</span>
                <span className="contact__info-value">{siteConfig.contact.email}</span>
              </div>
            </a>

            <a href={siteConfig.contact.instagram.url} target="_blank" rel="noopener noreferrer" className="contact__info-card glass-card">
              <div className="contact__info-icon contact__info-icon--instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <div>
                <span className="contact__info-label">Instagram</span>
                <span className="contact__info-value">{siteConfig.contact.instagram.handle}</span>
              </div>
            </a>

            <div className="contact__info-card glass-card">
              <div className="contact__info-icon"><MapPin size={22} /></div>
              <div>
                <span className="contact__info-label">Localização</span>
                <span className="contact__info-value">{siteConfig.contact.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

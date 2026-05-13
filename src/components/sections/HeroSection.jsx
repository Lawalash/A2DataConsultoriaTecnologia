import React from 'react';
import { ArrowRight, MessageCircle, Sparkles, Calendar, Users, FileText, BarChart3, Zap, ClipboardList } from 'lucide-react';
import siteConfig from '../../data/siteConfig';
import './HeroSection.css';

const HeroSection = () => {
  const whatsappLink = `https://wa.me/${siteConfig.contact.whatsapp.number}?text=${encodeURIComponent(siteConfig.contact.whatsapp.defaultMessage)}`;

  const scrollToSolutions = () => {
    const el = document.getElementById('solucoes');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const floatingKeywords = [
    { icon: Calendar, label: 'Agenda' },
    { icon: Users, label: 'Clientes' },
    { icon: FileText, label: 'Prontuário' },
    { icon: BarChart3, label: 'Relatórios' },
    { icon: ClipboardList, label: 'Gestão' },
    { icon: Zap, label: 'Automação' },
  ];

  return (
    <section id="inicio" className="hero">
      {/* Background effects */}
      <div className="hero__bg">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
        <div className="hero__grid-pattern" />
      </div>

      <div className="hero__container container">
        <div className="hero__content">
          <div className="hero__badge badge badge-accent">
            <Sparkles size={14} />
            <span>Soluções prontas para seu negócio</span>
          </div>

          <h1 className="hero__title">
            Soluções digitais prontas para negócios que precisam
            <span className="hero__title-gradient"> organizar a operação </span>
            e crescer com mais controle.
          </h1>

          <p className="hero__subtitle">
            A A2 Data desenvolve sistemas acessíveis, com implantação simples, mensalidade clara, suporte próximo e cancelamento sem multa.
          </p>

          <div className="hero__ctas">
            <button className="btn btn-primary btn-lg" onClick={scrollToSolutions}>
              <span>Ver Soluções</span>
              <ArrowRight size={18} />
            </button>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
              <MessageCircle size={18} />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="hero__visual">
          {/* Floating keyword cards */}
          <div className="hero__floating-grid">
            {floatingKeywords.map(({ icon: Icon, label }, i) => (
              <div key={label} className={`hero__float-card glass-card`} style={{ animationDelay: `${i * 0.15}s` }}>
                <Icon size={20} className="hero__float-icon" />
                <span>{label}</span>
              </div>
            ))}
          </div>
          {/* Dashboard mockup placeholder */}
          <div className="hero__mockup glass-card">
            <div className="hero__mockup-header">
              <div className="hero__mockup-dots">
                <span /><span /><span />
              </div>
              <span className="hero__mockup-title">Dashboard A2 Data</span>
            </div>
            <div className="hero__mockup-body">
              <div className="hero__mockup-sidebar">
                <div className="hero__mockup-menu-item active" />
                <div className="hero__mockup-menu-item" />
                <div className="hero__mockup-menu-item" />
                <div className="hero__mockup-menu-item" />
              </div>
              <div className="hero__mockup-content">
                <div className="hero__mockup-stat" />
                <div className="hero__mockup-stat" />
                <div className="hero__mockup-stat" />
                <div className="hero__mockup-chart" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll" onClick={scrollToSolutions}>
        <div className="hero__scroll-mouse">
          <div className="hero__scroll-wheel" />
        </div>
        <span>Descubra mais</span>
      </div>
    </section>
  );
};

export default HeroSection;

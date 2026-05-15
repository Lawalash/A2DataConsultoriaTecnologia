import React, { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles, Activity, Database, Lock } from 'lucide-react';
import PreScreeningModal from '../PreScreeningModal/PreScreeningModal';
import './HeroSection.css';

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSolutions = () => {
    const el = document.getElementById('solucoes');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="inicio" className="hero">
      {/* Background effects */}
      <div className="hero__bg">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
        
        {/* Animated Grid & Code Lines */}
        <div className="hero__grid-pattern" />
        <div className="hero__code-lines">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="hero__code-line" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${15 + Math.random() * 15}s` }} />
          ))}
        </div>
      </div>

      <div className="hero__container container">
        <div className="hero__content">
          <div className={`hero__badge badge badge-accent ${mounted ? 'animate-in' : ''}`} style={{ '--delay': '0ms' }}>
            <Sparkles size={14} className="hero__badge-icon" />
            <span>Ecossistema A2 Data</span>
          </div>

          <h1 className={`hero__title ${mounted ? 'animate-in' : ''}`} style={{ '--delay': '100ms' }}>
            Transforme sua operação com soluções digitais 
            <span className="hero__title-gradient"> vivas e conectadas.</span>
          </h1>

          <p className={`hero__subtitle ${mounted ? 'animate-in' : ''}`} style={{ '--delay': '200ms' }}>
            Sistemas prontos para organizar processos, reduzir o trabalho manual e escalar seu negócio com dados precisos e controle total.
          </p>

          <div className={`hero__ctas ${mounted ? 'animate-in' : ''}`} style={{ '--delay': '300ms' }}>
            <button className="btn btn-primary btn-lg" onClick={scrollToSolutions}>
              <span>Ver Soluções</span>
              <ArrowRight size={18} />
            </button>
            <button onClick={() => setModalOpen(true)} className="btn btn-secondary btn-lg">
              <MessageCircle size={18} />
              <span>Falar no WhatsApp</span>
            </button>
          </div>
        </div>

        <PreScreeningModal isOpen={modalOpen} onClose={() => setModalOpen(false)} solution={null} />

        <div className={`hero__visual ${mounted ? 'animate-in' : ''}`} style={{ '--delay': '400ms' }}>
          
          {/* Main Dashboard Mockup */}
          <div className="hero__mockup-main glass-card">
            <div className="hero__mockup-header">
              <div className="hero__mockup-dots">
                <span /><span /><span />
              </div>
              <div className="hero__mockup-tabs">
                <div className="hero__mockup-tab active">Overview</div>
                <div className="hero__mockup-tab">Analytics</div>
              </div>
            </div>
            
            <div className="hero__mockup-body">
              <div className="hero__mockup-metrics">
                <div className="hero__mockup-metric">
                  <span className="hero__mockup-metric-label">Propostas</span>
                  <span className="hero__mockup-metric-value">247</span>
                  <div className="hero__mockup-metric-chart" />
                </div>
                <div className="hero__mockup-metric">
                  <span className="hero__mockup-metric-label">Conversão</span>
                  <span className="hero__mockup-metric-value">68%</span>
                  <div className="hero__mockup-metric-chart type-b" />
                </div>
              </div>
              
              <div className="hero__mockup-chart-main">
                <div className="hero__mockup-chart-bar" style={{height: '40%'}} />
                <div className="hero__mockup-chart-bar" style={{height: '65%'}} />
                <div className="hero__mockup-chart-bar" style={{height: '45%'}} />
                <div className="hero__mockup-chart-bar" style={{height: '85%'}} />
                <div className="hero__mockup-chart-bar" style={{height: '60%'}} />
                <div className="hero__mockup-chart-bar" style={{height: '95%'}} />
                <div className="hero__mockup-chart-bar" style={{height: '75%'}} />
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="hero__float-card hc-1 glass-card">
            <div className="hc-icon-wrap"><Activity size={16} /></div>
            <div className="hc-text">
              <span className="hc-title">Real-time</span>
              <span className="hc-sub">Sync ativo</span>
            </div>
          </div>

          <div className="hero__float-card hc-2 glass-card">
            <div className="hc-icon-wrap"><Database size={16} /></div>
            <div className="hc-text">
              <span className="hc-title">Supabase</span>
              <span className="hc-sub">Conectado</span>
            </div>
          </div>

          <div className="hero__float-card hc-3 glass-card">
            <div className="hc-icon-wrap"><Lock size={16} /></div>
            <div className="hc-text">
              <span className="hc-title">Segurança</span>
              <span className="hc-sub">RLS Ativo</span>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="hero__scroll" onClick={scrollToSolutions}>
        <div className="hero__scroll-mouse">
          <div className="hero__scroll-wheel" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

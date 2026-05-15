import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Play, ShieldCheck, Sparkles, Clock, Activity } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import solutions from '../../data/solutions';
import { faqNail, faqIlpi } from '../../data/faq';
import FaqSection from '../../components/sections/FaqSection';
import ContactSection from '../../components/sections/ContactSection';
import FooterNew from '../../components/sections/FooterNew';
import PreScreeningModal from '../../components/PreScreeningModal/PreScreeningModal';
import './SolutionPage.css';

const SolutionPage = () => {
  const { slug } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const solution = solutions.find((s) => s.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!solution) {
    return (
      <div className="solution-404 container">
        <h1>Solução não encontrada</h1>
        <Link to="/" className="btn btn-primary"><ArrowLeft size={16} /> Voltar ao início</Link>
      </div>
    );
  }

  const faqItems = solution.id === 'nail-designers' ? faqNail : faqIlpi;

  const allFeatures = [
    ...(solution.publicFeatures || []),
    ...(solution.adminFeatures || []),
    ...(solution.clinicalFeatures || []),
    ...(solution.timekeepingFeatures || []),
    ...(solution.securityFeatures || []),
  ];

  return (
    <>
      {/* Hero */}
      <section className="sp-hero">
        {solution.heroImage ? (
          <div className="sp-hero__bg" style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.95)), url(${solution.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ) : (
          <div className="sp-hero__bg">
            <div className="sp-hero__orb sp-hero__orb--1" />
            <div className="sp-hero__orb sp-hero__orb--2" />
          </div>
        )}
        <div className="container sp-hero__content">
          <Link to="/#solucoes" className="sp-hero__back">
            <ArrowLeft size={16} /> Voltar às soluções
          </Link>
          <span className="sp-hero__icon">
            {solution.icon === 'Sparkles' ? <Sparkles size={48} /> : <Activity size={48} />}
          </span>
          <h1 className="sp-hero__title">{solution.headline}</h1>
          <p className="sp-hero__subtitle">{solution.subheadline}</p>
          <div className="sp-hero__ctas">
            <button className="btn btn-primary btn-lg" onClick={() => setIsModalOpen(true)}>
              <FaWhatsapp size={18} />
              <span>{solution.ctas.primary.text}</span>
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => {
              const el = document.getElementById('sp-video-section');
              if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
            }}>
              <Play size={18} />
              <span>{solution.ctas.secondary.text}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pains / Target Audience */}
      <section className="sp-section">
        <div className="container">
          <div className="sp-two-col">
            <div>
              <span className="section-label">Para quem é</span>
              <h2 className="section-title">Essa solução foi feita para você</h2>
              <div className="sp-list">
                {solution.targetAudience.map((item, i) => (
                  <div key={i} className="sp-list__item">
                    <Check size={16} className="sp-list__check" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="section-label">Dores resolvidas</span>
              <h2 className="section-title">Problemas que ficam para trás</h2>
              <div className="sp-list sp-list--pains">
                {solution.pains.map((pain, i) => (
                  <div key={i} className="sp-list__item sp-list__item--pain">
                    <span className="sp-list__dot" />
                    <span>{pain}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="sp-section sp-section--alt">
        <div className="container">
          <div className="sp-features-header">
            <span className="section-label">Funcionalidades</span>
            <h2 className="section-title">O que você recebe</h2>
          </div>
          <div className="sp-features-grid">
            {allFeatures.map((feat, i) => (
              <div key={i} className="sp-feature glass-card">
                <Check size={16} className="sp-feature__icon" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
          {solution.futureFeatures && solution.futureFeatures.length > 0 && (
            <div className="sp-future">
              <h3 className="sp-future__title">
                <Clock size={16} /> Em breve
              </h3>
              <div className="sp-future__list">
                {solution.futureFeatures.map((f, i) => (
                  <span key={i} className="sp-future__tag">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Video Demo */}
      <section className="sp-section" id="sp-video-section">
        <div className="container">
          <div className="sp-video-header">
            <span className="section-label">Demonstração</span>
            <h2 className="section-title">Veja o sistema em ação</h2>
          </div>
          <div className="sp-video glass-card">
            {solution.videoUrl ? (
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                <iframe 
                  src={solution.videoUrl} 
                  title="Demonstração" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
                ></iframe>
              </div>
            ) : (
              <div className="sp-video__placeholder">
                <div className="sp-video__play">
                  <Play size={40} />
                </div>
                <p>Vídeo demonstrativo em breve</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="sp-section sp-section--alt">
        <div className="container">
          <div className="sp-pricing-header">
            <span className="section-label">Valores</span>
            <h2 className="section-title">Investimento claro e acessível</h2>
          </div>
          <div className="sp-pricing glass-card">
            <div className="sp-pricing__grid">
              {solution.pricing.trial && (
                <div className="sp-pricing__item sp-pricing__item--highlight">
                  <Sparkles size={18} />
                  <span className="sp-pricing__item-label">Teste grátis</span>
                  <span className="sp-pricing__item-value">{solution.pricing.trial}</span>
                </div>
              )}
              <div className="sp-pricing__item">
                <span className="sp-pricing__item-label">Mensalidade</span>
                <span className="sp-pricing__item-value sp-pricing__item-value--big">
                  {solution.pricing.launchPrice
                    ? `R$ ${solution.pricing.launchPrice.toFixed(2).replace('.', ',')}`
                    : `R$ ${solution.pricing.regularPrice.toFixed(2).replace('.', ',')}`
                  }
                  <small>/mês</small>
                </span>
              </div>
              <div className="sp-pricing__item">
                <span className="sp-pricing__item-label">Implantação</span>
                <span className="sp-pricing__item-value">
                  {solution.pricing.implantation === 0
                    ? 'R$ 0,00'
                    : `R$ ${solution.pricing.implantation.toFixed(2).replace('.', ',')}`
                  }
                </span>
                {solution.pricing.implantationNote && (
                  <span className="sp-pricing__item-note">{solution.pricing.implantationNote}</span>
                )}
              </div>
            </div>
            <div className="sp-pricing__cancel badge badge-success">
              <ShieldCheck size={14} />
              <span>{solution.pricing.cancellation}</span>
            </div>
            {solution.pricing.extra && (
              <p className="sp-pricing__extra">{solution.pricing.extra}</p>
            )}
            <div className="sp-pricing__cta">
              <button className="btn btn-whatsapp btn-lg" onClick={() => setIsModalOpen(true)}>
                <FaWhatsapp size={18} />
                <span>{solution.ctas.primary.text}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection items={faqItems} title="Perguntas Frequentes" />

      {/* Contact + Footer */}
      <ContactSection />
      <FooterNew />

      {/* Pre-Screening Modal */}
      <PreScreeningModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        solution={solution} 
      />
    </>
  );
};

export default SolutionPage;

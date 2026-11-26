import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Play, X, ShieldCheck, Sparkles, Activity, ShoppingCart, Utensils, Smartphone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import solutions from '../../data/solutions';
import PreScreeningModal from '../PreScreeningModal/PreScreeningModal';
import './SolutionsSection.css';

const getEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
};

const VideoModal = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;
  const embedUrl = getEmbedUrl(videoUrl);
  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal__content glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal__close" onClick={onClose}><X size={24} /></button>
        {embedUrl ? (
          <div className="video-modal__iframe-wrapper" style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
            <iframe 
              src={embedUrl} 
              title="Demonstração" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
            ></iframe>
          </div>
        ) : (
          <div className="video-modal__placeholder">
            <Play size={48} />
            <p>Vídeo demonstrativo em breve</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PricingBadge = ({ pricing }) => {
  if (!pricing) return null;
  const showImplantation =
    (pricing.implantation !== null && pricing.implantation !== undefined && pricing.implantation > 0) ||
    Boolean(pricing.implantationNote);

  return (
    <div className="pricing-badge">
      {pricing.trial && (
        <div className="pricing-badge__trial">
          <ShieldCheck size={14} />
          <span>{pricing.trial}</span>
        </div>
      )}
      {showImplantation && (
        <div className="pricing-badge__price">
          {pricing.implantation !== null && pricing.implantation > 0 ? (
            <>
              <span className="pricing-badge__label">Implantação</span>
              <span className="pricing-badge__value">R$ {pricing.implantation.toFixed(2).replace('.', ',')}</span>
            </>
          ) : (
            <>
              <span className="pricing-badge__label">Implantação</span>
              <span className="pricing-badge__value pricing-badge__value--free">R$ 0,00</span>
              <span className="pricing-badge__note">{pricing.implantationNote}</span>
            </>
          )}
        </div>
      )}
      <div className="pricing-badge__monthly">
        <span className="pricing-badge__label">
          {pricing.startingFrom ? 'Planos a partir de' : 'Mensalidade'}
        </span>
        <div className="pricing-badge__amount">
          {pricing.launchPrice ? (
            <>
              <span className="pricing-badge__from">a partir de</span>
              <span className="pricing-badge__value pricing-badge__value--big">
                R$ {pricing.launchPrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="pricing-badge__period">/mês</span>
            </>
          ) : (
            <>
              <span className="pricing-badge__value pricing-badge__value--big">
                R$ {pricing.regularPrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="pricing-badge__period">/mês</span>
            </>
          )}
        </div>
      </div>
      <div className="pricing-badge__cancel badge badge-success">
        <ShieldCheck size={12} />
        <span>{pricing.cancellation}</span>
      </div>
    </div>
  );
};

const SolutionCard = ({ solution }) => {
  const [videoOpen, setVideoOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={36} />;
      case 'Activity': return <Activity size={36} />;
      case 'ShoppingCart': return <ShoppingCart size={36} />;
      case 'Utensils': return <Utensils size={36} />;
      case 'Smartphone': return <Smartphone size={36} />;
      default: return <Activity size={36} />;
    }
  };

  const handleVideoClick = () => {
    if (solution.videoUrl) {
      setVideoOpen(true);
    }
  };

  return (
    <>
      <div className="solution-card glass-card">
        <div className="solution-card__header">
          <span className="solution-card__icon">
            {getIcon(solution.icon)}
          </span>
          <div style={{ flex: 1 }}>
            <h3 className="solution-card__name">{solution.name}</h3>
            <p className="solution-card__audience">{solution.audience}</p>
          </div>
          {solution.status && (
            <span className="solution-card__status">{solution.status}</span>
          )}
        </div>

        <p className="solution-card__description">{solution.shortDescription}</p>

        <div className="solution-card__benefits">
          {solution.benefits.slice(0, 6).map((b, i) => (
            <div key={i} className="solution-card__benefit">
              <Check size={14} className="solution-card__check" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div 
          className={`solution-card__video ${!solution.videoUrl ? 'solution-card__video--disabled' : ''}`} 
          onClick={handleVideoClick}
        >
          <div className="solution-card__video-thumb">
            <div className="solution-card__play-btn">
              <Play size={24} />
            </div>
            <span className="solution-card__video-label">
              {solution.videoUrl ? 'Ver demonstração' : 'Demonstração em breve'}
            </span>
          </div>
        </div>

        <PricingBadge pricing={solution.pricing} />

        <div className="solution-card__footer-tags">
          {solution.tags && solution.tags.map((tag, index) => (
            <span key={index} className="solution-card__tag">{tag}</span>
          ))}
        </div>

        <div className="solution-card__ctas">
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <FaWhatsapp size={16} />
            <span>{solution.ctas.primary.text}</span>
          </button>
          <Link to={`/solucoes/${solution.slug}`} className="btn btn-secondary">
            <span>Ver detalhes</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} videoUrl={solution.videoUrl} />
      <PreScreeningModal isOpen={modalOpen} onClose={() => setModalOpen(false)} solution={solution} />
    </>
  );
};

const SolutionsSection = () => (
  <section id="solucoes" className="solutions">
    <div className="container">
      <div className="solutions__header">
        <span className="section-label">Soluções em Destaque</span>
        <h2 className="section-title">Vitrine de Soluções</h2>
        <p className="section-subtitle">
          Projetos profissionais focados em resultados. Conheça nossas soluções prontas e em desenvolvimento.
        </p>
      </div>

      <div className="solutions__grid">
        {solutions.map((solution) => (
          <SolutionCard key={solution.id} solution={solution} />
        ))}
      </div>
    </div>
  </section>
);

export default SolutionsSection;

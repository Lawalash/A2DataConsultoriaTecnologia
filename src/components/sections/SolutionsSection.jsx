import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Play, X, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import solutions from '../../data/solutions';
import siteConfig from '../../data/siteConfig';
import './SolutionsSection.css';

const VideoModal = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;
  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal__content glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal__close" onClick={onClose}><X size={24} /></button>
        {videoUrl ? (
          <div className="video-modal__iframe-wrapper" style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
            <iframe 
              src={videoUrl} 
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

const PricingBadge = ({ pricing }) => (
  <div className="pricing-badge">
    {pricing.trial && (
      <div className="pricing-badge__trial">
        <ShieldCheck size={14} />
        <span>{pricing.trial}</span>
      </div>
    )}
    <div className="pricing-badge__price">
      {pricing.implantation !== null && pricing.implantation > 0 ? (
        <>
          <span className="pricing-badge__label">Implantação</span>
          <span className="pricing-badge__value">R$ {pricing.implantation.toFixed(2).replace('.', ',')}</span>
        </>
      ) : pricing.implantationNote ? (
        <>
          <span className="pricing-badge__label">Implantação</span>
          <span className="pricing-badge__value pricing-badge__value--free">R$ 0,00</span>
          <span className="pricing-badge__note">{pricing.implantationNote}</span>
        </>
      ) : null}
    </div>
    <div className="pricing-badge__monthly">
      <span className="pricing-badge__label">Mensalidade</span>
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

const SolutionCard = ({ solution }) => {
  const [videoOpen, setVideoOpen] = useState(false);
  const whatsappLink = `https://wa.me/${siteConfig.contact.whatsapp.number}?text=${encodeURIComponent(solution.whatsappMessage)}`;

  return (
    <>
      <div className="solution-card glass-card">
        <div className="solution-card__header">
          <span className="solution-card__icon">
            {solution.icon === 'Sparkles' ? <Sparkles size={36} /> : <Activity size={36} />}
          </span>
          <div>
            <h3 className="solution-card__name">{solution.name}</h3>
            <p className="solution-card__audience">{solution.audience}</p>
          </div>
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

        {/* Video placeholder */}
        <div className="solution-card__video" onClick={() => setVideoOpen(true)}>
          <div className="solution-card__video-thumb">
            <div className="solution-card__play-btn">
              <Play size={24} />
            </div>
            <span className="solution-card__video-label">Ver demonstração</span>
          </div>
        </div>

        <PricingBadge pricing={solution.pricing} />

        <div className="solution-card__ctas">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <FaWhatsapp size={16} />
            <span>{solution.ctas.primary.text}</span>
          </a>
          <Link to={`/solucoes/${solution.slug}`} className="btn btn-secondary">
            <span>Ver detalhes</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} videoUrl={solution.videoUrl} />
    </>
  );
};

const SolutionsSection = () => (
  <section id="solucoes" className="solutions">
    <div className="container">
      <div className="solutions__header">
        <span className="section-label">Soluções em Destaque</span>
        <h2 className="section-title">Sistemas prontos para transformar seu negócio</h2>
        <p className="section-subtitle">
          Cada solução foi criada para resolver dores reais de nichos específicos. Conheça, teste e decida com clareza.
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

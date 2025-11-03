import React, { useEffect, useRef } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './ServiceModal.css';

export default function ServiceModal({ isOpen, onClose, serviceData }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Trap focus & scroll
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Esc para fechar
  useEffect(() => {
    const handleEsc = e => e.key === 'Escape' && isOpen && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Tab trap
  const handleTab = e => {
    if (e.key !== 'Tab') return;
    const focusables = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  };

  if (!isOpen || !serviceData) return null;

  return (
    <div
      className="service-modal-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        className="service-modal-container"
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleTab}
      >

        {/* HEADER */}
        <div className="service-modal-header">
          <h2 id="modal-title" className="service-modal-title">
            <span className="service-modal-title-text">{serviceData.title}</span>
          </h2>
          <button
            type="button"
            className="service-modal-close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <span aria-hidden="true" style={{ fontSize: '1.1rem', lineHeight: 1 }}>×</span>
          </button>
        </div>

        {/* CONTENT GRID */}
        <div className="service-modal-content">

          {/* CARROSSEL (APENAS INDICADORES) */}
          <div className="service-modal-carousel">
            <Carousel
              showThumbs={false}
              showStatus={false}
              showArrows={false}
              infiniteLoop
              swipeable
              emulateTouch
              renderIndicator={(onClick, isSelected, idx, label) => (
                <button
                  type="button"
                  onClick={onClick}
                  className={`carousel-indicator ${isSelected ? 'selected' : ''}`}
                  aria-label={`${label || 'Ir para imagem'} ${idx + 1}`}
                  key={idx}
                />
              )}
            >
              {serviceData.images.map((img, i) => (
                <div key={i} className="carousel-slide">
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="carousel-image"
                  />
                  {img.caption && (
                    <p className="carousel-caption">{img.caption}</p>
                  )}
                </div>
              ))}
            </Carousel>
          </div>

          {/* INFORMAÇÕES E BENEFÍCIOS */}
          <div className="service-modal-info">
            <div id="modal-description" className="service-modal-description">
              <p>{serviceData.description}</p>
            </div>
            <div className="service-modal-benefits">
              <h3>O que oferecemos:</h3>
              <ul>
                {serviceData.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* TECNOLOGIAS ABAIXO */}
        {serviceData.technologies && (
          <div className="service-modal-tech">
            <h3>Tecnologias:</h3>
            <div className="tech-tags">
              {serviceData.technologies.map((t, i) => (
                <span key={i} className={`tech-tag ${i < 3 ? 'popular' : ''}`} title={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="service-modal-footer">
          <button
            type="button"
            className="service-modal-cta"
            onClick={() => {
              onClose();
              setTimeout(() => {
                document
                  .getElementById('contato')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            }}
          >
            Solicitar Orçamento
          </button>
          <button
            type="button"
            className="service-modal-secondary"
            onClick={onClose}
          >
            Voltar
          </button>
        </div>

      </div>
    </div>
  );
}
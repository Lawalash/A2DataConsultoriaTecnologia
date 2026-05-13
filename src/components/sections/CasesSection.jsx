import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import cases from '../../data/cases';
import './CasesSection.css';

const CasesSection = () => (
  <section id="cases" className="cases">
    <div className="container">
      <div className="cases__header">
        <span className="section-label">Cases e Projetos</span>
        <h2 className="section-title">Projetos reais, resultados comprovados</h2>
        <p className="section-subtitle">
          Soluções em funcionamento para clientes que confiaram na A2 Data.
        </p>
      </div>

      <div className="cases__grid">
        {cases.map((c) => (
          <div key={c.id} className="case-card glass-card">
            {/* Image placeholder */}
            <div className="case-card__image">
              <div className="case-card__image-placeholder">
                <span className="case-card__segment-badge badge badge-accent">{c.segment}</span>
              </div>
            </div>

            <div className="case-card__body">
              <h3 className="case-card__name">{c.name}</h3>
              <p className="case-card__description">{c.shortDescription}</p>

              <div className="case-card__features">
                {c.features.slice(0, 4).map((f, i) => (
                  <span key={i} className="case-card__feature-tag">{f}</span>
                ))}
                {c.features.length > 4 && (
                  <span className="case-card__feature-tag case-card__feature-tag--more">
                    +{c.features.length - 4}
                  </span>
                )}
              </div>

              <div className="case-card__techs">
                {c.technologies.map((t, i) => (
                  <span key={i} className="case-card__tech">{t}</span>
                ))}
              </div>

              <Link to={`/cases/${c.slug}`} className="btn btn-secondary btn-sm case-card__cta">
                <span>Explorar Projeto</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CasesSection;

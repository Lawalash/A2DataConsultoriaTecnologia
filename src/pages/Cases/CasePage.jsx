import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import cases from '../../data/cases';
import solutions from '../../data/solutions';
import FooterNew from '../../components/sections/FooterNew';
import './CasePage.css';

const CasePage = () => {
  const { slug } = useParams();
  const caseData = cases.find((c) => c.slug === slug);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!caseData) {
    return (
      <div className="case-404 container">
        <h1>Case não encontrado</h1>
        <Link to="/#cases" className="btn btn-primary"><ArrowLeft size={16} /> Voltar</Link>
      </div>
    );
  }

  const relatedSolution = solutions.find((s) => s.id === caseData.solutionId);

  return (
    <>
      <section className="cp-hero">
        {caseData.coverImage ? (
          <div className="cp-hero__bg" style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.95)), url(${caseData.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ) : (
          <div className="cp-hero__bg" />
        )}
        <div className="container cp-hero__content">
          <div className="cp-hero__top">
            <Link to="/#cases" className="cp-hero__back">
              <ArrowLeft size={16} /> Voltar aos cases
            </Link>
            <span className="badge badge-accent">{caseData.segment}</span>
          </div>
          <h1 className="cp-hero__title">{caseData.name}</h1>
          <p className="cp-hero__description">{caseData.description}</p>
          <div className="cp-hero__status">
            <span className="badge badge-success">● {caseData.status}</span>
          </div>
        </div>
      </section>

      <section className="cp-section">
        <div className="container">
          <div className="cp-grid">
            <div>
              <h2 className="section-title">Funcionalidades</h2>
              <div className="cp-features">
                {caseData.features.map((f, i) => (
                  <div key={i} className="cp-feature">
                    <Check size={16} className="cp-feature__icon" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="section-title">Tecnologias</h2>
              <div className="cp-techs">
                {caseData.technologies.map((t, i) => (
                  <span key={i} className="cp-tech glass-card">{t}</span>
                ))}
              </div>

              {relatedSolution && (
                <div className="cp-related glass-card">
                  <h3>Solução Relacionada</h3>
                  <p>{relatedSolution.name}</p>
                  <Link to={`/solucoes/${relatedSolution.slug}`} className="btn btn-primary btn-sm">
                    <span>Ver solução</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <FooterNew />
    </>
  );
};

export default CasePage;

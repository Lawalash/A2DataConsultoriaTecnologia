import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import staticCases from '../../data/cases';
import solutions from '../../data/solutions';
import FooterNew from '../../components/sections/FooterNew';
import { supabase } from '../../lib/supabaseClient';
import './CasePage.css';

const CasePage = () => {
  const { slug } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    
    const fetchCase = async () => {
      try {
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('slug', slug)
          .single();
          
        if (data) {
          setCaseData(data);
        } else {
          // fallback to static
          const fallback = staticCases.find(c => c.slug === slug);
          setCaseData(fallback || null);
        }
      } catch(err) {
        console.error('Error fetching case:', err);
        const fallback = staticCases.find(c => c.slug === slug);
        setCaseData(fallback || null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCase();
  }, [slug]);

  if (loading) {
    return (
      <div className="case-404 container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh'}}>
        <Loader2 size={32} className="spin" style={{color: 'var(--accent)'}} />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="case-404 container">
        <h1>Case não encontrado</h1>
        <Link to="/#cases" className="btn btn-primary"><ArrowLeft size={16} /> Voltar</Link>
      </div>
    );
  }

  // Handle both DB mapping and static mapping
  const title = caseData.title || caseData.name;
  const description = caseData.description || caseData.longDescription || caseData.shortDescription;
  const features = caseData.features || [];
  const techs = caseData.tech_stack || caseData.technologies || [];
  const image = caseData.cover_image_url || caseData.coverImage;
  const segment = caseData.segment || '';
  const status = caseData.status || 'Ativo';
  
  // The solution Id mapping might be different depending on if it's from DB or static
  const relatedSolution = solutions.find((s) => s.id === caseData.solution_id || s.id === caseData.solutionId);

  return (
    <>
      <section className="cp-hero">
        {image ? (
          <div className="cp-hero__bg" style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.95)), url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ) : (
          <div className="cp-hero__bg" />
        )}
        <div className="container cp-hero__content">
          <div className="cp-hero__top">
            <Link to="/#cases" className="cp-hero__back">
              <ArrowLeft size={16} /> Voltar aos cases
            </Link>
            <span className="badge badge-accent">{segment}</span>
          </div>
          <h1 className="cp-hero__title">{title}</h1>
          <p className="cp-hero__description">{description}</p>
          <div className="cp-hero__status">
            <span className="badge badge-success">● {status}</span>
          </div>
        </div>
      </section>

      <section className="cp-section">
        <div className="container">
          <div className="cp-grid">
            <div>
              <h2 className="section-title">Funcionalidades</h2>
              <div className="cp-features">
                {features.map((f, i) => (
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
                {techs.map((t, i) => (
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

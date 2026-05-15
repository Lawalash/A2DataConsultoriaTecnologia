import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import staticCases from '../../data/cases';
import { supabase } from '../../lib/supabaseClient';
import './CasesSection.css';

const CasesSection = () => {
  const [casesData, setCasesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCasesData(data);
        } else {
          setCasesData(staticCases);
        }
      } catch (err) {
        console.error('Error fetching cases, falling back to static:', err);
        setCasesData(staticCases);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCases();
  }, []);

  if (loading) {
    return (
      <section id="cases" className="cases">
        <div className="container" style={{display: 'flex', justifyContent: 'center', padding: '100px 0'}}>
          <Loader2 size={32} className="spin" style={{color: 'var(--accent)'}} />
        </div>
      </section>
    );
  }

  return (
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
          {casesData.map((c) => {
            // Map DB fields to component needs if necessary, to handle both static and DB schemas
            const title = c.title || c.name;
            const description = c.summary || c.shortDescription;
            const features = c.features || [];
            const techs = c.tech_stack || c.technologies || [];
            const image = c.cover_image_url || c.coverImage;

            return (
              <div key={c.id || c.slug} className="case-card glass-card">
                <div className="case-card__image">
                  <div 
                    className="case-card__image-placeholder"
                    style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    <span className="case-card__segment-badge badge badge-accent">{c.segment}</span>
                  </div>
                </div>

                <div className="case-card__body">
                  <h3 className="case-card__name">{title}</h3>
                  <p className="case-card__description">{description}</p>

                  <div className="case-card__features">
                    {features.slice(0, 4).map((f, i) => (
                      <span key={i} className="case-card__feature-tag">{f}</span>
                    ))}
                    {features.length > 4 && (
                      <span className="case-card__feature-tag case-card__feature-tag--more">
                        +{features.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="case-card__techs">
                    {techs.map((t, i) => (
                      <span key={i} className="case-card__tech">{t}</span>
                    ))}
                  </div>

                  <Link to={`/cases/${c.slug}`} className="btn btn-secondary btn-sm case-card__cta">
                    <span>Explorar Projeto</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CasesSection;

import React from 'react';
import { Code, Cpu, Layers, UserCheck } from 'lucide-react';
import siteConfig from '../../data/siteConfig';
import ricardoImage from '../../assets/imagens/Ricardo.png';
import './FounderSection.css';

const highlightIcons = [Code, Cpu, Layers, UserCheck];

const FounderSection = () => (
  <section id="sobre" className="founder">
    <div className="container">
      <div className="founder__header">
        <span className="section-label">Sobre</span>
        <h2 className="section-title">Quem está por trás da A2 Data</h2>
      </div>

      <div className="founder__content glass-card">
        <div className="founder__image-wrap">
          <img src={ricardoImage} alt="Ricardo Alexandre" className="founder__image" />
          <div className="founder__image-glow" />
        </div>

        <div className="founder__info">
          <h3 className="founder__name">{siteConfig.founder.name}</h3>
          <p className="founder__role">{siteConfig.founder.role}</p>
          <p className="founder__bio">{siteConfig.founder.bio}</p>

          <div className="founder__highlights">
            {siteConfig.founder.highlights.map((h, i) => {
              const Icon = highlightIcons[i] || Code;
              return (
                <div key={i} className="founder__highlight">
                  <Icon size={16} />
                  <span>{h}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default FounderSection;

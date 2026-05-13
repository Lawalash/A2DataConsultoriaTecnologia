import React from 'react';
import { MessageSquare, Monitor, Settings, Headphones } from 'lucide-react';
import './HowItWorksSection.css';

const steps = [
  {
    icon: MessageSquare,
    title: 'Conversa inicial',
    description: 'Entendemos a realidade do seu negócio e indicamos a solução mais adequada.',
    number: '01',
  },
  {
    icon: Monitor,
    title: 'Demonstração',
    description: 'Você vê o sistema funcionando antes de decidir.',
    number: '02',
  },
  {
    icon: Settings,
    title: 'Implantação',
    description: 'Configuramos a plataforma e deixamos tudo pronto para começar.',
    number: '03',
  },
  {
    icon: Headphones,
    title: 'Suporte e evolução',
    description: 'Você conta com acompanhamento, correções e melhorias quando necessário.',
    number: '04',
  },
];

const HowItWorksSection = () => (
  <section id="como-funciona" className="how-it-works">
    <div className="container">
      <div className="how-it-works__header">
        <span className="section-label">Processo</span>
        <h2 className="section-title">Como funciona</h2>
        <p className="section-subtitle">
          Do primeiro contato ao suporte contínuo — tudo com transparência e simplicidade.
        </p>
      </div>

      <div className="how-it-works__grid">
        {steps.map(({ icon: Icon, title, description, number }, i) => (
          <div key={i} className="how-step glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="how-step__number">{number}</div>
            <div className="how-step__icon-wrap">
              <Icon size={24} />
            </div>
            <h3 className="how-step__title">{title}</h3>
            <p className="how-step__description">{description}</p>
            {i < steps.length - 1 && <div className="how-step__connector" />}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;

import React from 'react';
import { ShieldCheck, DollarSign, Monitor, Headphones, UserCheck, Zap, RefreshCw } from 'lucide-react';
import './WhyChooseUsSection.css';

const differentials = [
  { icon: ShieldCheck, title: 'Soluções para dores reais', description: 'Cada sistema resolve problemas específicos de nichos reais.' },
  { icon: DollarSign, title: 'Mensalidades acessíveis', description: 'Preços pensados para micro e pequenos negócios.' },
  { icon: Monitor, title: 'Demonstração antes da contratação', description: 'Você vê o sistema funcionando antes de decidir.' },
  { icon: Headphones, title: 'Suporte próximo', description: 'Atendimento direto com quem realmente desenvolve.' },
  { icon: UserCheck, title: 'Cancelamento sem multa', description: 'O cliente permanece porque vê valor, não por contrato.' },
  { icon: RefreshCw, title: 'Evolução contínua', description: 'Melhorias constantes baseadas no uso real dos clientes.' },
  { icon: Zap, title: 'Contato com quem desenvolve', description: 'Sem intermediários — fale diretamente com Ricardo.' },
];

const WhyChooseUsSection = () => (
  <section className="why-choose">
    <div className="container">
      <div className="why-choose__header">
        <span className="section-label">Diferenciais</span>
        <h2 className="section-title">Por que escolher a A2 Data?</h2>
      </div>

      <div className="why-choose__grid">
        {differentials.map(({ icon: Icon, title, description }, i) => (
          <div key={i} className="why-card glass-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="why-card__icon">
              <Icon size={22} />
            </div>
            <h3 className="why-card__title">{title}</h3>
            <p className="why-card__description">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUsSection;

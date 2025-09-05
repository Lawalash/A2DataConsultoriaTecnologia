// src/components/Plans.jsx
// Dependencies: React, lucide-react
// Install: npm install lucide-react

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Rocket,
  Brain,
  Settings,
  Shield,
  Check,
  X,
  Sparkles,
  Crown,
  Zap,
  Star,
  Code,
  Clock,
  Users
} from 'lucide-react';
import './Plans.css';

// Dados originais (valores originais mantidos para referência)
const plansData = [
  {
    id: 'basic',
    name: 'Básico',
    badge: 'Iniciante',
    icon: BarChart3,
    originalPrice: 2350,
    currentPrice: 1990,
    discount: 15,
    monthlyHoursDev: 30,
    users: 1,
    features: [
      { name: 'Análise de dados essencial', included: true, highlight: false },
      { name: 'Relatórios semanais automatizados', included: true, highlight: false },
      { name: 'Dashboard responsivo', included: true, highlight: false },
      { name: '1 usuário ativo', included: true, highlight: false },
      { name: '30 horas de desenvolvimento', included: true, highlight: true },
      { name: 'Suporte por email', included: true, highlight: false },
      { name: 'Inteligência artificial', included: false, highlight: false },
      { name: 'Análise preditiva', included: false, highlight: false },
      { name: 'API integrations', included: false, highlight: false },
    ],
    popular: false,
    ctaText: 'Começar Agora',
  },
  {
    id: 'intermediate',
    name: 'Intermediário',
    badge: 'Mais Popular',
    icon: Rocket,
    originalPrice: 5290,
    currentPrice: 4490,
    discount: 15,
    monthlyHoursDev: 60,
    users: 5,
    features: [
      { name: 'BI completo e avançado', included: true, highlight: true },
      { name: 'Dashboards interativos', included: true, highlight: false },
      { name: 'Integrações com APIs', included: true, highlight: true },
      { name: 'Até 5 usuários simultâneos', included: true, highlight: false },
      { name: '60 horas de desenvolvimento', included: true, highlight: true },
      { name: 'Suporte prioritário', included: true, highlight: false },
      { name: 'Relatórios personalizados', included: true, highlight: false },
      { name: 'Análise preditiva básica', included: true, highlight: true },
      { name: 'Automação de processos', included: false, highlight: false },
    ],
    popular: true,
    ctaText: 'Escolher Plano',
  },
  {
    id: 'advanced',
    name: 'Avançado',
    badge: 'Enterprise',
    icon: Brain,
    originalPrice: 8800,
    currentPrice: 7490,
    discount: 15,
    monthlyHoursDev: 90,
    users: 'Ilimitados',
    features: [
      { name: 'IA aplicada e machine learning', included: true, highlight: true },
      { name: 'Análise preditiva avançada', included: true, highlight: true },
      { name: 'Automação completa', included: true, highlight: true },
      { name: 'Usuários ilimitados', included: true, highlight: false },
      { name: '90 horas de desenvolvimento', included: true, highlight: true },
      { name: 'Integrações customizadas', included: true, highlight: false },
      { name: 'Suporte 24/7 dedicado', included: true, highlight: false },
      { name: 'Consultoria estratégica', included: true, highlight: true },
      { name: 'White-label disponível', included: true, highlight: false },
    ],
    popular: false,
    ctaText: 'Começar Teste',
  },
  {
    id: 'custom',
    name: 'Personalizado',
    badge: 'Sob Medida',
    icon: Settings,
    currentPrice: 'Sob Consulta',
    description: 'Solução customizada para necessidades específicas e empresas de grande porte com desenvolvimento ilimitado.',
    monthlyHoursDev: 'Ilimitadas',
    users: 'Ilimitados',
    features: [
      { name: 'Tudo do plano Avançado', included: true, highlight: false },
      { name: 'Desenvolvimentos exclusivos', included: true, highlight: true },
      { name: 'Atendimento dedicado', included: true, highlight: false },
      { name: 'Consultoria estratégica', included: true, highlight: false },
      { name: 'SLA personalizado', included: true, highlight: true },
      { name: 'Implementação on-premise', included: true, highlight: true },
    ],
    popular: false,
    isCustom: true,
    ctaText: 'Falar com Especialista',
  },
];

// Constants: percentual de desconto anual (sobre o mensal reduzido)
const ANNUAL_DISCOUNT = 0.20; // 20% de desconto no anual (sobre o mensal já reduzido)

// Reduções mensais específicas por plano (ajustadas conforme solicitado)
// basic: 45%
// intermediate: 45%
// advanced: 50%
const REDUCTION_RATES = {
  basic: 0.45,
  intermediate: 0.45,
  advanced: 0.50
};

const formatBRL = price =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(price);

// PlanStats (mantido)
const PlanStats = React.memo(({ plan }) => {
  if (plan.isCustom) return null;
  return (
    <div className="plan-stats">
      <div className="stat-item">
        <Users size={18} className="stat-icon" />
        <span className="stat-number">{plan.users}</span>
        <span className="stat-label">Usuário{plan.users !== 1 ? 's' : ''}</span>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-item">
        <Code size={18} className="stat-icon" />
        <span className="stat-number">{plan.monthlyHoursDev}h</span>
        <span className="stat-label">Desenvolvimento</span>
      </div>
    </div>
  );
});

// PriceDisplay agora recebe billingCycle (monthly | annual)
const PriceDisplay = React.memo(({ plan, billingCycle }) => {
  // custom
  if (plan.isCustom) {
    return (
      <div className="price-custom">
        <Sparkles size={20} className="price-sparkle" />
        <span className="price-value custom-price">Sob Consulta</span>
      </div>
    );
  }

  const monthly = plan._monthlyPrice; // já reduzido conforme plano
  const annualMonthly = plan._annualMonthlyPrice; // mensal equivalente no anual (com desconto de ANNUAL_DISCOUNT)
  const original = plan._originalPrice; // original reduzido conforme taxa do plano (para comparação/strike-through)

  const showingAnnual = billingCycle === 'annual';
  const displayed = showingAnnual ? annualMonthly : monthly;
  const savingsMonthly = original - displayed;
  const savingsText = savingsMonthly > 0 ? `Economize ${formatBRL(savingsMonthly)} por mês` : null;

  return (
    <div className="price-container visible">
      <div className="price-discount-wrapper">
        <span className="price-original">{formatBRL(original)}</span>
        <div className="price-discount-tag">
          <span>{showingAnnual ? `-${Math.round(ANNUAL_DISCOUNT * 100)}%` : `-${plan.discount}%`}</span>
          <div className="discount-shine"></div>
        </div>
      </div>

      <div className="price-current">
        <span className="price-value">{formatBRL(displayed)}</span>
        <span className="price-period">/mês</span>
      </div>

      {savingsText && (
        <div className="price-savings">{savingsText}</div>
      )}
    </div>
  );
});

// FeatureItem (mantido)
const FeatureItem = React.memo(({ feature, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <li
      className={`feature-item ${!feature.included ? 'disabled' : ''} ${feature.highlight ? 'highlight' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="feature-icon-wrapper">
        {feature.included ? (
          <Check size={16} className="feature-icon check" />
        ) : (
          <X size={16} className="feature-icon x" />
        )}
      </div>
      <span className="feature-text">{feature.name}</span>
      {feature.highlight && <Star size={14} className="feature-star" />}
    </li>
  );
});

// PlanCard - recebe billingCycle
const PlanCard = React.memo(({ plan, index, billingCycle }) => {
  const Icon = plan.icon;
  const cardClasses = `plan-card ${plan.popular ? 'popular' : ''} ${plan.isCustom ? 'custom' : ''}`;

  return (
    <div
      className={cardClasses}
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      {plan.isCustom && (
        <div className="custom-background-animation">
          <div className="floating-particles">
            {[...Array(6)].map((_, i) => <div key={i} className={`particle particle-${i + 1}`}></div>)}
          </div>
          <div className="wave-animation">
            <div className="wave wave-1"></div>
            <div className="wave wave-2"></div>
            <div className="wave wave-3"></div>
          </div>
        </div>
      )}

      {plan.popular && (
        <div className="plan-popular-tag">
          <Crown size={16} />
          <span>Mais Popular</span>
        </div>
      )}

      <div className="plan-header">
        <div className="plan-icon-wrapper">
          <Icon size={32} />
          <div className="icon-glow"></div>
        </div>
        <h3>{plan.name}</h3>
        <span className="plan-badge">{plan.badge}</span>
      </div>

      <PlanStats plan={plan} />

      <div className="plan-price">
        <PriceDisplay plan={plan} billingCycle={billingCycle} />
      </div>

      <div className="plan-features">
        {plan.isCustom && <p className="plan-custom-description">{plan.description}</p>}
        <ul>
          {plan.features.map((f, i) => <FeatureItem key={i} feature={f} index={i} />)}
        </ul>
      </div>

      <button
        className={`plan-button ${plan.isCustom ? 'contact-button' : 'subscribe-button'} ${plan.popular ? 'popular-button' : ''}`}
      >
        <span>{plan.ctaText}</span>
        {!plan.isCustom && <Zap size={18} className="button-icon" />}
        <div className="button-shine"></div>
      </button>
    </div>
  );
});

// Componente Principal
const Plans = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly | annual

  // aplica redução específica nos valores por plano e calcula anual (20% desconto) - memoizado
  const plansWithAdjustedPrices = useMemo(() => {
    return plansData.map(plan => {
      if (plan.isCustom) return plan;

      // pega a taxa de redução específica para o plano (fallback 0 se não definido)
      const reductionRate = REDUCTION_RATES[plan.id] ?? 0;

      // reduz o preço atual conforme a taxa solicitada
      const monthlyReduced = Math.round(plan.currentPrice * (1 - reductionRate));

      // reduz o preço "original" (para strike-through e comparação) usando a mesma taxa
      const originalReduced = plan.originalPrice ? Math.round(plan.originalPrice * (1 - reductionRate)) : null;

      // calcula o mensal equivalente quando o usuário escolhe o anual (aplica ANNUAL_DISCOUNT sobre o mensal reduzido)
      const annualMonthly = Math.round(monthlyReduced * (1 - ANNUAL_DISCOUNT));

      // economias anuais (valor anual comparando mensal reduzido com mensal anual equivalente)
      const annualSavings = Math.round((monthlyReduced - annualMonthly) * 12);

      return {
        ...plan,
        _monthlyPrice: monthlyReduced,
        _originalPrice: originalReduced ?? monthlyReduced,
        _annualMonthlyPrice: annualMonthly,
        _annualSavings: annualSavings
      };
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    const section = document.querySelector('.plans-section');
    if (section) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`plans-section ${isVisible ? 'visible' : ''}`} id="planos">
      <div className="plans-container">
        <div className="plans-hero">
          <h2>Escolha Seu Plano Ideal</h2>
          <p className="plans-subtitle">
            Soluções inteligentes para impulsionar seu negócio com análise de dados avançada e desenvolvimento personalizado
          </p>

          <div className="plans-features-preview">
            <div className="preview-item"><Check size={16} /><span>Sem taxas de setup</span></div>
            <div className="preview-item"><Check size={16} /><span>Cancele quando quiser</span></div>
            <div className="preview-item"><Check size={16} /><span>Suporte especializado</span></div>
            <div className="preview-item"><Clock size={16} /><span>Horas de desenvolvimento inclusas</span></div>
          </div>

          {/* Billing toggle */}
          <div className="billing-toggle-wrapper" style={{ marginTop: 20 }}>
            <div className="billing-toggle">
              <button
                className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('monthly')}
                aria-pressed={billingCycle === 'monthly'}
              >
                Mensal
              </button>
              <button
                className={`toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
                onClick={() => setBillingCycle('annual')}
                aria-pressed={billingCycle === 'annual'}
              >
                Anual
                <span className="savings-badge">-20%</span>
              </button>
            </div>
            <p className="toggle-subtitle">Escolha entre pagamento mensal ou anual (anual = 20% off)</p>
          </div>
        </div>

        <div className="plans-grid">
          {plansWithAdjustedPrices.map((p, i) => (
            <PlanCard key={p.id} plan={p} index={i} billingCycle={billingCycle} />
          ))}
        </div>

        <div className="plans-guarantee">
          <Shield size={20} />
          <div className="guarantee-content">
            <strong>Garantia de Satisfação</strong>
            <p>15 dias para testar sem compromisso. Se não ficar satisfeito, devolvemos seu dinheiro.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;

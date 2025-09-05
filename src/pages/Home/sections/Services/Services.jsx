import React, { useState } from 'react';
import { FaChartLine, FaRobot, FaBrain, FaMobileAlt, FaDesktop } from 'react-icons/fa';
import ServiceModal from './ServiceModal';
import './Services.css';

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dados dos serviços com imagens de exemplo (substitua pelas suas imagens reais)
  const servicesData = {
    'analise-dados': {
      title: 'Análise de Dados',
      icon: <FaChartLine />,
      description: 'Transformamos seus dados em insights acionáveis através de análises avançadas, dashboards interativos e relatórios personalizados. Nossa equipe especializada utiliza as melhores ferramentas do mercado para extrair o máximo valor dos seus dados empresariais.',
      benefits: [
        'Dashboards interativos em tempo real',
        'Relatórios automatizados personalizados',
        'Visualizações avançadas e intuitivas',
        'Análise preditiva e tendências',
        'Integração com múltiplas fontes de dados',
        'Monitoramento de KPIs estratégicos'
      ],
      technologies: ['Power BI', 'Tableau', 'Python', 'R', 'SQL', 'Excel Avançado'],
      images: [
        {
          src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
          alt: 'Dashboard analítico interativo',
          caption: 'Dashboards personalizados para sua empresa'
        },
        {
          src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
          alt: 'Gráficos e visualizações de dados',
          caption: 'Visualizações claras e objetivas'
        },
        {
          src: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=500&fit=crop',
          alt: 'Relatórios automatizados',
          caption: 'Relatórios automáticos e inteligentes'
        }
      ]
    },
    'automatizacao': {
      title: 'Automatização',
      icon: <FaRobot />,
      description: 'Otimizamos seus processos através de automação inteligente, eliminando tarefas repetitivas e aumentando a produtividade. Criamos fluxos de trabalho automatizados que se integram perfeitamente ao seu negócio.',
      benefits: [
        'Fluxos de trabalho totalmente otimizados',
        'Integração nativa com WhatsApp Business',
        'Monitoramento 24/7 dos processos',
        'Redução de erros humanos',
        'Aumento significativo da produtividade',
        'ROI mensurável e comprovado'
      ],
      technologies: ['Zapier', 'Microsoft Power Automate', 'Python', 'APIs', 'WhatsApp Business'],
      images: [
        {
          src: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop',
          alt: 'Processos automatizados',
          caption: 'Automação completa de processos'
        },
        {
          src: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=500&fit=crop',
          alt: 'Integração WhatsApp',
          caption: 'Integração com WhatsApp Business'
        },
        {
          src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop',
          alt: 'Monitoramento em tempo real',
          caption: 'Monitoramento 24/7 em tempo real'
        }
      ]
    },
    'ia-aplicada': {
      title: 'IA Aplicada',
      icon: <FaBrain />,
      description: 'Implementamos soluções de Inteligência Artificial sob medida para seu negócio, desde análise preditiva até automação inteligente. Nossa expertise em IA transforma dados em vantagem competitiva.',
      benefits: [
        'Modelos preditivos personalizados',
        'Automação inteligente avançada',
        'Análise de tendências futuras',
        'Processamento de linguagem natural',
        'Machine Learning aplicado',
        'Insights baseados em IA'
      ],
      technologies: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI API', 'Azure AI'],
      images: [
        {
          src: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
          alt: 'Inteligência Artificial',
          caption: 'IA personalizada para seu negócio'
        },
        {
          src: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop',
          alt: 'Machine Learning',
          caption: 'Modelos de Machine Learning avançados'
        },
        {
          src: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=500&fit=crop',
          alt: 'Análise preditiva',
          caption: 'Análise preditiva e insights inteligentes'
        }
      ]
    },
    'apps-mobile': {
      title: 'Aplicativos Mobile',
      icon: <FaMobileAlt />,
      description: 'Desenvolvemos aplicativos móveis nativos e híbridos com foco na experiência do usuário. Nossos apps são intuitivos, rápidos e integrados com suas necessidades de negócio.',
      benefits: [
        'UX/UI intuitivo e moderno',
        'Desenvolvimento para Android e iOS',
        'Integração completa com APIs',
        'Performance otimizada',
        'Design responsivo e acessível',
        'Suporte e manutenção contínua'
      ],
      technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'API REST'],
      images: [
        {
          src: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop',
          alt: 'Desenvolvimento mobile',
          caption: 'Apps personalizados para seu negócio'
        },
        {
          src: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=500&fit=crop',
          alt: 'Interface mobile moderna',
          caption: 'Interfaces modernas e intuitivas'
        },
        {
          src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
          alt: 'App em funcionamento',
          caption: 'Performance e usabilidade excepcionais'
        }
      ]
    },
    'desenvolvimento-web': {
      title: 'Desenvolvimento Web',
      icon: <FaDesktop />,
      description: 'Criamos sites modernos, landing pages de alta conversão e sistemas web completos. Nosso foco é entregar soluções que geram resultados reais para seu negócio.',
      benefits: [
        'Sites totalmente responsivos',
        'Landing pages otimizadas para conversão',
        'Performance de ponta e SEO otimizado',
        'Design moderno e profissional',
        'Integração com sistemas existentes',
        'Hospedagem e manutenção incluídas'
      ],
      technologies: ['React', 'Next.js', 'WordPress', 'PHP', 'Node.js', 'AWS'],
      images: [
        {
          src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
          alt: 'Desenvolvimento web moderno',
          caption: 'Sites modernos e responsivos'
        },
        {
          src: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=500&fit=crop',
          alt: 'Landing page otimizada',
          caption: 'Landing pages de alta conversão'
        },
        {
          src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop',
          alt: 'Sistema web completo',
          caption: 'Sistemas web completos e integrados'
        }
      ]
    }
  };

  const handleServiceClick = (serviceKey) => {
    setSelectedService(servicesData[serviceKey]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <section id="servicos" className="servicos">
      <div className="servicos-container">
        <h2>Nossos Serviços</h2>
        <div className="grid-servicos">
          {/* Análise de Dados */}
          <div className="servico-card">
            <div className="servico-icon">
              <FaChartLine />
            </div>
            <h3>Análise de Dados</h3>
            <p className="servico-descricao">Extração de insights, gráficos interativos e relatórios customizados.</p>
            <div className="servico-overlay">
              <div className="servico-detalhes">
                <h4>Análise de Dados</h4>
                <ul>
                  <li>Dashboards interativos</li>
                  <li>Relatórios automatizados</li>
                  <li>Visualização avançada</li>
                </ul>
                <button 
                  className="servico-link"
                  onClick={() => handleServiceClick('analise-dados')}
                  type="button"
                >
                  Saiba mais
                </button>
              </div>
            </div>
          </div>

          {/* Automatização */}
          <div className="servico-card">
            <div className="servico-icon">
              <FaRobot />
            </div>
            <h3>Automatização</h3>
            <p className="servico-descricao">Tarefas automatizadas, reports de vendas via WhatsApp e monitoramento em tempo real.</p>
            <div className="servico-overlay">
              <div className="servico-detalhes">
                <h4>Automatização</h4>
                <ul>
                  <li>Fluxos de trabalho otimizados</li>
                  <li>Integração com WhatsApp</li>
                  <li>Monitoramento 24/7</li>
                </ul>
                <button 
                  className="servico-link"
                  onClick={() => handleServiceClick('automatizacao')}
                  type="button"
                >
                  Saiba mais
                </button>
              </div>
            </div>
          </div>

          {/* IA Aplicada */}
          <div className="servico-card">
            <div className="servico-icon">
              <FaBrain />
            </div>
            <h3>IA Aplicada</h3>
            <p className="servico-descricao">Soluções inteligentes, análise preditiva e insights com Inteligência Artificial.</p>
            <div className="servico-overlay">
              <div className="servico-detalhes">
                <h4>IA Aplicada</h4>
                <ul>
                  <li>Modelos preditivos</li>
                  <li>Automação inteligente</li>
                  <li>Análise de tendências</li>
                </ul>
                <button 
                  className="servico-link"
                  onClick={() => handleServiceClick('ia-aplicada')}
                  type="button"
                >
                  Saiba mais
                </button>
              </div>
            </div>
          </div>

          {/* Aplicativos Mobile */}
          <div className="servico-card">
            <div className="servico-icon">
              <FaMobileAlt />
            </div>
            <h3>Aplicativos Mobile</h3>
            <p className="servico-descricao">Desenvolvimento de apps personalizados para acesso rápido e prático aos dados.</p>
            <div className="servico-overlay">
              <div className="servico-detalhes">
                <h4>Aplicativos Mobile</h4>
                <ul>
                  <li>UX/UI intuitivo</li>
                  <li>Android e iOS</li>
                  <li>Integração com APIs</li>
                </ul>
                <button 
                  className="servico-link"
                  onClick={() => handleServiceClick('apps-mobile')}
                  type="button"
                >
                  Saiba mais
                </button>
              </div>
            </div>
          </div>

          {/* Desenvolvimento Web */}
          <div className="servico-card">
            <div className="servico-icon">
              <FaDesktop />
            </div>
            <h3>Desenvolvimento Web</h3>
            <p className="servico-descricao">Criação de sites e landing pages modernas, responsivas e focadas em conversão.</p>
            <div className="servico-overlay">
              <div className="servico-detalhes">
                <h4>Desenvolvimento Web</h4>
                <ul>
                  <li>Sites responsivos</li>
                  <li>Landing pages otimizadas</li>
                  <li>Performance de ponta</li>
                </ul>
                <button 
                  className="servico-link"
                  onClick={() => handleServiceClick('desenvolvimento-web')}
                  type="button"
                >
                  Saiba mais
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-planos">
        <p className="cta-texto">Que tal conhecer nossos planos agora?</p>
        <button className="cta-botao" onClick={() => {
          const el = document.getElementById('planos');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}>Ver Planos</button>
      </div>

      {/* Modal de Serviços */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        serviceData={selectedService}
      />
    </section>
  );
};

export default Services;
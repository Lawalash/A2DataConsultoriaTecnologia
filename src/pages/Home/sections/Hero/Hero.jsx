// Hero.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChartLine, FaDatabase, FaBrain } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const prefixText = 'NEGÓCIOS DO ';
  const highlightText = 'AMANHÃ';
  const fullText = prefixText + highlightText;

  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReduced) {
      setDisplayed(fullText);
      setShowCursor(false);
      return;
    }

    const TYPING_SPEED = 80; // ms por caractere
    const CURSOR_BLINK_DELAY = 500; // delay antes de começar a piscar
    let i = 0;
    
    const typeInterval = setInterval(() => {
      i += 1;
      setDisplayed(fullText.slice(0, i));
      
      if (i >= fullText.length) {
        clearInterval(typeInterval);
        
        // Após terminar de digitar, aguarda um pouco e começa a piscar o cursor
        setTimeout(() => {
          setShowCursor(true);
          
          // Cursor piscando
          const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
          }, 600);
          
          // Para de piscar após alguns segundos e remove o cursor
          setTimeout(() => {
            clearInterval(cursorInterval);
            setShowCursor(false);
          }, 3000);
        }, CURSOR_BLINK_DELAY);
      }
    }, TYPING_SPEED);

    return () => {
      clearInterval(typeInterval);
    };
  }, [fullText]);

  const prefixShown = displayed.slice(0, prefixText.length);
  const highlightShown = displayed.slice(prefixText.length);

  const scrollToPlans = () => {
    const plansElement = document.getElementById('planos');
    if (plansElement) {
      plansElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleAgendarDemo = () => {
    navigate('/demo/agendar-demo');
  };

  return (
    <section id="inicio" className="hero">
      <div className="particles-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span>Inovação em Análise de Dados e Tecnologia</span>
          </div>

          <h1 className="animated-heading" aria-live="polite">
            <span className="text-prefix">{prefixShown}</span>
            <span className="highlight">{highlightShown}</span>
            <span className={`typing-cursor ${showCursor ? 'visible' : 'hidden'}`} aria-hidden="true"></span>
          </h1>

          <p className="hero-description">
            Transforme dados em decisões estratégicas com inteligência artificial avançada.
            Prepare sua empresa para o futuro com análises preditivas e insights acionáveis.
          </p>

          <div className="cta-group">
            <button className="cta-primary" onClick={scrollToPlans}>
              <span>Começar Agora</span>
            </button>

            <button className="cta-secondary" onClick={handleAgendarDemo}>
              <span>Agendar Demo</span>
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">97%</span>
              <span className="stat-label">Satisfação</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Projetos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2+</span>
              <span className="stat-label">Anos no mercado</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-container">
            <img
              src="https://images.unsplash.com/photo-1581089781785-603411fa81e5?auto=format&fit=crop&w=600"
              alt="Dashboard de análise de dados"
              className="hero-main-image"
            />
            <div className="image-overlay"></div>
          </div>

          <div className="floating-card card-1">
            <div className="card-icon">
              <FaChartLine />
            </div>
            <div className="card-content">
              <span className="card-title">Análise Preditiva</span>
              <span className="card-subtitle">IA Avançada</span>
            </div>
          </div>

          <div className="floating-card card-2">
            <div className="card-icon">
              <FaDatabase />
            </div>
            <div className="card-content">
              <span className="card-title">Big Data</span>
              <span className="card-subtitle">Processamento</span>
            </div>
          </div>

          <div className="floating-card card-3">
            <div className="card-icon">
              <FaBrain />
            </div>
            <div className="card-content">
              <span className="card-title">Machine Learning</span>
              <span className="card-subtitle">Automação</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll" onClick={() => {
        const nextSection = document.querySelector('.hero').nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      }}>
        <span>Descubra mais</span>
        <div className="scroll-icon">
          <FaChevronDown />
        </div>
      </div>
    </section>
  );
};

export default Hero;
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaBars, 
  FaHome, 
  FaInfoCircle, 
  FaCogs, 
  FaEnvelope,
  FaTimes,
  FaChevronDown,
  FaCreditCard
} from 'react-icons/fa';
import './Header.css';

const Header = ({ toggleSidebar, isSidebarOpen = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio'); // Nova state para seção ativa
  const location = useLocation();

  // Lista das seções para monitorar
  const navLinks = [
    { to: "/#inicio", text: "Início", icon: FaHome, hash: "#inicio", id: "inicio" },
    { to: "/#sobre", text: "Sobre", icon: FaInfoCircle, hash: "#sobre", id: "sobre" },
    { to: "/#servicos", text: "Serviços", icon: FaCogs, hash: "#servicos", id: "servicos" },
    { to: "/#planos", text: "Planos", icon: FaCreditCard, hash: "#planos", id: "planos" },
    { to: "/#contato", text: "Contato", icon: FaEnvelope, hash: "#contato", id: "contato" },
  ];

  // Hook para detectar a seção ativa
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Ajusta quando a seção é considerada "ativa"
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setActiveSection(sectionId);
          
          // Atualiza a URL sem scroll
          if (window.history.pushState) {
            const newUrl = `${window.location.pathname}#${sectionId}`;
            window.history.replaceState(null, null, newUrl);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observa todas as seções
    navLinks.forEach(link => {
      const element = document.getElementById(link.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Hook para scroll com auto-hide
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determina se o header deve ter o efeito "scrolled"
      setScrolled(currentScrollY > 50);
      
      // Auto-hide header ao fazer scroll para baixo, mostra ao scroll para cima
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Fecha menu mobile ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Função melhorada para verificar se link está ativo
  const isActive = (linkId) => {
    if (location.pathname === '/') {
      return activeSection === linkId;
    }
    return false;
  };

  // Detectar seção ativa baseada na posição inicial da página
  useEffect(() => {
    const detectInitialSection = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && navLinks.some(link => link.id === hash)) {
        setActiveSection(hash);
      } else {
        // Se não há hash, detecta baseado na posição do scroll
        const scrollPosition = window.scrollY + 100; // offset para header
        
        for (let i = navLinks.length - 1; i >= 0; i--) {
          const element = document.getElementById(navLinks[i].id);
          if (element && element.offsetTop <= scrollPosition) {
            setActiveSection(navLinks[i].id);
            break;
          }
        }
      }
    };

    // Pequeno delay para garantir que os elementos estão renderizados
    const timer = setTimeout(detectInitialSection, 100);
    return () => clearTimeout(timer);
  }, [location]);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  // Função para scroll suave
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    
    // Remove o # do targetId se existir
    const elementId = targetId.replace('#', '');
    const targetElement = document.getElementById(elementId);
    
    if (targetElement) {
      // Calcula a posição considerando a altura do header
      const headerHeight = scrolled ? 70 : 80;
      const elementPosition = targetElement.offsetTop - headerHeight - 20; // 20px de margem extra
      
      // Define imediatamente a seção como ativa para feedback visual instantâneo
      setActiveSection(elementId);
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      
      // Atualiza a URL
      window.history.pushState(null, null, `#${elementId}`);
    }
    
    // Fecha o menu mobile se estiver aberto
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''} ${!isVisible ? 'hidden' : ''}`}>
        <div className="header-content">
          {/* Logo com efeito aprimorado */}
          <div className="logo">
            <Link 
              to="/#inicio" 
              className="logo-link"
              onClick={(e) => handleSmoothScroll(e, '#inicio')}
            >
              <span className="logo-text">A2data</span>
              <div className="logo-glow"></div>
            </Link>
          </div>
          
          {/* Navegação desktop */}
          <nav className="navigation">
            <ul className="nav-links">
              {navLinks.map(link => {
                const IconComponent = link.icon;
                return (
                  <li key={link.hash}>
                    <Link 
                      to={link.to} 
                      className={`nav-link ${isActive(link.id) ? 'active' : ''}`}
                      onClick={(e) => handleSmoothScroll(e, link.hash)}
                    >
                      <IconComponent className="nav-icon" />
                      <span className="nav-text">{link.text}</span>
                      <div className="nav-link-bg"></div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Botão CTA adicional (opcional) */}
          <div className="header-actions">
            <Link 
              to="/#contato" 
              className="cta-button"
              onClick={(e) => handleSmoothScroll(e, '#contato')}
            >
              <span>Fale Conosco</span>
              <FaChevronDown className="cta-icon" />
            </Link>
          </div>
          
          {/* Botão hambúrguer mobile */}
          <button 
            className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
            onClick={handleMobileMenuToggle}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* Menu mobile */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`} id="mobile-menu">
          <div className="mobile-menu-content">
            <nav className="mobile-navigation">
              {navLinks.map(link => {
                const IconComponent = link.icon;
                return (
                  <Link 
                    key={link.hash}
                    to={link.to} 
                    className={`mobile-nav-link ${isActive(link.id) ? 'active' : ''}`}
                    onClick={(e) => handleSmoothScroll(e, link.hash)}
                  >
                    <IconComponent className="mobile-nav-icon" />
                    <span className="mobile-nav-text">{link.text}</span>
                    <div className="mobile-nav-indicator"></div>
                  </Link>
                );
              })}
            </nav>
            <div className="mobile-menu-footer">
              <Link 
                to="/#contato" 
                className="mobile-cta-button"
                onClick={(e) => handleSmoothScroll(e, '#contato')}
              >
                Fale Conosco
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay para fechar menu mobile */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}
    </>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Send, 
  ChevronUp,
  TrendingUp,
  Users,
  Briefcase,
  Copy,
  Check
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState('');
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [copiedItem, setCopiedItem] = useState(null);

  const contactData = {
    location: "Rua das Acácias, 123, Catolé, Campina Grande - PB, 58410-000",
    phone: "(83) 98906-0130",
    email: "contato@a2data.com.br"
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Email enviado:', email);
    setEmail('');
  };

  const handleMouseEnter = (e, type) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      text: `Clique para copiar ${type}`,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTooltip({
        ...tooltip,
        text: 'Copiado!'
      });
      
      setTimeout(() => {
        setCopiedItem(null);
        setTooltip({ show: false, text: '', x: 0, y: 0 });
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <footer id="contato" className="footer">
      {/* Tooltip */}
      {tooltip.show && (
        <div 
          className="tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.text}
          <div className="tooltip-arrow"></div>
        </div>
      )}

      {/* Background Animado */}
      <div className="footer-background">
        {/* Orbs flutuantes */}
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="floating-orb orb-4"></div>
        
        {/* Ondas animadas melhoradas */}
        <div className="waves-container">
          <svg className="wave-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,90 600,30 900,60 C1050,75 1150,45 1200,60 L1200,0 L0,0 Z" className="wave-path wave-1"/>
          </svg>
          <svg className="wave-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,40 C400,70 800,10 1200,40 L1200,0 L0,0 Z" className="wave-path wave-2"/>
          </svg>
          <svg className="wave-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,80 C200,50 400,110 600,80 C800,50 1000,110 1200,80 L1200,0 L0,0 Z" className="wave-path wave-3"/>
          </svg>
        </div>
        
        {/* Overlay gradiente */}
        <div className="footer-overlay"></div>
      </div>

      {/* Conteúdo do Footer */}
      <div className="footer-content">
        {/* Seção Principal */}
        <div className="footer-main">
          <div className="footer-grid">
            
            {/* Coluna da Marca */}
            <div className="brand-column">
              <div className="brand-info">
                <h3 className="brand-title">
                  A2 DATA
                </h3>
                <p className="brand-subtitle">
                  Data Intelligence
                </p>
              </div>
              
              <p className="brand-description">
                Transformamos dados em estratégias inteligentes para impulsionar o crescimento do seu negócio.
              </p>
              
              {/* Stats */}
              <div className="stats-container">
                <div className="stat-item">
                  <TrendingUp className="stat-icon" />
                  <span className="stat-text">+500 Projetos</span>
                </div>
                <div className="stat-item">
                  <Users className="stat-icon" />
                  <span className="stat-text">+100 Clientes</span>
                </div>
              </div>
            </div>
            
            {/* Links Rápidos */}
            <div className="links-column">
              <h4 className="column-title">
                <div className="column-icon solutions-icon">
                  <Briefcase className="icon" />
                </div>
                Soluções
              </h4>
              <ul className="links-list">
                {['Business Intelligence', 'Data Analytics', 'Automação', 'Consultoria', 'Dashboards'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="footer-link">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Contato */}
            <div className="contact-column">
              <h4 className="column-title">
                <div className="column-icon contact-icon">
                  <Mail className="icon" />
                </div>
                Contato
              </h4>
              
              <div className="contact-info">
                <div 
                  className="contact-item clickable-contact"
                  onClick={() => copyToClipboard(contactData.location, 'location')}
                  onMouseEnter={(e) => handleMouseEnter(e, 'endereço')}
                  onMouseLeave={handleMouseLeave}
                >
                  <MapPin className="contact-icon-item location-icon" />
                  <div>
                    <p className="contact-label">Localização</p>
                    <p className="contact-value">Campina Grande/PB</p>
                  </div>
                  {copiedItem === 'location' ? (
                    <Check className="copy-icon copied" />
                  ) : (
                    <Copy className="copy-icon" />
                  )}
                </div>
                
                <div 
                  className="contact-item clickable-contact"
                  onClick={() => copyToClipboard(contactData.phone, 'phone')}
                  onMouseEnter={(e) => handleMouseEnter(e, 'telefone')}
                  onMouseLeave={handleMouseLeave}
                >
                  <Phone className="contact-icon-item phone-icon" />
                  <div>
                    <p className="contact-label">WhatsApp</p>
                    <p className="contact-value">(83) 98906-0130</p>
                  </div>
                  {copiedItem === 'phone' ? (
                    <Check className="copy-icon copied" />
                  ) : (
                    <Copy className="copy-icon" />
                  )}
                </div>
                
                <div 
                  className="contact-item clickable-contact"
                  onClick={() => copyToClipboard(contactData.email, 'email')}
                  onMouseEnter={(e) => handleMouseEnter(e, 'email')}
                  onMouseLeave={handleMouseLeave}
                >
                  <Mail className="contact-icon-item email-icon" />
                  <div>
                    <p className="contact-label">E-mail</p>
                    <p className="contact-value">contato@a2data.com.br</p>
                  </div>
                  {copiedItem === 'email' ? (
                    <Check className="copy-icon copied" />
                  ) : (
                    <Copy className="copy-icon" />
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Newsletter e Social */}
        <div className="newsletter-social-section">
          <div className="newsletter-social-container">
            <div className="newsletter-social-grid">
              
              {/* Newsletter */}
              <div className="newsletter-section">
                <p className="newsletter-description">
                  Receba insights exclusivos sobre dados e tecnologia.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input"
                    required
                  />
                  <button
                    type="submit"
                    className="newsletter-button"
                  >
                    <Send className="newsletter-send-icon" />
                  </button>
                </form>
              </div>
              
              {/* Social */}
              <div className="social-section">
                <h4 className="social-title">Siga no Instagram</h4>
                <p className="social-description">Dicas e insights diários sobre dados</p>
                <a 
                  href="https://www.instagram.com/a2data_/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="instagram-button"
                >
                  <Instagram className="instagram-icon" />
                  <span>@a2data</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-container">
            <div className="footer-bottom-content">
              <p className="copyright">
                © 2025 A2 Data Consultoria. Todos os direitos reservados.
              </p>
              <div className="footer-links">
                <a href="#" className="footer-bottom-link">Termos de Uso</a>
                <a href="#" className="footer-bottom-link">Privacidade</a>
                <a href="#" className="footer-bottom-link">LGPD</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botão Voltar ao Topo */}
      <button
        onClick={scrollToTop}
        className={`back-to-top ${showBackToTop ? 'back-to-top-visible' : 'back-to-top-hidden'}`}
      >
        <ChevronUp className="back-to-top-icon" />
      </button>
    </footer>
  );
};

export default Footer;
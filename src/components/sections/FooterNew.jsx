import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import siteConfig from '../../data/siteConfig';
import './FooterNew.css';

const FooterNew = () => {
  const whatsappLink = `https://wa.me/${siteConfig.contact.whatsapp.number}?text=${encodeURIComponent(siteConfig.contact.whatsapp.defaultMessage)}`;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer-new">
      <div className="container">
        <div className="footer-new__grid">
          {/* Brand */}
          <div className="footer-new__brand">
            <Link to="/" className="footer-new__logo">
              <span className="footer-new__logo-a2">A2</span>
              <span className="footer-new__logo-data">Data</span>
            </Link>
            <p className="footer-new__tagline">
              Soluções digitais prontas para negócios que precisam organizar a operação e crescer com mais controle.
            </p>
          </div>

          {/* Links */}
          <div className="footer-new__col">
            <h4>Links Rápidos</h4>
            <ul>
              {siteConfig.nav.map(({ id, label, hash }) => (
                <li key={id}><a href={hash}>{label}</a></li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="footer-new__col">
            <h4>Soluções</h4>
            <ul>
              <li><Link to="/solucoes/nail-designers">Nail Designers</Link></li>
              <li><Link to="/solucoes/a2-form-ilpi">A2 FORM Controller</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-new__col">
            <h4>Contato</h4>
            <ul>
              <li><a href={whatsappLink} target="_blank" rel="noopener noreferrer">{siteConfig.contact.whatsapp.displayNumber}</a></li>
              <li><a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a></li>
              <li><a href={siteConfig.contact.instagram.url} target="_blank" rel="noopener noreferrer">{siteConfig.contact.instagram.handle}</a></li>
              <li><span>{siteConfig.contact.location}</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-new__bottom">
          <p>© 2026 A2 Data. Todos os direitos reservados.</p>
          <div className="footer-new__bottom-links">
            <span style={{cursor: 'pointer'}}>Termos de Uso</span>
            <span style={{cursor: 'pointer'}}>Privacidade</span>
            <span style={{cursor: 'pointer'}}>LGPD</span>
          </div>
        </div>
      </div>

      <button className="footer-new__top" onClick={scrollToTop} aria-label="Voltar ao topo">
        <ChevronUp size={20} />
      </button>
    </footer>
  );
};

export default FooterNew;

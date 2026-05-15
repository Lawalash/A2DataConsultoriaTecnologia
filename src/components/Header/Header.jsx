import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import siteConfig from '../../data/siteConfig';
import PreScreeningModal from '../PreScreeningModal/PreScreeningModal';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0.1 }
    );

    siteConfig.nav.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleNavClick = (e, hash) => {
    e.preventDefault();
    const id = hash.replace('#', '');

    if (location.pathname !== '/') {
      navigate('/' + hash);
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveSection(id);
      window.history.replaceState(null, null, hash);
    }
    setMobileOpen(false);
  };

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="header__inner">
          <Link to="/" className="header__logo" onClick={(e) => handleNavClick(e, '#inicio')}>
            <span className="header__logo-a2">A2</span>
            <span className="header__logo-data">Data</span>
          </Link>

          <nav className="header__nav">
            {siteConfig.nav.map(({ id, label, hash }) => (
              <a
                key={id}
                href={hash}
                className={`header__link ${activeSection === id && location.pathname === '/' ? 'header__link--active' : ''}`}
                onClick={(e) => handleNavClick(e, hash)}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <button onClick={() => setModalOpen(true)} className="btn btn-whatsapp btn-sm header__cta">
              <FaWhatsapp size={16} />
              <span>Falar com Consultor</span>
            </button>
          </div>

          <button
            className={`header__hamburger ${mobileOpen ? 'header__hamburger--open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'mobile-menu--open' : ''}`}>
        <div className="mobile-menu__overlay" onClick={() => setMobileOpen(false)} />
        <div className="mobile-menu__panel">
          <nav className="mobile-menu__nav">
            {siteConfig.nav.map(({ id, label, hash }) => (
              <a
                key={id}
                href={hash}
                className={`mobile-menu__link ${activeSection === id ? 'mobile-menu__link--active' : ''}`}
                onClick={(e) => handleNavClick(e, hash)}
              >
                {label}
              </a>
            ))}
          </nav>
          <button onClick={() => { setMobileOpen(false); setModalOpen(true); }} className="btn btn-whatsapp btn-lg mobile-menu__cta">
            <FaWhatsapp size={18} />
            <span>Falar com Consultor</span>
          </button>
        </div>
      </div>
      <PreScreeningModal isOpen={modalOpen} onClose={() => setModalOpen(false)} solution={null} />
    </>
  );
};

export default Header;
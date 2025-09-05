import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaHome, FaInfoCircle, FaCogs, FaEnvelope } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
  // Desabilitar o scroll quando o sidebar estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fechar o sidebar quando um link é clicado
  const handleLinkClick = () => {
    closeSidebar();
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'active' : ''}`}>
        <button className="close-btn" onClick={closeSidebar} aria-label="Fechar">
          <FaTimes />
        </button>
        <ul className="sidebar-links">
          <li>
            <Link to="/#inicio" onClick={handleLinkClick}>
              <FaHome className="sidebar-icon" /> Início
            </Link>
          </li>
          <li>
            <Link to="/#sobre" onClick={handleLinkClick}>
              <FaInfoCircle className="sidebar-icon" /> Sobre
            </Link>
          </li>
          <li>
            <Link to="/#servicos" onClick={handleLinkClick}>
              <FaCogs className="sidebar-icon" /> Serviços
            </Link>
          </li>
          <li>
            <Link to="/#contato" onClick={handleLinkClick}>
              <FaEnvelope className="sidebar-icon" /> Contato
            </Link>
          </li>
        </ul>
      </div>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
      ></div>
    </>
  );
};

export default Sidebar;
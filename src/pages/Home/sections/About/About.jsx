import React from 'react';
import { FaReact, FaBrain, FaChartLine, FaCloudUploadAlt, FaCodeBranch } from 'react-icons/fa';
import yanImage from '../../../../assets/imagens/Yan.png';
import ricardoImage from '../../../../assets/imagens/Ricardo.png';
import './About.css';

const About = () => {
  return (
    <section id="sobre" className="socios">
      {/* Yan - Especialista em Dados */}
      <div className="socio-card">
        <div className="socio-img-container">
          <img src={yanImage} alt="Yan" className="socio-img" />
        </div>
        <div className="socio-overlay yan-overlay">
          <div className="overlay-content">
            <div className="icones-animados">
              <FaReact className="icone fab" />
              <FaBrain className="icone fas" />
              <FaChartLine className="icone fas" />
            </div>
            <h3 className="socio-nome">Yan Silva</h3>
            <div className="socio-divider"></div>
            <p className="socio-skills">
              Data Science<br />
              Machine Learning<br />
              Big Data Analytics
            </p>
          </div>
        </div>
      </div>

      {/* Ricardo - Especialista em Tecnologia */}
      <div className="socio-card">
        <div className="socio-img-container">
          <img src={ricardoImage} alt="Ricardo" className="socio-img" />
        </div>
        <div className="socio-overlay tech-overlay">
          <div className="overlay-content">
           <div className="icones-animados">
              <FaBrain className="icone fas" />
              <FaCloudUploadAlt className="icone fas" />
              <FaCodeBranch className="icone fas" />
            </div>
            <h3 className="socio-nome">Ricardo Alexandre</h3>
            <div className="socio-divider"></div>
            <p className="socio-skills">
              AI Development<br />
              Cloud Solutions<br />
              Web 3.0
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

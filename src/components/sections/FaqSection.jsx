import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqGeneral } from '../../data/faq';
import './FaqSection.css';

const FaqItem = ({ question, answer, isOpen, onClick }) => (
  <div className={`faq-item glass-card ${isOpen ? 'faq-item--open' : ''}`} onClick={onClick}>
    <div className="faq-item__header">
      <h3 className="faq-item__question">{question}</h3>
      <ChevronDown size={18} className="faq-item__chevron" />
    </div>
    <div className="faq-item__body">
      <p className="faq-item__answer">{answer}</p>
    </div>
  </div>
);

const FaqSection = ({ items = faqGeneral, title = 'Perguntas Frequentes' }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="faq">
      <div className="container">
        <div className="faq__header">
          <span className="section-label">FAQ</span>
          <h2 className="section-title">{title}</h2>
        </div>

        <div className="faq__list">
          {items.map((item, i) => (
            <FaqItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;

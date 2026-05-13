import React, { useEffect } from 'react';
import HeroSection from '../../components/sections/HeroSection';
import SolutionsSection from '../../components/sections/SolutionsSection';
import HowItWorksSection from '../../components/sections/HowItWorksSection';
import CasesSection from '../../components/sections/CasesSection';
import WhyChooseUsSection from '../../components/sections/WhyChooseUsSection';
import FounderSection from '../../components/sections/FounderSection';
import FaqSection from '../../components/sections/FaqSection';
import ContactSection from '../../components/sections/ContactSection';
import FooterNew from '../../components/sections/FooterNew';

const Home = () => {
  useEffect(() => {
    const { hash } = window.location;
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.substring(1));
        if (el) {
          const offset = 80;
          const top = el.offsetTop - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 200);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <>
      <HeroSection />
      <SolutionsSection />
      <HowItWorksSection />
      <CasesSection />
      <WhyChooseUsSection />
      <FounderSection />
      <FaqSection />
      <ContactSection />
      <FooterNew />
    </>
  );
};

export default Home;

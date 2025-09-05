// src/pages/Home/Home.jsx
import React, { useEffect } from 'react';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import Services from './sections/Services/Services';
import Plans from './sections/Plans/Plans';
import Footer from './sections/Footer/Footer';

const Home = () => {
  useEffect(() => {
    const { hash } = window.location;
    if (hash) {
      const el = document.getElementById(hash.substring(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, []);

  return (
    <>
      <Hero />
      <About />
      <Services />
      <Plans />
      <Footer /> 
    </>
  );
};

export default Home;

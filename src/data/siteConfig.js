// src/data/siteConfig.js
// Configurações centralizadas do site A2 Data

const siteConfig = {
  brand: {
    name: 'A2 Data',
    tagline: 'Soluções Digitais',
    description: 'A A2 Data desenvolve soluções digitais prontas para negócios que precisam organizar a operação, reduzir trabalho manual e crescer com mais controle.',
  },
  founder: {
    name: 'Ricardo Alexandre',
    role: 'Fundador da A2 Data · Desenvolvedor de Sistemas · Criador de Soluções SaaS',
    bio: 'Sou Ricardo Alexandre, desenvolvedor e fundador da A2 Data. Trabalho criando sistemas que transformam rotinas manuais em processos digitais mais simples, organizados e escaláveis. Meu foco é desenvolver soluções acessíveis para nichos específicos, com atendimento próximo, clareza comercial e evolução contínua.',
    highlights: [
      'Desenvolvimento de sistemas',
      'Automação de processos',
      'Soluções SaaS',
      'Atendimento consultivo',
    ],
    photo: '/assets/imagens/Ricardo.png',
  },
  contact: {
    whatsapp: {
      number: '5583993725984',
      displayNumber: '(83) 99372-5984',
      defaultMessage: 'Olá, Ricardo! Vi o site da A2 Data e gostaria de conhecer melhor as soluções.',
    },
    email: 'jrvariedadescg@gmail.com',
    instagram: {
      url: 'https://www.instagram.com/a2data_/',
      handle: '@a2data_',
    },
    location: 'R. Robério Maracajá Henrique, 345 - Três Irmãs',
  },
  seo: {
    title: 'A2 Data — Soluções Digitais Prontas para seu Negócio',
    description: 'A A2 Data desenvolve sistemas acessíveis para nichos específicos. Sistema para Nail Designers e Gestão de ILPIs. Implantação simples, suporte próximo e cancelamento sem multa.',
    keywords: 'soluções digitais, sistema nail designer, sistema ILPI, gestão digital, A2 Data, Campina Grande, SaaS',
  },
  nav: [
    { id: 'inicio', label: 'Início', hash: '#inicio' },
    { id: 'solucoes', label: 'Soluções', hash: '#solucoes' },
    { id: 'como-funciona', label: 'Como Funciona', hash: '#como-funciona' },
    { id: 'cases', label: 'Cases', hash: '#cases' },
    { id: 'sobre', label: 'Sobre', hash: '#sobre' },
    { id: 'contato', label: 'Contato', hash: '#contato' },
  ],
};

export default siteConfig;

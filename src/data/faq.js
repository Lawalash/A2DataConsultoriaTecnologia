// src/data/faq.js
// Dados centralizados do FAQ A2 Data

const faqGeneral = [
  {
    question: 'Existe fidelidade?',
    answer: 'Não. O cancelamento pode ser feito sem multa.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer: 'Sim. O cliente não fica preso por contrato de permanência.',
  },
  {
    question: 'O suporte está incluso?',
    answer: 'Sim, o suporte básico e correções de funcionamento estão inclusos conforme cada plano.',
  },
  {
    question: 'Posso pedir melhorias?',
    answer: 'Sim. Ajustes extras, personalizações e novas funcionalidades são avaliados e orçados separadamente.',
  },
  {
    question: 'O sistema funciona no celular?',
    answer: 'Sim. As soluções são responsivas e pensadas para uso em diferentes dispositivos.',
  },
  {
    question: 'Como funciona a implantação?',
    answer: 'Após a contratação, a A2 Data configura a solução e orienta o cliente para começar a usar.',
  },
  {
    question: 'Posso ver uma demonstração antes de contratar?',
    answer: 'Sim. As soluções contam com vídeos e podem ter apresentação guiada com Ricardo.',
  },
];

const faqNail = [
  {
    question: 'Preciso ter CNPJ para contratar?',
    answer: 'Não. A solução é voltada tanto para profissionais autônomas quanto para estúdios formalizados.',
  },
  {
    question: 'Posso personalizar minha página?',
    answer: 'Sim. A página é configurada com sua marca, cores, serviços e portfólio.',
  },
  {
    question: 'O agendamento é automático?',
    answer: 'A estrutura de agendamento permite que suas clientes escolham horários disponíveis na sua agenda.',
  },
  ...faqGeneral,
];

const faqIlpi = [
  {
    question: 'A solução atende às exigências regulatórias?',
    answer: 'A plataforma foi desenhada para organizar e padronizar registros conforme boas práticas de gestão de ILPIs.',
  },
  {
    question: 'Quantos funcionários posso cadastrar?',
    answer: 'Não há limite de cadastro de funcionários ou residentes no plano padrão.',
  },
  {
    question: 'Os dados são seguros?',
    answer: 'Sim. A plataforma conta com autenticação multifator, perfis de acesso e rastreabilidade de ações.',
  },
  ...faqGeneral,
];

export { faqGeneral, faqNail, faqIlpi };

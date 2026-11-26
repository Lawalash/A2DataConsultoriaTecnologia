// src/data/solutions.js
// Dados centralizados das soluções A2 Data

const solutions = [
  {
    id: 'studios-beleza',
    slug: 'studios-beleza',
    name: 'Sistema para Studios de Beleza',
    shortName: 'Studios de Beleza',
    icon: 'Sparkles',
    coverImage: '/assets/solutions/nail-designers/cover.webp',
    videoThumbnail: '/assets/solutions/nail-designers/video-thumb.webp',
    heroImage: '/assets/solutions/nail-designers/hero.png',
    audience: 'Nail designers, manicures, studios de beleza e profissionais de estética',
    shortDescription: 'Solução completa para presença digital e gestão de studios de beleza, com site público, portfólio de procedimentos e painel administrativo para controlar clientes, financeiro, estoque e serviços.',
    headline: 'Site profissional, clientes, caixa, estoque e portfólio em uma única plataforma.',
    subheadline: 'Organize seu negócio, venda com mais facilidade e apresente sua marca com uma presença digital forte.',
    commercialPhrases: [
      'Sua marca com presença digital profissional e gestão simples em um só lugar.',
      'Mostre seus serviços, organize seu estoque e tenha mais controle do seu faturamento.',
      'Aumente o valor percebido do seu trabalho.'
    ],
    targetAudience: [
      'Nail designers autônomas',
      'Manicures',
      'Studios de beleza',
      'Profissionais de estética'
    ],
    pains: [
      'Controle de clientes bagunçado',
      'Dificuldade de mostrar portfólio e serviços',
      'Perda de produtos no estoque',
      'Falta de visão financeira (caixa)',
      'Falta de uma página profissional na web'
    ],
    benefits: [
      'Presença digital profissional',
      'Portfólio de procedimentos atualizado',
      'Controle de clientes e histórico',
      'Gestão financeira do negócio',
      'Controle de estoque e insumos',
      'Painel administrativo simples'
    ],
    tags: ['Beleza', 'Nail Design', 'Site', 'Gestão', 'Caixa', 'Estoque', 'React', 'Supabase'],
    status: 'Em desenvolvimento / demonstração',
    type: 'Site + Sistema Web',
    pricing: {
      trial: '15 dias grátis',
      launchPrice: null,
      regularPrice: 149.90,
      startingFrom: true,
      displayText: 'Planos a partir de R$ 149,90/mês',
      implantation: null,
      implantationNote: null,
      cancellation: 'Cancelamento sem multa',
    },
    ctas: {
      primary: { text: 'Quero testar por 15 dias', action: 'whatsapp' },
      secondary: { text: 'Ver demonstração', action: 'video' },
      tertiary: { text: 'Falar no WhatsApp', action: 'whatsapp' },
    },
    whatsappMessage: 'Olá, Ricardo! Vi o sistema para Studios de Beleza no site da A2 Data e quero entender como funcionaria para mim.',
    videoUrl: 'https://www.youtube.com/embed/VhC2IlNQgmw',
    videoPlaceholder: false,
  },
  {
    id: 'a2-datapoint',
    slug: 'a2-datapoint',
    name: 'A2 DataPoint',
    shortName: 'A2 DataPoint',
    icon: 'Activity',
    coverImage: '/assets/solutions/a2-form-ilpi/cover.webp',
    videoThumbnail: '/assets/solutions/a2-form-ilpi/video-thumb.webp',
    heroImage: '/assets/solutions/a2-form-ilpi/hero.png',
    audience: 'ILPIs, clínicas, instituições de saúde e empresas com equipes presenciais ou externas',
    shortDescription: 'Controle de ponto moderno com registro por matrícula, foto, geolocalização, escalas, sinalizações e painel administrativo para auditoria em tempo real.',
    headline: 'Ponto eletrônico com foto e GPS para ILPIs e equipes.',
    subheadline: 'Modernize o controle de presença da sua equipe, eliminando fraudes e retrabalho do RH.',
    commercialPhrases: [
      'Controle de ponto antifraude e simplificado.',
      'Auditoria de jornadas em tempo real.',
      'Sinalização imediata de atrasos e horas extras.'
    ],
    targetAudience: [
      'ILPIs e clínicas',
      'Equipes presenciais e externas',
      'Departamentos de RH e gestão de pessoas'
    ],
    pains: [
      'Fraudes na marcação de ponto',
      'Controle manual sujeito a erros',
      'Dificuldade de fechar o espelho de ponto',
      'Falta de rastreabilidade na geolocalização'
    ],
    benefits: [
      'Registro de ponto com foto e GPS',
      'Gestão de escalas e colaboradores',
      'Sinalizações de atraso, hora extra e inconsistências',
      'Banco de horas com auditoria',
      'Painel administrativo em tempo real',
      'Segurança com autenticação e MFA'
    ],
    tags: ['Ponto eletrônico', 'GPS', 'Foto', 'ILPI', 'RH', 'Supabase', 'React'],
    status: 'Em homologação / implantação',
    type: 'Sistema Web',
    pricing: null,
    ctas: {
      primary: { text: 'Solicitar demonstração', action: 'whatsapp' },
      secondary: { text: 'Demonstração em breve', action: 'video' },
      tertiary: { text: 'Falar com Ricardo', action: 'whatsapp' },
    },
    whatsappMessage: 'Olá, Ricardo! Vi o A2 DataPoint no site e gostaria de conhecer a solução para minha empresa.',
    videoUrl: null,
    videoPlaceholder: true,
  },
  {
    id: 'superbox-plus',
    slug: 'superbox-plus',
    name: 'SuperBox Plus',
    shortName: 'SuperBox Plus',
    icon: 'ShoppingCart',
    coverImage: '/assets/solutions/superbox/cover.webp',
    videoThumbnail: '/assets/solutions/superbox/video-thumb.webp',
    heroImage: '/assets/solutions/superbox/hero.png',
    audience: 'Mercadinhos, conveniências e comércios de bairro',
    shortDescription: 'Sistema desktop para mercadinhos e conveniências, com PDV, leitor de código de barras, controle de estoque por validade, impressão térmica, fechamento de caixa, backup e integração com nuvem.',
    headline: 'PDV completo para comércio de bairro, com estoque, Pix e funcionamento offline.',
    subheadline: 'Simplifique a frente de caixa e gerencie seu mercadinho sem depender de internet para vender.',
    commercialPhrases: [
      'Acelere o checkout e evite filas.',
      'Nunca pare de vender, mesmo sem internet.',
      'Controle perdas e vencimentos no estoque.'
    ],
    targetAudience: [
      'Mercados e mercadinhos',
      'Lojas de conveniência',
      'Pequenos varejistas'
    ],
    pains: [
      'Sistemas lentos e complexos',
      'Dependência de internet no caixa',
      'Produtos perdendo a validade no estoque',
      'Fechamento de caixa demorado'
    ],
    benefits: [
      'Funciona offline',
      'PDV com código de barras',
      'Controle de estoque e validade',
      'Pix Online no caixa',
      'Impressão térmica',
      'Dashboard e relatórios'
    ],
    tags: ['PDV', 'Varejo', 'Estoque', 'Pix', 'Offline', 'C#', 'SQLite', 'Supabase'],
    status: 'Em implementação / pré-produção',
    type: 'Sistema Desktop',
    pricing: null,
    ctas: {
      primary: { text: 'Conhecer solução', action: 'whatsapp' },
      secondary: { text: 'Demonstração em breve', action: 'video' },
      tertiary: { text: 'Falar com Ricardo', action: 'whatsapp' },
    },
    whatsappMessage: 'Olá, Ricardo! Vi o SuperBox Plus no site e gostaria de saber mais.',
    videoUrl: null,
    videoPlaceholder: true,
  },
  {
    id: 'rv-acaiteria',
    slug: 'rv-acaiteria',
    name: 'RV Açaíteria',
    shortName: 'RV Açaíteria',
    icon: 'Utensils',
    coverImage: '/assets/solutions/rvacaiteria/cover.webp',
    videoThumbnail: '/assets/solutions/rvacaiteria/video-thumb.webp',
    heroImage: '/assets/solutions/rvacaiteria/hero.png',
    audience: 'Açaíterias, hamburguerias e deliveries de alimentação',
    shortDescription: 'Plataforma web de delivery para food service, com cardápio online, pedidos em tempo real, painel administrativo, controle de caixa, estoque, clientes, entregadores e programa de fidelidade.',
    headline: 'Delivery próprio com gestão de pedidos, entregas, caixa e fidelidade.',
    subheadline: 'Diga adeus às altas taxas de aplicativos e centralize seus pedidos em uma plataforma robusta.',
    commercialPhrases: [
      'Não perca dinheiro com taxas abusivas.',
      'Fidelize seu cliente e aumente as vendas.',
      'Gestão em tempo real do pedido à entrega.'
    ],
    targetAudience: [
      'Açaíterias e sorveterias',
      'Hamburguerias',
      'Pizzarias',
      'Deliveries em geral'
    ],
    pains: [
      'Taxas altas do iFood e afins',
      'Erros ao anotar pedidos pelo WhatsApp',
      'Desorganização nas entregas',
      'Falta de retenção de clientes (fidelidade)'
    ],
    benefits: [
      'Cardápio online personalizado',
      'Gestão de pedidos em tempo real',
      'Painel do entregador',
      'Controle de caixa e estoque',
      'Programa de fidelidade',
      'Impressão de pedidos'
    ],
    tags: ['Delivery', 'Food Service', 'React', 'Supabase', 'Realtime', 'Fidelidade'],
    status: 'Em desenvolvimento avançado',
    type: 'Sistema Web',
    pricing: null,
    ctas: {
      primary: { text: 'Conhecer solução', action: 'whatsapp' },
      secondary: { text: 'Demonstração em breve', action: 'video' },
      tertiary: { text: 'Falar com Ricardo', action: 'whatsapp' },
    },
    whatsappMessage: 'Olá, Ricardo! Gostaria de saber mais sobre a solução de delivery RV Açaíteria.',
    videoUrl: null,
    videoPlaceholder: true,
  },
  {
    id: 'a2-event-off',
    slug: 'a2-event-off',
    name: 'A2 Event OFF',
    shortName: 'Event OFF',
    icon: 'Smartphone',
    coverImage: '/assets/solutions/event-off/cover.webp',
    videoThumbnail: '/assets/solutions/event-off/video-thumb.webp',
    heroImage: '/assets/solutions/event-off/hero.png',
    audience: 'Produtores de eventos, feiras e operações itinerantes',
    shortDescription: 'Aplicativo Android nativo para lançar pedidos, controlar comandas, calcular troco, registrar vendas e acompanhar o financeiro em eventos onde a internet pode falhar.',
    headline: 'PDV Android offline para eventos, feiras e operações sem internet.',
    subheadline: 'Venda de forma ágil em qualquer lugar, sem depender do sinal 4G ou Wi-Fi.',
    commercialPhrases: [
      'Nunca perca uma venda por falta de sinal.',
      'Lançamento rápido para evitar filas em eventos.',
      'Tudo salvo no celular e sincronizado depois.'
    ],
    targetAudience: [
      'Organizadores de feiras e eventos',
      'Food trucks e barracas',
      'Operações itinerantes'
    ],
    pains: [
      'Sistemas que travam sem internet',
      'Filas gigantes por demora no caixa',
      'Falta de controle rápido de comandas',
      'Perda de vendas'
    ],
    benefits: [
      '100% offline',
      'App Android nativo',
      'Pedidos e comandas',
      'Controle de caixa',
      'Histórico de vendas',
      'Ideal para eventos e feiras'
    ],
    tags: ['Android', 'Kotlin', 'Offline', 'Eventos', 'PDV', 'Comandas'],
    status: 'Beta funcional / homologação',
    type: 'Aplicativo Android',
    pricing: null,
    ctas: {
      primary: { text: 'Conhecer solução', action: 'whatsapp' },
      secondary: { text: 'Demonstração em breve', action: 'video' },
      tertiary: { text: 'Falar com Ricardo', action: 'whatsapp' },
    },
    whatsappMessage: 'Olá, Ricardo! O A2 Event OFF me chamou atenção, gostaria de uma demonstração.',
    videoUrl: null,
    videoPlaceholder: true,
  }
];

export default solutions;

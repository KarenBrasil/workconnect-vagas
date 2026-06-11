const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyB_3qNra19Q5klUYpQZYQSshrf3W6UCt1A",
  authDomain: "workconnect-5da4a.firebaseapp.com",
  projectId: "workconnect-5da4a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const vagas = [
  {
    titulo: "Desenvolvedor Front-end React Pleno",
    empresa: "TechSolutions BR",
    contrato: "CLT",
    salario: "R$ 6.000,00",
    descricao: "Buscamos um desenvolvedor com experiência em ReactJS, TypeScript e Styled Components para atuar em projetos de grande escala. Trabalho 100% remoto.",
    contato: "vagas@techsolutions.com.br",
  },
  {
    titulo: "Ofereço: Serviços de UI/UX Design",
    empresa: "Profissional Autônomo (Camila S.)",
    contrato: "Freelance",
    salario: "A combinar",
    descricao: "Sou designer UI/UX com 4 anos de experiência criando interfaces modernas e responsivas no Figma. Procuro projetos freelancer para aplicativos mobile ou web.",
    contato: "camila.design@gmail.com",
  },
  {
    titulo: "Engenheiro de Dados Sênior",
    empresa: "DataCorp",
    contrato: "PJ",
    salario: "R$ 14.000,00",
    descricao: "Procuramos Engenheiro de Dados Sênior com forte conhecimento em AWS, Python, Spark e pipelines ETL robustos. Necessário inglês avançado.",
    contato: "rh@datacorp.io",
  },
  {
    titulo: "Ofereço: Consultoria em Segurança da Informação",
    empresa: "Profissional Autônomo (Ricardo P.)",
    contrato: "PJ",
    salario: "R$ 150/hora",
    descricao: "Especialista em pentest e adequação à LGPD. Ajudo a sua startup a blindar as aplicações antes de ir para produção. Faça uma auditoria completa com meu serviço.",
    contato: "ricardo.sec@protonmail.com",
  },
  {
    titulo: "Desenvolvedor Backend Node.js",
    empresa: "Startup Inova",
    contrato: "PJ",
    salario: "R$ 8.500,00",
    descricao: "Vaga para desenvolvedor Node.js com foco em APIs RESTful, microsserviços e bancos de dados relacionais e NoSQL (Postgres e MongoDB).",
    contato: "talentos@inova.com",
  },
  {
    titulo: "Ofereço: Desenvolvimento Mobile (React Native)",
    empresa: "Profissional Autônomo (João M.)",
    contrato: "Freelance",
    salario: "A combinar",
    descricao: "Precisa de um app rápido e moderno para iOS e Android? Sou desenvolvedor React Native criando apps de alta performance com Expo. Entre em contato para orçamentos.",
    contato: "joaom.dev@outlook.com",
  },
  {
    titulo: "Analista de Marketing Digital (Tech)",
    empresa: "Agência Click",
    contrato: "CLT",
    salario: "R$ 4.500,00",
    descricao: "Procuramos especialista em tráfego pago e SEO focado no nicho de tecnologia e SaaS. Trabalho híbrido em São Paulo.",
    contato: "vagas@agenciaclick.com",
  },
  {
    titulo: "Ofereço: Gestão de Projetos Ágeis (Scrum Master)",
    empresa: "Profissional Autônomo (Amanda F.)",
    contrato: "PJ",
    salario: "A combinar",
    descricao: "Sou Scrum Master certificada, ajudo equipes de desenvolvimento a otimizarem suas entregas e melhorarem a comunicação interna.",
    contato: "amanda.agile@gmail.com",
  },
  {
    titulo: "Desenvolvedor Python (Júnior)",
    empresa: "CodeBase",
    contrato: "CLT",
    salario: "R$ 3.500,00",
    descricao: "Vaga de entrada para desenvolvedores Python. Você trabalhará junto com nossos seniores na criação de bots e automações web. Ótima oportunidade de aprendizado.",
    contato: "rh@codebase.tech",
  },
  {
    titulo: "Ofereço: Edição de Vídeo para YouTube/Reels",
    empresa: "Profissional Autônomo (Lucas V.)",
    contrato: "Freelance",
    salario: "R$ 50/vídeo curto",
    descricao: "Editor de vídeo especializado em formato curto (TikTok, Reels, Shorts) para criadores de conteúdo tech e programadores.",
    contato: "lucas.edits@gmail.com",
  },
  {
    titulo: "Tech Lead",
    empresa: "Fintech PayRight",
    contrato: "PJ",
    salario: "R$ 18.000,00",
    descricao: "Buscamos líder técnico para guiar o esquadrão principal de pagamentos. Necessário experiência prévia em fintechs e liderança de times.",
    contato: "vagas@payright.com.br",
  },
  {
    titulo: "Ofereço: Criação de Landing Pages Alta Conversão",
    empresa: "Profissional Autônomo (Fernanda L.)",
    contrato: "Freelance",
    salario: "R$ 1.500/projeto",
    descricao: "Desenvolvo landing pages em Next.js super rápidas com SEO otimizado, ideais para o lançamento de produtos de tecnologia e infoprodutos.",
    contato: "fernanda.web@gmail.com",
  },
  {
    titulo: "Especialista em Cloud AWS",
    empresa: "CloudSec BR",
    contrato: "PJ",
    salario: "R$ 12.000,00",
    descricao: "Precisa-se de profissional certificado AWS para atuar na migração de servidores legados para arquitetura serverless.",
    contato: "recrutamento@cloudsec.com",
  },
  {
    titulo: "Ofereço: Testes de QA Manuais e Automatizados",
    empresa: "Profissional Autônomo (Bruno T.)",
    contrato: "Freelance",
    salario: "A combinar",
    descricao: "Sou analista de testes (QA) com experiência em Cypress e Selenium. Ofereço serviço de caça a bugs antes de você lançar a sua aplicação no mercado.",
    contato: "bruno.qa@gmail.com",
  },
  {
    titulo: "Suporte Técnico Nível 2",
    empresa: "HelpDesk TI",
    contrato: "CLT",
    salario: "R$ 2.800,00",
    descricao: "Atendimento técnico a clientes B2B via chat e telefone. Necessário conhecimentos básicos em redes, Linux e resolução de problemas de software.",
    contato: "suporte.vagas@helpdesk.com",
  }
];

async function seed() {
  console.log("Iniciando injeção de 15 vagas fictícias...");
  for (let i = 0; i < vagas.length; i++) {
    const vaga = {
      ...vagas[i],
      criadoEm: new Date(Date.now() - i * 3600000).toISOString(), // tempos ligeiramente diferentes
    };
    try {
      await addDoc(collection(db, 'vagas'), vaga);
      console.log(`Vaga ${i + 1} adicionada: ${vaga.titulo}`);
    } catch (e) {
      console.error(`Erro ao adicionar vaga ${i + 1}:`, e);
    }
  }
  console.log("Processo finalizado com sucesso!");
  process.exit(0);
}

seed();

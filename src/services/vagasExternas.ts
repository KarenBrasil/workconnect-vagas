export interface VagaExterna {
  id: string;
  titulo: string;
  empresa: string;
  local: string;
  link: string;
  fonte: string;
  descricao: string;
  tempoPostagem: string;
  tags: string[];
  dataOriginal: Date;
}

function calcularTempoPostagem(data: Date): string {
  const agora = new Date();
  const difMs = agora.getTime() - data.getTime();
  const difHoras = Math.floor(difMs / (1000 * 60 * 60));
  const difDias = Math.floor(difHoras / 24);

  if (difHoras < 1) return 'Há menos de 1 hora';
  if (difHoras < 24) return `Há ${difHoras} hora${difHoras > 1 ? 's' : ''}`;
  if (difDias === 1) return 'Há 1 dia';
  return `Há ${difDias} dias`;
}

function extrairTags(texto: string, labelsBase: string[] = []): string[] {
  const tags = new Set<string>();
  
  labelsBase.forEach(l => {
    if (l) tags.add(l.trim());
  });

  const lower = texto.toLowerCase();

  // Modelos de Contrato
  if (lower.includes('pj') && !tags.has('PJ')) tags.add('PJ');
  if (lower.includes('clt') && !tags.has('CLT')) tags.add('CLT');
  if ((lower.includes('freelance') || lower.includes('freela')) && !tags.has('Freelance')) tags.add('Freelance');

  // Modelos de Trabalho
  if ((lower.includes('remoto') || lower.includes('remote') || lower.includes('home office')) && !tags.has('Remoto')) tags.add('Remoto');
  if ((lower.includes('híbrido') || lower.includes('hibrido') || lower.includes('hybrid')) && !tags.has('Híbrido')) tags.add('Híbrido');
  if ((lower.includes('presencial') || lower.includes('onsite')) && !tags.has('Presencial')) tags.add('Presencial');

  // Locais Internacionais Comuns
  if (lower.includes('worldwide') || lower.includes('anywhere')) tags.add('Worldwide 🌍');
  if (lower.includes('europe') || lower.includes('europa')) tags.add('Europa 🇪🇺');
  if (lower.includes('portugal')) tags.add('Portugal 🇵🇹');
  if (lower.includes('eua') || lower.includes('usa') || lower.includes('united states')) tags.add('EUA 🇺🇸');
  
  // Áreas Específicas
  if (lower.includes('redes') || lower.includes('network')) tags.add('Redes');
  if (lower.includes('suporte') || lower.includes('support')) tags.add('Suporte');
  if (lower.includes('devops')) tags.add('DevOps');
  if (lower.includes('dados') || lower.includes('data')) tags.add('Dados');
  
  return Array.from(tags).slice(0, 4);
}

// Limpa colchetes e parênteses do título para ficar puro
function limparTitulo(titulo: string): string {
  return titulo
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/-/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const reposGithub = [
  { fonte: 'Front-End BR', url: 'https://api.github.com/repos/frontendbr/vagas/issues?state=open&sort=created&direction=desc&per_page=12' },
  { fonte: 'Back-End BR', url: 'https://api.github.com/repos/backend-br/vagas/issues?state=open&sort=created&direction=desc&per_page=12' },
  { fonte: 'React BR', url: 'https://api.github.com/repos/react-brasil/vagas/issues?state=open&sort=created&direction=desc&per_page=8' },
  { fonte: 'QA Brasil', url: 'https://api.github.com/repos/qa-brasil/vagas/issues?state=open&sort=created&direction=desc&per_page=5' },
  { fonte: 'Infra & Redes', url: 'https://api.github.com/repos/devopsbr/vagas/issues?state=open&sort=created&direction=desc&per_page=5' }
];

export const buscarVagasExternas = async (termo: string = ''): Promise<VagaExterna[]> => {
  const todas: VagaExterna[] = [];
  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
  const termoBusca = termo.toLowerCase().trim();

  // 1. Busca no GITHUB
  for (const repo of reposGithub) {
    try {
      const response = await fetch(repo.url, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      });

      if (!response.ok) continue;
      const items = await response.json();

      const vagasFiltradas = items.filter((item: any) => {
        if (item.pull_request) return false;
        const texto = `${item.title} ${item.body || ''}`.toLowerCase();
        if (termoBusca && termoBusca !== 'desenvolvedor' && termoBusca !== '') {
          if (!texto.includes(termoBusca)) return false;
        }
        return new Date(item.created_at) >= tresMesesAtras;
      });

      const vagas = vagasFiltradas.map((item: any) => {
        let empresa = '';
        const matchEmpresa = item.title.match(/\[(.*?)\]/);
        if (matchEmpresa && matchEmpresa[1] && !matchEmpresa[1].toLowerCase().includes('remoto')) {
            empresa = matchEmpresa[1];
        }

        const labels = item.labels ? item.labels.map((l: any) => l.name) : [];
        const tags = extrairTags(`${item.title} ${item.body || ''}`, labels);

        return {
          id: `github-${item.id}`,
          titulo: limparTitulo(item.title),
          empresa: empresa,
          local: '', // Deixamos vazio se não for explícito para não poluir
          link: item.html_url,
          fonte: 'GitHub BR',
          descricao: item.body || '',
          tempoPostagem: calcularTempoPostagem(new Date(item.created_at)),
          tags,
          dataOriginal: new Date(item.created_at)
        };
      });

      todas.push(...vagas);
    } catch (e) {
      console.log(`Erro ao buscar feed ${repo.fonte}:`, e);
    }
  }

  // 2. Busca no REMOTIVE (Internacional - Todas as categorias de TI)
  try {
    const url = `https://remotive.com/api/remote-jobs?limit=40`;
    const response = await fetch(url);
    if (response.ok) {
      const json = await response.json();
      const vagasRemotive = json.jobs.filter((item: any) => {
        const texto = `${item.title} ${item.category} ${item.description || ''}`.toLowerCase();
        // Filtramos para áreas de tecnologia que importam (inclui QA, Data, Design, Support, Dev)
        const isTech = ['software-dev', 'data', 'qa', 'devops', 'customer-support', 'design'].includes(item.category);
        if (!isTech) return false;

        if (termoBusca && termoBusca !== 'desenvolvedor' && termoBusca !== '') {
            if (!texto.includes(termoBusca)) return false;
        }
        return new Date(item.publication_date) >= tresMesesAtras;
      }).map((item: any) => {
        const baseTags = [];
        if (item.candidate_required_location) baseTags.push(item.candidate_required_location);
        const tags = extrairTags(`${item.title} ${item.job_type}`, baseTags);

        if (!tags.includes('Remoto')) tags.push('Remoto');

        return {
          id: `remotive-${item.id}`,
          titulo: limparTitulo(item.title),
          empresa: item.company_name,
          local: item.candidate_required_location || '',
          link: item.url,
          fonte: 'Remotive',
          descricao: item.description || '',
          tempoPostagem: calcularTempoPostagem(new Date(item.publication_date)),
          tags: tags.slice(0, 4),
          dataOriginal: new Date(item.publication_date)
        };
      });

      todas.push(...vagasRemotive);
    }
  } catch (e) {
    console.log(`Erro ao buscar feed Remotive:`, e);
  }

  // 3. Busca no RemoteOK (Internacional)
  try {
    const response = await fetch('https://remoteok.com/api', {
        headers: { 'User-Agent': 'WorkConnect App' }
    });
    if (response.ok) {
      const json = await response.json();
      const jobs = json.slice(1, 20);
      const vagasRemoteOK = jobs.filter((item: any) => {
        const texto = `${item.position} ${item.description || ''} ${(item.tags||[]).join(' ')}`.toLowerCase();
        if (termoBusca && termoBusca !== 'desenvolvedor' && termoBusca !== '') {
            if (!texto.includes(termoBusca)) return false;
        }
        return new Date(item.date) >= tresMesesAtras;
      }).map((item: any) => {
        const baseTags = [];
        if (item.location) baseTags.push(item.location);
        if (item.tags && Array.isArray(item.tags)) {
            baseTags.push(...item.tags.slice(0, 2));
        }
        const tags = extrairTags(`${item.position}`, baseTags);
        if (!tags.includes('Remoto')) tags.push('Remoto');

        return {
          id: `remoteok-${item.id}`,
          titulo: limparTitulo(item.position),
          empresa: item.company,
          local: item.location || '',
          link: item.url,
          fonte: 'RemoteOK',
          descricao: item.description || '',
          tempoPostagem: calcularTempoPostagem(new Date(item.date)),
          tags: tags.slice(0, 4),
          dataOriginal: new Date(item.date)
        };
      });

      todas.push(...vagasRemoteOK);
    }
  } catch (e) {
    console.log(`Erro ao buscar feed RemoteOK:`, e);
  }

  // Misturar todas as vagas ordenando de forma cronológica exata (da mais recente para a mais antiga)
  todas.sort((a, b) => b.dataOriginal.getTime() - a.dataOriginal.getTime());

  return todas;
};

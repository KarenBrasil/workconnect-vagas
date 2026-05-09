export interface VagaExterna {
  id: string;
  titulo: string;
  empresa: string;
  local: string;         // Cidade/País real (ex: "São Paulo, Brasil" ou "Worldwide")
  link: string;
  fonte: string;
  descricao: string;
  tempoPostagem: string;
  tags: string[];        // Apenas: contrato (PJ/CLT), modalidade (Remoto/Híbrido), senioridade (Pleno/Sênior)
  dataOriginal: Date;
}

// Lista de termos que NÃO são cidades mas aparecem no campo "location" das APIs
const NAO_SAO_CIDADES = new Set([
  'greenhouse', 'lever', 'workday', 'bamboohr', 'kiavi', 'nava', 'pbc',
  'remote', 'anywhere', 'worldwide', 'global', 'n/a', 'tbd', 'various',
  'multiple', 'hybrid', 'flexible', 'see job description', 'see description',
]);

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

// Valida se uma string parece ser um local real (cidade ou país)
function validarLocal(local: string): string {
  if (!local || local.trim().length < 2) return '';
  const localLower = local.toLowerCase().trim();
  if (NAO_SAO_CIDADES.has(localLower)) return '';
  // Remove locais que parecem nomes de ferramentas (sem espaço, todo minúsculo, <6 chars)
  if (localLower.length < 4 && !localLower.includes(',')) return '';
  return local.trim();
}

// Extrai SOMENTE tags de contrato, modalidade e senioridade (NÃO localização)
function extrairTagsContrato(texto: string, labelsBase: string[] = []): string[] {
  const tags = new Set<string>();
  const lower = texto.toLowerCase();

  // De labels do GitHub, incluir apenas os que são tipo/contrato
  labelsBase.forEach(l => {
    const lLower = l.toLowerCase();
    if (['pj', 'clt', 'remoto', 'híbrido', 'hibrido', 'remote', 'freelance', 'junior', 'pleno', 'sênior', 'senior'].includes(lLower)) {
      tags.add(l.trim());
    }
  });

  // Contrato
  if (lower.includes(' pj') || lower.startsWith('pj')) tags.add('PJ');
  if (lower.includes('clt')) tags.add('CLT');
  if (lower.includes('freelance') || lower.includes('freela')) tags.add('Freelance');
  if (lower.includes('estágio') || lower.includes('estagio') || lower.includes('intern')) tags.add('Estágio');

  // Modalidade
  if (lower.includes('remoto') || lower.includes('remote') || lower.includes('home office')) tags.add('Remoto');
  if (lower.includes('híbrido') || lower.includes('hibrido') || lower.includes('hybrid')) tags.add('Híbrido');
  if (lower.includes('presencial') || lower.includes('on-site') || lower.includes('onsite')) tags.add('Presencial');

  // Senioridade
  if (lower.includes('júnior') || lower.includes('junior') || lower.includes('jr.') || lower.includes(' jr ')) tags.add('Júnior');
  if (lower.includes('pleno') || lower.includes('mid-level') || lower.includes('mid level')) tags.add('Pleno');
  if (lower.includes('sênior') || lower.includes('senior') || lower.includes('sr.') || lower.includes(' sr ')) tags.add('Sênior');

  return Array.from(tags).slice(0, 4);
}

// Limpa colchetes, parênteses e prefixos comuns do título
function limparTitulo(titulo: string): string {
  return titulo
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const reposGithub = [
  { fonte: 'Front-End BR', url: 'https://api.github.com/repos/frontendbr/vagas/issues?state=open&sort=created&direction=desc&per_page=15' },
  { fonte: 'Back-End BR', url: 'https://api.github.com/repos/backend-br/vagas/issues?state=open&sort=created&direction=desc&per_page=15' },
  { fonte: 'React BR', url: 'https://api.github.com/repos/react-brasil/vagas/issues?state=open&sort=created&direction=desc&per_page=8' },
  { fonte: 'QA Brasil', url: 'https://api.github.com/repos/qa-brasil/vagas/issues?state=open&sort=created&direction=desc&per_page=6' },
  { fonte: 'Infra & DevOps', url: 'https://api.github.com/repos/devopsbr/vagas/issues?state=open&sort=created&direction=desc&per_page=6' },
];

export const buscarVagasExternas = async (termo: string = ''): Promise<VagaExterna[]> => {
  const todas: VagaExterna[] = [];
  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
  const termoBusca = termo.toLowerCase().trim();

  // 1. GitHub (Vagas BR)
  for (const repo of reposGithub) {
    try {
      const response = await fetch(repo.url, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      });
      if (!response.ok) continue;
      const items = await response.json();

      const vagasFiltradas = items.filter((item: any) => {
        if (item.pull_request) return false;
        if (termoBusca) {
          const texto = `${item.title} ${item.body || ''}`.toLowerCase();
          if (!texto.includes(termoBusca)) return false;
        }
        return new Date(item.created_at) >= tresMesesAtras;
      });

      const vagas = vagasFiltradas.map((item: any) => {
        // Extrai empresa do padrão [Empresa] no título
        let empresa = '';
        const matchEmpresa = item.title.match(/\[([^\]]+)\]/);
        if (matchEmpresa) {
          const candidato = matchEmpresa[1].trim();
          const lower = candidato.toLowerCase();
          // Só usa como empresa se não for palavra reservada
          if (!['remoto', 'remote', 'híbrido', 'presencial', 'pj', 'clt', 'junior', 'pleno', 'senior'].includes(lower)) {
            empresa = candidato;
          }
        }

        const labels = item.labels ? item.labels.map((l: any) => l.name) : [];
        const tags = extrairTagsContrato(`${item.title} ${item.body || ''}`, labels);

        // Local: tenta extrair cidade do corpo da issue
        let local = '';
        const bodyText = item.body || '';
        const matchLocal = bodyText.match(/(?:local|cidade|location|city)[:\s]+([^\n\r,]+)/i);
        if (matchLocal) local = validarLocal(matchLocal[1]);

        return {
          id: `github-${item.id}`,
          titulo: limparTitulo(item.title),
          empresa,
          local,
          link: item.html_url,
          fonte: 'GitHub BR',
          descricao: bodyText,
          tempoPostagem: calcularTempoPostagem(new Date(item.created_at)),
          tags,
          dataOriginal: new Date(item.created_at)
        };
      });

      todas.push(...vagas);
    } catch (e) {
      console.log(`Erro ao buscar ${repo.fonte}:`, e);
    }
  }

  // 2. Remotive (Internacional)
  try {
    const url = `https://remotive.com/api/remote-jobs?limit=40`;
    const response = await fetch(url);
    if (response.ok) {
      const json = await response.json();
      const CATEGORIAS_TI = ['software-dev', 'devops', 'data', 'qa', 'design', 'product', 'customer-support'];
      
      const vagasRemotive = json.jobs.filter((item: any) => {
        if (!CATEGORIAS_TI.includes(item.category)) return false;
        if (termoBusca) {
          const texto = `${item.title} ${item.description || ''}`.toLowerCase();
          if (!texto.includes(termoBusca)) return false;
        }
        return new Date(item.publication_date) >= tresMesesAtras;
      }).map((item: any) => {
        const rawLocal = item.candidate_required_location || '';
        // Para Remotive, "Worldwide" e variantes se tornam um local internacional legível
        let local = '';
        if (rawLocal && !NAO_SAO_CIDADES.has(rawLocal.toLowerCase())) {
          local = rawLocal;
        } else if (rawLocal.toLowerCase().includes('worldwide') || rawLocal.toLowerCase().includes('anywhere')) {
          local = 'Internacional 🌍';
        }

        const tags = extrairTagsContrato(`${item.title} ${item.job_type || ''} ${item.description || ''}`);
        if (!tags.includes('Remoto')) tags.push('Remoto');

        return {
          id: `remotive-${item.id}`,
          titulo: limparTitulo(item.title),
          empresa: item.company_name || '',
          local,
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
    console.log('Erro ao buscar Remotive:', e);
  }

  // 3. RemoteOK (Internacional)
  try {
    const response = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'WorkConnect App' }
    });
    if (response.ok) {
      const json = await response.json();
      const jobs = json.slice(1, 25);
      
      const vagasRemoteOK = jobs.filter((item: any) => {
        if (termoBusca) {
          const texto = `${item.position || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
          if (!texto.includes(termoBusca)) return false;
        }
        return new Date(item.date) >= tresMesesAtras;
      }).map((item: any) => {
        const rawLocal = item.location || '';
        const local = validarLocal(rawLocal) ? validarLocal(rawLocal) : 'Internacional 🌍';

        const baseTags: string[] = [];
        if (item.tags && Array.isArray(item.tags)) {
          // Filtramos tags do RemoteOK que sejam relevantes (senioridade/contrato)
          const tagsRelevantes = item.tags.filter((t: string) =>
            ['senior', 'junior', 'mid', 'fulltime', 'parttime', 'contract', 'intern'].includes(t.toLowerCase())
          );
          baseTags.push(...tagsRelevantes.slice(0, 2));
        }
        const tags = extrairTagsContrato(`${item.position || ''}`, baseTags);
        if (!tags.includes('Remoto')) tags.push('Remoto');

        return {
          id: `remoteok-${item.id}`,
          titulo: limparTitulo(item.position || ''),
          empresa: item.company || '',
          local,
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
    console.log('Erro ao buscar RemoteOK:', e);
  }

  // Mistura cronológica real: mais recente no topo, independente da fonte
  todas.sort((a, b) => b.dataOriginal.getTime() - a.dataOriginal.getTime());
  return todas;
};

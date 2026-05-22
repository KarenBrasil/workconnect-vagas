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
// ──────────────────────────────────────────────────────────────────────────
// CACHE — guarda as vagas no localStorage por 2 horas
// Assim o app não re-chama as APIs a cada recarregamento de página
// ──────────────────────────────────────────────────────────────────────────
const CACHE_KEY = 'wc_vagas_externas_v1';
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas em milissegundos

interface CacheEntry {
  timestamp: number;
  vagas: VagaExterna[];
}

function lerCache(): VagaExterna[] | null {
  try {
    if (typeof localStorage === 'undefined') return null; // React Native sem web
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    const agora = Date.now();
    if (agora - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY); // expirado
      return null;
    }
    // Reconstrói as datas (JSON não preserva objetos Date)
    return entry.vagas.map(v => ({
      ...v,
      dataOriginal: new Date(v.dataOriginal),
    }));
  } catch {
    return null;
  }
}

function salvarCache(vagas: VagaExterna[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const entry: CacheEntry = { timestamp: Date.now(), vagas };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage cheio ou indisponível — ignora
  }
}

/** Retorna quanto tempo falta para o cache expirar (string legível) */
export function tempoRestanteCache(): string {
  try {
    if (typeof localStorage === 'undefined') return '';
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return '';
    const entry: CacheEntry = JSON.parse(raw);
    const restanteMs = CACHE_TTL_MS - (Date.now() - entry.timestamp);
    if (restanteMs <= 0) return '';
    const min = Math.ceil(restanteMs / 60000);
    return min >= 60 ? `${Math.floor(min / 60)}h${min % 60 > 0 ? ` ${min % 60}min` : ''}` : `${min}min`;
  } catch {
    return '';
  }
}

/** Força limpeza do cache (para o botão "Atualizar agora") */
export function limparCacheVagas(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(CACHE_KEY);
  } catch {}
}

// Apenas 2 repos consolidados — reduz chamadas à API do GitHub
const reposGithub = [
  {
    fonte: 'GitHub BR',
    url: 'https://api.github.com/repos/frontendbr/vagas/issues?state=open&sort=created&direction=desc&per_page=30',
  },
  {
    fonte: 'GitHub BR',
    url: 'https://api.github.com/repos/backend-br/vagas/issues?state=open&sort=created&direction=desc&per_page=30',
  },
];

export const buscarVagasExternas = async (termo: string = ''): Promise<VagaExterna[]> => {
  const todas: VagaExterna[] = [];
  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
  const termoBusca = termo.toLowerCase().trim();

  // 1. GitHub (Vagas BR) — com detecção explícita de rate limit
  for (const repo of reposGithub) {
    try {
      const response = await fetch(repo.url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'WorkConnect-App',
        },
      });

      // 403 ou 429 = rate limit atingido — não lança erro, só pula esse repo
      if (response.status === 403 || response.status === 429) {
        console.log(`GitHub rate limit atingido para ${repo.url}`);
        continue;
      }
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
        let empresa = '';
        const matchEmpresa = item.title.match(/\[([^\]]+)\]/);
        if (matchEmpresa) {
          const candidato = matchEmpresa[1].trim();
          const lower = candidato.toLowerCase();
          if (!['remoto', 'remote', 'híbrido', 'presencial', 'pj', 'clt', 'junior', 'pleno', 'senior'].includes(lower)) {
            empresa = candidato;
          }
        }

        const labels = item.labels ? item.labels.map((l: any) => l.name) : [];
        const tags = extrairTagsContrato(`${item.title} ${item.body || ''}`, labels);

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
          dataOriginal: new Date(item.created_at),
        };
      });

      todas.push(...vagas);
    } catch (e) {
      console.log(`Erro ao buscar GitHub:`, e);
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

  // 4. Arbeitnow (Vagas Globais/Europa/Remoto)
  try {
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (response.ok) {
      const { data } = await response.json();
      const vagasArbeit = (data || []).map((item: any) => ({
        id: `arbeit-${item.slug}`,
        titulo: item.title,
        empresa: item.company_name,
        local: item.location || 'Remoto 🌍',
        link: item.url,
        fonte: 'Arbeitnow',
        descricao: item.description || '',
        tempoPostagem: 'Recente',
        tags: item.tags || ['TI', 'Global'],
        dataOriginal: new Date() // API não envia data exata em alguns campos, usamos hoje
      }));
      todas.push(...vagasArbeit);
    }
  } catch (e) {
    console.log('Erro ao buscar Arbeitnow:', e);
  }

  // 5. Jooble (O "Jubly" que você pediu — Agregador gigante)
  try {
    const JOOBLE_API_KEY = ''; // Espaço para sua chave Jooble
    if (JOOBLE_API_KEY) {
      const response = await fetch(`https://jooble.org/api/v2/jobs/${JOOBLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: termo || 'TI', location: 'Brasil' })
      });
      if (response.ok) {
        const data = await response.json();
        const vagasJooble = (data.jobs || []).map((item: any) => ({
          id: `jooble-${item.id}`,
          titulo: item.title,
          empresa: item.company || 'Empresa Confidencial',
          local: item.location,
          link: item.link,
          fonte: 'Jooble',
          descricao: item.snippet,
          tempoPostagem: item.updated,
          tags: ['Jooble', 'Web'],
          dataOriginal: new Date(item.updated)
        }));
        todas.push(...vagasJooble);
      }
    }
  } catch (e) {
    console.log('Erro ao buscar Jooble:', e);
  }

  // 6. Estrutura para InfoJobs (Pronta para quando você tiver as chaves)
  const INFOJOBS_TOKEN = ''; // Token Base64 (ClientID:ClientSecret)
  if (INFOJOBS_TOKEN) {
    try {
      const response = await fetch('https://api.infojobs.com.br/v2/job-search?category=it', {
        headers: { 'Authorization': `Basic ${INFOJOBS_TOKEN}` }
      });
      if (response.ok) {
        const data = await response.json();
        const vagasInfo = (data.elements || []).map((item: any) => ({
          id: `infojobs-${item.id}`,
          titulo: item.title,
          empresa: item.corporateName,
          local: item.location,
          link: item.url,
          fonte: 'InfoJobs',
          descricao: item.description,
          tempoPostagem: 'Recente',
          tags: ['InfoJobs', 'Brasil'],
          dataOriginal: new Date()
        }));
        todas.push(...vagasInfo);
      }
    } catch (e) {
      console.log('Erro ao buscar InfoJobs:', e);
    }
  }

  // Mistura cronológica real: mais recente no topo
  todas.sort((a, b) => b.dataOriginal.getTime() - a.dataOriginal.getTime());

  // Salva no cache para os próximos 2 horas
  if (todas.length > 0) salvarCache(todas);

  return todas;
};

/**
 * Versão com cache — use esta no componente.
 * Só chama as APIs se o cache estiver vazio ou expirado (> 2h).
 */
export const buscarVagasComCache = async (): Promise<VagaExterna[]> => {
  const cached = lerCache();
  if (cached && cached.length > 0) {
    console.log(`[Cache] ${cached.length} vagas carregadas do cache local (expira em ${tempoRestanteCache()})`);
    return cached;
  }
  console.log('[Cache] Cache vazio ou expirado — buscando nas APIs...');
  return buscarVagasExternas('');
};

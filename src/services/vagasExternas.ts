import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VagaExterna {
  id: string;
  titulo: string;
  empresa: string;
  local: string;         // Cidade/País real (ex: "São Paulo, Brasil" ou "Worldwide")
  link: string;
  fonte: string;
  descricao: string;
  tempoPostagem: string; // Ficará como "há X horas"
  tags: string[];        // Apenas: contrato (PJ/CLT), modalidade (Remoto/Híbrido), senioridade (Pleno/Sênior)
  dataOriginal: Date;
}

// Lista de termos que NÃO são cidades mas aparecem no campo "location" das APIs
const NAO_SAO_CIDADES = new Set([
  'greenhouse', 'lever', 'workday', 'bamboohr', 'kiavi', 'nava', 'pbc',
  'remote', 'anywhere', 'worldwide', 'global', 'n/a', 'tbd', 'various',
  'multiple', 'hybrid', 'flexible', 'see job description', 'see description',
]);

// Helper para converter data em tempo relativo ("há 5h", "há 2 dias")
export function calcularTempoRelativo(data: Date | string): string {
  try {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    if (isNaN(dataObj.getTime())) return 'recentemente';
    const agora = new Date();
    const diffMs = agora.getTime() - dataObj.getTime();
    if (diffMs < 0) return 'agora'; // Datas no futuro por fuso horário

    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `há ${diffHoras}h`;
    const diffDias = Math.floor(diffHoras / 24);
    if (diffDias === 1) return 'há 1 dia';
    if (diffDias < 30) return `há ${diffDias} dias`;
    const diffMeses = Math.floor(diffDias / 30);
    if (diffMeses === 1) return 'há 1 mês';
    return `há ${diffMeses} meses`;
  } catch {
    return 'recentemente';
  }
}

// Valida se uma string parece ser um local real (cidade ou país)
function validarLocal(local: string, paisPadrao: string = ''): string {
  if (!local || local.trim().length < 2) return paisPadrao;
  const localLower = local.toLowerCase().trim();
  if (NAO_SAO_CIDADES.has(localLower)) return paisPadrao;
  // Remove locais que parecem nomes de ferramentas (sem espaço, todo minúsculo, <6 chars)
  if (localLower.length < 4 && !localLower.includes(',')) return paisPadrao;
  
  let resultado = local.trim();
  // Se o local já tem vírgula, provavelmente já tem país/estado. Se não tem, e temos país padrão, adiciona.
  if (paisPadrao && !resultado.includes(',') && !resultado.toLowerCase().includes(paisPadrao.toLowerCase())) {
    resultado = `${resultado}, ${paisPadrao}`;
  }
  return resultado;
}

// Extrai SOMENTE tags de contrato, modalidade e senioridade (NÃO localização)
function extrairTagsContrato(texto: string, labelsBase: string[] = []): string[] {
  const tags = new Set<string>();
  const lower = texto.toLowerCase();

  labelsBase.forEach(l => {
    const lLower = l.toLowerCase();
    if (['pj', 'clt', 'remoto', 'híbrido', 'hibrido', 'remote', 'freelance', 'junior', 'pleno', 'sênior', 'senior'].includes(lLower)) {
      tags.add(l.trim());
    }
  });

  if (lower.includes(' pj') || lower.startsWith('pj')) tags.add('PJ');
  if (lower.includes('clt')) tags.add('CLT');
  if (lower.includes('freelance') || lower.includes('freela')) tags.add('Freelance');
  if (lower.includes('estágio') || lower.includes('estagio') || lower.includes('intern')) tags.add('Estágio');

  if (lower.includes('remoto') || lower.includes('remote') || lower.includes('home office')) tags.add('Remoto');
  if (lower.includes('híbrido') || lower.includes('hibrido') || lower.includes('hybrid')) tags.add('Híbrido');
  if (lower.includes('presencial') || lower.includes('on-site') || lower.includes('onsite')) tags.add('Presencial');

  if (lower.includes('júnior') || lower.includes('junior') || lower.includes('jr.') || lower.includes(' jr ')) tags.add('Júnior');
  if (lower.includes('pleno') || lower.includes('mid-level') || lower.includes('mid level')) tags.add('Pleno');
  if (lower.includes('sênior') || lower.includes('senior') || lower.includes('sr.') || lower.includes(' sr ')) tags.add('Sênior');

  return Array.from(tags).slice(0, 4);
}

// ==========================================
// MÓDULO DE TRADUÇÃO SIMPLES E RESUMO
// ==========================================
const DICIONARIO_BUSCA: Record<string, string> = {
  'desenvolvedor': 'developer',
  'engenheiro': 'engineer',
  'dados': 'data',
  'produto': 'product',
  'gerente': 'manager',
  'vendas': 'sales',
};

const DICIONARIO_TITULOS: Record<string, string> = {
  'developer': 'Desenvolvedor',
  'engineer': 'Engenheiro',
  'manager': 'Gerente',
  'data': 'Dados',
  'designer': 'Designer',
  'sales': 'Vendas',
  'software': 'Software',
  'product': 'Produto',
};

export function traduzirTermoDaBusca(termo: string): string {
  let novo = termo.toLowerCase();
  for (const [pt, en] of Object.entries(DICIONARIO_BUSCA)) {
    novo = novo.replace(new RegExp(`\\b${pt}\\b`, 'g'), en);
  }
  return novo;
}

function traduzirEFormatarTitulo(titulo: string): string {
  let novo = titulo.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\s{2,}/g, ' ').trim();
  for (const [en, pt] of Object.entries(DICIONARIO_TITULOS)) {
    novo = novo.replace(new RegExp(`\\b${en}\\b`, 'gi'), pt);
  }
  return novo;
}

function resumirDescricaoHTML(html: string): string {
  if (!html) return '';
  const text = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  if (text.length > 180) {
    return text.substring(0, 180) + '... \n\n📍 Veja os requisitos completos e candidate-se no site oficial da vaga.';
  }
  return text;
}
// ==========================================

// ──────────────────────────────────────────────────────────────────────────
// CACHE (AGORA COM ASYNCSTORAGE)
// ──────────────────────────────────────────────────────────────────────────
const CACHE_KEY = 'wc_vagas_externas_v2';
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

interface CacheEntry {
  timestamp: number;
  vagas: VagaExterna[];
}

async function lerCache(): Promise<VagaExterna[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    const agora = Date.now();
    if (agora - entry.timestamp > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.vagas.map(v => ({
      ...v,
      dataOriginal: new Date(v.dataOriginal),
      // Recalcula tempo relativo ao ler do cache para ficar atualizado
      tempoPostagem: calcularTempoRelativo(new Date(v.dataOriginal))
    }));
  } catch {
    return null;
  }
}

async function salvarCache(vagas: VagaExterna[]): Promise<void> {
  try {
    const entry: CacheEntry = { timestamp: Date.now(), vagas };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (e) {
    console.log('Erro ao salvar cache:', e);
  }
}

export async function limparCacheVagas(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {}
}

const reposGithub = [
  { url: 'https://api.github.com/repos/frontendbr/vagas/issues?state=open&sort=created&direction=desc&per_page=30' },
  { url: 'https://api.github.com/repos/backend-br/vagas/issues?state=open&sort=created&direction=desc&per_page=30' },
];

export const buscarVagasExternas = async (termo: string = ''): Promise<VagaExterna[]> => {
  const todas: VagaExterna[] = [];
  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
  const termoTraduzidoBusca = termo ? traduzirTermoDaBusca(termo) : '';
  const termoBusca = termoTraduzidoBusca.toLowerCase().trim();

  // 1. GitHub BR
  for (const repo of reposGithub) {
    try {
      const response = await fetch(repo.url, { headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'TechConnect' } });
      if (response.status === 403 || response.status === 429) continue;
      if (!response.ok) continue;
      const items = await response.json();

      const vagas = items.filter((i: any) => !i.pull_request && new Date(i.created_at) >= tresMesesAtras).map((item: any) => {
        let empresa = '';
        const matchEmpresa = item.title.match(/\[([^\]]+)\]/);
        if (matchEmpresa) {
          const candidato = matchEmpresa[1].trim();
          if (!['remoto', 'remote', 'híbrido', 'pj', 'clt', 'junior', 'pleno', 'senior'].includes(candidato.toLowerCase())) empresa = candidato;
        }

        const labels = item.labels ? item.labels.map((l: any) => l.name) : [];
        const tags = extrairTagsContrato(`${item.title} ${item.body || ''}`, labels);

        let local = '';
        const matchLocal = (item.body || '').match(/(?:local|cidade|location)[:\s]+([^\n\r,]+)/i);
        if (matchLocal) local = validarLocal(matchLocal[1], 'Brasil 🇧🇷');

        const dataOriginal = new Date(item.created_at);
        return {
          id: `github-${item.id}`,
          titulo: traduzirEFormatarTitulo(item.title),
          empresa,
          local: local || 'Brasil 🇧🇷',
          link: item.html_url,
          fonte: 'GitHub BR',
          descricao: resumirDescricaoHTML(item.body || ''),
          tempoPostagem: calcularTempoRelativo(dataOriginal),
          tags,
          dataOriginal,
        };
      });
      todas.push(...vagas);
    } catch (e) { console.log('Erro GitHub:', e); }
  }

  // 2. Remotive
  try {
    const response = await fetch(`https://remotive.com/api/remote-jobs?limit=40`);
    if (response.ok) {
      const json = await response.json();
      const vagasRemotive = json.jobs.filter((i: any) => new Date(i.publication_date) >= tresMesesAtras).map((item: any) => {
        const rawLocal = item.candidate_required_location || '';
        let local = validarLocal(rawLocal, 'Global 🌍');
        if (rawLocal.toLowerCase().includes('worldwide') || rawLocal.toLowerCase().includes('anywhere')) local = 'Global 🌍';

        const tags = extrairTagsContrato(`${item.title} ${item.job_type || ''}`);
        if (!tags.includes('Remoto')) tags.push('Remoto');
        const dataOriginal = new Date(item.publication_date);

        return {
          id: `remotive-${item.id}`,
          titulo: traduzirEFormatarTitulo(item.title),
          empresa: item.company_name || '',
          local,
          link: item.url,
          fonte: 'Remotive',
          descricao: resumirDescricaoHTML(item.description || ''),
          tempoPostagem: calcularTempoRelativo(dataOriginal),
          tags: tags.slice(0, 4),
          dataOriginal
        };
      });
      todas.push(...vagasRemotive);
    }
  } catch (e) { console.log('Erro Remotive:', e); }

  // 3. RemoteOK
  try {
    const response = await fetch('https://remoteok.com/api', { headers: { 'User-Agent': 'TechConnect' } });
    if (response.ok) {
      const json = await response.json();
      const vagasRemoteOK = json.slice(1, 25).filter((i: any) => new Date(i.date) >= tresMesesAtras).map((item: any) => {
        const local = validarLocal(item.location || '', 'Global 🌍');
        const tags = extrairTagsContrato(`${item.position || ''}`);
        if (!tags.includes('Remoto')) tags.push('Remoto');
        const dataOriginal = new Date(item.date);

        return {
          id: `remoteok-${item.id}`,
          titulo: traduzirEFormatarTitulo(item.position || ''),
          empresa: item.company || '',
          local,
          link: item.url,
          fonte: 'RemoteOK',
          descricao: resumirDescricaoHTML(item.description || ''),
          tempoPostagem: calcularTempoRelativo(dataOriginal),
          tags: tags.slice(0, 4),
          dataOriginal
        };
      });
      todas.push(...vagasRemoteOK);
    }
  } catch (e) { console.log('Erro RemoteOK:', e); }

  // 4. Arbeitnow
  try {
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (response.ok) {
      const { data } = await response.json();
      const vagasArbeit = (data || []).map((item: any) => {
        const dataOriginal = item.created_at ? new Date(item.created_at * 1000) : new Date();
        return {
          id: `arbeit-${item.slug}`,
          titulo: traduzirEFormatarTitulo(item.title),
          empresa: item.company_name,
          local: validarLocal(item.location, 'Global 🌍'),
          link: item.url,
          fonte: 'Arbeitnow',
          descricao: resumirDescricaoHTML(item.description || ''),
          tempoPostagem: calcularTempoRelativo(dataOriginal),
          tags: item.tags ? item.tags.slice(0, 3) : ['Global'],
          dataOriginal
        };
      });
      todas.push(...vagasArbeit);
    }
  } catch (e) { console.log('Erro Arbeitnow:', e); }

  // Filtro de termo (caso fornecido)
  const todasFiltradas = todas.filter(v => {
    if (!termoBusca) return true;
    const txt = `${v.titulo} ${v.empresa} ${v.tags.join(' ')}`.toLowerCase();
    return txt.includes(termoBusca);
  });

  todasFiltradas.sort((a, b) => b.dataOriginal.getTime() - a.dataOriginal.getTime());

  if (todasFiltradas.length > 0 && !termoBusca) {
    await salvarCache(todasFiltradas);
  }

  return todasFiltradas;
};

export const buscarVagasComCache = async (): Promise<VagaExterna[]> => {
  const cached = await lerCache();
  if (cached && cached.length > 0) return cached;
  return await buscarVagasExternas('');
};

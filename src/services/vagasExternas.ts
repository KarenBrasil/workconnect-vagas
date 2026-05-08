import * as rssParser from 'react-native-rss-parser';

export interface VagaExterna {
  id: string;
  titulo: string;
  empresa: string;
  local: string;
  link: string;
  fonte: string;
  descricao: string;
}

const feeds = [
  {
    fonte: 'Indeed',
    url: (termo: string) =>
      `https://www.indeed.com/rss?q=${encodeURIComponent(termo)}&l=Brasil&lang=pt_BR`,
  },
  {
    fonte: 'Vagas.com',
    url: (termo: string) =>
      `https://www.vagas.com.br/vagas-de-${encodeURIComponent(termo)}.rss`,
  },
];

export const buscarVagasExternas = async (termo: string = 'desenvolvedor'): Promise<VagaExterna[]> => {
  const todas: VagaExterna[] = [];

  for (const feed of feeds) {
    try {
      // Usamos um Proxy de CORS (AllOrigins) porque quando o app for publicado na Vercel (Web),
      // os navegadores bloqueiam requisições diretas para RSS de outros sites por segurança.
      const targetUrl = feed.url(termo);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

      const response = await fetch(proxyUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      if (!response.ok) continue;

      const text = await response.text();
      const parsed = await rssParser.parse(text);

      const baseKeywords = ['desenvolvedor', 'programador', 'software', 'tecnologia', 'ti', 'dados', 'front', 'back', 'fullstack', 'react', 'node', 'python', 'java', 'ux', 'ui', 'devops', 'cloud', 'qa', 'analista', 'engenheiro', 'mobile', 'ios', 'android'];
      const searchKeywords = [...baseKeywords, termo.toLowerCase()];

      const tresMesesAtras = new Date();
      tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

      const vagasFiltradas = parsed.items.filter((item: any) => {
        const texto = `${item.title} ${item.description || item.content}`.toLowerCase();
        const containsTech = searchKeywords.some(kw => texto.includes(kw));

        // Filtro de tempo: Vagas publicadas no máximo há 3 meses
        const pubDate = item.published ? new Date(item.published) : new Date();
        const isRecent = pubDate >= tresMesesAtras;

        return containsTech && isRecent;
      });

      const vagas = vagasFiltradas.slice(0, 5).map((item: any, index: number) => ({
        id: `${feed.fonte}-${index}-${Date.now()}`,
        titulo: item.title || 'Sem título',
        empresa: item.authors?.[0]?.name || feed.fonte,
        local: 'Brasil',
        link: item.links?.[0]?.url || item.id || '',
        fonte: feed.fonte,
        descricao: item.description || item.content || '',
      }));

      todas.push(...vagas);
    } catch (e) {
      console.log(`Erro ao buscar feed ${feed.fonte}:`, e);
    }
  }

  return todas;
};

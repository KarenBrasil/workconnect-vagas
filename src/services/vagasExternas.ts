export interface VagaExterna {
  id: string;
  titulo: string;
  empresa: string;
  local: string;
  link: string;
  fonte: string;
  descricao: string;
}

const repos = [
  { fonte: 'Front-End BR', url: 'https://api.github.com/repos/frontendbr/vagas/issues?state=open&sort=created&direction=desc&per_page=10' },
  { fonte: 'Back-End BR', url: 'https://api.github.com/repos/backend-br/vagas/issues?state=open&sort=created&direction=desc&per_page=10' },
  { fonte: 'React BR', url: 'https://api.github.com/repos/react-brasil/vagas/issues?state=open&sort=created&direction=desc&per_page=10' }
];

export const buscarVagasExternas = async (termo: string = 'desenvolvedor'): Promise<VagaExterna[]> => {
  const todas: VagaExterna[] = [];

  for (const repo of repos) {
    try {
      // Usamos a API nativa do GitHub ao invés de RSS.
      // O GitHub tem CORS nativo liberado, não precisa de proxies, é super rápido e 100% de vagas de tecnologia.
      const response = await fetch(repo.url, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      });

      if (!response.ok) continue;

      const items = await response.json();

      const tresMesesAtras = new Date();
      tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

      const termoBusca = termo.toLowerCase();

      const vagasFiltradas = items.filter((item: any) => {
        if (item.pull_request) return false;

        const texto = `${item.title} ${item.body || ''}`.toLowerCase();
        
        if (termoBusca && termoBusca !== 'desenvolvedor') {
          if (!texto.includes(termoBusca)) return false;
        }

        const pubDate = new Date(item.created_at);
        const isRecent = pubDate >= tresMesesAtras;

        return isRecent;
      });

      const vagas = vagasFiltradas.slice(0, 5).map((item: any) => {
        // Extrai a possível empresa do título se tiver o formato [Empresa] ou na descrição, se não, usa a fonte.
        let empresa = repo.fonte;
        const matchEmpresa = item.title.match(/\[(.*?)\]/);
        if (matchEmpresa && matchEmpresa[1] && !matchEmpresa[1].toLowerCase().includes('remoto')) {
            empresa = matchEmpresa[1];
        }

        return {
          id: `github-${item.id}`,
          titulo: item.title,
          empresa: empresa,
          local: 'Brasil / Remoto',
          link: item.html_url,
          fonte: repo.fonte,
          descricao: item.body || 'Veja os detalhes no link.',
        };
      });

      todas.push(...vagas);
    } catch (e) {
      console.log(`Erro ao buscar feed ${repo.fonte}:`, e);
    }
  }

  // Embaralha levemente ou apenas retorna
  return todas;
};

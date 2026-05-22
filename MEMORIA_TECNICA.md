# 🧠 Memória Técnica - WorkConnect

Este arquivo é o registro central de todo o progresso do projeto. **Não apague**, pois ele serve para que eu (sua IA) saiba exatamente em que ponto paramos em cada sessão.

---

## 📌 Status Atual (Última Atualização: 09/05/2026)

### 🚀 Deploy e Acesso
- **Link do App:** [https://app-vagas-mu.vercel.app](https://app-vagas-mu.vercel.app)
- **Repositório GitHub:** [KarenBrasil/workconnect-vagas](https://github.com/KarenBrasil/workconnect-vagas)

### 🛠️ Funcionalidades Implementadas
1. **Feed Híbrido:** Integração de vagas internas (Firebase) e externas (APIs).
2. **Busca Local:** Pesquisa instantânea que não consome limites de API e mantém o total de vagas estável.
3. **Sistema de Cache:** Vagas externas são salvas no navegador por **2 horas**. O app fica super rápido e só busca novas vagas quando o cache expira.
4. **Interface Mobile:** Menu inferior fixo e container de 480px para visualização perfeita em celulares.

### 🔌 Fontes de Vagas (APIs)
- **Ativas:** GitHub (Vagas BR), Remotive, RemoteOK, Arbeitnow.
- **Preparadas (Aguardando Chaves):** 
  - **Jooble (Jubly):** Código pronto em `vagasExternas.ts`. Falta a chave de [jooble.org](https://jooble.org/api/about).
  - **InfoJobs Brasil:** Estrutura pronta. Falta o ClientID/Secret de [developer.infojobs.net](https://developer.infojobs.net/).

---

## 📝 Histórico de Decisões
- **09/05:** Mudança do contador de `61/61` para o total simples (ex: `65 vagas`) para melhor visualização.
- **09/05:** Remoção da barra azul de cache da tela (a atualização de 2h agora é silenciosa e interna).
- **09/05:** Adição da fonte **Arbeitnow** para aumentar o volume de vagas globais.

---

## 📋 Próximas Tarefas
- [ ] Ativar Jooble (assim que a chave for fornecida).
- [ ] Ativar InfoJobs (assim que a chave for fornecida).
- [ ] Monitorar limites da API do GitHub.

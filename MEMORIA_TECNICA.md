# 🧠 Memória Técnica - TechConnect

Este arquivo é o registro central de todo o progresso do projeto. **Não apague**, pois ele serve para que eu (sua IA) saiba exatamente em que ponto paramos em cada sessão.

---

## 📌 Status Atual (Última Atualização: 06/06/2026)

### 🚀 Deploy e Acesso
- **Link do App:** [https://app-vagas-mu.vercel.app](https://app-vagas-mu.vercel.app)
- **Repositório GitHub:** [KarenBrasil/techconnect-vagas](https://github.com/KarenBrasil/workconnect-vagas)

### 🛠️ Funcionalidades Implementadas
1. **Feed Híbrido:** Integração de vagas internas (Firebase) e externas (APIs).
2. **Busca Local:** Pesquisa instantânea com filtro por tag (Remoto, PJ, CLT, etc.).
3. **Sistema de Cache:** Vagas externas salvas por **2 horas** (localStorage no web). O app fica rápido e só busca novas vagas quando o cache expira.
4. **Interface Mobile:** Menu inferior fixo e container de 480px para visualização perfeita em celulares.
5. **Favoritos Funcionais:** Botão de coração nas telas de Busca e Detalhes salva/remove vagas. Contador real na Home.
6. **Contato direto em vagas internas:** Campo "Contato" no formulário de postagem. Na tela de detalhes, abre e-mail ou WhatsApp automaticamente.
7. **Tema Escuro/Claro:** Todas as telas agora aplicam ThemeContext (inclusive Favoritos e Detalhes da Vaga).

### 🔌 Fontes de Vagas (APIs)
- **Ativas:** GitHub (Vagas BR), Remotive, RemoteOK, Arbeitnow.
- **Preparadas (Aguardando Chaves):**
  - **Jooble:** Código pronto em `vagasExternas.ts`. Falta a chave de [jooble.org](https://jooble.org/api/about).
  - **InfoJobs Brasil:** Estrutura pronta. Falta o ClientID/Secret de [developer.infojobs.net](https://developer.infojobs.net/).

---

## 🔐 Segurança
- Credenciais Firebase e Google Client ID movidas para `.env` (EXPO_PUBLIC_*)
- `.env` adicionado ao `.gitignore` — não é mais commitado no GitHub
- ⚠️ **Ainda pendente:** Configurar variáveis de ambiente na Vercel (painel de settings do projeto)

---

## 📝 Histórico de Decisões
- **09/05:** Mudança do contador de `61/61` para o total simples (ex: `65 vagas`) para melhor visualização.
- **09/05:** Remoção da barra azul de cache da tela (a atualização de 2h agora é silenciosa e interna).
- **09/05:** Adição da fonte **Arbeitnow** para aumentar o volume de vagas globais.
- **06/06:** Correção de 10 bugs críticos e médios detectados em análise técnica completa.
  - Credenciais em variáveis de ambiente
  - Campo `criadoEm` duplicado removido
  - Botão de favoritar conectado ao serviço (search + job detail)
  - Tela de detalhes usa cache em vez de rebuscar tudo
  - Prefixo `arbeit-` adicionado à detecção de vagas externas
  - ThemeContext aplicado em Favoritos e Detalhes da Vaga
  - `userId = 'anonimo'` substituído por null check real
  - "Vagas Salvas" na Home conectado ao Firestore real
  - Admin query com limit(100) + orderBy
  - Campo de contato (e-mail/WhatsApp) adicionado ao formulário de postagem
- **09/06:** Resolução Crítica do Login do Google no Vercel (Crash de Autenticação).
  - **Problema 1 (Erro 400 - redirect_uri_mismatch):** O `expo-auth-session` não conseguia lidar com o domínio customizado da Vercel (`techconnect-br.vercel.app`). Solução: Substituição total pelo `signInWithPopup` nativo do Firebase.
  - **Problema 2 (Vercel Env Vars Bug):** A Vercel não injetou o `process.env.EXPO_PUBLIC_FIREBASE_API_KEY`, gerando uma URL do Firebase com chaves literais (`apiKey=EXPO_PUBLIC...`) e bloqueando o sistema de segurança do Google com "The requested action is invalid". Solução: Chaves do Firebase tiveram que ser **hardcoded (chumbadas)** novamente no `firebaseConfig.ts` para burlar esse bug da Vercel.
  - **Problema 3 (Popup Bloqueado Silenciosamente):** Usar carregamento dinâmico assíncrono (`await import`) antes de abrir o popup fazia o navegador perder o contexto de "clique do usuário", acionando o antivírus/bloqueador de popups nativo do Chrome e fazendo o botão "não fazer nada". Solução: O `signInWithPopup` deve ser importado de forma estática e síncrona no topo do arquivo.
  - **Problema 4 (Cegueira de Erros):** O navegador Chrome bloqueia chamadas repetidas de `Alert.alert()` (window.alert) silenciosamente. Solução: Foi construído um painel vermelho fixo na tela atrelado à variável `errorMessage` para garantir que qualquer erro de segurança seja visível ao usuário, independentemente de bloqueadores.

---

## 📋 Próximas Tarefas
- [ ] Ativar Jooble (assim que a chave for fornecida).
- [ ] Ativar InfoJobs (assim que a chave for fornecida).
- [ ] Implementar Firebase Security Rules para validar admin no backend.
- [ ] Cache de vagas para app nativo (AsyncStorage em vez de localStorage).

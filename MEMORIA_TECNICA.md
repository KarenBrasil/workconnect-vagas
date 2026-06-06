# 🧠 Memória Técnica - WorkConnect

Este arquivo é o registro central de todo o progresso do projeto. **Não apague**, pois ele serve para que eu (sua IA) saiba exatamente em que ponto paramos em cada sessão.

---

## 📌 Status Atual (Última Atualização: 06/06/2026)

### 🚀 Deploy e Acesso
- **Link do App:** [https://app-vagas-mu.vercel.app](https://app-vagas-mu.vercel.app)
- **Repositório GitHub:** [KarenBrasil/workconnect-vagas](https://github.com/KarenBrasil/workconnect-vagas)

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

---

## 📋 Próximas Tarefas
- [ ] Configurar variáveis de ambiente na Vercel (dashboard do projeto)
- [ ] Ativar Jooble (assim que a chave for fornecida).
- [ ] Ativar InfoJobs (assim que a chave for fornecida).
- [ ] Implementar Firebase Security Rules para validar admin no backend.
- [ ] Cache de vagas para app nativo (AsyncStorage em vez de localStorage).



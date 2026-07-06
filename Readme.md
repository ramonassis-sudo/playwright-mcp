# 🚀 Testes Automatizados - KitchenAid (Playwright + TypeScript + IA + MCP)

Este projeto é uma **Prova de Conceito (POC)** extremamente robusta e moderna desenvolvida para automatizar testes End-to-End (E2E) no e-commerce da KitchenAid Brasil. Os cenários validam fluxos críticos de negócio — como busca de produtos, autenticação, gestão de itens no carrinho e etapas de checkout — garantindo a estabilidade da aplicação sob a perspectiva do usuário final.

---

## 🧠 Paradigma de Desenvolvimento: IA + MCP (Model Context Protocol)

O grande diferencial de engenharia desta POC foi a simbiose entre a **direção estratégica humana** e a **capacidade de execução assistida por IA via MCP**:

1. **Exploração Dinâmica (Browser MCP):** A IA interagiu diretamente com o navegador em tempo real no site real da KitchenAid. Isso permitiu analisar comportamentos de renderização, tempos de resposta e layouts reais antes da codificação.
2. **Seletores de Alta Estabilidade (Acessibilidade First):** Orientada por regras rígidas de qualidade, a IA mapeou a interface priorizando a árvore de acessibilidade da página (usando `getByRole()`, `getByLabel()`, `getByPlaceholder()` e `getByText()`). Isso elimina a fragilidade típica de seletores baseados em classes CSS ou XPath complexos, tornando os testes resilientes a mudanças visuais.

---

## 📐 Destaques da Arquitetura

O projeto foi desenhado sob os melhores padrões de desenvolvimento em **TypeScript** e **Playwright**:

* **Page Object Model (POM) estruturado (`/pages`):** Toda a interação com as páginas é encapsulada em classes específicas. Alterações de design no site exigem ajustes de código em apenas um local centralizado.
* **Custom Fixtures e Injeção de Dependências (`/fixtures`):** Estende o runner nativo do Playwright para injetar automaticamente os Page Objects nos testes. Os testes recebem as instâncias prontas por meio de desestruturação de parâmetros (ex: `async ({ homePage, searchResultsPage }) => { ... }`).
* **Autenticação "Lazy" & Dinâmica (`/fixtures/test-options.ts`):** O login é executado sob demanda apenas para testes que exigem autenticação (`authenticatedTest`). Se o arquivo de sessão (`playwright/.auth/user-{index}.json`) não existir, o runner inicia um contexto isolado, faz login, aceita os cookies, gera o `storageState` em disco e prossegue.
* **Isolamento de Workers em Paralelo:** Para evitar conflitos de sessão ou concorrência de dados em testes concorrentes, os usuários de teste são distribuídos deterministicamente entre os workers ativos com base no índice do worker (`testInfo.workerIndex % 3`).
* **Massa de Dados Segura (`/config`):** Dados de teste e credenciais são consumidos de forma segura a partir de um arquivo `.env`, validados de forma *fail-fast* (o teste quebra imediatamente de forma explicativa caso falte alguma variável de ambiente).

---

## 📂 Estrutura de Diretórios

```text
playwright-mcp/
├── config/             # Leitura segura de variáveis .env e massa de teste
├── docs/               # Documentação BDD (.feature) e prompts do automator
├── e2e/                # Especificações de teste (arquivos .spec.ts) e setups
├── fixtures/           # Extensão do Playwright para injeção de POM e lazy auth
└── pages/              # Implementações do Page Object Model (POM)
    └── checkout/       # Componentização das etapas de fechamento do pedido
```

---

## ⚡ Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (instalado junto com o Node.js)

---

## 🛠️ Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/ramoonassis/playwright-mcp.git
cd playwright-mcp
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Instalar navegadores do Playwright

```bash
npx playwright install
```

### 4. Configurar arquivo `.env`

Nenhum dado sensível fica fixo no código. Crie um arquivo `.env` na raiz do projeto com a seguinte estrutura ajustando os valores correspondentes:

```env
BASE_URL=https://www.kitchenaid.com.br

TEST_USER_EMAIL=seu-email@exemplo.com
TEST_USER_PASSWORD=sua-senha

SEARCH_TERM=Batedeira KitchenAid Artisan Mineral Water
PRODUCT_LINK_NAME=Batedeira KitchenAid Artisan Mineral Water
EXPECTED_PRICE=R$ 2.399,00

EXPECTED_FREIGHT=R$ 19,90
EXPECTED_TOTAL_FINAL=R$ 2.418,90

FIRST_NAME=Maria
LAST_NAME=Silva
CPF=00000000000
PHONE=11999999999
CEP=01001000
ADDRESS_NUM=100
```

---

## 🏃 Execução dos Testes

### Executar todos os cenários

```bash
npx playwright test
```

### Executar apenas cenários E2E (com tag @e2e)

```bash
npx playwright test --grep @e2e
```

### Executar com navegador visível (Headed)

```bash
npx playwright test --headed
```

### Executar teste específico

```bash
npx playwright test e2e/test_ct001_search.spec.ts
```

### Exibir relatório detalhado de execuções (HTML Report)

```bash
npx playwright show-report
```

---

## 🔍 Depuração (Debugging)

### Modo Interativo de Debugging

```bash
npx playwright test --debug
```

### Execução com Trace habilitado

```bash
npx playwright test --trace on
```

Em caso de falha nos testes, relatórios detalhados, vídeos e capturas de tela (screenshots) serão gerados automaticamente no diretório `test-results/evidence` conforme configurado em `playwright.config.ts`.

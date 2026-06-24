# Lector Agentes - Workspace Dedicado + Salvamento Obrigatório no Obsidian

> **Plano de Implementação Completo**  
> Gerado para CaiOS em `C:\Users\gcaio\caios`

## Goal

Transformar a página `/lector` em um **hub poderoso** de agentes especializados do Lector Live, onde:
- Cada agente tem uma **interface dedicada** (não redireciona mais para o chat genérico do Hermes).
- Execução acontece **em tempo real** com logs de ferramentas, streaming e resultados estruturados.
- **Salvamento automático e obrigatório** no Obsidian (pasta da base de conhecimento Lector) acontece em **todo** o fluxo.
- É fácil adicionar novos agentes no futuro.

## Contexto Atual (Junho 2026)

- CaiOS já tem integração madura com Hermes (WebSocket via `HermesGateway`, `useHermesChat`, token fetching).
- Existe o excelente padrão do **Explorer** (`useExplorerAgent` + `explorer.service.ts`) como referência para agentes especializados com estado persistente, parsing de output e sync com Obsidian.
- `knowledgeSyncService` + `vaultService` já cuidam de salvar no Obsidian (`CaiOS/` folder dentro do vault).
- Já existe uma versão inicial de `/lector` com grid de cards e redirecionamento simples.
- Muitos skills `lector-*` já existem no Hermes (criar treinamentos, avaliações, questões, SCORM, capas, turmas, etc.).
- Usuário exige: "salvar no Obsidian é obrigatório, nunca precisa pedir".

## Arquitetura Proposta

**Padrão "Specialized Lector Agent"** (inspirado no Explorer):

1. `useLectorAgent.ts` (hook dedicado)
   - Gerencia gateway Hermes persistente (pode usar profile separado no futuro).
   - Mantém sessão Lector ativa.
   - Expõe: `sendLectorRequest()`, logs em tempo real, resultados estruturados, `saveToObsidian()`.

2. `lector.service.ts` (estado + regras de negócio)
   - Lista de agentes com metadados (skill, pasta Obsidian alvo, parser de resultado).
   - Métodos para construir prompts fortes que **forçam** uso do skill + salvamento no Obsidian.
   - Armazena histórico de execuções Lector.
   - Gera Markdown estruturado para Obsidian.

3. Componentes de UI dedicados em `src/components/lector/`
   - `LectorAgentCard.tsx`
   - `LectorWorkspace.tsx` (o coração: prompt + execução + logs + resultados)
   - `LectorLiveLogs.tsx`
   - `LectorResultsPanel.tsx`
   - `LectorObsidianActions.tsx`

4. Salvamento no Obsidian
   - Sempre ao final (e em pontos intermediários importantes).
   - Usa `knowledgeSyncService` + prompts explícitos para Hermes usar skill de escrita no vault.
   - Pasta alvo sugerida: `CaiOS/Lector/{Agente}/{Título}` ou a estrutura que o usuário já usa em `Hermes Agent - Base de Conhecimento/Lector Live`.

## Tech Stack / Padrões

- React + TypeScript
- Reutilizar: `HermesGateway`, eventos de `tool.start/complete`, streaming
- Seguir padrão do Explorer (service + hook + estado local + sync)
- TDD onde possível (especialmente no service e hook)
- Componentes usando os `Card`, `Button` e Tailwind já existentes

---

## Plano de Implementação (Bite-sized Tasks)

### Fase 0: Preparação e Tipos

**Task 0.1: Criar tipos para Lector**

**Files:**
- Create: `src/types/lector.ts`

**Conteúdo sugerido (esqueleto):**

```ts
export interface LectorAgent {
  id: string
  name: string
  description: string
  icon: string          // emoji ou nome do lucide
  skill: string
  obsidianFolder: string   // ex: 'Lector/Treinamentos'
  promptTemplate: string
}

export interface LectorExecution {
  id: string
  agentId: string
  prompt: string
  startedAt: string
  completedAt?: string
  status: 'running' | 'success' | 'error' | 'partial'
  logs: LectorLog[]
  result?: LectorResult
  obsidianPath?: string
}

export interface LectorLog {
  id: string
  timestamp: string
  type: 'info' | 'tool' | 'success' | 'error' | 'obsidian'
  message: string
  toolName?: string
}

export interface LectorResult {
  title?: string
  summary?: string
  links: Array<{ label: string; path?: string; url?: string }>
  rawOutput?: string
}
```

**Task 0.2: Expandir lista de agentes**

Adicionar os agentes solicitados + completar com os existentes:

- Criador de Treinamentos
- Criador de Avaliações
- Criador de Questões
- Criador de SCORMs
- Criador de Capas
- Criador de Turmas
- **Criador de Vídeos** (lector-criar-treinamento-video-hyperframes)
- **Curadoria de Nomes** (lector-curadoria-nomes-treinamentos)
- **Validador de Avaliações** (lector-validar-avaliacoes-api)
- Orquestrador Lector

---

### Fase 1: Serviço Central (Lector Service)

**Task 1.1: Criar `lector.service.ts`**

**Files:**
- Create: `src/services/lector.service.ts`

**Responsabilidades:**
- `getAgents(): LectorAgent[]`
- `buildExecutionPrompt(agent, userInput): string` — prompt forte que força uso do skill + salvamento no Obsidian
- `parseResult(agent, rawText): LectorResult`
- `scheduleObsidianSave(execution)`
- `addLog(executionId, log)`

**Task 1.2: Implementar construção de prompt com garantia de Obsidian**

Exemplo de prompt que deve ser gerado:

```
Você é um agente especialista em Lector Live.

Use **obrigatoriamente** o skill: lector-portal-9-criar-treinamentos

Pedido do usuário:
[USER PROMPT]

Regras obrigatórias:
1. Execute o skill completo.
2. Ao final, salve um resumo detalhado + links gerados em:
   CaiOS/Lector/Treinamentos/[Título] (use o skill obsidian ou escreva diretamente no vault).
3. Inclua wikilinks para outros itens da base Lector.
4. Retorne também os IDs criados (treinamento, turma, etc).
```

---

### Fase 2: Hook Dedicado (useLectorAgent)

**Task 2.1: Criar o hook**

**Files:**
- Create: `src/hooks/useLectorAgent.ts`

Modelo forte: copie a estrutura de `useExplorerAgent.ts` mas adaptada.

Funcionalidades chave:
- `currentAgent`
- `execution: LectorExecution | null`
- `logs: LectorLog[]`
- `isRunning`
- `sendRequest(userPrompt: string)`
- `saveCurrentToObsidian()`
- `cancel()`

Internamente:
- Usa `HermesGateway` (pode reusar o persistent ou criar um por agente)
- Escuta eventos `tool.start`, `tool.complete`, `message.delta`, `message.complete`
- Chama `lectorService` para logging e parsing

**Task 2.2: Garantir que salvamento no Obsidian seja chamado automaticamente**

No `message.complete` ou quando detectar sucesso:
- Chamar `lectorService.scheduleObsidianSave(...)`
- Opcionalmente enviar um prompt de follow-up: "Agora salve tudo no Obsidian na pasta correta usando o formato adequado."

---

### Fase 3: UI - Workspace Dedicado dentro da página Lector

**Task 3.1: Refatorar `LectorAgentes.tsx`**

- Manter o grid de cards (melhorado).
- Quando selecionar um agente → mostrar **dentro da mesma página** o `<LectorWorkspace agent={...} />`

**Task 3.2: Criar componentes de UI**

**Files:**
- Create: `src/components/lector/LectorWorkspace.tsx`
- Create: `src/components/lector/LectorLiveLogs.tsx`
- Create: `src/components/lector/LectorResultsPanel.tsx`
- Create: `src/components/lector/LectorPromptComposer.tsx`

Layout sugerido do Workspace:
```
[Header do Agente]
[Prompt Composer + Botão "Executar Agente"]

[Duas colunas ou abas]
├── Live Logs (streaming + tool activity)
└── Resultados Estruturados
    - Cards com links criados
    - Resumo
    - Botão "Salvar no Obsidian" (sempre visível)
    - Link direto para o arquivo no Obsidian (se possível)
```

**Task 3.3: Implementar visual de logs em tempo real**

Usar os eventos que o HermesGateway já emite (`tool.start`, `tool.complete`, `message.delta`).

---

### Fase 4: Salvamento Obrigatório no Obsidian + Evolução

**Task 4.1: Integrar com knowledgeSyncService**

- Criar método específico em `lector.service.ts`: `syncLectorExecutionToObsidian(execution)`
- Usar `notesService` ou escrita direta via Hermes + prompt.

**Task 4.2: Garantir salvamento automático**

- Após `message.complete` bem sucedido → salvar automaticamente.
- Adicionar botão manual "Forçar salvar no Obsidian".
- Registrar log do tipo `obsidian` quando salvar.

**Task 4.3: Estrutura de pastas no Obsidian**

Definir convenção clara (ex.):
- `CaiOS/Lector/Treinamentos/`
- `CaiOS/Lector/Avaliacoes/`
- `CaiOS/Lector/Historico/`

Pode ser configurável depois.

---

### Fase 5: Adicionar Mais Agentes + Polimento

**Task 5.1:** Adicionar os agentes novos (Vídeos, Curadoria, Validação).

**Task 5.2:** Adicionar histórico de execuções Lector (lista na sidebar da página ou em uma aba "Histórico").

**Task 5.3:** Melhorias de UX
- Indicador de "Salvando no Obsidian..."
- Botão para abrir o arquivo gerado no Obsidian (via `tauriBridge` ou link).
- Validação de prompt antes de executar.
- Suporte a parâmetros estruturados (não só texto livre) para alguns agentes.

---

### Fase 6: Integração e Testes

**Task 6.1:** Adicionar o novo item no `NAV_ITEMS` (já feito na versão atual).

**Task 6.2:** Testes manuais recomendados
- Executar cada agente principal
- Verificar se logs aparecem em tempo real
- Verificar se salva no Obsidian
- Verificar se resultado estruturado aparece

**Task 6.3:** Atualizar `App.tsx` se necessário para registrar o serviço no boot.

---

## Arquivos que serão criados/modificados

**Criação:**
- `src/types/lector.ts`
- `src/services/lector.service.ts`
- `src/hooks/useLectorAgent.ts`
- `src/components/lector/*.tsx` (vários)
- `.hermes/plans/...` (este arquivo)

**Modificação:**
- `src/pages/LectorAgentes.tsx` (grande refatoração)
- `src/lib/constants.ts` (talvez adicionar mais constantes)
- `src/services/knowledge-sync.service.ts` (possivelmente extensão)
- `src/app/routes.tsx` (já atualizado)

## Riscos e Tradeoffs

- **Hermes precisa estar rodando** — manter a lógica de `ensureDashboard`.
- **Perfis separados** — decidir se usamos profile `lector` ou o default (Explorer usa profile próprio).
- **Parsing de resultados** — alguns skills retornam texto livre. Começar simples e evoluir parsers.
- **Salvamento duplo** — garantir que não salve duas vezes (uma pelo Hermes, outra pelo CaiOS).
- **Long running tasks** — skills de Lector podem demorar. Mostrar claramente que está rodando.

## Perguntas Abertas (para decidir durante implementação)

1. Queremos um profile Hermes dedicado chamado `lector`?
2. Os resultados estruturados devem ser salvos também localmente no CaiOS (localStorage) além do Obsidian?
3. Deseja um "Modo Batch" (executar vários agentes em sequência)?

---

## Como Executar Este Plano

1. Leia este plano completo.
2. Comece pela Fase 0 → Fase 1 (tipos + service).
3. Depois implemente o hook (Fase 2).
4. Só então mexa na UI (Fase 3).
5. Faça o salvamento no Obsidian por último na Fase 4 (é o mais importante para o usuário).

**Recomendação:** Use o skill `subagent-driven-development` ou `delegate_task` para implementar task por task.

Este plano é detalhado o suficiente para que qualquer pessoa (ou subagente) consiga implementar sem precisar voltar a perguntar "o que fazer".

---

**Status do Plano:** Pronto para execução.

Próximo passo recomendado: Confirmar com o usuário e começar pela Task 0.1 + 1.1.

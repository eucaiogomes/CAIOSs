import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import { generateId, nowISO } from '@/lib/utils'
import type {
  ExplorerEventKind,
  ExplorerInsight,
  ExplorerLearning,
  ExplorerSessionState,
  ExplorerTimelineEvent,
} from '@/types/explorer'

const DEFAULT_STATE: ExplorerSessionState = {
  targetSystem: '',
  investigationMode: false,
  currentUrl: 'about:blank',
  sessionStartedAt: nowISO(),
  timeline: [],
  insights: [],
  learnings: [],
}

function load(): ExplorerSessionState {
  return storageGet<ExplorerSessionState>(STORAGE_KEYS.explorerState) ?? { ...DEFAULT_STATE }
}

function save(state: ExplorerSessionState): void {
  storageSet(STORAGE_KEYS.explorerState, state)
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )
}

export const explorerService = {
  getState(): ExplorerSessionState {
    return load()
  },

  resetSession(): ExplorerSessionState {
    const next: ExplorerSessionState = {
      ...DEFAULT_STATE,
      sessionStartedAt: nowISO(),
      targetSystem: load().targetSystem,
      investigationMode: load().investigationMode,
      learnings: load().learnings,
    }
    save(next)
    return next
  },

  setTargetSystem(name: string): ExplorerSessionState {
    const state = load()
    const next = { ...state, targetSystem: name.trim() }
    save(next)
    return next
  },

  setInvestigationMode(enabled: boolean): ExplorerSessionState {
    const state = load()
    const next = { ...state, investigationMode: enabled }
    save(next)
    return next
  },

  setCurrentUrl(url: string): ExplorerSessionState {
    const state = load()
    const next = { ...state, currentUrl: url }
    save(next)
    return next
  },

  addTimelineEvent(
    kind: ExplorerEventKind,
    label: string,
    detail?: string,
    url?: string,
  ): ExplorerTimelineEvent {
    const state = load()
    const event: ExplorerTimelineEvent = {
      id: generateId(),
      at: nowISO(),
      kind,
      label,
      detail,
      url,
    }
    const timeline = [event, ...state.timeline].slice(0, 200)
    save({ ...state, timeline })
    return event
  },

  addInsight(
    category: ExplorerInsight['category'],
    title: string,
    body: string,
  ): ExplorerInsight {
    const state = load()
    const insight: ExplorerInsight = {
      id: generateId(),
      at: nowISO(),
      category,
      title,
      body,
    }
    const insights = [insight, ...state.insights].slice(0, 50)
    save({ ...state, insights })
    return insight
  },

  addLearning(discovery: string, system?: string): ExplorerLearning {
    const state = load()
    const learning: ExplorerLearning = {
      id: generateId(),
      at: nowISO(),
      system: system ?? (state.targetSystem || undefined),
      discovery,
      appliedToSkill: false,
    }
    const learnings = [learning, ...state.learnings].slice(0, 100)
    save({ ...state, learnings })
    return learning
  },

  markLearningsApplied(): void {
    const state = load()
    save({
      ...state,
      learnings: state.learnings.map((l) => ({ ...l, appliedToSkill: true })),
    })
  },

  setLastAgentSummary(summary: string): void {
    const state = load()
    save({ ...state, lastAgentSummary: summary })
  },

  formatEventTime(iso: string): string {
    return formatTime(iso)
  },

  buildCapturePrompt(snapshot?: {
    url: string
    title?: string
    cookies?: Array<{ name: string; value: string; domain: string }>
    storage?: { local: unknown[]; session: unknown[] }
    network?: Array<{
      method: string
      url: string
      status: number | null
      postData?: string
      responseBody?: string | null
    }>
  }): string {
    const state = load()
    const events = state.timeline.slice(0, 80)
    const eventLines = events
      .map((e) => {
        const parts = [
          `[${formatTime(e.at)}] ${e.kind}: ${e.label}`,
          e.detail ? `  detalhe: ${e.detail}` : '',
          e.url ? `  url: ${e.url}` : '',
        ].filter(Boolean)
        return parts.join('\n')
      })
      .join('\n')

    const networkLines = (snapshot?.network ?? [])
      .slice(0, 40)
      .map((n) => {
        const lines = [
          `${n.method} ${n.url} → ${n.status ?? '?'}`,
          n.postData ? `  body: ${n.postData.slice(0, 500)}` : '',
          n.responseBody ? `  response: ${n.responseBody.slice(0, 800)}` : '',
        ].filter(Boolean)
        return lines.join('\n')
      })
      .join('\n')

    const cookieLines = (snapshot?.cookies ?? [])
      .map((c) => `${c.domain} ${c.name}=${c.value}`)
      .join('\n')

    return [
      '[Explorer — captura CDP enviada pelo usuário]',
      'Contexto: sessão de testes — incluir dados sensíveis (cookies, tokens, payloads) para mapeamento.',
      snapshot?.url ? `URL atual: ${snapshot.url}` : `URL: ${state.currentUrl}`,
      snapshot?.title ? `Título: ${snapshot.title}` : '',
      `Eventos na timeline: ${events.length}`,
      '',
      '## Timeline',
      eventLines || '(nenhum evento)',
      '',
      '## Rede (CDP)',
      networkLines || '(nenhuma requisição capturada)',
      '',
      '## Cookies (completo — ambiente de testes)',
      cookieLines || '(nenhum cookie)',
      '',
      '## Storage',
      snapshot?.storage ? JSON.stringify(snapshot.storage, null, 2).slice(0, 4000) : '(não capturado)',
      '',
      'Interprete e mapeie: fluxos, entidades, endpoints, autenticação, dependências.',
      'Responda estruturado: Fluxo / Entidade / Endpoint / Hipótese.',
      'Acumule conhecimento para a base CaiOS/Explorer no Obsidian.',
    ]
      .filter((line) => line !== '')
      .join('\n')
  },

  buildObservationPrompt(event: ExplorerTimelineEvent): string {
    const state = load()
    const mode = state.investigationMode ? 'Investigação' : 'Exploração rotineira'
    const system = state.targetSystem || 'não definido'
    const time = formatTime(event.at)
    return [
      '[Explorer — observação automática]',
      `Sistema: ${system}`,
      `Modo: ${mode}`,
      `Horário: ${time}`,
      `Evento (${event.kind}): ${event.label}`,
      event.detail ? `Detalhe: ${event.detail}` : '',
      event.url ? `URL: ${event.url}` : '',
      '',
      'Interprete este evento no contexto da sessão. Se identificar fluxo, entidade ou hipótese, responda em formato estruturado:',
      '- Fluxo: ...',
      '- Entidade: ...',
      '- Hipótese: ...',
      'Seja conciso. Acumule conhecimento para refinar a skill caios-explorer ao final.',
    ]
      .filter(Boolean)
      .join('\n')
  },

  buildSkillRefinementPrompt(): string | null {
    const state = load()
    const pending = state.learnings.filter((l) => !l.appliedToSkill)
    if (pending.length === 0 && state.insights.length === 0) return null

    const discoveries = pending.map((l) => `- ${l.discovery}`).join('\n')
    const insights = state.insights
      .slice(0, 10)
      .map((i) => `- [${i.category}] ${i.title}: ${i.body}`)
      .join('\n')

    return [
      'Refine a skill `caios-explorer` com o conhecimento acumulado nesta sessão Explorer.',
      'Use skill_manage(action="patch") para adicionar descobertas reais ao SKILL.md ou references/.',
      'Não invente — apenas consolide o que foi observado.',
      '',
      state.targetSystem ? `Sistema: ${state.targetSystem}` : '',
      discoveries ? `Descobertas:\n${discoveries}` : '',
      insights ? `Insights recentes:\n${insights}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  },

  buildReportPrompt(): string {
    const state = load()
    return [
      'Gere relatório de descoberta da sessão Explorer atual.',
      state.targetSystem ? `Sistema: ${state.targetSystem}` : '',
      `Modo: ${state.investigationMode ? 'Investigação' : 'Rotina'}`,
      `Eventos capturados: ${state.timeline.length}`,
      '',
      'Inclua: resumo executivo, fluxos, entidades, endpoints observados, hipóteses, próximos passos.',
      `Estruture para Obsidian em ${'CaiOS/Explorer/'}.`,
    ]
      .filter(Boolean)
      .join('\n')
  },

  buildObsidianSyncPrompt(): string {
    const state = load()
    return [
      'Envie o conhecimento desta sessão Explorer para o Obsidian.',
      `Pasta: CaiOS/Explorer/Sessões/`,
      state.targetSystem ? `Sistema: ${state.targetSystem}` : '',
      'Use a skill obsidian. Organize com wikilinks entre fluxos, entidades e endpoints.',
      'Inclua linha do tempo contextual e evidências disponíveis.',
    ]
      .filter(Boolean)
      .join('\n')
  },
}
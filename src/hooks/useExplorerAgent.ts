import { HERMES_EXPLORER_PROFILE } from '@/lib/constants'
import {
  clearHermesTokenCache,
  fetchHermesModelInfo,
  fetchHermesSessionToken,
  formatModelLabel,
  getHermesWsUrl,
  type HermesSessionResumeResult,
} from '@/lib/hermes-api'
import {
  getPersistedExplorerHermesSession,
  setPersistedExplorerHermesSession,
} from '@/lib/explorer-session-persist'
import { HermesGateway } from '@/lib/hermes-gateway'
import { generateId, nowISO } from '@/lib/utils'
import { explorerService } from '@/services/explorer.service'
import { ensureDashboard } from '@/services/hermes-dashboard.service'
import type { ExplorerInsight, ExplorerSessionState, ExplorerTimelineEvent } from '@/types/explorer'
import { useCallback, useEffect, useRef, useState } from 'react'

const PROFILE = HERMES_EXPLORER_PROFILE
const SESSION_OPTS = { close_on_disconnect: false, title: 'Explorer — Sessão Contínua' } as const

let persistentExplorerGateway: HermesGateway | null = null

function closePersistentExplorerGateway() {
  persistentExplorerGateway?.close()
  persistentExplorerGateway = null
}

function coerceText(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  return String(value)
}

function isSessionBusyError(msg: string): boolean {
  return /session busy/i.test(msg)
}

function parseInsightsFromAgent(text: string): ExplorerInsight[] {
  const results: ExplorerInsight[] = []
  const patterns: { re: RegExp; category: ExplorerInsight['category']; title: string }[] = [
    { re: /(?:^|\n)\s*[-*]?\s*Fluxo(?:\s+identificado)?:\s*(.+)/gi, category: 'flow', title: 'Fluxo identificado' },
    { re: /(?:^|\n)\s*[-*]?\s*Entidade(?:\s+descoberta)?:\s*(.+)/gi, category: 'entity', title: 'Entidade' },
    { re: /(?:^|\n)\s*[-*]?\s*Hipótese:\s*(.+)/gi, category: 'hypothesis', title: 'Hipótese' },
  ]
  for (const { re, category, title } of patterns) {
    for (const match of text.matchAll(re)) {
      const body = match[1]?.trim()
      if (body) results.push(explorerService.addInsight(category, title, body))
    }
  }
  if (results.length === 0 && text.trim().length > 40) {
    results.push(explorerService.addInsight('summary', 'Interpretação', text.trim().slice(0, 500)))
  }
  return results
}

export function useExplorerAgent() {
  const [phase, setPhase] = useState<'booting' | 'connecting' | 'ready' | 'busy' | 'error'>('booting')
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<ExplorerSessionState>(() => explorerService.getState())
  const [agentReply, setAgentReply] = useState('')
  const [thinking, setThinking] = useState(false)
  const [currentModel, setCurrentModel] = useState('')
  const [currentProvider, setCurrentProvider] = useState('')

  const gwRef = useRef<HermesGateway | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const streamIdRef = useRef<string | null>(null)
  const busyRef = useRef(false)
  const mountedRef = useRef(true)
  const lastSentAtRef = useRef<string | null>(null)

  const refreshState = useCallback(() => {
    setState(explorerService.getState())
  }, [])

  const setBusyState = useCallback((busy: boolean) => {
    busyRef.current = busy
    setPhase(busy ? 'busy' : 'ready')
    setThinking(busy)
  }, [])

  const finalizeAssistant = useCallback(
    (text: string) => {
      streamIdRef.current = null
      if (text.trim()) {
        setAgentReply(text)
        explorerService.setLastAgentSummary(text)
        parseInsightsFromAgent(text)
        refreshState()
      }
      busyRef.current = false
      setThinking(false)
      setPhase('ready')
    },
    [refreshState],
  )

  const wireGateway = useCallback(
    (gw: HermesGateway) => {
      gw.on('message.start', () => {
        streamIdRef.current = generateId()
        setAgentReply('')
      })
      gw.on<{ text?: string }>('message.delta', (ev) => {
        const delta = coerceText(ev.payload?.text)
        if (!delta) return
        setAgentReply((prev) => prev + delta)
      })
      gw.on<{ text?: string; rendered?: string }>('message.complete', (ev) => {
        const finalText = coerceText(ev.payload?.text) || coerceText(ev.payload?.rendered)
        finalizeAssistant(finalText)
      })
      gw.on<{ running?: boolean }>('session.info', (ev) => {
        if (ev.payload?.running === true) setBusyState(true)
        else if (ev.payload?.running === false && busyRef.current) setBusyState(false)
      })
      gw.on<{ message?: string }>('error', (ev) => {
        const msg = ev.payload?.message
        if (!msg) return
        if (isSessionBusyError(msg)) {
          setBusyState(true)
          return
        }
        setError(msg)
        setBusyState(false)
      })
    },
    [finalizeAssistant, setBusyState],
  )

  const connectGateway = useCallback(async () => {
    if (persistentExplorerGateway?.state === 'open') {
      gwRef.current = persistentExplorerGateway
      wireGateway(persistentExplorerGateway)
      return persistentExplorerGateway
    }
    const token = await fetchHermesSessionToken(PROFILE)
    const gw = new HermesGateway()
    gwRef.current = gw
    wireGateway(gw)
    await gw.connect(getHermesWsUrl(token, PROFILE))
    persistentExplorerGateway = gw
    return gw
  }, [wireGateway])

  const applyResume = useCallback(
    (result: HermesSessionResumeResult) => {
      sessionIdRef.current = result.session_id
      const stored = result.resumed ?? result.session_key ?? result.session_id
      setPersistedExplorerHermesSession(stored)
      if (result.running) setBusyState(true)
      else setBusyState(false)
    },
    [setBusyState],
  )

  const createSession = useCallback(
    async (gw: HermesGateway) => {
      const result = await gw.request<{ session_id: string; stored_session_id?: string }>(
        'session.create',
        SESSION_OPTS,
      )
      sessionIdRef.current = result.session_id
      setPersistedExplorerHermesSession(result.stored_session_id ?? result.session_id)
      return result
    },
    [],
  )

  const resumeSession = useCallback(
    async (gw: HermesGateway, targetId: string) => {
      const result = await gw.request<HermesSessionResumeResult>('session.resume', {
        session_id: targetId,
        ...SESSION_OPTS,
      })
      applyResume(result)
      return result
    },
    [applyResume],
  )

  const refreshModelInfo = useCallback(async () => {
    try {
      const info = await fetchHermesModelInfo(PROFILE)
      setCurrentModel(info.model ?? '')
      setCurrentProvider(info.provider ?? '')
    } catch {
      /* optional */
    }
  }, [])

  const boot = useCallback(async () => {
    setPhase('booting')
    setError(null)
    try {
      const ok = await ensureDashboard()
      if (!ok) throw new Error('Dashboard Hermes não respondeu')

      setPhase('connecting')
      const gw = await connectGateway()
      const stored = getPersistedExplorerHermesSession()
      if (stored) {
        try {
          await resumeSession(gw, stored)
        } catch {
          await createSession(gw)
        }
      } else {
        await createSession(gw)
      }
      await refreshModelInfo()
      setPhase('ready')
    } catch (err) {
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Erro ao conectar Explorer Agent')
      closePersistentExplorerGateway()
      gwRef.current = null
    }
  }, [connectGateway, createSession, refreshModelInfo, resumeSession])

  const switchModel = useCallback(
    async (provider: string, model: string) => {
      setError(null)
      setAgentReply('')
      streamIdRef.current = null
      busyRef.current = false
      setThinking(false)
      setPhase('connecting')

      try {
        clearHermesTokenCache(PROFILE)
        closePersistentExplorerGateway()
        gwRef.current = null

        const gw = await connectGateway()
        await createSession(gw)
        await refreshModelInfo()

        setCurrentProvider(provider)
        setCurrentModel(model)
        explorerService.addTimelineEvent(
          'system',
          `Modelo: ${formatModelLabel(model, provider)}`,
        )
        refreshState()
        setPhase('ready')
      } catch (err) {
        setPhase('error')
        setError(err instanceof Error ? err.message : 'Falha ao trocar modelo')
        closePersistentExplorerGateway()
        gwRef.current = null
      }
    },
    [connectGateway, createSession, refreshModelInfo, refreshState],
  )

  useEffect(() => {
    mountedRef.current = true
    void boot()
    return () => {
      mountedRef.current = false
    }
  }, [boot])

  const submitPrompt = useCallback(
    async (text: string, silent = false) => {
      const trimmed = text.trim()
      if (!trimmed || busyRef.current) return false

      const gw = gwRef.current
      const sessionId = sessionIdRef.current
      if (!gw || !sessionId) return false

      if (!silent) setError(null)
      setBusyState(true)

      try {
        await gw.request('prompt.submit', { session_id: sessionId, text: trimmed }, 30_000)
        return true
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Falha ao enviar'
        if (isSessionBusyError(msg)) {
          setBusyState(true)
          return false
        }
        setError(msg)
        setBusyState(false)
        return false
      }
    },
    [setBusyState],
  )

  const recordEvent = useCallback(
    (kind: ExplorerTimelineEvent['kind'], label: string, detail?: string, url?: string) => {
      const event = explorerService.addTimelineEvent(kind, label, detail, url)
      refreshState()
      return event
    },
    [refreshState],
  )

  const setUrl = useCallback(
    (url: string) => {
      explorerService.setCurrentUrl(url)
      refreshState()
    },
    [refreshState],
  )

  const sendCaptureToHermes = useCallback(
    async (snapshot?: Parameters<typeof explorerService.buildCapturePrompt>[0]) => {
      const prompt = explorerService.buildCapturePrompt(snapshot)
      lastSentAtRef.current = nowISO()
      const ok = await submitPrompt(prompt)
      if (ok) {
        explorerService.addTimelineEvent('system', 'Captura enviada ao Hermes')
        refreshState()
      }
      return ok
    },
    [refreshState, submitPrompt],
  )

  const syncState = useCallback(() => {
    refreshState()
  }, [refreshState])

  return {
    phase,
    error,
    state,
    agentReply,
    thinking,
    currentModel,
    currentProvider,
    isBusy: phase === 'busy',
    canInteract: phase === 'ready' || phase === 'busy',
    setUrl,
    recordEvent,
    sendCaptureToHermes,
    switchModel,
    syncState,
    retry: boot,
  }
}
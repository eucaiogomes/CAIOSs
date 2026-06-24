import { HermesGateway } from '@/lib/hermes-gateway'
import {
  fetchHermesModelInfo,
  fetchHermesSessionToken,
  fetchHermesSessions,
  formatModelLabel,
  getHermesWsUrl,
  type HermesResumeMessage,
  type HermesSessionInfo,
  type HermesSessionResumeResult,
} from '@/lib/hermes-api'
import {
  getPersistedHermesSession,
  setPersistedHermesSession,
} from '@/lib/hermes-session-persist'
import { generateId } from '@/lib/utils'
import { ensureDashboard } from '@/services/hermes-dashboard.service'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface HermesToolActivity {
  id: string
  name: string
  status: 'running' | 'complete'
  detail?: string
}

export interface HermesChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  streaming?: boolean
  tools?: HermesToolActivity[]
}

const SESSION_OPTS = { close_on_disconnect: false } as const

/** Mantém o WebSocket vivo ao trocar de rota — o agente continua no servidor. */
let persistentGateway: HermesGateway | null = null

function closePersistentGateway() {
  persistentGateway?.close()
  persistentGateway = null
}

function coerceText(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  return String(value)
}

function isSessionBusyError(msg: string): boolean {
  return /session busy/i.test(msg)
}

function mapResumeMessages(msgs: HermesResumeMessage[]): HermesChatMessage[] {
  const result: HermesChatMessage[] = []
  for (const m of msgs) {
    if (m.role === 'tool') {
      const label = m.name ?? 'tool'
      const ctx = m.context?.trim()
      result.push({
        id: generateId(),
        role: 'assistant',
        content: ctx ? `[${label}] ${ctx}` : `[${label}]`,
      })
      continue
    }
    if (m.role === 'system') continue
    const text = (m.text ?? coerceText(m.content)).trim()
    if (!text) continue
    result.push({ id: generateId(), role: m.role, content: text })
  }
  return result
}

export function useHermesChat() {
  const [phase, setPhase] = useState<'booting' | 'connecting' | 'ready' | 'busy' | 'error'>('booting')
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<HermesChatMessage[]>([])
  const [modelLabel, setModelLabel] = useState<string>('')
  const [currentModel, setCurrentModel] = useState<string>('')
  const [currentProvider, setCurrentProvider] = useState<string>('')
  const [thinking, setThinking] = useState(false)
  const [sessions, setSessions] = useState<HermesSessionInfo[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [activeSessionKey, setActiveSessionKey] = useState<string | null>(null)
  const [switchingSession, setSwitchingSession] = useState(false)
  const [backgroundNote, setBackgroundNote] = useState<string | null>(null)

  const gwRef = useRef<HermesGateway | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const streamIdRef = useRef<string | null>(null)
  const busyRef = useRef(false)
  const mountedRef = useRef(true)
  const reconnectingRef = useRef(false)
  const listenerCleanupRef = useRef<(() => void)[]>([])

  const clearGatewayListeners = useCallback(() => {
    for (const off of listenerCleanupRef.current) off()
    listenerCleanupRef.current = []
  }, [])

  const persistSessionKey = useCallback((key: string | null) => {
    setActiveSessionKey(key)
    setPersistedHermesSession(key)
  }, [])

  const setBusyState = useCallback((busy: boolean) => {
    busyRef.current = busy
    setPhase(busy ? 'busy' : 'ready')
    if (busy) setThinking(true)
    else setThinking(false)
  }, [])

  const appendAssistantDelta = useCallback((text: string) => {
    const streamId = streamIdRef.current
    if (!streamId || !text) return
    setBackgroundNote(null)
    setMessages((prev) =>
      prev.map((m) =>
        m.id === streamId ? { ...m, content: m.content + text, streaming: true } : m,
      ),
    )
  }, [])

  const finalizeAssistant = useCallback((text: string) => {
    const streamId = streamIdRef.current
    if (!streamId) return
    streamIdRef.current = null
    setMessages((prev) =>
      prev.map((m) =>
        m.id === streamId
          ? { ...m, content: text || m.content, streaming: false }
          : m,
      ),
    )
    setBackgroundNote(null)
    busyRef.current = false
    setThinking(false)
    setPhase('ready')
  }, [])

  const startAssistantMessage = useCallback(() => {
    const id = generateId()
    streamIdRef.current = id
    setBackgroundNote(null)
    setMessages((prev) => [
      ...prev,
      { id, role: 'assistant', content: '', streaming: true, tools: [] },
    ])
    setThinking(false)
  }, [])

  const ensureStreamingPlaceholder = useCallback(() => {
    if (streamIdRef.current) return
    startAssistantMessage()
  }, [startAssistantMessage])

  const wireGateway = useCallback((gw: HermesGateway) => {
    clearGatewayListeners()
    listenerCleanupRef.current = [
      gw.on('message.start', () => startAssistantMessage()),
      gw.on<{ text?: string }>('message.delta', (ev) => {
        appendAssistantDelta(coerceText(ev.payload?.text))
      }),
      gw.on<{ text?: string; rendered?: string }>('message.complete', (ev) => {
        const finalText = coerceText(ev.payload?.text) || coerceText(ev.payload?.rendered)
        if (!streamIdRef.current && finalText) startAssistantMessage()
        finalizeAssistant(finalText)
      }),
      gw.on('thinking.delta', () => setThinking(true)),
      gw.on<{ running?: boolean }>('session.info', (ev) => {
        if (ev.payload?.running === true) setBusyState(true)
        else if (ev.payload?.running === false && busyRef.current) setBusyState(false)
      }),
      gw.on<{ message?: string }>('error', (ev) => {
        const msg = ev.payload?.message
        if (!msg) return
        if (isSessionBusyError(msg)) {
          setError(null)
          setBackgroundNote('Hermes ainda está trabalhando nesta sessão. Aguarde a resposta.')
          setBusyState(true)
          return
        }
        setError(msg)
        if (busyRef.current) {
          busyRef.current = false
          streamIdRef.current = null
          setThinking(false)
          setPhase('ready')
        }
      }),
      gw.on<{ name?: string; description?: string; tool_id?: string }>('tool.start', (ev) => {
        ensureStreamingPlaceholder()
        const streamId = streamIdRef.current
        if (!streamId) return
        const tool: HermesToolActivity = {
          id: ev.payload?.tool_id ?? generateId(),
          name: coerceText(ev.payload?.name) || 'tool',
          status: 'running',
          detail: coerceText(ev.payload?.description),
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamId ? { ...m, tools: [...(m.tools ?? []), tool] } : m,
          ),
        )
      }),
      gw.on<{ name?: string; tool_id?: string }>('tool.complete', (ev) => {
        const streamId = streamIdRef.current
        if (!streamId) return
        const toolId = ev.payload?.tool_id
        const name = coerceText(ev.payload?.name)
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== streamId) return m
            const tools = (m.tools ?? []).map((t) =>
              (toolId && t.id === toolId) || (!toolId && t.name === name && t.status === 'running')
                ? { ...t, status: 'complete' as const }
                : t,
            )
            return { ...m, tools }
          }),
        )
      }),
    ]
  }, [
    appendAssistantDelta,
    clearGatewayListeners,
    ensureStreamingPlaceholder,
    finalizeAssistant,
    setBusyState,
    startAssistantMessage,
  ])

  const refreshModelInfo = useCallback(async () => {
    try {
      const info = await fetchHermesModelInfo()
      setCurrentModel(info.model ?? '')
      setCurrentProvider(info.provider ?? '')
      setModelLabel(formatModelLabel(info.model, info.provider))
    } catch {
      /* optional */
    }
  }, [])

  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true)
    setSessionsError(null)
    try {
      const res = await fetchHermesSessions(30, 0, 'recent')
      setSessions(res.sessions)
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : 'Falha ao carregar sessões')
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  const applyResumeResult = useCallback(
    (result: HermesSessionResumeResult) => {
      sessionIdRef.current = result.session_id
      const stored = result.resumed ?? result.session_key ?? result.session_id
      persistSessionKey(stored)

      const mapped = mapResumeMessages(result.messages)
      setMessages(
        mapped.length > 0
          ? mapped
          : [
              {
                id: generateId(),
                role: 'system',
                content: 'Sessão retomada. Continue de onde parou.',
              },
            ],
      )

      if (result.running) {
        setBusyState(true)
        ensureStreamingPlaceholder()
        setBackgroundNote('Hermes ainda está trabalhando — você pode navegar e voltar depois.')
      } else {
        setBusyState(false)
        setBackgroundNote(null)
      }
    },
    [ensureStreamingPlaceholder, persistSessionKey, setBusyState],
  )

  const createSession = useCallback(
    async (gw: HermesGateway) => {
      const result = await gw.request<{ session_id: string; stored_session_id?: string }>(
        'session.create',
        SESSION_OPTS,
      )
      sessionIdRef.current = result.session_id
      const stored = result.stored_session_id ?? result.session_id
      persistSessionKey(stored)
      return result
    },
    [persistSessionKey],
  )

  const resumeSession = useCallback(
    async (gw: HermesGateway, targetId: string) => {
      const result = await gw.request<HermesSessionResumeResult>('session.resume', {
        session_id: targetId,
        ...SESSION_OPTS,
      })
      applyResumeResult(result)
      return result
    },
    [applyResumeResult],
  )

  const connectGateway = useCallback(async () => {
    if (persistentGateway?.state === 'open') {
      gwRef.current = persistentGateway
      wireGateway(persistentGateway)
      return persistentGateway
    }

    const token = await fetchHermesSessionToken()
    const gw = new HermesGateway()
    gwRef.current = gw
    wireGateway(gw)
    await gw.connect(getHermesWsUrl(token))
    persistentGateway = gw
    return gw
  }, [wireGateway])

  const boot = useCallback(async () => {
    setPhase('booting')
    setError(null)
    setBackgroundNote(null)
    try {
      const ok = await ensureDashboard()
      if (!ok) throw new Error('Dashboard Hermes não respondeu')

      setPhase('connecting')
      const gw = await connectGateway()

      const storedKey = getPersistedHermesSession()
      if (storedKey) {
        try {
          await resumeSession(gw, storedKey)
        } catch {
          await createSession(gw)
          setMessages([
            {
              id: generateId(),
              role: 'system',
              content: 'Olá, Caio. Sou o Hermes — seu orquestrador de agentes. Como posso ajudar?',
            },
          ])
          setPhase('ready')
        }
      } else {
        await createSession(gw)
        setMessages([
          {
            id: generateId(),
            role: 'system',
            content: 'Olá, Caio. Sou o Hermes — seu orquestrador de agentes. Como posso ajudar?',
          },
        ])
        setPhase('ready')
      }

      await refreshModelInfo()
      void refreshSessions()
    } catch (err) {
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Erro ao conectar')
      closePersistentGateway()
      gwRef.current = null
    }
  }, [connectGateway, createSession, refreshModelInfo, refreshSessions, resumeSession])

  const reconnect = useCallback(async () => {
    if (reconnectingRef.current || !mountedRef.current) return
    const storedKey = activeSessionKey ?? getPersistedHermesSession()
    if (!storedKey) return

    reconnectingRef.current = true
    try {
      setPhase('connecting')
      closePersistentGateway()
      gwRef.current = null
      const gw = await connectGateway()
      await resumeSession(gw, storedKey)
      setPhase(busyRef.current ? 'busy' : 'ready')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao reconectar')
      setPhase('error')
    } finally {
      reconnectingRef.current = false
    }
  }, [activeSessionKey, connectGateway, resumeSession])

  useEffect(() => {
    mountedRef.current = true
    void boot()
    return () => {
      mountedRef.current = false
      clearGatewayListeners()
    }
  }, [boot, clearGatewayListeners])

  useEffect(() => {
    const gw = gwRef.current
    if (!gw) return
    return gw.onState((state) => {
      if (state === 'closed' && mountedRef.current) {
        void reconnect()
      }
    })
  }, [phase, reconnect])

  useEffect(() => {
    if (phase !== 'busy') return
    const timer = setTimeout(() => {
      if (!busyRef.current) return
      setBackgroundNote(
        'Hermes ainda está trabalhando. Tarefas longas com ferramentas podem demorar — você pode sair da página que o trabalho continua.',
      )
    }, 120_000)
    return () => clearTimeout(timer)
  }, [phase])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busyRef.current) return

      const gw = gwRef.current
      const sessionId = sessionIdRef.current
      if (!gw || !sessionId) return

      setError(null)
      setBackgroundNote(null)
      busyRef.current = true
      setPhase('busy')
      setThinking(true)

      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'user', content: trimmed },
      ])

      try {
        await gw.request('prompt.submit', { session_id: sessionId, text: trimmed }, 30_000)
        void refreshSessions()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Falha ao enviar mensagem'
        if (isSessionBusyError(msg)) {
          setError(null)
          setBackgroundNote('Hermes ainda está processando a mensagem anterior.')
          setBusyState(true)
          return
        }
        if (/timeout|fechado|desconectado/i.test(msg)) {
          setError(null)
          setBackgroundNote(
            'Conexão instável — o Hermes pode ainda estar trabalhando. Use Sincronizar para retomar.',
          )
          setBusyState(true)
          void reconnect()
          return
        }
        busyRef.current = false
        setPhase('ready')
        setThinking(false)
        setError(msg)
      }
    },
    [reconnect, refreshSessions, setBusyState],
  )

  const newChat = useCallback(async () => {
    const gw = gwRef.current
    if (!gw) return
    setError(null)
    setBackgroundNote(null)
    streamIdRef.current = null
    busyRef.current = false
    setThinking(false)
    try {
      await createSession(gw)
      setMessages([
        {
          id: generateId(),
          role: 'system',
          content: 'Nova conversa iniciada. O que vamos fazer?',
        },
      ])
      setPhase('ready')
      void refreshSessions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar sessão')
    }
  }, [createSession, refreshSessions])

  const switchSession = useCallback(
    async (targetId: string) => {
      const gw = gwRef.current
      if (!gw || targetId === activeSessionKey) return
      if (busyRef.current || switchingSession) return

      setSwitchingSession(true)
      setError(null)
      setBackgroundNote(null)
      streamIdRef.current = null
      busyRef.current = false
      setThinking(false)
      setMessages([])

      try {
        await resumeSession(gw, targetId)
        setPhase(busyRef.current ? 'busy' : 'ready')
        void refreshSessions()
      } catch (err) {
        setPhase('ready')
        setError(err instanceof Error ? err.message : 'Falha ao retomar sessão')
      } finally {
        setSwitchingSession(false)
      }
    },
    [activeSessionKey, refreshSessions, resumeSession, switchingSession],
  )

  const switchModel = useCallback(
    async (provider: string, model: string) => {
      const gw = gwRef.current
      if (!gw) return
      setCurrentProvider(provider)
      setCurrentModel(model)
      setModelLabel(formatModelLabel(model, provider))
      setError(null)
      setBackgroundNote(null)
      streamIdRef.current = null
      busyRef.current = false
      setThinking(false)
      try {
        await createSession(gw)
        setMessages([
          {
            id: generateId(),
            role: 'system',
            content: `Modelo alterado para ${formatModelLabel(model, provider)}. Nova conversa iniciada.`,
          },
        ])
        setPhase('ready')
        void refreshSessions()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao reiniciar sessão')
      }
    },
    [createSession, refreshSessions],
  )

  return {
    phase,
    error,
    backgroundNote,
    messages,
    modelLabel,
    currentModel,
    currentProvider,
    thinking,
    sessions,
    sessionsLoading,
    sessionsError,
    storedSessionId: activeSessionKey,
    switchingSession,
    sendMessage,
    newChat,
    switchSession,
    switchModel,
    loadSessions: refreshSessions,
    retry: boot,
    reconnect,
    isBusy: phase === 'busy',
    canType: phase === 'ready' && !switchingSession,
  }
}
import {
  fetchHermesModelInfo,
  fetchHermesSessionToken,
  formatModelLabel,
  getHermesWsUrl,
  type HermesSessionResumeResult,
} from '@/lib/hermes-api'
import { HermesGateway } from '@/lib/hermes-gateway'
import {
  getPersistedLiveCallHermesSession,
  setPersistedLiveCallHermesSession,
} from '@/lib/live-call-session-persist'
import { generateId } from '@/lib/utils'
import { liveCallService } from '@/services/live-call.service'
import { ensureDashboard } from '@/services/hermes-dashboard.service'
import type { LiveCallChatEntry, LiveCallSuggestion } from '@/types/live-call'
import { useCallback, useEffect, useRef, useState } from 'react'

const SESSION_OPTS = { close_on_disconnect: false, title: 'Live Call Coach' } as const

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

function parseSuggestions(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/^[\s→\-*]+/, '').trim())
    .filter((l) => l.length > 8)
    .slice(0, 3)
}

export function useLiveCallAgent(sessionId: string | null) {
  const [phase, setPhase] = useState<'booting' | 'connecting' | 'ready' | 'busy' | 'error'>('booting')
  const [error, setError] = useState<string | null>(null)
  const [thinking, setThinking] = useState(false)
  const [currentModel, setCurrentModel] = useState('')
  const [currentProvider, setCurrentProvider] = useState('')
  const [chat, setChat] = useState<LiveCallChatEntry[]>([])
  const [suggestions, setSuggestions] = useState<LiveCallSuggestion[]>([])
  const [lastReply, setLastReply] = useState('')

  const gwRef = useRef<HermesGateway | null>(null)
  const hermesSessionRef = useRef<string | null>(null)
  const streamIdRef = useRef<string | null>(null)
  const busyRef = useRef(false)
  const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSuggestRef = useRef(false)
  const replyBufferRef = useRef('')
  const replyModeRef = useRef<'chat' | 'suggest' | 'summary'>('chat')
  const summaryWaiterRef = useRef<((summary: string) => void) | null>(null)

  const refreshFromStore = useCallback(() => {
    if (!sessionId) return
    const session = liveCallService.getSession(sessionId)
    if (!session) return
    setChat(session.chat)
    setSuggestions(session.suggestions)
  }, [sessionId])

  const setBusyState = useCallback((busy: boolean) => {
    busyRef.current = busy
    setPhase(busy ? 'busy' : 'ready')
    setThinking(busy)
  }, [])

  const finalizeReply = useCallback(
    (text: string) => {
      streamIdRef.current = null
      const trimmed = text.trim() || replyBufferRef.current.trim()
      replyBufferRef.current = ''

      if (!trimmed || !sessionId) {
        busyRef.current = false
        setThinking(false)
        setPhase('ready')
        return
      }

      setLastReply(trimmed)

      if (replyModeRef.current === 'suggest') {
        for (const line of parseSuggestions(trimmed)) {
          liveCallService.addSuggestion(sessionId, line)
        }
        refreshFromStore()
      } else if (replyModeRef.current === 'summary') {
        summaryWaiterRef.current?.(trimmed)
        summaryWaiterRef.current = null
      } else {
        liveCallService.addChat(sessionId, 'assistant', trimmed)
        setChat((prev) => [
          ...prev,
          { id: generateId(), at: new Date().toISOString(), role: 'assistant', content: trimmed },
        ])
      }

      replyModeRef.current = 'chat'
      busyRef.current = false
      setThinking(false)
      setPhase('ready')
      pendingSuggestRef.current = false
    },
    [refreshFromStore, sessionId],
  )

  const wireGateway = useCallback(
    (gw: HermesGateway) => {
      gw.on('message.start', () => {
        streamIdRef.current = generateId()
        replyBufferRef.current = ''
      })
      gw.on<{ text?: string }>('message.delta', (ev) => {
        const delta = coerceText(ev.payload?.text)
        if (!delta) return
        replyBufferRef.current += delta
      })
      gw.on<{ text?: string; rendered?: string }>('message.complete', (ev) => {
        const finalText = coerceText(ev.payload?.text) || coerceText(ev.payload?.rendered)
        finalizeReply(finalText)
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
        pendingSuggestRef.current = false
      })
    },
    [finalizeReply, setBusyState],
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

  const createSession = useCallback(async (gw: HermesGateway) => {
    const result = await gw.request<{ session_id: string; stored_session_id?: string }>(
      'session.create',
      SESSION_OPTS,
    )
    hermesSessionRef.current = result.session_id
    setPersistedLiveCallHermesSession(result.stored_session_id ?? result.session_id)
    return result
  }, [])

  const resumeSession = useCallback(async (gw: HermesGateway, targetId: string) => {
    const result = await gw.request<HermesSessionResumeResult>('session.resume', {
      session_id: targetId,
      ...SESSION_OPTS,
    })
    hermesSessionRef.current = result.session_id
    setPersistedLiveCallHermesSession(result.resumed ?? result.session_key ?? result.session_id)
    if (result.running) setBusyState(true)
    return result
  }, [setBusyState])

  const boot = useCallback(async () => {
    setPhase('booting')
    setError(null)
    try {
      const ok = await ensureDashboard()
      if (!ok) throw new Error('Dashboard Hermes não respondeu')
      setPhase('connecting')
      const gw = await connectGateway()
      const stored = getPersistedLiveCallHermesSession()
      if (stored) {
        try {
          await resumeSession(gw, stored)
        } catch {
          await createSession(gw)
        }
      } else {
        await createSession(gw)
      }
      const info = await fetchHermesModelInfo()
      setCurrentModel(info.model ?? '')
      setCurrentProvider(info.provider ?? '')
      setPhase('ready')
    } catch (err) {
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Erro ao conectar Hermes')
      closePersistentGateway()
      gwRef.current = null
    }
  }, [connectGateway, createSession, resumeSession])

  useEffect(() => {
    void boot()
  }, [boot])

  useEffect(() => {
    refreshFromStore()
  }, [refreshFromStore, sessionId])

  const submitPrompt = useCallback(
    async (text: string, mode: 'chat' | 'suggest' | 'summary' = 'chat', silent = false) => {
      const trimmed = text.trim()
      if (!trimmed || busyRef.current) return false

      const gw = gwRef.current
      const hermesId = hermesSessionRef.current
      if (!gw || !hermesId) return false

      replyModeRef.current = mode
      if (!silent) setError(null)
      setBusyState(true)

      try {
        await gw.request('prompt.submit', { session_id: hermesId, text: trimmed }, 60_000)
        return true
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Falha ao enviar'
        if (isSessionBusyError(msg)) {
          setBusyState(true)
          return false
        }
        setError(msg)
        setBusyState(false)
        pendingSuggestRef.current = false
        return false
      }
    },
    [setBusyState],
  )

  const askCoach = useCallback(
    async (question: string) => {
      if (!sessionId) return false
      const session = liveCallService.getSession(sessionId)
      if (!session) return false

      liveCallService.addChat(sessionId, 'user', question)
      setChat((prev) => [
        ...prev,
        { id: generateId(), at: new Date().toISOString(), role: 'user', content: question },
      ])

      const prompt = liveCallService.buildQuestionPrompt(session, question)
      return submitPrompt(prompt, 'chat')
    },
    [sessionId, submitPrompt],
  )

  const requestSuggestions = useCallback(
    async (recentLines: string[] = []) => {
      if (!sessionId || busyRef.current || pendingSuggestRef.current) return
      const session = liveCallService.getSession(sessionId)
      if (!session) return

      pendingSuggestRef.current = true
      const prompt = liveCallService.buildSuggestionPrompt(session, recentLines)
      await submitPrompt(prompt, 'suggest', true)
    },
    [sessionId, submitPrompt],
  )

  const scheduleSuggestions = useCallback(
    (recentLines: string[]) => {
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current)
      suggestionTimerRef.current = setTimeout(() => {
        void requestSuggestions(recentLines)
      }, 8000)
    },
    [requestSuggestions],
  )

  const endCallWithSummary = useCallback(async () => {
    if (!sessionId) return null
    const session = liveCallService.getSession(sessionId)
    if (!session) return null

    const prompt = liveCallService.buildSummaryPrompt(session)
    const summaryPromise = new Promise<string>((resolve) => {
      summaryWaiterRef.current = resolve
      setTimeout(() => resolve(''), 120_000)
    })

    const ok = await submitPrompt(prompt, 'summary')
    if (!ok) return liveCallService.endSession(sessionId)

    const summary = await summaryPromise
    return liveCallService.endSession(sessionId, summary || undefined)
  }, [sessionId, submitPrompt])

  const switchModel = useCallback(
    async (provider: string, model: string) => {
      setError(null)
      setPhase('connecting')
      try {
        closePersistentGateway()
        gwRef.current = null
        const gw = await connectGateway()
        await createSession(gw)
        const info = await fetchHermesModelInfo()
        setCurrentModel(info.model ?? model)
        setCurrentProvider(info.provider ?? provider)
        setPhase('ready')
      } catch (err) {
        setPhase('error')
        setError(err instanceof Error ? err.message : 'Falha ao trocar modelo')
      }
    },
    [connectGateway, createSession],
  )

  return {
    phase,
    error,
    thinking,
    chat,
    suggestions,
    lastReply,
    currentModel,
    currentProvider,
    modelLabel: formatModelLabel(currentModel, currentProvider),
    isBusy: phase === 'busy',
    canInteract: phase === 'ready' || phase === 'busy',
    askCoach,
    requestSuggestions,
    scheduleSuggestions,
    endCallWithSummary,
    switchModel,
    retry: boot,
  }
}
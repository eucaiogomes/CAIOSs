import { ChatBubble } from '@/components/hermes/ChatBubble'
import { ChatComposer } from '@/components/hermes/ChatComposer'
import { HermesModelPicker } from '@/components/hermes/HermesModelPicker'
import { PageFullBleed } from '@/components/layout/PageFullBleed'
import { Button } from '@/components/ui/button'
import { useLiveCallAgent } from '@/hooks/useLiveCallAgent'
import { useSpeechTranscription } from '@/hooks/useSpeechTranscription'
import { liveCallService, detectPlatform } from '@/services/live-call.service'
import { cn } from '@/lib/utils'
import * as tauriBridge from '@/lib/tauri-bridge'
import type { LiveCallSession } from '@/types/live-call'
import type { HermesChatMessage } from '@/hooks/useHermesChat'
import {
  ExternalLink,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  RefreshCw,
  Users,
  Video,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'

function normalizeMeetingUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function toHermesMessage(entry: { id: string; role: string; content: string }): HermesChatMessage {
  return {
    id: entry.id,
    role: entry.role as HermesChatMessage['role'],
    content: entry.content,
  }
}

export function LiveCallView() {
  const active = liveCallService.getActive()
  const [urlInput, setUrlInput] = useState(active.meetingUrl)
  const [titleInput, setTitleInput] = useState(active.title)
  const [participantsInput, setParticipantsInput] = useState(active.participants.join(', '))
  const [sessionId, setSessionId] = useState<string | null>(active.sessionId)
  const [meetingUrl, setMeetingUrl] = useState(active.meetingUrl)
  const [iframeKey, setIframeKey] = useState(0)
  const [endedSession, setEndedSession] = useState<LiveCallSession | null>(null)
  const [ending, setEnding] = useState(false)
  const [transcriptTick, setTranscriptTick] = useState(0)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const recentLinesRef = useRef<string[]>([])

  const {
    phase,
    error,
    thinking,
    chat,
    suggestions,
    currentModel,
    currentProvider,
    isBusy,
    canInteract,
    askCoach,
    scheduleSuggestions,
    endCallWithSummary,
    switchModel,
    retry,
  } = useLiveCallAgent(sessionId)

  const session = sessionId ? liveCallService.getSession(sessionId) : null
  const transcript = session?.transcript ?? []
  void transcriptTick

  const onTranscriptChunk = useCallback(
    (chunk: { text: string; isFinal: boolean }) => {
      if (!sessionId) return
      liveCallService.addTranscript(sessionId, chunk.text, chunk.isFinal, 'Você')
      if (chunk.isFinal) {
        recentLinesRef.current = [...recentLinesRef.current, chunk.text].slice(-8)
        scheduleSuggestions(recentLinesRef.current)
      }
      setTranscriptTick((n) => n + 1)
    },
    [scheduleSuggestions, sessionId],
  )

  const { supported: micSupported, listening, error: micError, start: startMic, stop: stopMic } =
    useSpeechTranscription(onTranscriptChunk)

  useEffect(() => {
    const el = transcriptRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [transcript])

  const handleJoin = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault()
      const url = normalizeMeetingUrl(urlInput)
      if (!url) return
      const participants = participantsInput
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
      const s = liveCallService.startSession(url, titleInput, participants)
      setSessionId(s.id)
      setMeetingUrl(url)
      setIframeKey((k) => k + 1)
      liveCallService.setActive({ transcribing: false })
    },
    [participantsInput, titleInput, urlInput],
  )

  const toggleTranscription = useCallback(() => {
    if (listening) {
      stopMic()
      liveCallService.setActive({ transcribing: false })
    } else {
      startMic()
      liveCallService.setActive({ transcribing: true })
    }
  }, [listening, startMic, stopMic])

  const handleEndCall = useCallback(async () => {
    if (!sessionId) return
    setEnding(true)
    stopMic()
    try {
      const ended = await endCallWithSummary()
      setEndedSession(ended)
      setSessionId(null)
      setMeetingUrl('')
    } finally {
      setEnding(false)
    }
  }, [endCallWithSummary, sessionId, stopMic])

  const isLoading = phase === 'booting' || phase === 'connecting'
  const isLive = Boolean(sessionId && meetingUrl)
  const platform = meetingUrl ? detectPlatform(meetingUrl) : null

  const chatMessages: HermesChatMessage[] = chat.map(toHermesMessage)

  return (
    <PageFullBleed className="flex min-h-0 flex-col">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/80 bg-bg-panel/90 px-3 py-2 backdrop-blur-md sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-primary/10 ring-1 ring-violet-400/25">
            <Video className="h-4 w-4 text-violet-300" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">Live Call</h1>
            <p className="truncate text-[10px] text-text-muted">
              {isLive ? `${platform} · coach Hermes` : 'Cole o link da reunião'}
            </p>
          </div>
        </div>

        {!isLive ? (
          <form onSubmit={handleJoin} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Link Zoom, Meet, Teams, Electro…"
              className="h-8 min-w-[180px] flex-1 rounded-lg border border-border/70 bg-bg-main px-3 text-xs outline-none focus:border-primary/40"
            />
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Título da reunião"
              className="h-8 w-36 rounded-lg border border-border/70 bg-bg-main px-3 text-xs outline-none focus:border-primary/40"
            />
            <input
              value={participantsInput}
              onChange={(e) => setParticipantsInput(e.target.value)}
              placeholder="Participantes (vírgula)"
              className="h-8 min-w-[140px] flex-1 rounded-lg border border-border/70 bg-bg-main px-3 text-xs outline-none focus:border-primary/40"
            />
            <Button type="submit" size="sm" disabled={!urlInput.trim()}>
              Entrar
            </Button>
          </form>
        ) : (
          <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5">
            <HermesModelPicker
              currentModel={currentModel}
              currentProvider={currentProvider}
              disabled={!canInteract || isBusy}
              onApplied={(p, m) => void switchModel(p, m)}
            />
            <Button
              size="sm"
              variant={listening ? 'secondary' : 'ghost'}
              onClick={toggleTranscription}
              disabled={!micSupported}
              title={micSupported ? 'Transcrever microfone' : 'Microfone não suportado'}
            >
              {listening ? <Mic className="h-3.5 w-3.5 text-success" /> : <MicOff className="h-3.5 w-3.5" />}
              <span className="ml-1 hidden sm:inline">{listening ? 'Ouvindo' : 'Transcrever'}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void tauriBridge.openUrl(meetingUrl)}
              title="Abrir em janela externa"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void retry()}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void handleEndCall()} disabled={ending || isBusy}>
              {ending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PhoneOff className="h-3.5 w-3.5" />}
              <span className="ml-1">Encerrar</span>
            </Button>
          </div>
        )}
      </header>

      {(error || micError) && (
        <div className="shrink-0 border-b border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error ?? micError}
        </div>
      )}

      {endedSession && (
        <div className="shrink-0 border-b border-success/20 bg-success/10 px-3 py-3 text-xs text-text-secondary sm:px-4">
          <p className="font-medium text-success">Chamada encerrada — resumo salvo</p>
          <p className="mt-1 line-clamp-3">{endedSession.summary?.slice(0, 400)}</p>
          <button
            type="button"
            className="mt-2 text-primary underline"
            onClick={() => setEndedSession(null)}
          >
            Fechar
          </button>
        </div>
      )}

      {!isLive ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <Video className="h-12 w-12 text-text-muted/30" />
          <p className="text-sm text-text-secondary">Assistente de chamadas com Hermes</p>
          <p className="max-w-md text-xs text-text-muted">
            Cole o link da videoconferência. O vídeo abre em tela cheia e o Hermes transcreve, sugere o que falar e
            entrega um resumo ao final — tudo salvo na base do CaiOS.
          </p>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_min(380px,38vw)]">
          <div className="relative min-h-0 overflow-hidden bg-black">
            <iframe
              key={iframeKey}
              src={meetingUrl}
              title="Chamada de vídeo"
              className="h-full w-full"
              allow="camera; microphone; fullscreen; display-capture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-[10px] text-white/80">
              {platform} — se o embed falhar, use o botão abrir externo
            </div>
          </div>

          <div className="flex min-h-0 flex-col border-t border-border/60 lg:border-l lg:border-t-0">
            {suggestions.length > 0 && (
              <div className="shrink-0 border-b border-border/60 bg-primary/5 px-3 py-2">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <Lightbulb className="h-3 w-3" />
                  Sugestões agora
                </div>
                <ul className="space-y-1">
                  {suggestions.slice(0, 3).map((s) => (
                    <li
                      key={s.id}
                      className="rounded-lg border border-primary/15 bg-bg-panel/80 px-2.5 py-1.5 text-xs text-text-primary"
                    >
                      {s.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="shrink-0 border-b border-border/60 px-3 py-2">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                <Users className="h-3 w-3" />
                Participantes
              </div>
              <p className="text-xs text-text-secondary">
                {session?.participants.length
                  ? session.participants.join(' · ')
                  : 'Adicione nomes ao entrar na chamada'}
              </p>
            </div>

            <div ref={transcriptRef} className="min-h-0 flex-1 overflow-y-auto border-b border-border/60 px-2 py-2">
              <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Transcrição ao vivo
              </p>
              {transcript.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-text-muted">
                  {listening ? 'Ouvindo microfone…' : 'Ative Transcrever para capturar a conversa'}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {transcript.map((t) => (
                    <li key={t.id} className={cn('rounded-lg px-2.5 py-1.5 text-xs', t.isFinal ? 'bg-bg-soft/50' : 'bg-bg-soft/20 italic text-text-muted')}>
                      <span className="font-mono text-[10px] text-primary">{t.at.slice(11, 19)}</span>
                      {t.speaker && <span className="ml-1.5 text-[10px] text-text-muted">{t.speaker}</span>}
                      <p className="mt-0.5 text-text-primary">{t.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-text-muted">Conectando coach Hermes…</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-text-muted">
                  Pergunte algo ao Hermes durante a chamada
                </p>
              ) : (
                chatMessages.map((m) => <ChatBubble key={m.id} message={m} />)
              )}
              {thinking && (
                <div className="flex items-center gap-2 px-4 py-2 text-xs text-text-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Hermes pensando…
                </div>
              )}
            </div>

            <ChatComposer
              disabled={!canInteract}
              busy={isBusy}
              placeholder="Pergunte ao coach: o que devo falar agora?"
              onSend={(text) => void askCoach(text)}
            />
          </div>
        </div>
      )}
    </PageFullBleed>
  )
}
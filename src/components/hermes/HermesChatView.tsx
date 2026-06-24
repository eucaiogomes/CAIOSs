import { PageFullBleed } from '@/components/layout/PageFullBleed'
import { ChatBubble } from '@/components/hermes/ChatBubble'
import { ChatComposer } from '@/components/hermes/ChatComposer'
import { HermesModelPicker } from '@/components/hermes/HermesModelPicker'
import { HermesSessionSidebar } from '@/components/hermes/HermesSessionSidebar'
import { Button } from '@/components/ui/button'
import { useHermesChat } from '@/hooks/useHermesChat'
import { cn } from '@/lib/utils'
import * as tauriBridge from '@/lib/tauri-bridge'
import { HERMES_DASHBOARD_URL } from '@/lib/constants'
import {
  ExternalLink,
  Loader2,
  MessageSquarePlus,
  PanelLeft,
  Radio,
  Settings,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function HermesChatView() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const {
    phase,
    error,
    backgroundNote,
    messages,
    currentModel,
    currentProvider,
    thinking,
    sessions,
    sessionsLoading,
    sessionsError,
    switchingSession,
    storedSessionId,
    sendMessage,
    newChat,
    switchSession,
    switchModel,
    loadSessions,
    retry,
    reconnect,
    isBusy,
    canType,
  } = useHermesChat()

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, thinking])

  const isLoading = phase === 'booting' || phase === 'connecting'
  const isReady = phase === 'ready' || phase === 'busy'

  const composerPlaceholder =
    phase === 'error'
      ? 'Hermes offline — use Tentar novamente acima'
      : isLoading
        ? 'Conectando ao Hermes…'
        : 'Mensagem para o Hermes…'

  return (
    <PageFullBleed className="flex min-h-0 flex-row overflow-hidden">
      {sessionsOpen && (
        <button
          type="button"
          aria-label="Fechar sessões"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSessionsOpen(false)}
        />
      )}
      <HermesSessionSidebar
        sessions={sessions}
        activeSessionKey={storedSessionId}
        loading={sessionsLoading}
        error={sessionsError}
        disabled={!isReady || isBusy || switchingSession}
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0',
          sessionsOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        onSelect={(id) => {
          void switchSession(id)
          setSessionsOpen(false)
        }}
        onNewChat={() => {
          void newChat()
          setSessionsOpen(false)
        }}
        onRefresh={() => void loadSessions()}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-10 flex shrink-0 flex-col gap-2 border-b border-border/80 bg-bg-panel/90 px-3 py-2.5 backdrop-blur-md sm:px-5 sm:py-3">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 lg:hidden"
                onClick={() => setSessionsOpen(true)}
                aria-label="Sessões"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/30">
                <Radio className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold tracking-tight">Hermes</h1>
                <p className="truncate text-[11px] text-text-muted">Chat com agente</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <span
              className={cn(
                'hidden rounded-full border px-2.5 py-1 text-[10px] font-medium sm:inline-flex',
                isReady && 'border-success/30 bg-success/10 text-success',
                isLoading && 'border-primary/30 bg-primary/10 text-primary',
                phase === 'error' && 'border-danger/30 bg-danger/10 text-danger',
              )}
            >
              {phase === 'booting' && 'Iniciando…'}
              {phase === 'connecting' && 'Conectando…'}
              {phase === 'ready' && 'Online'}
              {phase === 'busy' && 'Respondendo…'}
              {phase === 'error' && 'Offline'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void newChat()}
              disabled={!isReady || switchingSession}
              title="Nova conversa"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void tauriBridge.openUrl(HERMES_DASHBOARD_URL)}>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate('/terminal', {
                  state: { command: 'hermes --cli', projectName: 'Hermes CLI' },
                })
              }
            >
              <Terminal className="h-3.5 w-3.5" />
            </Button>
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </Link>
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-start sm:justify-center">
            <HermesModelPicker
              currentModel={currentModel}
              currentProvider={currentProvider}
              disabled={!isReady || isBusy}
              onApplied={(provider, model) => void switchModel(provider, model)}
            />
          </div>
        </header>

        {backgroundNote && (
          <div className="shrink-0 flex items-center justify-between gap-3 border-b border-amber-500/25 bg-amber-500/10 px-5 py-2 text-xs text-amber-100">
            <span>{backgroundNote}</span>
            <button
              type="button"
              className="shrink-0 rounded border border-amber-400/40 px-2 py-0.5 hover:bg-amber-500/20"
              onClick={() => void reconnect()}
            >
              Sincronizar
            </button>
          </div>
        )}

        {error && (
          <div className="shrink-0 border-b border-danger/20 bg-danger/10 px-5 py-2 text-xs text-danger">
            {error}
            {phase === 'error' && (
              <button type="button" className="ml-2 underline" onClick={() => void retry()}>
                Tentar novamente
              </button>
            )}
          </div>
        )}

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="hermes-chat-bg pointer-events-none absolute inset-0" />

          {switchingSession && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-main/50 backdrop-blur-[2px]">
              <p className="text-sm text-text-secondary">Carregando sessão…</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-bg-panel/80">
                <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-text-secondary">
                {phase === 'booting' ? 'Iniciando Hermes…' : 'Conectando ao agente…'}
              </p>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto py-6">
              <div className="mx-auto flex max-w-3xl flex-col gap-1">
                {messages.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-text-muted">
                    Envie uma mensagem para começar.
                  </div>
                )}
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {thinking && !messages.some((m) => m.streaming) && (
                  <div className="flex gap-3 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-bg-soft ring-1 ring-border/80">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-border/70 bg-bg-panel/90 px-4 py-3">
                      <span className="hermes-dot" />
                      <span className="hermes-dot animation-delay-150" />
                      <span className="hermes-dot animation-delay-300" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <ChatComposer
          disabled={!canType}
          busy={isBusy}
          autoFocus={canType}
          placeholder={composerPlaceholder}
          onSend={(text) => void sendMessage(text)}
        />
      </div>
    </PageFullBleed>
  )
}
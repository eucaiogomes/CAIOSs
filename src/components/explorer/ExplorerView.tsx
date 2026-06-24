import { ExplorerTimeline } from '@/components/explorer/ExplorerTimeline'
import { HermesModelPicker } from '@/components/hermes/HermesModelPicker'
import { PageFullBleed } from '@/components/layout/PageFullBleed'
import { Button } from '@/components/ui/button'
import { useExplorerAgent } from '@/hooks/useExplorerAgent'
import { useExplorerCdp } from '@/hooks/useExplorerCdp'
import { HERMES_EXPLORER_PROFILE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ArrowRight, Compass, Loader2, RefreshCw, Send } from 'lucide-react'
import { useCallback, useState, type FormEvent } from 'react'

function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return 'about:blank'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function ExplorerView() {
  const {
    phase,
    error,
    state,
    agentReply,
    thinking,
    isBusy,
    canInteract,
    setUrl,
    sendCaptureToHermes,
    switchModel,
    syncState,
    retry,
    currentModel,
    currentProvider,
  } = useExplorerAgent()

  const {
    available: cdpAvailable,
    connected: cdpConnected,
    previewFrame,
    cdpError,
    navigating,
    navigate: cdpNavigate,
    captureSnapshot,
    retry: retryCdp,
  } = useExplorerCdp(syncState)

  const [urlInput, setUrlInput] = useState(
    state.currentUrl === 'about:blank' ? '' : state.currentUrl,
  )
  const [sending, setSending] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const isLoading = phase === 'booting' || phase === 'connecting'
  const isReady = phase === 'ready' || phase === 'busy'

  const handleNavigate = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault()
      const url = normalizeUrl(urlInput)
      if (url === 'about:blank') return
      setUrlInput(url)
      setUrl(url)
      setIframeKey((k) => k + 1)
      if (cdpAvailable) {
        await cdpNavigate(url)
      }
    },
    [cdpAvailable, cdpNavigate, setUrl, urlInput],
  )

  const handleSend = useCallback(async () => {
    setSending(true)
    try {
      const snapshot = cdpAvailable && cdpConnected
        ? await captureSnapshot()
        : undefined
      await sendCaptureToHermes(
        snapshot
          ? {
              url: snapshot.url,
              title: snapshot.title,
              cookies: snapshot.cookies,
              storage: snapshot.storage,
              network: snapshot.network,
            }
          : undefined,
      )
    } finally {
      setSending(false)
    }
  }, [captureSnapshot, cdpAvailable, cdpConnected, sendCaptureToHermes])

  return (
    <PageFullBleed className="flex min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/80 bg-bg-panel/90 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-primary/10 ring-1 ring-teal-400/25">
            <Compass className="h-4 w-4 text-teal-300" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">Explorer</h1>
            <p className="truncate text-[10px] text-text-muted">
              {cdpConnected ? 'CDP · captura profunda' : cdpAvailable ? 'CDP conectando…' : 'CDP offline'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <HermesModelPicker
            profile={HERMES_EXPLORER_PROFILE}
            currentModel={currentModel}
            currentProvider={currentProvider}
            disabled={!isReady || isBusy}
            sessionResetHint="Reinicia sessão Explorer com o novo modelo"
            onApplied={(provider, model) => void switchModel(provider, model)}
          />
          <span
            className={cn(
              'hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-flex',
              isReady && !thinking && 'border-success/30 bg-success/10 text-success',
              isLoading && 'border-primary/30 bg-primary/10 text-primary',
              thinking && 'border-warning/30 bg-warning/10 text-warning',
              phase === 'error' && 'border-danger/30 bg-danger/10 text-danger',
            )}
          >
            {phase === 'booting' && 'Iniciando…'}
            {phase === 'connecting' && 'Conectando…'}
            {phase === 'ready' && !thinking && 'Pronto'}
            {thinking && 'Hermes interpretando…'}
            {phase === 'error' && 'Offline'}
          </span>
          <Button variant="ghost" size="sm" onClick={() => { void retry(); void retryCdp() }} title="Reconectar">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {(error || cdpError || phase === 'error') && (
        <div className="shrink-0 border-b border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger sm:px-4">
          {error ?? cdpError ?? 'Explorer offline'}
        </div>
      )}

      <form
        onSubmit={(e) => void handleNavigate(e)}
        className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-bg-panel/60 px-3 py-2 sm:px-4"
      >
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Cole a URL do sistema"
          className="min-w-0 flex-1 rounded-lg border border-border/70 bg-bg-main px-3 py-1.5 text-sm outline-none focus:border-primary/40"
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!canInteract || navigating}>
          {navigating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </Button>
      </form>

      {isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-secondary">Conectando Explorer Agent…</p>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_min(340px,36vw)]">
          <div className="relative min-h-0 overflow-hidden border-b border-border/60 bg-black/90 lg:border-b-0 lg:border-r">
            {previewFrame ? (
              <img
                src={previewFrame}
                alt="Preview CDP"
                className="h-full w-full object-contain"
              />
            ) : !cdpAvailable && state.currentUrl && state.currentUrl !== 'about:blank' ? (
              <iframe
                key={iframeKey}
                src={state.currentUrl}
                title="Explorer preview"
                className="h-full w-full bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : state.currentUrl && state.currentUrl !== 'about:blank' ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-text-secondary">Aguardando preview CDP…</p>
                <p className="text-xs text-text-muted">
                  Interaja na janela Chrome/Edge aberta pelo Explorer.
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <Compass className="h-10 w-10 text-text-muted/40" />
                <p className="text-sm text-text-secondary">Cole uma URL para começar</p>
                <p className="max-w-sm text-xs text-text-muted">
                  O CDP captura rede, cookies, storage e navegação para mapeamento.
                </p>
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden">
            <ExplorerTimeline events={state.timeline} />
          </div>
        </div>
      )}

      <footer className="flex shrink-0 items-center gap-2 border-t border-border/60 bg-bg-panel/95 px-3 py-2.5 sm:px-4">
        <Button
          className="flex-1 sm:flex-none"
          onClick={() => void handleSend()}
          disabled={!canInteract || isBusy || sending || state.timeline.length === 0}
        >
          {sending || (isBusy && thinking) ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-3.5 w-3.5" />
          )}
          Enviar ao Hermes
        </Button>
        {agentReply && (
          <p className="hidden min-w-0 flex-1 truncate text-xs text-text-muted lg:block">
            Última resposta: {agentReply.slice(0, 120)}
            {agentReply.length > 120 ? '…' : ''}
          </p>
        )}
      </footer>
    </PageFullBleed>
  )
}
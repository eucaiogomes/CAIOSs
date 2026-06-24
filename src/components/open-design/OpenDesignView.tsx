import { PageFullBleed } from '@/components/layout/PageFullBleed'
import { Button } from '@/components/ui/button'
import { OPEN_DESIGN_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'
import * as tauriBridge from '@/lib/tauri-bridge'
import {
  ensureOpenDesign,
  getOpenDesignStatus,
  type OpenDesignPhase,
} from '@/services/open-design.service'
import {
  ExternalLink,
  Loader2,
  Palette,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function OpenDesignView() {
  const [phase, setPhase] = useState<OpenDesignPhase>('checking')
  const [error, setError] = useState<string | null>(null)
  const [iframeKey, setIframeKey] = useState(0)
  const [deployDir, setDeployDir] = useState<string | null>(null)

  const boot = useCallback(async () => {
    setError(null)
    try {
      const ok = await ensureOpenDesign(setPhase)
      const status = await getOpenDesignStatus()
      setDeployDir(status.deployDir ?? null)
      if (!ok) {
        setError('Open Design não respondeu a tempo. Verifique Docker Desktop e tente novamente.')
        setPhase('error')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar Open Design'
      setError(message)
      setPhase('error')
    }
  }, [])

  useEffect(() => {
    void boot()
  }, [boot])

  const isOnline = phase === 'online'
  const isLoading = phase === 'checking' || phase === 'starting' || phase === 'waiting'

  return (
    <PageFullBleed className="flex flex-col">
      <header className="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-bg-panel/90 px-3 py-2.5 backdrop-blur-md sm:gap-4 sm:px-5 sm:py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/10 ring-1 ring-violet-400/30">
            <Palette className="h-4 w-4 text-violet-300" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">Open Design</h1>
            <p className="truncate text-[11px] text-text-muted">
              Design agentic · modo API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'hidden rounded-full border px-2.5 py-1 text-[10px] font-medium sm:inline-flex',
              isOnline && 'border-success/30 bg-success/10 text-success',
              isLoading && 'border-primary/30 bg-primary/10 text-primary',
              phase === 'error' && 'border-danger/30 bg-danger/10 text-danger',
            )}
          >
            {phase === 'checking' && 'Verificando…'}
            {phase === 'starting' && 'Iniciando Docker…'}
            {phase === 'waiting' && 'Aguardando serviço…'}
            {phase === 'online' && 'Online'}
            {phase === 'error' && 'Offline'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIframeKey((k) => k + 1)}
            disabled={!isOnline}
            title="Recarregar workspace"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => tauriBridge.openUrl(OPEN_DESIGN_URL)}
            disabled={!isOnline}
          >
            <ExternalLink className="h-4 w-4" /> Abrir externo
          </Button>
          <Link
            to="/settings"
            className="inline-flex h-8 items-center rounded-md px-3 text-sm text-text-secondary transition-colors hover:bg-bg-soft hover:text-text-primary"
          >
            Settings
          </Link>
        </div>
      </header>

      {error && (
        <div className="mx-5 mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <p>{error}</p>
          {deployDir && (
            <p className="mt-2 text-xs text-text-muted">
              Deploy: <code className="text-text-secondary">{deployDir}</code>
            </p>
          )}
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => void boot()}>
            Tentar novamente
          </Button>
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden bg-bg-panel">
        {isLoading && !isOnline && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-bg-panel/95 backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
              <Loader2 className="h-7 w-7 animate-spin text-violet-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Preparando sessão Open Design</p>
              <p className="mt-1 max-w-md text-xs text-text-muted">
                {phase === 'checking' && 'Verificando se o container já está rodando…'}
                {phase === 'starting' && 'Subindo container Docker na porta 7456…'}
                {phase === 'waiting' && 'Primeira inicialização pode levar até 2 minutos.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
              Design systems + skills curadas
            </div>
          </div>
        )}

        {isOnline && (
          <iframe
            key={iframeKey}
            src={OPEN_DESIGN_URL}
            title="Open Design"
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
          />
        )}
      </div>

      {!isOnline && phase === 'error' && (
        <div className="border-t border-border px-5 py-3 text-[11px] text-text-muted">
          Requer Docker Desktop. URL: {OPEN_DESIGN_URL}
        </div>
      )}
    </PageFullBleed>
  )
}
import { Button } from '@/components/ui/button'
import type { HermesSessionInfo } from '@/lib/hermes-api'
import { formatSessionLabel, formatSessionTime } from '@/lib/hermes-api'
import { cn } from '@/lib/utils'
import { Loader2, MessageSquarePlus, RefreshCw } from 'lucide-react'

interface HermesSessionSidebarProps {
  sessions: HermesSessionInfo[]
  activeSessionKey: string | null
  loading: boolean
  error?: string | null
  disabled: boolean
  className?: string
  onSelect: (sessionId: string) => void
  onNewChat: () => void
  onRefresh: () => void
}

export function HermesSessionSidebar({
  sessions,
  activeSessionKey,
  loading,
  error,
  disabled,
  className,
  onSelect,
  onNewChat,
  onRefresh,
}: HermesSessionSidebarProps) {
  const isNewSessionActive =
    activeSessionKey !== null && !sessions.some((s) => s.id === activeSessionKey)

  return (
    <aside
      className={cn(
        'flex h-full w-[min(280px,88vw)] shrink-0 flex-col border-r border-border/80 bg-bg-panel/95 lg:w-[260px]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Sessões
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Atualizar sessões"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </Button>
      </div>

      <div className="px-3 py-2">
        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-center gap-2"
          onClick={onNewChat}
          disabled={disabled}
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Nova sessão
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {error && (
          <div className="mb-2 rounded-lg border border-danger/30 bg-danger/10 px-2.5 py-2 text-[11px] text-danger">
            {error}
          </div>
        )}
        {loading && sessions.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando…
          </div>
        ) : sessions.length === 0 && !isNewSessionActive ? (
          <p className="px-2 py-6 text-center text-xs text-text-muted">
            Nenhuma sessão anterior.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {isNewSessionActive && (
              <li>
                <button
                  type="button"
                  aria-current="true"
                  className={cn(
                    'w-full rounded-lg border-l-2 border-primary bg-primary/10 px-2.5 py-2 text-left transition-colors',
                  )}
                >
                  <p className="truncate text-sm font-medium text-text-primary">Nova conversa</p>
                  <p className="mt-0.5 text-[10px] text-text-muted">agora</p>
                </button>
              </li>
            )}
            {sessions.map((session) => {
              const isActive = session.id === activeSessionKey
              return (
                <li key={session.id}>
                  <button
                    type="button"
                    aria-current={isActive ? 'true' : undefined}
                    disabled={disabled}
                    onClick={() => onSelect(session.id)}
                    className={cn(
                      'w-full rounded-lg px-2.5 py-2 text-left transition-colors',
                      isActive
                        ? 'border-l-2 border-primary bg-primary/10'
                        : 'border-l-2 border-transparent hover:bg-bg-soft/80',
                      disabled && !isActive && 'opacity-50',
                    )}
                  >
                    <p
                      className={cn(
                        'truncate text-sm',
                        isActive ? 'font-medium text-text-primary' : 'text-text-secondary',
                      )}
                    >
                      {formatSessionLabel(session)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-text-muted">
                      <span>{formatSessionTime(session.last_active)}</span>
                      {session.message_count > 0 && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{session.message_count} msgs</span>
                        </>
                      )}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
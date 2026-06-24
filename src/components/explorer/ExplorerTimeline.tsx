import { explorerService } from '@/services/explorer.service'
import type { ExplorerTimelineEvent } from '@/types/explorer'
import { cn } from '@/lib/utils'

const KIND_LABELS: Record<ExplorerTimelineEvent['kind'], string> = {
  navigation: 'nav',
  interaction: 'ação',
  network: 'rede',
  entity: 'entidade',
  flow: 'fluxo',
  evidence: 'evidência',
  inference: 'inferência',
  insight: 'insight',
  system: 'sistema',
}

interface ExplorerTimelineProps {
  events: ExplorerTimelineEvent[]
}

export function ExplorerTimeline({ events }: ExplorerTimelineProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/60 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Sessão Atual
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {events.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-text-muted">
            Navegue para começar a linha do tempo.
          </p>
        ) : (
          <ul className="space-y-1">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-transparent px-2.5 py-2 hover:border-border/50 hover:bg-bg-soft/40"
              >
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 font-mono text-[10px] text-primary">
                    {explorerService.formatEventTime(event.at)}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded px-1 py-0.5 text-[9px] uppercase tracking-wide',
                      event.kind === 'navigation' && 'bg-blue/10 text-blue',
                      event.kind === 'flow' && 'bg-primary/10 text-primary',
                      event.kind === 'entity' && 'bg-success/10 text-success',
                      event.kind === 'inference' && 'bg-warning/10 text-warning',
                      !['navigation', 'flow', 'entity', 'inference'].includes(event.kind) &&
                        'bg-bg-soft text-text-muted',
                    )}
                  >
                    {KIND_LABELS[event.kind]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-primary">{event.label}</p>
                {event.detail && (
                  <p
                    className={cn(
                      'mt-0.5 text-[11px] text-text-muted',
                      event.kind === 'network' ? 'break-all whitespace-pre-wrap' : 'truncate',
                    )}
                  >
                    {event.detail}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
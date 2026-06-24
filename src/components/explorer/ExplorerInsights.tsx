import type { ExplorerInsight } from '@/types/explorer'
import { cn } from '@/lib/utils'
import { Brain, GitBranch, HelpCircle, Layers } from 'lucide-react'

const CATEGORY_META: Record<
  ExplorerInsight['category'],
  { icon: typeof Brain; className: string }
> = {
  flow: { icon: GitBranch, className: 'text-primary' },
  entity: { icon: Layers, className: 'text-success' },
  hypothesis: { icon: HelpCircle, className: 'text-warning' },
  summary: { icon: Brain, className: 'text-text-secondary' },
}

interface ExplorerInsightsProps {
  insights: ExplorerInsight[]
  agentReply?: string
  thinking?: boolean
}

export function ExplorerInsights({ insights, agentReply, thinking }: ExplorerInsightsProps) {
  return (
    <div className="flex h-full flex-col border-t border-border/60 bg-bg-panel/80">
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2">
        <Brain className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Hermes Insights
        </p>
        {thinking && (
          <span className="ml-auto text-[10px] text-primary animate-pulse">interpretando…</span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {insights.length === 0 && !agentReply ? (
          <p className="text-xs text-text-muted">
            O agente interpreta navegação e eventos em tempo real — fluxos, entidades e hipóteses
            aparecem aqui.
          </p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => {
              const meta = CATEGORY_META[insight.category]
              const Icon = meta.icon
              return (
                <div key={insight.id} className="rounded-lg border border-border/50 bg-bg-soft/30 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-3.5 w-3.5', meta.className)} />
                    <p className="text-xs font-medium text-text-primary">{insight.title}</p>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{insight.body}</p>
                </div>
              )
            })}
            {agentReply && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-primary">
                  Última interpretação
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {agentReply}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
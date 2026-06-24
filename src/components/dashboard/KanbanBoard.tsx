import { Badge } from '@/components/ui/badge'
import {
  agentIconForAssignee,
  KANBAN_ACTIVE_COLUMNS,
  KANBAN_COLUMN_LABELS,
  type KanbanBoardResponse,
  type KanbanTask,
} from '@/lib/hermes-api'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface KanbanBoardProps {
  board: KanbanBoardResponse | null
  loading: boolean
  online: boolean
  error: string | null
}

const COLUMN_ACCENT: Record<string, string> = {
  triage: 'border-warning/40',
  todo: 'border-border',
  ready: 'border-blue/40',
  running: 'border-primary/50',
  blocked: 'border-danger/40',
  done: 'border-success/40',
}

function KanbanTaskCard({ task }: { task: KanbanTask }) {
  const summary = task.latest_summary ?? task.result
  return (
    <div className="rounded-lg border border-border/70 bg-bg-soft/80 p-2.5 transition-colors hover:border-border">
      <p className="line-clamp-2 text-xs font-medium leading-snug text-text-primary">
        {task.title}
      </p>
      {summary && (
        <p className="mt-1 line-clamp-2 text-[10px] text-text-muted">{summary}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {task.assignee && (
          <span className="inline-flex items-center gap-1 rounded-md bg-bg-panel px-1.5 py-0.5 text-[10px] text-text-secondary">
            <span>{agentIconForAssignee(task.assignee)}</span>
            <span className="max-w-[72px] truncate">{task.assignee}</span>
          </span>
        )}
        {task.tenant && (
          <Badge variant="muted" className="text-[9px]">
            {task.tenant}
          </Badge>
        )}
        {task.priority >= 4 && (
          <Badge variant="warning" className="text-[9px]">
            alta
          </Badge>
        )}
      </div>
    </div>
  )
}

export function KanbanBoard({ board, loading, online, error }: KanbanBoardProps) {
  if (loading && !board) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando kanban…
      </div>
    )
  }

  if (!online || error) {
    return (
      <div className="rounded-xl border border-border/60 bg-bg-panel/50 px-4 py-8 text-center">
        <p className="text-sm text-text-secondary">
          {error ?? 'Hermes offline'}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Abra o Hermes ou use Mission Control para iniciar o dashboard.
        </p>
      </div>
    )
  }

  const columnMap = new Map(board?.columns.map((c) => [c.name, c.tasks]) ?? [])

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-3">
        {KANBAN_ACTIVE_COLUMNS.map((colName) => {
          const tasks = columnMap.get(colName) ?? []
          const label = KANBAN_COLUMN_LABELS[colName] ?? colName
          return (
            <div
              key={colName}
              className={cn(
                'flex w-[min(200px,72vw)] shrink-0 flex-col rounded-xl border bg-bg-panel/40 sm:w-[200px]',
                COLUMN_ACCENT[colName] ?? 'border-border/60',
              )}
            >
              <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  {label}
                </span>
                <span className="rounded-full bg-bg-soft px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                  {tasks.length}
                </span>
              </div>
              <div className="flex max-h-[320px] min-h-[80px] flex-col gap-2 overflow-y-auto p-2">
                {tasks.length === 0 ? (
                  <p className="py-4 text-center text-[10px] text-text-muted">—</p>
                ) : (
                  tasks.map((task) => <KanbanTaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
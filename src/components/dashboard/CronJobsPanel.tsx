import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatCronSchedule,
  formatCronTime,
  pauseHermesCronJob,
  resumeHermesCronJob,
  triggerHermesCronJob,
  type HermesCronJob,
} from '@/lib/hermes-api'
import { cn } from '@/lib/utils'
import { Clock, Loader2, Pause, Play, Zap } from 'lucide-react'
import { useState } from 'react'

interface CronJobsPanelProps {
  jobs: HermesCronJob[]
  loading: boolean
  online: boolean
  error: string | null
  onRefresh: () => void
}

function jobTitle(job: HermesCronJob): string {
  const name = job.name?.trim()
  if (name) return name
  const prompt = job.prompt?.trim()
  if (prompt) return prompt.length > 60 ? `${prompt.slice(0, 57)}…` : prompt
  return 'Job sem título'
}

function JobRow({
  job,
  onRefresh,
}: {
  job: HermesCronJob
  onRefresh: () => void
}) {
  const [busy, setBusy] = useState(false)
  const paused = job.state === 'paused' || !job.enabled
  const profile = job.profile ?? 'default'

  const runAction = async (action: 'pause' | 'resume' | 'trigger') => {
    setBusy(true)
    try {
      if (action === 'pause') await pauseHermesCronJob(job.id, profile)
      else if (action === 'resume') await resumeHermesCronJob(job.id, profile)
      else await triggerHermesCronJob(job.id, profile)
      onRefresh()
    } catch {
      /* best-effort */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-lg border border-border/70 bg-bg-soft/50 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">{jobTitle(job)}</p>
          <p className="mt-0.5 text-[11px] text-text-muted">
            {formatCronSchedule(job)}
            {job.profile_name && (
              <span className="ml-1.5 text-text-muted">· {job.profile_name}</span>
            )}
          </p>
        </div>
        <Badge variant={paused ? 'muted' : 'success'} className="shrink-0 text-[9px]">
          {paused ? 'pausado' : 'ativo'}
        </Badge>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-text-muted">
        <span>
          Última: <span className="text-text-secondary">{formatCronTime(job.last_run_at)}</span>
        </span>
        <span>
          Próxima: <span className="text-text-secondary">{formatCronTime(job.next_run_at)}</span>
        </span>
      </div>

      {job.last_error && (
        <p className="mt-1.5 line-clamp-2 text-[10px] text-danger">{job.last_error}</p>
      )}

      <div className="mt-2 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void runAction(paused ? 'resume' : 'pause')}
          title={paused ? 'Retomar' : 'Pausar'}
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : paused ? (
            <Play className="h-3 w-3" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void runAction('trigger')}
          title="Executar agora"
        >
          <Zap className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function CronJobsPanel({ jobs, loading, online, error, onRefresh }: CronJobsPanelProps) {
  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando cron jobs…
      </div>
    )
  }

  if (!online || error) {
    return (
      <div className="rounded-xl border border-border/60 bg-bg-panel/50 px-4 py-6 text-center">
        <p className="text-sm text-text-secondary">{error ?? 'Hermes offline'}</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-bg-panel/30 px-4 py-8 text-center">
        <Clock className="mx-auto mb-2 h-5 w-5 text-text-muted" />
        <p className="text-sm text-text-secondary">Nenhum cron job configurado</p>
        <p className="mt-1 text-xs text-text-muted">
          Use <code className="text-primary">hermes cron</code> ou o dashboard Hermes para criar automações.
        </p>
      </div>
    )
  }

  const active = jobs.filter((j) => j.enabled && j.state !== 'paused').length

  return (
    <div className="space-y-3">
      <p className={cn('text-[11px] text-text-muted')}>
        {active} ativo{active !== 1 ? 's' : ''} · {jobs.length} total
      </p>
      <div className="space-y-2">
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} onRefresh={onRefresh} />
        ))}
      </div>
    </div>
  )
}
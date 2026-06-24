import { useProjectContext } from '@/contexts/ProjectContext'
import { PROJECT_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { projectsService } from '@/services/projects.service'
import { ChevronDown, FolderKanban, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function ProjectSelector() {
  const navigate = useNavigate()
  const { currentProject, setCurrentProject } = useProjectContext()
  const [open, setOpen] = useState(false)
  const projects = useMemo(() => projectsService.list(), [open])

  const status = currentProject
    ? PROJECT_STATUSES.find((s) => s.value === currentProject.status)
    : null

  return (
    <div className="relative max-w-full min-w-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex max-w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors',
          currentProject
            ? 'border-primary/30 bg-primary/5 text-text-primary hover:border-primary/50'
            : 'border-border bg-bg-panel text-text-secondary hover:border-border/80'
        )}
      >
        <FolderKanban className="h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 text-left">
          <p className="truncate font-medium leading-tight">
            {currentProject?.name ?? 'Selecionar projeto'}
          </p>
          {currentProject?.localPath && (
            <p className="truncate text-[10px] text-text-muted">{currentProject.localPath}</p>
          )}
        </div>
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-bg-panel py-1 shadow-xl shadow-black/30">
            {currentProject && (
              <button
                onClick={() => { setCurrentProject(null); setOpen(false) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-text-muted hover:bg-bg-soft hover:text-danger"
              >
                <X className="h-3.5 w-3.5" /> Limpar projeto ativo
              </button>
            )}
            <div className="max-h-64 overflow-y-auto">
              {projects.map((project) => {
                const st = PROJECT_STATUSES.find((s) => s.value === project.status)
                const active = currentProject?.id === project.id
                return (
                  <button
                    key={project.id}
                    onClick={() => {
                      setCurrentProject(project.id)
                      setOpen(false)
                      navigate(`/projects/${project.id}`)
                    }}
                    className={cn(
                      'flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-bg-soft',
                      active && 'bg-primary/5'
                    )}
                  >
                    <span className="text-sm font-medium text-text-primary">{project.name}</span>
                    <span className={cn('text-[10px]', st?.color)}>{st?.label}</span>
                  </button>
                )
              })}
            </div>
            <div className="border-t border-border p-1">
              <button
                onClick={() => { setOpen(false); navigate('/projects') }}
                className="w-full rounded-lg px-3 py-2 text-xs text-primary hover:bg-bg-soft"
              >
                + Novo projeto
              </button>
            </div>
          </div>
        </>
      )}

      {currentProject && status && (
        <span className={cn('ml-2 hidden text-[10px] font-medium lg:inline', status.color)}>
          {status.label}
        </span>
      )}
    </div>
  )
}
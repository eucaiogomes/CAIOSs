import { CronJobsPanel } from '@/components/dashboard/CronJobsPanel'
import { KanbanBoard } from '@/components/dashboard/KanbanBoard'
import { ProjectCard } from '@/components/project-card/ProjectCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TAGLINE } from '@/lib/constants'
import { formatRelative } from '@/lib/utils'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useMissionControlFeed } from '@/hooks/useMissionControlFeed'
import { experimentsService } from '@/services/experiments.service'
import { projectsService } from '@/services/projects.service'
import { promptsService } from '@/services/prompts.service'
import { toolLauncher } from '@/services/tool-launcher.service'
import { toolsService } from '@/services/tools.service'
import {
  Clock,
  FlaskConical,
  FolderPlus,
  LayoutDashboard,
  ListTodo,
  Plus,
  RefreshCw,
  Wrench,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function Dashboard() {
  const navigate = useNavigate()
  const { setCurrentProject } = useProjectContext()
  const {
    board,
    cronJobs,
    loading: feedLoading,
    online,
    error: feedError,
    activeTaskCount,
    runningCount,
    refresh: refreshFeed,
  } = useMissionControlFeed()
  const favorites = useMemo(() => toolsService.getFavorites(), [])
  const recentProjects = useMemo(() => projectsService.getRecent(3), [])
  const recentTests = useMemo(() => experimentsService.getRecent(3), [])
  const recentPrompts = useMemo(() => promptsService.getRecent(3), [])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting}, <span className="text-primary">Caio</span>.
        </h1>
        <p className="mt-2 text-text-secondary">{TAGLINE}</p>
        <p className="mt-1 text-sm text-text-muted">Your AI workspace is ready.</p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-text-secondary">Kanban — agentes em tempo real</h2>
            {online && (
              <Badge variant={runningCount > 0 ? 'primary' : 'muted'} className="text-[10px]">
                {runningCount > 0 ? `${runningCount} em andamento` : `${activeTaskCount} tarefas`}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => void refreshFeed()}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/hermes')}>
              <LayoutDashboard className="h-3.5 w-3.5" />
              Hermes
            </Button>
            <Link to="/mission-control" className="text-xs text-primary hover:underline">
              Mission Control
            </Link>
          </div>
        </div>
        <Card className="p-4">
          <KanbanBoard
            board={board}
            loading={feedLoading}
            online={online}
            error={feedError}
          />
        </Card>
        <p className="text-[11px] text-text-muted">
          Tarefas criadas pelo Hermes e outros agentes aparecem aqui automaticamente. Atualiza a cada 5s.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-text-secondary">Cron jobs</h2>
            {online && cronJobs.length > 0 && (
              <Badge variant="muted" className="text-[10px]">
                {cronJobs.length} job{cronJobs.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => void refreshFeed()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Card className="p-4">
          <CronJobsPanel
            jobs={cronJobs}
            loading={feedLoading}
            online={online}
            error={feedError}
            onRefresh={() => void refreshFeed()}
          />
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-secondary">Ferramentas favoritas</h2>
          <Link to="/tools" className="text-xs text-primary hover:underline">Ver todas</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {favorites.map((tool) => (
            <Button
              key={tool.id}
              variant="secondary"
              onClick={() => {
                toolLauncher
                  .launch(tool, { navigate })
                  .catch((err) => console.error('[CaiOS]', err))
              }}
            >
              <span>{tool.icon}</span>
              {tool.name}
            </Button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary">Projetos recentes</h2>
            <Link to="/projects" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="grid gap-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setCurrentProject(project.id)
                  navigate(`/projects/${project.id}`)
                }}
              >
                <ProjectCard
                  project={project}
                  toolCount={projectsService.getLinkedToolIds(project.id).length}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary">Últimos testes</h2>
            <Link to="/lab" className="text-xs text-primary hover:underline">Ver Lab</Link>
          </div>
          <div className="space-y-3">
            {recentTests.map((test) => (
              <Card key={test.id}>
                <CardHeader className="mb-0">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-warning" />
                    <CardTitle>{test.title}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-1">{test.result}</CardDescription>
                </CardHeader>
                <p className="text-[11px] text-text-muted">
                  Nota: {test.rating}/10 · {formatRelative(test.createdAt)}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-secondary">Últimos prompts</h2>
          <Link to="/prompts" className="text-xs text-primary hover:underline">Ver biblioteca</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {recentPrompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardTitle>{prompt.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">{prompt.content}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/projects')}>
          <FolderPlus className="h-4 w-4" />
          Criar novo projeto
        </Button>
        <Button variant="secondary" onClick={() => navigate('/tools')}>
          <Plus className="h-4 w-4" />
          Adicionar ferramenta
        </Button>
        <Button variant="ghost" onClick={() => navigate('/lab')}>
          <Wrench className="h-4 w-4" />
          Registrar teste
        </Button>
      </section>
    </div>
  )
}
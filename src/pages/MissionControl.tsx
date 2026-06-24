import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import {
  CLAUDE_CODE_TOOL_ID,
  CODEX_TOOL_ID,
  GROK_TOOL_ID,
  HERMES_TOOL_ID,
  OBSIDIAN_TOOL_ID,
} from '@/lib/constants'
import { useProjectContext } from '@/contexts/ProjectContext'
import { cliConfigService } from '@/services/cli-config.service'
import { HERMES_ARCHITECTURE_LAYERS, hermesService } from '@/services/hermes.service'
import { toolLauncher } from '@/services/tool-launcher.service'
import { toolsService } from '@/services/tools.service'
import { workspaceService } from '@/services/workspace.service'
import {
  Brain,
  CheckCircle,
  ExternalLink,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Play,
  Radar,
  XCircle,
} from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

interface AgentCard {
  id: string
  name: string
  icon: string
  role: string
  verified: boolean
  version?: string
}

export function MissionControl() {
  const navigate = useNavigate()
  const { currentProject } = useProjectContext()
  const cli = useMemo(() => cliConfigService.get(), [])
  const cwd = workspaceService.getEffectiveCwd(currentProject?.localPath)

  const agents: AgentCard[] = useMemo(
    () => [
      {
        id: HERMES_TOOL_ID,
        name: 'Hermes',
        icon: '📡',
        role: 'Orquestrador',
        verified: cli.hermes.verified,
        version: cli.hermes.version,
      },
      {
        id: CLAUDE_CODE_TOOL_ID,
        name: 'Claude Code',
        icon: '🤖',
        role: 'Codificador',
        verified: cli.claudeCode.verified,
        version: cli.claudeCode.version,
      },
      {
        id: CODEX_TOOL_ID,
        name: 'Codex',
        icon: '⚡',
        role: 'Codificador',
        verified: cli.codex.verified,
        version: cli.codex.version,
      },
      {
        id: GROK_TOOL_ID,
        name: 'Grok',
        icon: '🧠',
        role: 'Assistente',
        verified: cli.grok.verified,
        version: cli.grok.version,
      },
    ],
    [cli],
  )

  const launchOptions = {
    navigate,
    cwd,
    projectName: currentProject?.name ?? 'Workspace',
    projectId: currentProject?.id,
  }

  const openAgent = (toolId: string) => {
    if (toolId === HERMES_TOOL_ID) {
      navigate('/hermes')
      return
    }
    const tool = toolsService.getById(toolId)
    if (!tool) return
    toolLauncher.launch(tool, launchOptions).catch(console.error)
  }

  const openTerminalCommand = (command: string, label: string) => {
    navigate('/terminal', {
      state: {
        command,
        cwd,
        projectName: currentProject?.name ?? label,
        projectId: currentProject?.id,
      },
    })
  }

  const openDashboard = () => navigate('/hermes')

  const openObsidian = () => {
    const tool = toolsService.getById(OBSIDIAN_TOOL_ID)
    if (!tool) return
    toolLauncher.launch(tool, launchOptions).catch(console.error)
  }

  const verifiedCount = agents.filter((a) => a.verified).length

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mission Control"
        description="Centro de comando do seu OS de agentes — orquestra Hermes, memória, kanban e produção."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Radar className="h-4 w-4 text-primary" />
              Agentes ativos
            </CardTitle>
            <CardDescription>
              {verifiedCount}/{agents.length} CLIs detectados e verificados
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" />
              Kernel
            </CardTitle>
            <CardDescription>
              Hermes gerencia kanban, memória, skills e gateway
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo className="h-4 w-4 text-primary" />
              Loop de feedback
            </CardTitle>
            <CardDescription>
              Resultados voltam para Obsidian e caios-data
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-text-secondary">Hermes — Ações rápidas</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openDashboard}>
            <LayoutDashboard className="h-4 w-4" />
            Abrir Hermes
          </Button>
          <Button
            variant="secondary"
            onClick={() => openTerminalCommand(hermesService.getKanbanWatchCommand(), 'Hermes Kanban')}
          >
            <ListTodo className="h-4 w-4" />
            Kanban watch
          </Button>
          <Button
            variant="ghost"
            onClick={() => openTerminalCommand(hermesService.getChatCommand(), 'Hermes CLI')}
          >
            <MessageSquare className="h-4 w-4" />
            Terminal avançado
          </Button>
          <Button
            variant="ghost"
            onClick={() => openTerminalCommand(hermesService.getStatusCommand(), 'Hermes Status')}
          >
            <Radar className="h-4 w-4" />
            Status
          </Button>
          <Button variant="ghost" onClick={openObsidian}>
            <ExternalLink className="h-4 w-4" />
            Memória (Obsidian)
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-text-muted">
          O Hermes abre em interface web integrada — o CaiOS inicia o dashboard automaticamente.
          Home: {hermesService.getHomePath()}
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-text-secondary">Agentes (Camada Superior)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="flex flex-col">
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span>{agent.icon}</span>
                      {agent.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{agent.role}</CardDescription>
                  </div>
                  {agent.verified ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-text-muted" />
                  )}
                </div>
                {agent.version && (
                  <Badge variant="muted" className="mt-2 w-fit text-[10px]">
                    {agent.version.slice(0, 40)}
                  </Badge>
                )}
              </CardHeader>
              <div className="px-4 pb-4">
                <Button
                  size="sm"
                  variant={agent.verified ? 'secondary' : 'ghost'}
                  className="w-full"
                  disabled={!agent.verified}
                  onClick={() => openAgent(agent.id)}
                >
                  <Play className="h-3 w-3" />
                  {agent.id === HERMES_TOOL_ID ? 'Abrir interface' : 'Abrir no terminal'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
        {verifiedCount < agents.length && (
          <p className="mt-3 text-xs text-text-muted">
            Agentes não detectados? Configure em{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => navigate('/settings')}
            >
              Settings
            </button>
            .
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-text-secondary">
          Arquitetura — 7 camadas
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {HERMES_ARCHITECTURE_LAYERS.map((layer) => (
            <Card key={layer.id} className="border-border/80">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                    {layer.id}
                  </span>
                  <div>
                    <CardTitle className="text-sm">{layer.name}</CardTitle>
                    <CardDescription className="text-[10px]">{layer.role}</CardDescription>
                  </div>
                </div>
                <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                  {layer.description}
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  <span className="text-primary">CaiOS:</span> {layer.caiosMapping}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
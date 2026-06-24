import { TerminalView } from '@/components/terminal/TerminalView'
import { TerminalWorkspaceBar } from '@/components/terminal/TerminalWorkspaceBar'
import { PageHeader } from '@/components/ui/page-header'
import { useProjectContext } from '@/contexts/ProjectContext'
import { CLAUDE_CODE_TOOL_ID, CODEX_TOOL_ID, GROK_TOOL_ID } from '@/lib/constants'
import { workspaceService } from '@/services/workspace.service'
import { toolsService } from '@/services/tools.service'
import type { Tool } from '@/types/tool'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface TerminalLocationState {
  tool?: Tool
  command?: string
  cwd?: string
  projectName?: string
  projectId?: string
}

export function TerminalPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentProject } = useProjectContext()
  const state = (location.state as TerminalLocationState) ?? {}
  const [workspaceOverride, setWorkspaceOverride] = useState<string | null>(null)

  const hasProject = !!(state.projectId ?? currentProject?.id)
  const projectName = state.projectName ?? currentProject?.name

  const cwd = useMemo(() => {
    if (state.cwd) return state.cwd
    if (currentProject?.localPath) return currentProject.localPath
    return workspaceOverride ?? workspaceService.getPath()
  }, [state.cwd, currentProject?.localPath, workspaceOverride])

  const claudeTool = toolsService.getById(CLAUDE_CODE_TOOL_ID)
  const codexTool = toolsService.getById(CODEX_TOOL_ID)
  const grokTool = toolsService.getById(GROK_TOOL_ID)
  const openCli = (tool: ReturnType<typeof toolsService.getById>) => {
    navigate('/terminal', {
      state: {
        tool: tool ?? undefined,
        cwd,
        projectName: projectName ?? 'Workspace',
      },
      replace: true,
    })
  }

  const openClaude = () => openCli(claudeTool)
  const openCodex = () => openCli(codexTool)
  const openGrok = () => openCli(grokTool)
  const activeTool = state.tool
  const activeCommand = state.command

  return (
    <div className="flex min-h-[min(70vh,600px)] flex-col">
      <PageHeader
        title="Terminal"
        description={
          hasProject && projectName
            ? `Projeto: ${projectName} — ${cwd}`
            : `Workspace livre — ${cwd}`
        }
      />

      {!hasProject && (
        <TerminalWorkspaceBar
          cwd={cwd}
          onWorkspaceChange={setWorkspaceOverride}
          onOpenClaude={openClaude}
          onOpenCodex={openCodex}
          onOpenGrok={openGrok}
        />
      )}

      <div className="flex-1 min-h-0">
        <TerminalView
          tool={activeTool}
          command={activeCommand}
          cwd={cwd}
          projectName={projectName ?? (hasProject ? undefined : 'Workspace')}
          projectId={state.projectId ?? currentProject?.id}
        />
      </div>
    </div>
  )
}
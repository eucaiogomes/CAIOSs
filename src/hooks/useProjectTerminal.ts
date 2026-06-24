import { useProjectContext } from '@/contexts/ProjectContext'
import { logsService } from '@/services/logs.service'
import { workspaceService } from '@/services/workspace.service'
import type { Tool } from '@/types/tool'
import { useNavigate } from 'react-router-dom'

export function useProjectTerminal() {
  const navigate = useNavigate()
  const { currentProject } = useProjectContext()

  const openTerminal = (options?: {
    command?: string
    tool?: Tool
    projectId?: string
    projectName?: string
    cwd?: string
  }) => {
    const cwd = workspaceService.getEffectiveCwd(options?.cwd ?? currentProject?.localPath)
    const projectName = options?.projectName ?? currentProject?.name ?? 'Workspace'
    const projectId = options?.projectId ?? currentProject?.id

    if (projectId) {
      logsService.add({
        type: 'project',
        message: `Terminal aberto${options?.command ? `: ${options.command}` : ''}`,
        projectId,
      })
    }

    navigate('/terminal', {
      state: {
        tool: options?.tool,
        command: options?.command,
        cwd,
        projectName,
        projectId,
      },
    })
  }

  return { openTerminal, currentProject }
}
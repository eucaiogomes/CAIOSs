import { Button } from '@/components/ui/button'
import { QUICK_COMMANDS } from '@/lib/constants'
import * as tauriBridge from '@/lib/tauri-bridge'
import { useProjectTerminal } from '@/hooks/useProjectTerminal'
import type { Project } from '@/types/project'
import { FlaskConical, FolderOpen, Terminal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ProjectQuickActionsProps {
  project: Project
}

export function ProjectQuickActions({ project }: ProjectQuickActionsProps) {
  const navigate = useNavigate()
  const { openTerminal } = useProjectTerminal()

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => openTerminal({ cwd: project.localPath, projectName: project.name, projectId: project.id })}>
        <Terminal className="h-4 w-4" /> Terminal na pasta
      </Button>
      {project.localPath && (
        <Button
          variant="secondary"
          onClick={() => tauriBridge.openPath(project.localPath!)}
        >
          <FolderOpen className="h-4 w-4" /> Abrir pasta
        </Button>
      )}
      {QUICK_COMMANDS.map((cmd) => (
        <Button
          key={cmd.command}
          variant="ghost"
          size="sm"
          onClick={() =>
            openTerminal({
              command: cmd.command,
              cwd: project.localPath,
              projectName: project.name,
              projectId: project.id,
            })
          }
        >
          {cmd.label}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/lab', { state: { projectId: project.id } })}
      >
        <FlaskConical className="h-4 w-4" /> Novo teste
      </Button>
    </div>
  )
}
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { useProjectContext } from '@/contexts/ProjectContext'
import * as tauriBridge from '@/lib/tauri-bridge'
import { projectsService } from '@/services/projects.service'
import { workspaceService } from '@/services/workspace.service'
import { CLAUDE_CODE_TOOL_ID, CODEX_TOOL_ID, GROK_TOOL_ID } from '@/lib/constants'
import { FolderOpen, FolderPlus, Play, Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface TerminalWorkspaceBarProps {
  cwd?: string
  onWorkspaceChange: (path: string) => void
  onOpenClaude: () => void
  onOpenCodex: () => void
  onOpenGrok: () => void
}

export function TerminalWorkspaceBar({ cwd, onWorkspaceChange, onOpenClaude, onOpenCodex, onOpenGrok }: TerminalWorkspaceBarProps) {
  const navigate = useNavigate()
  const { setCurrentProject, refresh } = useProjectContext()
  const [workspacePath, setWorkspacePath] = useState(cwd ?? workspaceService.getPath())
  const [showCreate, setShowCreate] = useState(false)
  const [projectName, setProjectName] = useState('')

  const handleSaveWorkspace = () => {
    workspaceService.setPath(workspacePath.trim())
    onWorkspaceChange(workspacePath.trim())
  }

  const handlePickFolder = async () => {
    const picked = await tauriBridge.pickFolder()
    if (picked) {
      setWorkspacePath(picked)
      workspaceService.setPath(picked)
      onWorkspaceChange(picked)
    }
  }

  const handleCreateProject = () => {
    if (!projectName.trim()) return
    const project = projectsService.create({
      name: projectName.trim(),
      description: 'Criado a partir do terminal',
      status: 'idea',
      localPath: workspacePath.trim(),
      links: [],
    })
    projectsService.linkTool(project.id, CLAUDE_CODE_TOOL_ID)
    projectsService.linkTool(project.id, CODEX_TOOL_ID)
    projectsService.linkTool(project.id, GROK_TOOL_ID)

    setCurrentProject(project.id)
    refresh()
    setShowCreate(false)
    setProjectName('')
    navigate(`/projects/${project.id}`)
  }

  return (
    <div className="mb-4 rounded-xl border border-border bg-bg-panel p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <Label className="text-[10px] uppercase tracking-wider text-text-muted">
            Pasta de trabalho (sem projeto selecionado)
          </Label>
          <Input
            value={workspacePath}
            onChange={(e) => setWorkspacePath(e.target.value)}
            className="mt-1 font-mono text-xs"
            placeholder="C:/Users/Caio/Projects/meu-projeto"
          />
          <p className="mt-1 text-[11px] text-text-muted">
            O Claude Code abre aqui. Você pode trabalhar, criar arquivos e depois registrar como projeto no CaiOS.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={handlePickFolder}>
            <FolderOpen className="h-4 w-4" /> Escolher pasta
          </Button>
          <Button size="sm" variant="ghost" onClick={handleSaveWorkspace}>
            <Save className="h-4 w-4" /> Usar pasta
          </Button>
          <Button size="sm" onClick={onOpenClaude}>
            <Play className="h-4 w-4" /> Claude Code
          </Button>
          <Button size="sm" variant="secondary" onClick={onOpenCodex}>
            <Play className="h-4 w-4" /> Codex
          </Button>
          <Button size="sm" variant="secondary" onClick={onOpenGrok}>
            <Play className="h-4 w-4" /> Grok
          </Button>

          <Button size="sm" variant="ghost" onClick={() => setShowCreate((v) => !v)}>
            <FolderPlus className="h-4 w-4" /> Criar projeto
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
          <div className="min-w-[200px] flex-1">
            <Label>Nome do projeto</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Meu novo projeto"
            />
          </div>
          <Button onClick={handleCreateProject} disabled={!projectName.trim()}>
            Registrar pasta como projeto
          </Button>
          <p className="w-full text-[11px] text-text-muted">
            Vai criar o projeto com a pasta acima e vincular o Claude Code automaticamente.
          </p>
        </div>
      )}
    </div>
  )
}
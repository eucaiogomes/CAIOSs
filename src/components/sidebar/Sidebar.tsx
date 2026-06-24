import { useProjectContext } from '@/contexts/ProjectContext'
import { useShell } from '@/contexts/ShellContext'
import { workspaceService } from '@/services/workspace.service'
import { NAV_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { toolsService } from '@/services/tools.service'
import { toolLauncher } from '@/services/tool-launcher.service'
import type { Tool } from '@/types/tool'
import {
  Brain,
  BookOpen,
  Compass,
  FlaskConical,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  Palette,
  Plus,
  Radio,
  Radar,
  Settings,
  Terminal,
  FileText,
  Video,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Brain,
  BookOpen,
  Compass,
  Radio,
  Palette,
  Radar,
  Wrench,
  FolderKanban,
  MessageSquareText,
  FlaskConical,
  FileText,
  Terminal,
  Video,
  Settings,
}

interface SidebarProps {
  onToolLaunch?: (tool: Tool) => void
}

export function Sidebar({ onToolLaunch }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentProject } = useProjectContext()
  const { sidebarOpen, closeSidebar } = useShell()
  const pinnedTools = toolsService.getFavorites()

  const handleToolClick = (tool: Tool) => {
    const fresh = toolsService.getById(tool.id) ?? tool
    toolLauncher
      .launch(fresh, {
        navigate,
        cwd: workspaceService.getEffectiveCwd(currentProject?.localPath),
        projectName: currentProject?.name ?? 'Workspace',
        projectId: currentProject?.id,
      })
      .then(() => onToolLaunch?.(tool))
      .catch((err) => console.error('[CaiOS]', err))
  }

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={closeSidebar}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full w-[min(280px,88vw)] shrink-0 flex-col border-r border-border bg-bg-panel shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:w-[240px] lg:translate-x-0 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          C
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">CaiOS</p>
          <p className="text-[10px] text-text-muted">Caio + OS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon]
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-text-secondary hover:bg-bg-soft hover:text-text-primary'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Pinned Tools
        </p>
        <ul className="space-y-0.5">
          {pinnedTools.map((tool) => (
            <li key={tool.id}>
              <button
                onClick={() => handleToolClick(tool)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-soft hover:text-text-primary"
              >
                <span className="text-base leading-none">{tool.icon ?? '🔧'}</span>
                <span className="truncate">{tool.name}</span>
              </button>
            </li>
          ))}
          <li>
            <Link
              to="/tools"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text-muted transition-colors hover:bg-bg-soft hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              Add Tool
            </Link>
          </li>
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-[10px] leading-relaxed text-text-muted">
          CaiOS não é um agente. É o lugar onde você organiza e acessa todos os seus agentes.
        </p>
      </div>
    </aside>
    </>
  )
}
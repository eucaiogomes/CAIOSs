import {
  CLAUDE_CODE_TOOL_ID,
  CODEX_TOOL_ID,
  GROK_TOOL_ID,
  HERMES_TOOL_ID,
  OPEN_DESIGN_TOOL_ID,
} from '@/lib/constants'
import * as tauriBridge from '@/lib/tauri-bridge'
import type { Tool } from '@/types/tool'
import type { NavigateFunction } from 'react-router-dom'
import { cliConfigService } from './cli-config.service'
import { logsService } from './logs.service'
import { terminalService } from './terminal.service'
import { toolsService } from './tools.service'

const CLI_TERMINAL_TOOL_IDS = new Set([
  CLAUDE_CODE_TOOL_ID,
  CODEX_TOOL_ID,
  GROK_TOOL_ID,
])

/** CLIs sempre abrem no terminal, mesmo se o localStorage ainda tiver type: web. */
function resolveLaunchTool(tool: Tool): Tool {
  const fresh = toolsService.getById(tool.id) ?? tool
  if (!CLI_TERMINAL_TOOL_IDS.has(fresh.id)) return fresh
  const command = cliConfigService.getCommandForTool(fresh.id) ?? fresh.command
  return { ...fresh, type: 'terminal', command }
}

export interface LaunchOptions {
  cwd?: string
  projectName?: string
  projectId?: string
  navigate?: NavigateFunction
}

export const toolLauncher = {
  async launch(tool: Tool, options?: LaunchOptions): Promise<void> {
    const navigate = options?.navigate
    const fresh = toolsService.getById(tool.id) ?? tool

    if (fresh.id === HERMES_TOOL_ID && navigate) {
      navigate('/hermes', {
        state: {
          cwd: options?.cwd,
          projectName: options?.projectName,
          projectId: options?.projectId,
        },
      })
      logsService.add({
        type: 'tool',
        message: `Abriu ${fresh.name} (dashboard)`,
        toolId: fresh.id,
        projectId: options?.projectId,
      })
      return
    }

    if (fresh.id === OPEN_DESIGN_TOOL_ID && navigate) {
      navigate('/open-design', {
        state: {
          cwd: options?.cwd,
          projectName: options?.projectName,
          projectId: options?.projectId,
        },
      })
      logsService.add({
        type: 'tool',
        message: `Abriu ${fresh.name} (sessão dedicada)`,
        toolId: fresh.id,
        projectId: options?.projectId,
      })
      return
    }

    const resolved = resolveLaunchTool(tool)

    try {
      switch (resolved.type) {
        case 'web': {
          if (!resolved.url) throw new Error('URL não configurada')
          if (resolved.openMode === 'internal') {
            const openedWindow = await tauriBridge.openInternalWebview(resolved.url, resolved.name)
            if (!openedWindow && navigate) {
              navigate('/tool/web', { state: { tool: resolved } })
            }
          } else {
            await tauriBridge.openUrl(resolved.url)
          }
          break
        }

        case 'terminal': {
          if (navigate) {
            navigate('/terminal', {
              state: {
                tool: resolved,
                command: resolved.command,
                cwd: options?.cwd,
                projectName: options?.projectName,
              },
            })
          }
          break
        }

        case 'folder': {
          if (!resolved.path) throw new Error('Caminho não configurado')
          await tauriBridge.openPath(resolved.path)
          break
        }

        case 'app': {
          if (!resolved.path) throw new Error('Caminho do app não configurado')
          await tauriBridge.openPath(resolved.path)
          break
        }

        case 'note': {
          if (navigate) {
            navigate('/notes', { state: { toolId: resolved.id, path: resolved.path } })
          }
          break
        }

        default:
          console.warn(`[CaiOS] Tipo "${resolved.type}" ainda não suportado`)
      }

      logsService.add({
        type: 'tool',
        message: `Abriu ${resolved.name} (${resolved.type})`,
        toolId: resolved.id,
        projectId: options?.projectId,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao abrir ferramenta'
      logsService.add({
        type: 'error',
        message: `Falha ao abrir ${resolved.name}: ${message}`,
        toolId: resolved.id,
        projectId: options?.projectId,
      })
      throw error
    }

    console.info('[CaiOS] Launch:', terminalService.getLaunchMessage(resolved, options?.cwd))
  },
}
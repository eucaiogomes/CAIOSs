import type { Tool } from '@/types/tool'

export interface TerminalSession {
  id: string
  command: string
  cwd?: string
  toolId?: string
  startedAt: string
}

/**
 * Tool launcher — MVP simulates actions; Tauri shell integration comes later.
 */
export const terminalService = {
  buildCommand(tool: Tool, _cwd?: string): string {
    switch (tool.type) {
      case 'terminal':
        return tool.command ?? tool.name.toLowerCase()
      case 'web':
        return tool.openMode === 'external'
          ? `open ${tool.url}`
          : `webview ${tool.url}`
      case 'folder':
        return `cd "${tool.path}"`
      case 'app':
        return `start "${tool.path ?? tool.name}"`
      default:
        return `# Tool type "${tool.type}" not yet supported`
    }
  },

  getLaunchMessage(tool: Tool, cwd?: string): string {
    const cmd = this.buildCommand(tool, cwd)
    const prefix = cwd ? `[${cwd}]` : '[~]'
    return `${prefix} $ ${cmd}`
  },

  simulateOutput(tool: Tool): string[] {
    switch (tool.type) {
      case 'terminal':
        return [
          `Iniciando ${tool.name}...`,
          `Comando: ${tool.command}`,
          '(Terminal real será conectado via Tauri Shell no próximo passo)',
        ]
      case 'web':
        return tool.openMode === 'external'
          ? [`Abrindo ${tool.url} no navegador externo...`]
          : [`Carregando WebView: ${tool.url}`, '(Alguns sites podem bloquear WebView)']
      case 'folder':
        return [`Abrindo pasta: ${tool.path}`]
      default:
        return [`Ação para ${tool.type} em desenvolvimento.`]
    }
  },
}
import { DEFAULT_OBSIDIAN_VAULT, OBSIDIAN_TOOL_ID } from '@/lib/constants'
import { toolsService } from '@/services/tools.service'

export const vaultService = {
  getVaultPath(): string {
    const tool = toolsService.getById(OBSIDIAN_TOOL_ID)
    const path = tool?.path?.trim()
    if (path) return path.replace(/\\/g, '/')
    return DEFAULT_OBSIDIAN_VAULT
  },

  getCaiOSFolder(): string {
    return `${this.getVaultPath()}/CaiOS`
  },

  setVaultPath(path: string): void {
    const tool = toolsService.getById(OBSIDIAN_TOOL_ID)
    if (!tool) return
    toolsService.update(OBSIDIAN_TOOL_ID, { path: path.replace(/\\/g, '/') })
  },
}
import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'

const DEFAULT_WORKSPACE_WIN = 'C:/Users/gcaio/caios-data/workspace'

function defaultPath(): string {
  if (typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('win')) {
    return DEFAULT_WORKSPACE_WIN
  }
  return '~/caios-data/workspace'
}

export const workspaceService = {
  getPath(): string {
    return storageGet<string>(STORAGE_KEYS.workspace) ?? defaultPath()
  },

  setPath(path: string): void {
    storageSet(STORAGE_KEYS.workspace, path)
  },

  getEffectiveCwd(projectPath?: string): string {
    return projectPath ?? this.getPath()
  },
}
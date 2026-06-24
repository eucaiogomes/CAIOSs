import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import { generateId, nowISO } from '@/lib/utils'
import { knowledgeSyncService } from '@/services/knowledge-sync.service'
import type { LogEntry, LogType } from '@/types/log'

function getAll(): LogEntry[] {
  return storageGet<LogEntry[]>(STORAGE_KEYS.logs) ?? []
}

function save(logs: LogEntry[]): void {
  storageSet(STORAGE_KEYS.logs, logs.slice(0, 200))
}

export const logsService = {
  list(): LogEntry[] {
    return getAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  getByProject(projectId: string): LogEntry[] {
    return getAll().filter((l) => l.projectId === projectId)
  },

  add(input: {
    type: LogType
    message: string
    toolId?: string
    projectId?: string
  }): LogEntry {
    const entry: LogEntry = {
      id: generateId(),
      ...input,
      createdAt: nowISO(),
    }
    save([entry, ...getAll()])
    knowledgeSyncService.schedule('log', entry.id)
    return entry
  },
}
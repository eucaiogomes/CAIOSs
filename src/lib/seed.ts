import { STORAGE_KEYS } from './constants'
import { storageGet, storageSet } from './db'
import {
  MOCK_EXPERIMENTS,
  MOCK_NOTES,
  MOCK_PROJECT_TOOLS,
  MOCK_PROJECTS,
  MOCK_PROMPTS,
  MOCK_TOOLS,
} from './mock-data'
import type { Tool } from '@/types/tool'

function migrateTools(): void {
  const existing = storageGet<Tool[]>(STORAGE_KEYS.tools) ?? []
  const knownIds = new Set(existing.map((tool) => tool.id))
  const missing = MOCK_TOOLS.filter((tool) => !knownIds.has(tool.id))
  if (missing.length === 0) return
  storageSet(STORAGE_KEYS.tools, [...existing, ...missing])
}

export function seedDatabaseIfNeeded(): void {
  if (!storageGet<boolean>(STORAGE_KEYS.seeded)) {
    storageSet(STORAGE_KEYS.tools, MOCK_TOOLS)
    storageSet(STORAGE_KEYS.projects, MOCK_PROJECTS)
    storageSet(STORAGE_KEYS.prompts, MOCK_PROMPTS)
    storageSet(STORAGE_KEYS.experiments, MOCK_EXPERIMENTS)
    storageSet(STORAGE_KEYS.notes, MOCK_NOTES)
    storageSet(STORAGE_KEYS.projectTools, MOCK_PROJECT_TOOLS)
    storageSet(STORAGE_KEYS.logs, [])
    storageSet(STORAGE_KEYS.seeded, true)
    return
  }

  migrateTools()
}
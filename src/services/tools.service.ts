import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import { generateId, nowISO } from '@/lib/utils'
import type { CreateToolInput, Tool, UpdateToolInput } from '@/types/tool'

function getAll(): Tool[] {
  return storageGet<Tool[]>(STORAGE_KEYS.tools) ?? []
}

function save(tools: Tool[]): void {
  storageSet(STORAGE_KEYS.tools, tools)
}

export const toolsService = {
  list(): Tool[] {
    return getAll().sort((a, b) => a.name.localeCompare(b.name))
  },

  getFavorites(): Tool[] {
    return getAll().filter((t) => t.isFavorite)
  },

  getById(id: string): Tool | undefined {
    return getAll().find((t) => t.id === id)
  },

  create(input: CreateToolInput): Tool {
    const tool: Tool = {
      ...input,
      id: generateId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }
    save([...getAll(), tool])
    return tool
  },

  update(id: string, input: UpdateToolInput): Tool | null {
    const tools = getAll()
    const index = tools.findIndex((t) => t.id === id)
    if (index === -1) return null
    const updated: Tool = { ...tools[index], ...input, updatedAt: nowISO() }
    tools[index] = updated
    save(tools)
    return updated
  },

  remove(id: string): boolean {
    const tools = getAll()
    const filtered = tools.filter((t) => t.id !== id)
    if (filtered.length === tools.length) return false
    save(filtered)
    return true
  },

  toggleFavorite(id: string): Tool | null {
    const tool = this.getById(id)
    if (!tool) return null
    return this.update(id, { isFavorite: !tool.isFavorite })
  },
}
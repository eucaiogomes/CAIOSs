import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import { generateId, nowISO } from '@/lib/utils'
import { knowledgeSyncService } from '@/services/knowledge-sync.service'
import type { CreatePromptInput, Prompt, UpdatePromptInput } from '@/types/prompt'

function getAll(): Prompt[] {
  return storageGet<Prompt[]>(STORAGE_KEYS.prompts) ?? []
}

function save(prompts: Prompt[]): void {
  storageSet(STORAGE_KEYS.prompts, prompts)
}

export const promptsService = {
  list(): Prompt[] {
    return getAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },

  getRecent(limit = 5): Prompt[] {
    return this.list().slice(0, limit)
  },

  getByProject(projectId: string): Prompt[] {
    return getAll().filter((p) => p.projectId === projectId)
  },

  getById(id: string): Prompt | undefined {
    return getAll().find((p) => p.id === id)
  },

  create(input: CreatePromptInput): Prompt {
    const prompt: Prompt = {
      ...input,
      id: generateId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }
    save([...getAll(), prompt])
    knowledgeSyncService.schedule('prompt', prompt.id)
    return prompt
  },

  update(id: string, input: UpdatePromptInput): Prompt | null {
    const prompts = getAll()
    const index = prompts.findIndex((p) => p.id === id)
    if (index === -1) return null
    const updated: Prompt = { ...prompts[index], ...input, updatedAt: nowISO() }
    prompts[index] = updated
    save(prompts)
    knowledgeSyncService.schedule('prompt', updated.id)
    return updated
  },

  duplicate(id: string): Prompt | null {
    const original = this.getById(id)
    if (!original) return null
    return this.create({
      title: `${original.title} (cópia)`,
      category: original.category,
      content: original.content,
      recommendedToolId: original.recommendedToolId,
      projectId: original.projectId,
      tags: [...original.tags],
    })
  },

  remove(id: string): boolean {
    const prompts = getAll()
    const filtered = prompts.filter((p) => p.id !== id)
    if (filtered.length === prompts.length) return false
    save(filtered)
    knowledgeSyncService.schedule('prompt', id)
    return true
  },
}
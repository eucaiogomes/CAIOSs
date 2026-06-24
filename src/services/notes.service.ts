import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import { generateId, nowISO } from '@/lib/utils'
import { knowledgeSyncService } from '@/services/knowledge-sync.service'
import type { CreateNoteInput, Note, UpdateNoteInput } from '@/types/note'

function getAll(): Note[] {
  return storageGet<Note[]>(STORAGE_KEYS.notes) ?? []
}

function save(notes: Note[]): void {
  storageSet(STORAGE_KEYS.notes, notes)
}

export const notesService = {
  list(): Note[] {
    return getAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },

  getByProject(projectId: string): Note[] {
    return getAll().filter((n) => n.projectId === projectId)
  },

  getById(id: string): Note | undefined {
    return getAll().find((n) => n.id === id)
  },

  create(input: CreateNoteInput): Note {
    const note: Note = {
      ...input,
      id: generateId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }
    save([...getAll(), note])
    knowledgeSyncService.schedule('note', note.id)
    return note
  },

  update(id: string, input: UpdateNoteInput): Note | null {
    const notes = getAll()
    const index = notes.findIndex((n) => n.id === id)
    if (index === -1) return null
    const updated: Note = { ...notes[index], ...input, updatedAt: nowISO() }
    notes[index] = updated
    save(notes)
    knowledgeSyncService.schedule('note', updated.id)
    return updated
  },

  remove(id: string): boolean {
    const notes = getAll()
    const filtered = notes.filter((n) => n.id !== id)
    if (filtered.length === notes.length) return false
    save(filtered)
    knowledgeSyncService.schedule('note', id)
    return true
  },
}
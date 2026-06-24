export type NoteScope = 'general' | 'project' | 'tool' | 'test'

export interface Note {
  id: string
  title: string
  content: string
  scope: NoteScope
  projectId?: string
  toolId?: string
  createdAt: string
  updatedAt: string
}

export type CreateNoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateNoteInput = Partial<CreateNoteInput>
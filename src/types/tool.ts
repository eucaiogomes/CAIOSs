export type ToolType = 'web' | 'terminal' | 'app' | 'folder' | 'note' | 'api' | 'mcp'

export type OpenMode = 'internal' | 'external'

export interface Tool {
  id: string
  name: string
  type: ToolType
  category: string
  description: string
  command?: string
  url?: string
  path?: string
  icon?: string
  isFavorite: boolean
  openMode: OpenMode
  createdAt: string
  updatedAt: string
}

export type CreateToolInput = Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateToolInput = Partial<CreateToolInput>
export type PromptCategory =
  | 'Código'
  | 'Pesquisa'
  | 'Design'
  | 'Agentes'
  | 'MCP'
  | 'Debug'
  | 'Landing Page'
  | 'Produto'
  | 'Arquitetura'

export interface Prompt {
  id: string
  title: string
  category: PromptCategory
  content: string
  recommendedToolId?: string
  projectId?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type CreatePromptInput = Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>
export type UpdatePromptInput = Partial<CreatePromptInput>
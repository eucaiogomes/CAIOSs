export type ProjectStatus = 'idea' | 'testing' | 'building' | 'paused' | 'done'

export interface ProjectLink {
  id: string
  label: string
  url: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  localPath?: string
  links: ProjectLink[]
  createdAt: string
  updatedAt: string
}

export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProjectInput = Partial<CreateProjectInput>
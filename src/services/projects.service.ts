import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import { generateId, nowISO } from '@/lib/utils'
import { knowledgeSyncService } from '@/services/knowledge-sync.service'
import type { CreateProjectInput, Project, ProjectLink, UpdateProjectInput } from '@/types/project'

function normalize(project: Project): Project {
  return { ...project, links: project.links ?? [] }
}

function getAll(): Project[] {
  return (storageGet<Project[]>(STORAGE_KEYS.projects) ?? []).map(normalize)
}

function save(projects: Project[]): void {
  storageSet(STORAGE_KEYS.projects, projects)
}

function getProjectToolsMap(): Record<string, string[]> {
  return storageGet<Record<string, string[]>>(STORAGE_KEYS.projectTools) ?? {}
}

function saveProjectToolsMap(map: Record<string, string[]>): void {
  storageSet(STORAGE_KEYS.projectTools, map)
}

export const projectsService = {
  list(): Project[] {
    return getAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },

  getRecent(limit = 5): Project[] {
    return this.list().slice(0, limit)
  },

  getById(id: string): Project | undefined {
    return getAll().find((p) => p.id === id)
  },

  getLinkedToolIds(projectId: string): string[] {
    return getProjectToolsMap()[projectId] ?? []
  },

  linkTool(projectId: string, toolId: string): void {
    const map = getProjectToolsMap()
    const current = map[projectId] ?? []
    if (!current.includes(toolId)) {
      map[projectId] = [...current, toolId]
      saveProjectToolsMap(map)
      this.touch(projectId)
      knowledgeSyncService.schedule('project', projectId)
    }
  },

  unlinkTool(projectId: string, toolId: string): void {
    const map = getProjectToolsMap()
    map[projectId] = (map[projectId] ?? []).filter((id) => id !== toolId)
    saveProjectToolsMap(map)
    this.touch(projectId)
    knowledgeSyncService.schedule('project', projectId)
  },

  setLinkedTools(projectId: string, toolIds: string[]): void {
    const map = getProjectToolsMap()
    map[projectId] = toolIds
    saveProjectToolsMap(map)
    this.touch(projectId)
    knowledgeSyncService.schedule('project', projectId)
  },

  addLink(projectId: string, link: Omit<ProjectLink, 'id'>): Project | null {
    const project = this.getById(projectId)
    if (!project) return null
    const newLink: ProjectLink = { ...link, id: generateId() }
    return this.update(projectId, { links: [...project.links, newLink] })
  },

  removeLink(projectId: string, linkId: string): Project | null {
    const project = this.getById(projectId)
    if (!project) return null
    return this.update(projectId, {
      links: project.links.filter((l) => l.id !== linkId),
    })
  },

  touch(id: string): void {
    const projects = getAll()
    const index = projects.findIndex((p) => p.id === id)
    if (index === -1) return
    projects[index] = { ...projects[index], updatedAt: nowISO() }
    save(projects)
  },

  create(input: CreateProjectInput): Project {
    const project: Project = {
      ...input,
      links: input.links ?? [],
      id: generateId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }
    save([...getAll(), project])
    knowledgeSyncService.schedule('project', project.id)
    return project
  },

  update(id: string, input: UpdateProjectInput): Project | null {
    const projects = getAll()
    const index = projects.findIndex((p) => p.id === id)
    if (index === -1) return null
    const updated: Project = normalize({
      ...projects[index],
      ...input,
      updatedAt: nowISO(),
    })
    projects[index] = updated
    save(projects)
    knowledgeSyncService.schedule('project', updated.id)
    return updated
  },

  remove(id: string): boolean {
    const projects = getAll()
    const filtered = projects.filter((p) => p.id !== id)
    if (filtered.length === projects.length) return false
    save(filtered)
    const map = getProjectToolsMap()
    delete map[id]
    saveProjectToolsMap(map)
    knowledgeSyncService.schedule('project', id)
    return true
  },
}
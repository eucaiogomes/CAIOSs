import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import { projectsService } from '@/services/projects.service'
import type { Project } from '@/types/project'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface ProjectContextValue {
  currentProject: Project | null
  currentProjectId: string | null
  setCurrentProject: (projectId: string | null) => void
  refresh: () => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

function loadStoredId(): string | null {
  return storageGet<string | null>(STORAGE_KEYS.currentProject) ?? null
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(loadStoredId)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const setCurrentProject = useCallback((projectId: string | null) => {
    setCurrentProjectId(projectId)
    if (projectId) {
      storageSet(STORAGE_KEYS.currentProject, projectId)
    } else {
      storageSet(STORAGE_KEYS.currentProject, null)
    }
  }, [])

  const currentProject = useMemo(() => {
    if (!currentProjectId) return null
    return projectsService.getById(currentProjectId) ?? null
  }, [currentProjectId, tick])

  const value = useMemo(
    () => ({ currentProject, currentProjectId, setCurrentProject, refresh }),
    [currentProject, currentProjectId, setCurrentProject, refresh]
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider')
  return ctx
}
import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import { generateId, nowISO } from '@/lib/utils'
import { knowledgeSyncService } from '@/services/knowledge-sync.service'
import type { CreateExperimentInput, Experiment, UpdateExperimentInput } from '@/types/experiment'

function getAll(): Experiment[] {
  return storageGet<Experiment[]>(STORAGE_KEYS.experiments) ?? []
}

function save(experiments: Experiment[]): void {
  storageSet(STORAGE_KEYS.experiments, experiments)
}

export const experimentsService = {
  list(): Experiment[] {
    return getAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  getRecent(limit = 5): Experiment[] {
    return this.list().slice(0, limit)
  },

  getByProject(projectId: string): Experiment[] {
    return getAll().filter((e) => e.projectId === projectId)
  },

  getById(id: string): Experiment | undefined {
    return getAll().find((e) => e.id === id)
  },

  create(input: CreateExperimentInput): Experiment {
    const experiment: Experiment = {
      ...input,
      id: generateId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }
    save([...getAll(), experiment])
    knowledgeSyncService.schedule('experiment', experiment.id)
    return experiment
  },

  update(id: string, input: UpdateExperimentInput): Experiment | null {
    const experiments = getAll()
    const index = experiments.findIndex((e) => e.id === id)
    if (index === -1) return null
    const updated: Experiment = { ...experiments[index], ...input, updatedAt: nowISO() }
    experiments[index] = updated
    save(experiments)
    knowledgeSyncService.schedule('experiment', updated.id)
    return updated
  },

  remove(id: string): boolean {
    const experiments = getAll()
    const filtered = experiments.filter((e) => e.id !== id)
    if (filtered.length === experiments.length) return false
    save(filtered)
    knowledgeSyncService.schedule('experiment', id)
    return true
  },
}
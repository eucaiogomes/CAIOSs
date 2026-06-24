import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import type { EvolutionSnapshot, EvolutionState } from '@/types/brain'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function defaultState(): EvolutionState {
  const today = todayKey()
  return {
    firstUseDate: today,
    lastActiveDate: today,
    activeDays: [today],
    totalActions: 0,
    snapshots: [],
  }
}

function getState(): EvolutionState {
  return storageGet<EvolutionState>(STORAGE_KEYS.evolution) ?? defaultState()
}

function save(state: EvolutionState): void {
  storageSet(STORAGE_KEYS.evolution, state)
}

export interface EvolutionMetrics {
  level: number
  maturityLabel: string
  daysActive: number
  daysSinceStart: number
  totalActions: number
  nodeCount: number
  linkCount: number
  growthPercent: number
}

const MATURITY_LABELS = [
  'Semente',
  'Broto',
  'Neurônio',
  'Sinapse',
  'Rede',
  'Córtex',
  'Mente',
  'Consciência',
] as const

function maturityLabel(level: number): string {
  const idx = Math.min(MATURITY_LABELS.length - 1, Math.floor(level / 12.5))
  return MATURITY_LABELS[idx]
}

export const evolutionService = {
  touch(): void {
    const state = getState()
    const today = todayKey()
    state.lastActiveDate = today
    if (!state.activeDays.includes(today)) {
      state.activeDays = [...state.activeDays, today]
    }
    save(state)
  },

  recordAction(count = 1): void {
    const state = getState()
    const today = todayKey()
    state.totalActions += count
    state.lastActiveDate = today
    if (!state.activeDays.includes(today)) {
      state.activeDays = [...state.activeDays, today]
    }
    save(state)
  },

  recordSnapshot(nodes: number, links: number): void {
    const state = getState()
    const today = todayKey()
    const existing = state.snapshots.findIndex((s) => s.date === today)
    const snap: EvolutionSnapshot = {
      date: today,
      nodes,
      links,
      actions: state.totalActions,
    }
    if (existing >= 0) {
      state.snapshots[existing] = snap
    } else {
      state.snapshots = [...state.snapshots.slice(-89), snap]
    }
    save(state)
  },

  getMetrics(nodeCount: number, linkCount: number): EvolutionMetrics {
    const state = getState()
    const daysActive = state.activeDays.length
    const start = new Date(state.firstUseDate)
    const daysSinceStart = Math.max(
      1,
      Math.ceil((Date.now() - start.getTime()) / 86_400_000) + 1,
    )

    const actionScore = Math.min(40, state.totalActions * 0.5)
    const nodeScore = Math.min(30, nodeCount * 0.8)
    const linkScore = Math.min(20, linkCount * 0.3)
    const dayScore = Math.min(10, daysActive * 0.5)
    const level = Math.min(100, Math.round(actionScore + nodeScore + linkScore + dayScore))

    const firstSnap = state.snapshots[0]
    const growthPercent =
      firstSnap && firstSnap.nodes > 0
        ? Math.round(((nodeCount - firstSnap.nodes) / firstSnap.nodes) * 100)
        : nodeCount > 0
          ? 100
          : 0

    return {
      level,
      maturityLabel: maturityLabel(level),
      daysActive,
      daysSinceStart,
      totalActions: state.totalActions,
      nodeCount,
      linkCount,
      growthPercent,
    }
  },

  getState(): EvolutionState {
    return getState()
  },

  getSnapshots(): EvolutionSnapshot[] {
    return getState().snapshots
  },
}
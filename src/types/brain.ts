export type BrainNodeKind =
  | 'vault'
  | 'project'
  | 'note'
  | 'prompt'
  | 'experiment'
  | 'tool'
  | 'log'
  | 'tag'
  | 'caios-root'

export interface BrainNode {
  id: string
  label: string
  kind: BrainNodeKind
  size: number
  color: string
  source: 'caios' | 'obsidian'
  meta?: Record<string, string>
}

export interface BrainLink {
  source: string
  target: string
  kind: 'belongs' | 'uses' | 'wikilink' | 'tag' | 'related'
  strength?: number
}

export interface BrainGraphData {
  nodes: BrainNode[]
  links: BrainLink[]
}

export interface VaultFileInfo {
  path: string
  title: string
  links: string[]
  tags: string[]
  folder: string
}

export interface EvolutionSnapshot {
  date: string
  nodes: number
  links: number
  actions: number
}

export interface EvolutionState {
  firstUseDate: string
  lastActiveDate: string
  activeDays: string[]
  totalActions: number
  snapshots: EvolutionSnapshot[]
}

export type SyncEntityType =
  | 'project'
  | 'note'
  | 'prompt'
  | 'experiment'
  | 'log'
  | 'index'
export type ExplorerEventKind =
  | 'navigation'
  | 'interaction'
  | 'network'
  | 'entity'
  | 'flow'
  | 'evidence'
  | 'inference'
  | 'insight'
  | 'system'

export interface ExplorerTimelineEvent {
  id: string
  at: string
  kind: ExplorerEventKind
  label: string
  detail?: string
  url?: string
  payload?: Record<string, unknown>
}

export interface ExplorerInsight {
  id: string
  at: string
  category: 'flow' | 'entity' | 'hypothesis' | 'summary'
  title: string
  body: string
}

export interface ExplorerLearning {
  id: string
  at: string
  system?: string
  discovery: string
  appliedToSkill: boolean
}

export interface ExplorerSessionState {
  targetSystem: string
  investigationMode: boolean
  currentUrl: string
  sessionStartedAt: string
  timeline: ExplorerTimelineEvent[]
  insights: ExplorerInsight[]
  learnings: ExplorerLearning[]
  lastAgentSummary?: string
}
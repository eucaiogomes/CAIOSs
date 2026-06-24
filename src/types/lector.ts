export interface LectorAgent {
  id: string
  name: string
  description: string
  icon: string // lucide icon name or emoji
  skill: string
  obsidianFolder: string // e.g. 'Lector/Treinamentos'
  promptTemplate: string
  color?: string
}

export type LectorExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'partial'

export interface LectorLog {
  id: string
  timestamp: string
  type: 'info' | 'tool' | 'success' | 'error' | 'obsidian' | 'streaming'
  message: string
  toolName?: string
  details?: string
}

export interface LectorResult {
  title?: string
  summary?: string
  createdItems: Array<{
    type: string
    id?: string
    name: string
    url?: string
    obsidianPath?: string
  }>
  links: Array<{ label: string; path?: string; url?: string }>
  rawOutput?: string
  obsidianPath?: string
}

export interface LectorExecution {
  id: string
  agentId: string
  agentName: string
  prompt: string
  startedAt: string
  completedAt?: string
  status: LectorExecutionStatus
  logs: LectorLog[]
  result?: LectorResult
  obsidianPath?: string
  error?: string
}

export interface LectorSessionState {
  currentAgent: LectorAgent | null
  currentExecution: LectorExecution | null
  history: LectorExecution[]
  isConnected: boolean
}
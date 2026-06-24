export type LogType = 'info' | 'error' | 'tool' | 'project' | 'experiment'

export interface LogEntry {
  id: string
  type: LogType
  message: string
  toolId?: string
  projectId?: string
  createdAt: string
}
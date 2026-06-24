export interface Experiment {
  id: string
  title: string
  objective: string
  result: string
  rating: number
  shouldContinue: boolean
  projectId?: string
  toolsUsed: string[]
  commandsUsed?: string
  logs?: string
  createdAt: string
  updatedAt: string
}

export type CreateExperimentInput = Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateExperimentInput = Partial<CreateExperimentInput>
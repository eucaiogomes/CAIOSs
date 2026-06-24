export interface CliToolConfig {
  id: string
  name: string
  command: string
  args: string[]
  verified: boolean
  version?: string
  detectedPath?: string
  updatedAt: string
}

export interface CaiosCliSettings {
  claudeCode: CliToolConfig
  codex: CliToolConfig
  grok: CliToolConfig
  hermes: CliToolConfig
}
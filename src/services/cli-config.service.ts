import { CLAUDE_CODE_TOOL_ID, CODEX_TOOL_ID, GROK_TOOL_ID, HERMES_TOOL_ID, STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import { nowISO } from '@/lib/utils'
import type { CaiosCliSettings, CliToolConfig } from '@/types/cli-config'
import { toolsService } from './tools.service'

const DEFAULT_CLAUDE_PATH_WIN =
  'C:/Users/gcaio/AppData/Roaming/npm/node_modules/@anthropic-ai/claude-code/bin/claude.exe'

const DEFAULT_CODEX_PATH_WIN =
  'C:/Users/gcaio/AppData/Roaming/npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe'

const DEFAULT_GROK_PATH_WIN = 'C:/Users/gcaio/.grok/bin/grok.exe'

const DEFAULT_HERMES_PATH_WIN =
  'C:/Users/lecto/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe'

function defaultCliConfig(id: string, name: string, command: string): CliToolConfig {
  return {
    id,
    name,
    command,
    args: [],
    verified: false,
    updatedAt: nowISO(),
  }
}

function defaultSettings(): CaiosCliSettings {
  return {
    claudeCode: defaultCliConfig('claude-code', 'Claude Code', DEFAULT_CLAUDE_PATH_WIN),
    codex: defaultCliConfig('codex', 'Codex', DEFAULT_CODEX_PATH_WIN),
    grok: defaultCliConfig('grok', 'Grok', DEFAULT_GROK_PATH_WIN),
    hermes: defaultCliConfig('hermes', 'Hermes', DEFAULT_HERMES_PATH_WIN),
  }
}

function getSettings(): CaiosCliSettings {
  const stored = storageGet<CaiosCliSettings>(STORAGE_KEYS.cliSettings)
  if (!stored) return defaultSettings()
  const defaults = defaultSettings()
  return {
    claudeCode: stored.claudeCode ?? defaults.claudeCode,
    codex: stored.codex ?? defaults.codex,
    grok: stored.grok ?? defaults.grok,
    hermes: stored.hermes ?? defaults.hermes,
  }
}

function saveSettings(settings: CaiosCliSettings): void {
  storageSet(STORAGE_KEYS.cliSettings, settings)
}

function buildCommand(config: CliToolConfig): string {
  const base = config.command.trim()
  const args = config.args.filter(Boolean)
  return args.length > 0 ? `${base} ${args.join(' ')}` : base
}

export const cliConfigService = {
  get(): CaiosCliSettings {
    return getSettings()
  },

  getClaudeCommand(): string {
    return buildCommand(getSettings().claudeCode)
  },

  getCodexCommand(): string {
    return buildCommand(getSettings().codex)
  },

  getGrokCommand(): string {
    return buildCommand(getSettings().grok)
  },

  getHermesCommand(): string {
    return buildCommand(getSettings().hermes)
  },

  getCommandForTool(toolId: string): string | null {
    if (toolId === CLAUDE_CODE_TOOL_ID) return this.getClaudeCommand()
    if (toolId === CODEX_TOOL_ID) return this.getCodexCommand()
    if (toolId === GROK_TOOL_ID) return this.getGrokCommand()
    if (toolId === HERMES_TOOL_ID) return this.getHermesCommand()
    return null
  },

  updateClaudeCode(patch: Partial<CliToolConfig>): CliToolConfig {
    const settings = getSettings()
    settings.claudeCode = { ...settings.claudeCode, ...patch, updatedAt: nowISO() }
    saveSettings(settings)
    this.syncTool(CLAUDE_CODE_TOOL_ID, settings.claudeCode, 'Claude Code', false)
    return settings.claudeCode
  },

  updateCodex(patch: Partial<CliToolConfig>): CliToolConfig {
    const settings = getSettings()
    settings.codex = { ...settings.codex, ...patch, updatedAt: nowISO() }
    saveSettings(settings)
    this.syncTool(CODEX_TOOL_ID, settings.codex, 'Codex', false)
    return settings.codex
  },

  updateGrok(patch: Partial<CliToolConfig>): CliToolConfig {
    const settings = getSettings()
    settings.grok = { ...settings.grok, ...patch, updatedAt: nowISO() }
    saveSettings(settings)
    this.syncTool(GROK_TOOL_ID, settings.grok, 'Grok', true)
    return settings.grok
  },

  updateHermes(patch: Partial<CliToolConfig>): CliToolConfig {
    const settings = getSettings()
    settings.hermes = { ...settings.hermes, ...patch, updatedAt: nowISO() }
    saveSettings(settings)
    this.syncTool(HERMES_TOOL_ID, settings.hermes, 'Hermes', false)
    return settings.hermes
  },

  syncTool(toolId: string, config: CliToolConfig, label: string, forceTerminal = false): void {
    const tool = toolsService.getById(toolId)
    if (!tool) return
    toolsService.update(toolId, {
      type: forceTerminal ? 'terminal' : tool.type,
      command: config.command,
      description: config.verified
        ? `${label} ${config.version ?? ''} — configurado e verificado`.trim()
        : `${label} via terminal — configure em Settings`,
    })
  },

  applyClaudeDetection(result: { path: string; version?: string }): CliToolConfig {
    return this.updateClaudeCode({
      command: result.path,
      detectedPath: result.path,
      version: result.version,
      verified: true,
    })
  },

  applyCodexDetection(result: { path: string; version?: string }): CliToolConfig {
    return this.updateCodex({
      command: result.path,
      detectedPath: result.path,
      version: result.version,
      verified: true,
    })
  },

  applyGrokDetection(result: { path: string; version?: string }): CliToolConfig {
    return this.updateGrok({
      command: result.path,
      detectedPath: result.path,
      version: result.version,
      verified: true,
    })
  },

  applyHermesDetection(result: { path: string; version?: string }): CliToolConfig {
    return this.updateHermes({
      command: result.path,
      detectedPath: result.path,
      version: result.version,
      verified: true,
    })
  },

  markClaudeUnverified(): CliToolConfig {
    return this.updateClaudeCode({ verified: false })
  },

  markCodexUnverified(): CliToolConfig {
    return this.updateCodex({ verified: false })
  },

  markGrokUnverified(): CliToolConfig {
    return this.updateGrok({ verified: false })
  },

  markHermesUnverified(): CliToolConfig {
    return this.updateHermes({ verified: false })
  },

  /** Garante que Grok abre no terminal (migração de versões que usavam type: web). */
  migrateGrokTerminal(): void {
    const tool = toolsService.getById(GROK_TOOL_ID)
    if (!tool) return
    const settings = getSettings()
    const needsUpdate =
      tool.type !== 'terminal' ||
      !tool.command ||
      tool.command !== settings.grok.command
    if (!needsUpdate) return
    this.syncTool(GROK_TOOL_ID, settings.grok, 'Grok', true)
  },

  /** Garante que Hermes abre no dashboard web integrado. */
  migrateHermesDashboard(): void {
    const tool = toolsService.getById(HERMES_TOOL_ID)
    if (!tool) return
    const settings = getSettings()
    toolsService.update(HERMES_TOOL_ID, {
      type: 'web',
      command: settings.hermes.command,
      url: 'http://localhost:9119',
      openMode: 'internal',
      description: settings.hermes.verified
        ? `Hermes ${settings.hermes.version ?? ''} — dashboard integrado`.trim()
        : 'Hermes Agent — configure em Settings',
    })
  },

  applyDetection: (result: { path: string; version?: string }) => cliConfigService.applyClaudeDetection(result),
  markUnverified: () => cliConfigService.markClaudeUnverified(),
}
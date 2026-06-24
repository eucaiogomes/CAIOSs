import { HERMES_DASHBOARD_URL, HERMES_HOME, HERMES_TOOL_ID } from '@/lib/constants'
import { cliConfigService } from './cli-config.service'
import { toolsService } from './tools.service'

export interface HermesLayer {
  id: number
  name: string
  role: string
  description: string
  caiosMapping: string
}

export const HERMES_ARCHITECTURE_LAYERS: HermesLayer[] = [
  {
    id: 1,
    name: 'Fundação',
    role: 'Hardware / VPS',
    description: 'PC local ou servidor onde o sistema roda 24/7.',
    caiosMapping: 'CaiOS desktop (Tauri) ou npm run dev no browser.',
  },
  {
    id: 2,
    name: 'Memória',
    role: 'Contexto infinito',
    description: 'Obsidian, MEMORY.md e providers externos do Hermes.',
    caiosMapping: 'Vault Obsidian + hermes memory + pasta caios-data/.',
  },
  {
    id: 3,
    name: 'Cérebro',
    role: 'LLMs via API',
    description: 'Modelos baratos para tarefas repetitivas, robustos para complexas.',
    caiosMapping: 'Configurado em hermes setup / config.yaml.',
  },
  {
    id: 4,
    name: 'Agentes',
    role: 'Harness',
    description: 'Hermes, Claude Code, Codex e Grok com ferramentas e permissões.',
    caiosMapping: 'Dashboard web integrado + Tools no CaiOS.',
  },
  {
    id: 5,
    name: 'Mission Control',
    role: 'Centro de comando',
    description: 'Dashboard unificado com Kanban e delegação de tarefas.',
    caiosMapping: 'Esta página + hermes dashboard + hermes kanban.',
  },
  {
    id: 6,
    name: 'Produção',
    role: 'Skills & Workflows',
    description: 'Áreas especializadas: vídeo, SEO, e-mail, etc.',
    caiosMapping: 'hermes skills + projetos vinculados no CaiOS.',
  },
  {
    id: 7,
    name: 'Loop',
    role: 'Feedback',
    description: 'Resultados fluem de volta para a memória — cada sessão fica mais inteligente.',
    caiosMapping: 'Lab + Notes + export para Obsidian.',
  },
]

export const hermesService = {
  getBaseCommand(): string {
    return cliConfigService.getHermesCommand()
  },

  getChatCommand(): string {
    const base = this.getBaseCommand()
    return `${base} --cli`
  },

  getDashboardCommand(): string {
    const base = this.getBaseCommand()
    return `${base} dashboard --no-open`
  },

  getKanbanWatchCommand(): string {
    const base = this.getBaseCommand()
    return `${base} kanban watch`
  },

  getKanbanListCommand(): string {
    const base = this.getBaseCommand()
    return `${base} kanban list`
  },

  getStatusCommand(): string {
    const base = this.getBaseCommand()
    return `${base} status`
  },

  getDashboardUrl(): string {
    return HERMES_DASHBOARD_URL
  },

  getHomePath(): string {
    return HERMES_HOME
  },

  isConfigured(): boolean {
    return cliConfigService.get().hermes.verified
  },

  getTool() {
    return toolsService.getById(HERMES_TOOL_ID)
  },

  getDashboardTool() {
    const tool = this.getTool()
    if (!tool) return null
    return {
      ...tool,
      type: 'web' as const,
      url: HERMES_DASHBOARD_URL,
      name: 'Hermes Dashboard',
      openMode: 'internal' as const,
    }
  },
}
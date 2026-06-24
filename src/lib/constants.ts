import type { ProjectStatus } from '@/types/project'
import type { PromptCategory } from '@/types/prompt'
import type { ToolType } from '@/types/tool'

export const STORAGE_KEYS = {
  tools: 'caios_tools',
  projects: 'caios_projects',
  prompts: 'caios_prompts',
  experiments: 'caios_experiments',
  logs: 'caios_logs',
  notes: 'caios_notes',
  projectTools: 'caios_project_tools',
  seeded: 'caios_seeded',
  settings: 'caios_settings',
  currentProject: 'caios_current_project',
  cliSettings: 'caios_cli_settings',
  workspace: 'caios_workspace',
  evolution: 'caios_evolution',
  brainCache: 'caios_brain_cache',
  explorerState: 'caios_explorer_state',
  explorerHermesSession: 'caios_explorer_hermes_session',
  liveCallActive: 'caios_live_call_active',
  liveCallArchive: 'caios_live_call_archive',
  liveCallHermesSession: 'caios_live_call_hermes_session',
} as const

export const DEFAULT_OBSIDIAN_VAULT = 'C:/Users/lecto/OneDrive/Documentos/Lector BRAIN'
export const CAIOS_VAULT_FOLDER = 'CaiOS'

export const CLAUDE_CODE_TOOL_ID = 'tool-claude'
export const CODEX_TOOL_ID = 'tool-codex'
export const GROK_TOOL_ID = 'tool-grok'
export const HERMES_TOOL_ID = 'tool-hermes'
export const OPEN_DESIGN_TOOL_ID = 'tool-open-design'
export const OBSIDIAN_TOOL_ID = 'tool-obsidian'

export const HERMES_DASHBOARD_URL = 'http://localhost:9119'
export const HERMES_EXPLORER_PROFILE = 'explorer'
export const HERMES_EXPLORER_DASHBOARD_URL = `http://127.0.0.1:9119/?profile=${HERMES_EXPLORER_PROFILE}`
export const HERMES_HOME = 'C:/Users/lecto/.hermes'
export const EXPLORER_SKILL_NAME = 'caios-explorer'
export const EXPLORER_OBSIDIAN_FOLDER = 'CaiOS/Explorer'
export const LIVE_CALL_OBSIDIAN_FOLDER = 'CaiOS/LiveCall'
export const OPEN_DESIGN_URL = 'http://localhost:7456'

export const QUICK_COMMANDS = [
  { label: 'npm run dev', command: 'npm run dev' },
  { label: 'npm install', command: 'npm install' },
  { label: 'git status', command: 'git status' },
  { label: 'git pull', command: 'git pull' },
] as const

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'Brain', path: '/brain', icon: 'Brain' },
  { label: 'Hermes', path: '/hermes', icon: 'Radio' },
  { label: 'Explorer', path: '/explorer', icon: 'Compass' },
  { label: 'Live Call', path: '/live-call', icon: 'Video' },
  { label: 'Open Design', path: '/open-design', icon: 'Palette' },
  { label: 'Mission Control', path: '/mission-control', icon: 'Radar' },
  { label: 'Lector', path: '/lector', icon: 'BookOpen' },
  { label: 'Tools', path: '/tools', icon: 'Wrench' },
  { label: 'Projects', path: '/projects', icon: 'FolderKanban' },
  { label: 'Prompts', path: '/prompts', icon: 'MessageSquareText' },
  { label: 'Lab', path: '/lab', icon: 'FlaskConical' },
  { label: 'Notes', path: '/notes', icon: 'FileText' },
  { label: 'Terminal', path: '/terminal', icon: 'Terminal' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
] as const

export const TOOL_TYPES: { value: ToolType; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'terminal', label: 'Terminal' },
  { value: 'app', label: 'App' },
  { value: 'folder', label: 'Pasta' },
  { value: 'note', label: 'Nota' },
]

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'idea', label: 'Ideia', color: 'text-text-muted' },
  { value: 'testing', label: 'Testando', color: 'text-warning' },
  { value: 'building', label: 'Em desenvolvimento', color: 'text-blue' },
  { value: 'paused', label: 'Pausado', color: 'text-text-secondary' },
  { value: 'done', label: 'Finalizado', color: 'text-success' },
]

export const PROMPT_CATEGORIES: PromptCategory[] = [
  'Código',
  'Pesquisa',
  'Design',
  'Agentes',
  'MCP',
  'Debug',
  'Landing Page',
  'Produto',
  'Arquitetura',
]

export const TAGLINE = 'Organize, teste e acesse suas ferramentas de IA em um só lugar.'
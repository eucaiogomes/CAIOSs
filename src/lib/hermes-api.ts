import { HERMES_DASHBOARD_URL, HERMES_EXPLORER_PROFILE } from '@/lib/constants'
import { isTauri } from '@/lib/tauri-bridge'

const TOKEN_RE = /__HERMES_SESSION_TOKEN__="([^"]+)"/
const SESSION_HEADER = 'X-Hermes-Session-Token'

const tokenCache = new Map<string, string>()

export interface HermesModelProvider {
  name: string
  slug: string
  models?: string[]
  total_models?: number
  is_current?: boolean
  warning?: string
}

export interface HermesModelOptions {
  model?: string
  provider?: string
  providers?: HermesModelProvider[]
}

export interface HermesModelInfo {
  model?: string
  provider?: string
}

export interface HermesModelAssignmentResult {
  ok: boolean
  confirm_required?: boolean
  confirm_message?: string
  provider?: string
  model?: string
}

export function getHermesHttpRoot(): string {
  return isTauri() || typeof window === 'undefined'
    ? HERMES_DASHBOARD_URL
    : `${window.location.origin}/hermes-api`
}

export function getHermesHttpBase(profile?: string): string {
  return getHermesHttpRoot()
}

function hermesApiUrl(path: string, profile = 'default'): string {
  const root = getHermesHttpRoot()
  if (!profile || profile === 'default') return `${root}${path}`
  const sep = path.includes('?') ? '&' : '?'
  return `${root}${path}${sep}profile=${encodeURIComponent(profile)}`
}

export function getHermesWsUrl(token: string, profile?: string): string {
  if (isTauri()) {
    const base = `ws://127.0.0.1:9119/api/ws?token=${encodeURIComponent(token)}`
    if (!profile || profile === 'default') return base
    return `${base}&profile=${encodeURIComponent(profile)}`
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const base = `${proto}//${window.location.host}/hermes-api/api/ws?token=${encodeURIComponent(token)}`
  if (!profile || profile === 'default') return base
  return `${base}&profile=${encodeURIComponent(profile)}`
}

export function formatModelLabel(model?: string, provider?: string): string {
  if (!model && !provider) return 'Selecionar modelo'
  if (model && provider) return `${shortModelName(model)} · ${provider}`
  return model ?? provider ?? 'Modelo'
}

export function shortModelName(model: string): string {
  const slash = model.lastIndexOf('/')
  return slash >= 0 ? model.slice(slash + 1) : model
}

export function clearHermesTokenCache(profile?: string): void {
  if (profile) tokenCache.delete(profile)
  else tokenCache.clear()
}

export async function fetchHermesSessionToken(profile = 'default'): Promise<string> {
  const cached = tokenCache.get(profile)
  if (cached) return cached
  const tokenUrl =
    !profile || profile === 'default'
      ? `${getHermesHttpRoot()}/`
      : `${getHermesHttpRoot()}/?profile=${encodeURIComponent(profile)}`
  const res = await fetch(tokenUrl, { credentials: 'include' })
  if (!res.ok) throw new Error('Não foi possível obter token do Hermes')
  const html = await res.text()
  const match = html.match(TOKEN_RE)
  if (!match?.[1]) throw new Error('Token de sessão Hermes não encontrado')
  tokenCache.set(profile, match[1])
  return match[1]
}

async function hermesFetch<T>(path: string, init?: RequestInit, profile = 'default'): Promise<T> {
  const token = await fetchHermesSessionToken(profile)
  const headers = new Headers(init?.headers)
  headers.set(SESSION_HEADER, token)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(hermesApiUrl(path, profile), {
    ...init,
    headers,
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(body || `Hermes API erro ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchHermesModelInfo(profile = 'default'): Promise<HermesModelInfo> {
  return hermesFetch<HermesModelInfo>('/api/model/info', undefined, profile)
}

export async function fetchHermesModelOptions(profile = 'default'): Promise<HermesModelOptions> {
  return hermesFetch<HermesModelOptions>('/api/model/options', undefined, profile)
}

export interface HermesSessionInfo {
  id: string
  source: string | null
  model: string | null
  title: string | null
  started_at: number
  ended_at: number | null
  last_active: number
  is_active: boolean
  message_count: number
  preview: string | null
}

export interface HermesSessionsResponse {
  sessions: HermesSessionInfo[]
  total: number
  limit: number
  offset: number
}

export interface HermesSessionMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content?: string | null
  name?: string
  context?: string
}

export interface HermesSessionMessagesResponse {
  session_id: string
  messages: HermesSessionMessage[]
}

export async function fetchHermesSessions(
  limit = 30,
  offset = 0,
  order: 'recent' | 'created' = 'recent',
  profile = 'default',
): Promise<HermesSessionsResponse> {
  return hermesFetch<HermesSessionsResponse>(
    `/api/sessions?limit=${limit}&offset=${offset}&order=${order}`,
    undefined,
    profile,
  )
}

export async function fetchHermesSessionMessages(
  sessionId: string,
  profile = 'default',
): Promise<HermesSessionMessagesResponse> {
  return hermesFetch<HermesSessionMessagesResponse>(
    `/api/sessions/${encodeURIComponent(sessionId)}/messages`,
    undefined,
    profile,
  )
}

export interface HermesResumeMessage {
  role: 'user' | 'assistant' | 'tool' | 'system'
  text?: string
  content?: string | null
  name?: string
  context?: string
}

export interface HermesSessionResumeResult {
  session_id: string
  resumed?: string
  session_key?: string
  message_count: number
  messages: HermesResumeMessage[]
  running?: boolean
  status?: string
  inflight?: { text?: string } | null
}

export function formatSessionLabel(session: HermesSessionInfo): string {
  const title = session.title?.trim()
  if (title && title.toLowerCase() !== 'untitled') return title
  const preview = session.preview?.trim()
  if (preview) return preview.length > 60 ? `${preview.slice(0, 57)}…` : preview
  return 'Conversa sem título'
}

export function formatSessionTime(unixSeconds: number): string {
  const diff = Date.now() - unixSeconds * 1000
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'ontem'
  if (days < 7) return `${days} dias`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
    new Date(unixSeconds * 1000),
  )
}

export async function setHermesModelAssignment(
  provider: string,
  model: string,
  confirmExpensive = false,
  profile = 'default',
): Promise<HermesModelAssignmentResult> {
  return hermesFetch<HermesModelAssignmentResult>(
    '/api/model/set',
    {
      method: 'POST',
      body: JSON.stringify({
        scope: 'main',
        provider,
        model,
        confirm_expensive_model: confirmExpensive,
      }),
    },
    profile,
  )
}

export const HERMES_EXPLORER = HERMES_EXPLORER_PROFILE

// ── Kanban ──────────────────────────────────────────────────────────

export type KanbanTaskStatus =
  | 'triage'
  | 'todo'
  | 'scheduled'
  | 'ready'
  | 'running'
  | 'blocked'
  | 'review'
  | 'done'
  | 'archived'

export interface KanbanTask {
  id: string
  title: string
  body?: string | null
  assignee?: string | null
  status: KanbanTaskStatus
  priority: number
  tenant?: string | null
  created_at: number
  started_at?: number | null
  completed_at?: number | null
  latest_summary?: string | null
  result?: string | null
}

export interface KanbanColumn {
  name: KanbanTaskStatus
  tasks: KanbanTask[]
}

export interface KanbanBoardResponse {
  columns: KanbanColumn[]
  tenants: string[]
  assignees: string[]
  latest_event_id: number
  board?: string
}

export const KANBAN_COLUMN_LABELS: Record<string, string> = {
  triage: 'Triagem',
  todo: 'A fazer',
  scheduled: 'Agendado',
  ready: 'Pronto',
  running: 'Em andamento',
  blocked: 'Bloqueado',
  review: 'Revisão',
  done: 'Concluído',
}

export const KANBAN_ACTIVE_COLUMNS: KanbanTaskStatus[] = [
  'triage',
  'todo',
  'ready',
  'running',
  'blocked',
  'done',
]

export async function fetchHermesKanbanBoard(board?: string): Promise<KanbanBoardResponse> {
  const query = board ? `?board=${encodeURIComponent(board)}` : ''
  return hermesFetch<KanbanBoardResponse>(`/api/plugins/kanban/board${query}`)
}

// ── Cron ────────────────────────────────────────────────────────────

export interface HermesCronJob {
  id: string
  profile?: string | null
  profile_name?: string | null
  name?: string | null
  prompt?: string | null
  schedule?: { kind?: string; expr?: string; display?: string }
  schedule_display?: string | null
  enabled: boolean
  state?: string | null
  deliver?: string | null
  last_run_at?: string | null
  next_run_at?: string | null
  last_error?: string | null
}

export async function fetchHermesCronJobs(profile = 'all'): Promise<HermesCronJob[]> {
  return hermesFetch<HermesCronJob[]>(
    `/api/cron/jobs?profile=${encodeURIComponent(profile)}`,
  )
}

export async function pauseHermesCronJob(
  jobId: string,
  profile = 'default',
): Promise<HermesCronJob> {
  return hermesFetch<HermesCronJob>(
    `/api/cron/jobs/${encodeURIComponent(jobId)}/pause?profile=${encodeURIComponent(profile)}`,
    { method: 'POST' },
  )
}

export async function resumeHermesCronJob(
  jobId: string,
  profile = 'default',
): Promise<HermesCronJob> {
  return hermesFetch<HermesCronJob>(
    `/api/cron/jobs/${encodeURIComponent(jobId)}/resume?profile=${encodeURIComponent(profile)}`,
    { method: 'POST' },
  )
}

export async function triggerHermesCronJob(
  jobId: string,
  profile = 'default',
): Promise<HermesCronJob> {
  return hermesFetch<HermesCronJob>(
    `/api/cron/jobs/${encodeURIComponent(jobId)}/trigger?profile=${encodeURIComponent(profile)}`,
    { method: 'POST' },
  )
}

export function formatCronSchedule(job: HermesCronJob): string {
  return job.schedule_display ?? job.schedule?.display ?? job.schedule?.expr ?? '—'
}

export function formatCronTime(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const future = diff < 0
  const abs = Math.abs(diff)
  const mins = Math.floor(abs / 60_000)
  if (mins < 1) return future ? 'em breve' : 'agora'
  if (mins < 60) return future ? `em ${mins} min` : `${mins} min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return future ? `em ${hours}h` : `${hours}h atrás`
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function agentIconForAssignee(assignee?: string | null): string {
  const key = (assignee ?? '').toLowerCase()
  if (key.includes('hermes') || key === 'default' || key === 'orchestrator') return '📡'
  if (key.includes('codex')) return '⚡'
  if (key.includes('claude')) return '🤖'
  if (key.includes('grok')) return '🧠'
  if (key.includes('opencode')) return '🔧'
  return '🤖'
}
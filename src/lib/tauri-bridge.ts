import { invoke, isTauri as checkTauri } from '@tauri-apps/api/core'

export function isTauri(): boolean {
  return checkTauri()
}

export async function openUrl(url: string): Promise<void> {
  if (isTauri()) {
    await invoke('open_url', { url })
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

export async function openPath(path: string): Promise<void> {
  if (isTauri()) {
    await invoke('open_path', { path })
    return
  }
  console.info('[CaiOS] openPath (browser fallback):', path)
}

export async function openInternalWebview(url: string, title: string): Promise<boolean> {
  if (isTauri()) {
    await invoke('open_internal_webview', { url, title })
    return true
  }
  return false
}

export interface PtySpawnOptions {
  sessionId: string
  command: string
  cwd?: string
  cols?: number
  rows?: number
}

export async function ptySpawn(options: PtySpawnOptions): Promise<void> {
  if (!isTauri()) return
  await invoke('pty_spawn', {
    sessionId: options.sessionId,
    command: options.command,
    cwd: options.cwd ?? null,
    cols: options.cols ?? 120,
    rows: options.rows ?? 30,
  })
}

export async function ptyWrite(sessionId: string, data: string): Promise<void> {
  if (!isTauri()) return
  await invoke('pty_write', { sessionId, data })
}

export async function ptyResize(sessionId: string, cols: number, rows: number): Promise<void> {
  if (!isTauri()) return
  await invoke('pty_resize', { sessionId, cols, rows })
}

export async function ptyKill(sessionId: string): Promise<void> {
  if (!isTauri()) return
  await invoke('pty_kill', { sessionId })
}

export function ptyOutputEvent(sessionId: string): string {
  return `pty-output-${sessionId}`
}

export function defaultShellCommand(): string {
  return navigator.platform.toLowerCase().includes('win') ? 'powershell.exe' : 'bash'
}

export async function pickFolder(): Promise<string | null> {
  if (!isTauri()) return null
  return invoke<string | null>('pick_folder')
}

export interface ClaudeDetection {
  path: string
  version?: string
}

export type CliDetection = ClaudeDetection

async function detectFromServer(endpoint: string): Promise<ClaudeDetection | null> {
  try {
    const res = await fetch(`http://localhost:1421${endpoint}`)
    const data = await res.json() as { found: boolean; path?: string; version?: string }
    if (!data.found || !data.path) return null
    return { path: data.path, version: data.version }
  } catch {
    return null
  }
}

export async function detectClaude(): Promise<ClaudeDetection | null> {
  if (isTauri()) return invoke<ClaudeDetection | null>('detect_claude')
  return detectFromServer('/detect/claude')
}

export async function detectCodex(): Promise<ClaudeDetection | null> {
  if (isTauri()) return invoke<ClaudeDetection | null>('detect_codex')
  return detectFromServer('/detect/codex')
}

export async function detectGrok(): Promise<ClaudeDetection | null> {
  if (isTauri()) return invoke<ClaudeDetection | null>('detect_grok')
  return detectFromServer('/detect/grok')
}

export async function detectHermes(): Promise<ClaudeDetection | null> {
  if (isTauri()) return invoke<ClaudeDetection | null>('detect_hermes')
  return detectFromServer('/detect/hermes')
}

function detectEndpointForCommand(command: string): string {
  const lower = command.toLowerCase()
  if (lower.includes('hermes')) return '/detect/hermes'
  if (lower.includes('codex')) return '/detect/codex'
  if (lower.includes('grok')) return '/detect/grok'
  return '/detect/claude'
}

export interface HermesDashboardStatus {
  online: boolean
  starting: boolean
  error?: string
}

export async function hermesDashboardStatus(): Promise<HermesDashboardStatus> {
  if (isTauri()) {
    return invoke<HermesDashboardStatus>('hermes_dashboard_status')
  }
  try {
    const res = await fetch('http://localhost:1421/hermes/dashboard/status')
    return (await res.json()) as HermesDashboardStatus
  } catch {
    return { online: false, starting: false, error: 'PTY server indisponível' }
  }
}

export async function hermesDashboardStart(): Promise<HermesDashboardStatus> {
  if (isTauri()) {
    return invoke<HermesDashboardStatus>('hermes_dashboard_start')
  }
  const res = await fetch('http://localhost:1421/hermes/dashboard/start', { method: 'POST' })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Falha ao iniciar dashboard')
  }
  return (await res.json()) as HermesDashboardStatus
}

export async function verifyCli(command: string): Promise<string> {
  if (isTauri()) return invoke<string>('verify_cli', { command })
  const endpoint = detectEndpointForCommand(command)
  const res = await fetch(`http://localhost:1421${endpoint}`)
  const data = await res.json() as { found: boolean; version?: string }
  const label = endpoint.includes('hermes')
    ? 'Hermes'
    : endpoint.includes('codex')
      ? 'Codex'
      : endpoint.includes('grok')
        ? 'Grok'
        : 'Claude Code'
  if (!data.found) throw new Error(`${label} não encontrado`)
  return data.version ?? 'OK'
}
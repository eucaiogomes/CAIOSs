import { HERMES_DASHBOARD_URL } from '@/lib/constants'
import * as tauriBridge from '@/lib/tauri-bridge'

const PTY_BASE = 'http://localhost:1421'
const POLL_INTERVAL_MS = 800
const DEFAULT_TIMEOUT_MS = 180_000

export type HermesDashboardPhase =
  | 'checking'
  | 'starting'
  | 'waiting'
  | 'online'
  | 'error'

export interface HermesDashboardStatus {
  online: boolean
  starting?: boolean
  error?: string
}

async function fetchStatus(): Promise<HermesDashboardStatus> {
  if (tauriBridge.isTauri()) {
    return tauriBridge.hermesDashboardStatus()
  }
  try {
    const res = await fetch(`${PTY_BASE}/hermes/dashboard/status`)
    return (await res.json()) as HermesDashboardStatus
  } catch {
    return { online: false, error: 'Servidor CaiOS PTY indisponível' }
  }
}

async function requestStart(): Promise<void> {
  if (tauriBridge.isTauri()) {
    await tauriBridge.hermesDashboardStart()
    return
  }
  const res = await fetch(`${PTY_BASE}/hermes/dashboard/start`, { method: 'POST' })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Falha ao iniciar Hermes dashboard')
  }
}

export async function isDashboardOnline(): Promise<boolean> {
  const status = await fetchStatus()
  return status.online
}

export async function ensureDashboard(
  onPhase?: (phase: HermesDashboardPhase) => void,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<boolean> {
  onPhase?.('checking')
  const initial = await fetchStatus()
  if (initial.online) {
    onPhase?.('online')
    return true
  }

  onPhase?.('starting')
  try {
    await requestStart()
  } catch (err) {
    onPhase?.('error')
    throw err
  }

  onPhase?.('waiting')
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    const status = await fetchStatus()
    if (status.online) {
      onPhase?.('online')
      return true
    }
  }

  onPhase?.('error')
  return false
}

export function getDashboardUrl(): string {
  return HERMES_DASHBOARD_URL
}
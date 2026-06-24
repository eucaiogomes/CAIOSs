import { OPEN_DESIGN_URL } from '@/lib/constants'

const PTY_BASE = 'http://localhost:1421'
const POLL_INTERVAL_MS = 1500
const DEFAULT_TIMEOUT_MS = 300_000

export type OpenDesignPhase =
  | 'checking'
  | 'starting'
  | 'waiting'
  | 'online'
  | 'error'

export interface OpenDesignStatus {
  online: boolean
  starting?: boolean
  error?: string
  url?: string
  deployDir?: string
}

async function fetchStatus(): Promise<OpenDesignStatus> {
  try {
    const res = await fetch(`${PTY_BASE}/open-design/status`)
    return (await res.json()) as OpenDesignStatus
  } catch {
    return { online: false, error: 'Servidor CaiOS PTY indisponível — rode npm run dev' }
  }
}

async function requestStart(): Promise<void> {
  const res = await fetch(`${PTY_BASE}/open-design/start`, { method: 'POST' })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Falha ao iniciar Open Design')
  }
}

export async function isOpenDesignOnline(): Promise<boolean> {
  const status = await fetchStatus()
  return status.online
}

export async function ensureOpenDesign(
  onPhase?: (phase: OpenDesignPhase) => void,
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

export function getOpenDesignUrl(): string {
  return OPEN_DESIGN_URL
}

export async function getOpenDesignStatus(): Promise<OpenDesignStatus> {
  return fetchStatus()
}
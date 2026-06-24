const CDP_API = 'http://localhost:1421'

export interface ExplorerCdpStatus {
  connected: boolean
  port: number
  url: string
  title: string
  eventCount: number
  networkCount: number
  hasFrame: boolean
}

export interface ExplorerCdpNetworkEntry {
  id: string
  at: string
  url: string
  method: string
  headers?: Record<string, string>
  postData?: string
  type?: string
  status: number | null
  responseHeaders?: Record<string, string>
  mimeType?: string | null
  responseBody?: string | null
}

export interface ExplorerCdpEvent {
  id: string
  at: string
  kind: string
  label: string
  detail?: string
  url?: string
  payload?: Record<string, unknown>
}

export interface ExplorerCdpSnapshot {
  at: string
  url: string
  title: string
  screenshot: string | null
  cookies: Array<{
    name: string
    value: string
    domain: string
    path: string
    secure?: boolean
    httpOnly?: boolean
    sameSite?: string
  }>
  storage: {
    local: Array<{ origin: string; entries: [string, string][] }>
    session: Array<{ origin: string; entries: [string, string][] }>
  }
  network: ExplorerCdpNetworkEntry[]
  events: ExplorerCdpEvent[]
  eventCount: number
  networkCount: number
}

async function cdpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${CDP_API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(body || `CDP API erro ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function getExplorerCdpStreamUrl(): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  if (window.location.port === '1420') {
    return `${proto}//${window.location.hostname}:1421/explorer/cdp/stream`
  }
  return `${proto}//localhost:1421/explorer/cdp/stream`
}

export const explorerCdpService = {
  async status(): Promise<ExplorerCdpStatus> {
    return cdpFetch<ExplorerCdpStatus>('/explorer/cdp/status')
  },

  async connect(): Promise<{ connected: boolean; port: number; url: string }> {
    return cdpFetch('/explorer/cdp/connect', { method: 'POST' })
  },

  async navigate(url: string): Promise<{ url: string }> {
    return cdpFetch('/explorer/cdp/navigate', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  },

  async snapshot(): Promise<ExplorerCdpSnapshot> {
    return cdpFetch('/explorer/cdp/snapshot', { method: 'POST' })
  },

  async screenshot(): Promise<{ data: string | null }> {
    return cdpFetch('/explorer/cdp/screenshot')
  },

  async clear(): Promise<void> {
    await cdpFetch('/explorer/cdp/clear', { method: 'POST' })
  },
}
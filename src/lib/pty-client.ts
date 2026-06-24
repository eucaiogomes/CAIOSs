type PtyMessage =
  | { type: 'output'; sessionId: string; data: string }
  | { type: 'spawned'; sessionId: string; command: string; cwd: string }
  | { type: 'exit'; sessionId: string }
  | { type: 'error'; message: string }

export interface PtySpawnOptions {
  sessionId: string
  command: string
  cwd?: string
  cols?: number
  rows?: number
}

const WS_URL = 'ws://localhost:1421'

let ws: WebSocket | null = null
let connecting: Promise<WebSocket> | null = null
const listeners = new Map<string, Set<(data: string) => void>>()
const exitListeners = new Map<string, Set<() => void>>()

function connect(): Promise<WebSocket> {
  if (ws?.readyState === WebSocket.OPEN) return Promise.resolve(ws)
  if (connecting) return connecting

  connecting = new Promise((resolve, reject) => {
    const socket = new WebSocket(WS_URL)
    socket.onopen = () => {
      ws = socket
      connecting = null
      resolve(socket)
    }
    socket.onerror = () => {
      connecting = null
      reject(new Error('PTY server offline — rode npm run dev'))
    }
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as PtyMessage
        if (msg.type === 'output') {
          listeners.get(msg.sessionId)?.forEach((fn) => fn(msg.data))
        }
        if (msg.type === 'exit') {
          exitListeners.get(msg.sessionId)?.forEach((fn) => fn())
        }
      } catch {
        // ignore
      }
    }
    socket.onclose = () => {
      ws = null
    }
  })

  return connecting
}

export async function isPtyServerAvailable(): Promise<boolean> {
  try {
    await connect()
    return true
  } catch {
    return false
  }
}

export async function ptySpawn(options: PtySpawnOptions): Promise<void> {
  const socket = await connect()
  socket.send(
    JSON.stringify({
      type: 'spawn',
      sessionId: options.sessionId,
      command: options.command,
      cwd: options.cwd,
      cols: options.cols ?? 120,
      rows: options.rows ?? 30,
    })
  )
}

export async function ptyWrite(sessionId: string, data: string): Promise<void> {
  const socket = await connect()
  socket.send(JSON.stringify({ type: 'write', sessionId, data }))
}

export async function ptyResize(sessionId: string, cols: number, rows: number): Promise<void> {
  const socket = await connect()
  socket.send(JSON.stringify({ type: 'resize', sessionId, cols, rows }))
}

export async function ptyKill(sessionId: string): Promise<void> {
  const socket = await connect()
  socket.send(JSON.stringify({ type: 'kill', sessionId }))
}

export function onPtyOutput(sessionId: string, handler: (data: string) => void): () => void {
  if (!listeners.has(sessionId)) listeners.set(sessionId, new Set())
  listeners.get(sessionId)!.add(handler)
  return () => listeners.get(sessionId)?.delete(handler)
}

export function onPtyExit(sessionId: string, handler: () => void): () => void {
  if (!exitListeners.has(sessionId)) exitListeners.set(sessionId, new Set())
  exitListeners.get(sessionId)!.add(handler)
  return () => exitListeners.get(sessionId)?.delete(handler)
}
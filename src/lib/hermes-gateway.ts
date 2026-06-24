export type GatewayEventName =
  | 'gateway.ready'
  | 'session.info'
  | 'message.start'
  | 'message.delta'
  | 'message.complete'
  | 'thinking.delta'
  | 'reasoning.delta'
  | 'status.update'
  | 'tool.start'
  | 'tool.progress'
  | 'tool.complete'
  | 'error'
  | (string & {})

export interface GatewayEvent<P = unknown> {
  type: GatewayEventName
  session_id?: string
  payload?: P
}

export type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

interface Pending {
  resolve: (v: unknown) => void
  reject: (e: Error) => void
  timer: ReturnType<typeof setTimeout>
}

const ANY = '*'

export class HermesGateway {
  private ws: WebSocket | null = null
  private reqId = 0
  private pending = new Map<string, Pending>()
  private listeners = new Map<string, Set<(ev: GatewayEvent) => void>>()
  private _state: ConnectionState = 'idle'
  private stateListeners = new Set<(s: ConnectionState) => void>()

  get state(): ConnectionState {
    return this._state
  }

  private setState(s: ConnectionState) {
    if (this._state === s) return
    this._state = s
    for (const cb of this.stateListeners) cb(s)
  }

  onState(cb: (s: ConnectionState) => void): () => void {
    this.stateListeners.add(cb)
    cb(this._state)
    return () => this.stateListeners.delete(cb)
  }

  on<P = unknown>(type: GatewayEventName, cb: (ev: GatewayEvent<P>) => void): () => void {
    let set = this.listeners.get(type)
    if (!set) {
      set = new Set()
      this.listeners.set(type, set)
    }
    set.add(cb as (ev: GatewayEvent) => void)
    return () => set!.delete(cb as (ev: GatewayEvent) => void)
  }

  onAny(cb: (ev: GatewayEvent) => void): () => void {
    return this.on(ANY as GatewayEventName, cb)
  }

  async connect(wsUrl: string): Promise<void> {
    if (this._state === 'open' || this._state === 'connecting') return
    this.setState('connecting')

    const ws = new WebSocket(wsUrl)
    this.ws = ws

    ws.addEventListener('message', (ev) => {
      try {
        this.dispatch(JSON.parse(ev.data as string) as Record<string, unknown>)
      } catch {
        /* ignore malformed */
      }
    })

    ws.addEventListener('close', () => {
      this.setState('closed')
      this.rejectAllPending(new Error('WebSocket fechado'))
    })

    await new Promise<void>((resolve, reject) => {
      const onOpen = () => {
        ws.removeEventListener('error', onError)
        this.setState('open')
        resolve()
      }
      const onError = () => {
        ws.removeEventListener('open', onOpen)
        this.setState('error')
        reject(new Error('Falha na conexão WebSocket'))
      }
      ws.addEventListener('open', onOpen, { once: true })
      ws.addEventListener('error', onError, { once: true })
    })
  }

  close() {
    this.ws?.close()
    this.ws = null
  }

  private dispatch(msg: Record<string, unknown>) {
    const id = msg.id as string | undefined

    if (id !== undefined && this.pending.has(id)) {
      const p = this.pending.get(id)!
      this.pending.delete(id)
      clearTimeout(p.timer)

      const err = msg.error as { message?: string } | undefined
      if (err) p.reject(new Error(err.message ?? 'request failed'))
      else p.resolve(msg.result)
      return
    }

    if (msg.method !== 'event') return

    const params = (msg.params ?? {}) as GatewayEvent
    if (typeof params.type !== 'string') return

    for (const cb of this.listeners.get(params.type) ?? []) cb(params)
    for (const cb of this.listeners.get(ANY) ?? []) cb(params)
  }

  private rejectAllPending(err: Error) {
    for (const p of this.pending.values()) {
      clearTimeout(p.timer)
      p.reject(err)
    }
    this.pending.clear()
  }

  request<T = unknown>(
    method: string,
    params: Record<string, unknown> = {},
    timeoutMs = 120_000,
  ): Promise<T> {
    if (!this.ws || this._state !== 'open') {
      return Promise.reject(new Error(`Gateway desconectado (${this._state})`))
    }

    const id = `c${++this.reqId}`

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`Timeout: ${method}`))
      }, timeoutMs)

      this.pending.set(id, {
        resolve: (v) => resolve(v as T),
        reject,
        timer,
      })

      try {
        this.ws!.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }))
      } catch (e) {
        clearTimeout(timer)
        this.pending.delete(id)
        reject(e instanceof Error ? e : new Error(String(e)))
      }
    })
  }
}
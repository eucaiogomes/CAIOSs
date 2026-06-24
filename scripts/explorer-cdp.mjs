import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { WebSocket } from 'ws'

const CDP_PORT = 9233
const CDP_HOST = '127.0.0.1'

/** @type {import('ws').WebSocketServer | null} */
let screencastWss = null

function findBrowserExecutable() {
  const candidates = [
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ]
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p
  }
  return null
}

function explorerProfileDir() {
  const dir = path.join(process.env.LOCALAPPDATA || os.homedir(), 'caios', 'explorer-cdp-profile')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function cdpHttpGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      { hostname: CDP_HOST, port: CDP_PORT, path: pathname, timeout: 3000 },
      (res) => {
        let body = ''
        res.on('data', (c) => { body += c })
        res.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch (err) {
            reject(err)
          }
        })
      },
    )
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('CDP timeout'))
    })
  })
}

function isCdpPortOpen() {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: CDP_HOST, port: CDP_PORT, path: '/json/version', timeout: 800 },
      (res) => {
        resolve(res.statusCode !== undefined && res.statusCode < 500)
        res.resume()
      },
    )
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
  })
}

class CdpConnection {
  constructor() {
    this.ws = null
    this.msgId = 1
    this.pending = new Map()
    this.listeners = new Set()
  }

  connect(wsUrl) {
    return new Promise((resolve, reject) => {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
      const ws = new WebSocket(wsUrl)
      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('CDP WebSocket timeout'))
      }, 8000)

      ws.on('open', () => {
        clearTimeout(timeout)
        this.ws = ws
        resolve()
      })
      ws.on('message', (raw) => {
        let msg
        try {
          msg = JSON.parse(raw.toString())
        } catch {
          return
        }
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve: res, reject: rej } = this.pending.get(msg.id)
          this.pending.delete(msg.id)
          if (msg.error) rej(new Error(msg.error.message || 'CDP error'))
          else res(msg.result)
          return
        }
        if (msg.method) {
          for (const fn of this.listeners) fn(msg)
        }
      })
      ws.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
      ws.on('close', () => {
        this.ws = null
      })
    })
  }

  onEvent(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('CDP desconectado'))
        return
      }
      const id = this.msgId++
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id)
          reject(new Error(`CDP timeout: ${method}`))
        }
      }, 20000)
    })
  }

  close() {
    this.ws?.close()
    this.ws = null
    this.pending.clear()
    this.listeners.clear()
  }
}

class ExplorerCdpSession {
  constructor() {
    this.browserProc = null
    this.cdp = new CdpConnection()
    this.targetId = null
    this.wsUrl = null
    this.currentUrl = 'about:blank'
    this.title = ''
    this.connected = false
    this.screencastActive = false
    this.lastFrame = null
    this.events = []
    this.network = []
    this.requestMap = new Map()
    this.maxEvents = 500
    this.maxNetwork = 300
    this.unsubscribe = null
  }

  pushEvent(kind, label, detail, extra = {}) {
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toISOString(),
      kind,
      label,
      detail,
      url: this.currentUrl,
      ...extra,
    }
    this.events.unshift(event)
    if (this.events.length > this.maxEvents) this.events.length = this.maxEvents
    this.broadcastScreencast({ type: 'event', event })
    return event
  }

  broadcastScreencast(payload) {
    if (!screencastWss) return
    const data = JSON.stringify(payload)
    for (const client of screencastWss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data)
        } catch {
          /* ignore */
        }
      }
    }
  }

  async ensureBrowser() {
    if (await isCdpPortOpen()) return

    const exe = findBrowserExecutable()
    if (!exe) throw new Error('Chrome/Edge não encontrado para CDP')

    const userDataDir = explorerProfileDir()
    const args = [
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-popup-blocking',
      'about:blank',
    ]

    this.browserProc = spawn(exe, args, {
      detached: false,
      stdio: 'ignore',
      windowsHide: false,
    })
    this.browserProc.on('error', () => {})
    this.browserProc.unref?.()

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 200))
      if (await isCdpPortOpen()) return
    }
    throw new Error('CDP browser não iniciou a tempo')
  }

  async pickTarget() {
    const targets = await cdpHttpGet('/json/list')
    const page = targets.find((t) => t.type === 'page' && !t.url.startsWith('chrome-extension'))
    if (!page) throw new Error('Nenhuma aba CDP disponível')
    this.targetId = page.id
    this.wsUrl = page.webSocketDebuggerUrl
    this.currentUrl = page.url || 'about:blank'
    this.title = page.title || ''
    return page
  }

  wireEvents() {
    if (this.unsubscribe) this.unsubscribe()
    this.unsubscribe = this.cdp.onEvent((msg) => {
      const { method, params } = msg

      if (method === 'Page.frameNavigated' && params?.frame?.parentId == null) {
        const url = params.frame.url || ''
        this.currentUrl = url
        this.title = params.frame.name || this.title
        this.pushEvent('navigation', 'Navegação CDP', url)
      }

      if (method === 'Page.screencastFrame' && params?.data) {
        this.lastFrame = `data:image/jpeg;base64,${params.data}`
        this.broadcastScreencast({ type: 'frame', data: this.lastFrame })
        void this.cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {})
      }

      if (method === 'Network.requestWillBeSent') {
        const req = params.request || {}
        const id = params.requestId
        const entry = {
          id,
          at: new Date().toISOString(),
          url: req.url,
          method: req.method,
          headers: req.headers,
          postData: req.postData,
          type: params.type,
          status: null,
          responseHeaders: null,
          mimeType: null,
          responseBody: null,
        }
        this.requestMap.set(id, entry)
        const short = req.url?.length > 120 ? `${req.url.slice(0, 120)}…` : req.url
        this.pushEvent('network', `${req.method} ${short}`, req.postData?.slice(0, 200), {
          payload: { requestId: id, method: req.method, url: req.url },
        })
      }

      if (method === 'Network.responseReceived') {
        const id = params.requestId
        const entry = this.requestMap.get(id)
        if (entry) {
          entry.status = params.response?.status
          entry.responseHeaders = params.response?.headers
          entry.mimeType = params.response?.mimeType
        }
      }

      if (method === 'Network.loadingFinished') {
        const id = params.requestId
        const entry = this.requestMap.get(id)
        if (entry) {
          this.network.unshift({ ...entry })
          if (this.network.length > this.maxNetwork) this.network.length = this.maxNetwork
          void this.fetchResponseBody(id, entry)
        }
      }

      if (method === 'Runtime.consoleAPICalled') {
        const args = (params.args || []).map((a) => a.value ?? a.description ?? '').join(' ')
        if (args) this.pushEvent('evidence', `Console.${params.type}`, args.slice(0, 300))
      }
    })
  }

  async fetchResponseBody(requestId, entry) {
    try {
      const body = await this.cdp.send('Network.getResponseBody', { requestId })
      entry.responseBody = body.base64Encoded
        ? Buffer.from(body.body, 'base64').toString('utf8').slice(0, 8000)
        : (body.body || '').slice(0, 8000)
    } catch {
      /* cross-origin or binary */
    }
  }

  async connect() {
    await this.ensureBrowser()
    await this.pickTarget()
    await this.cdp.connect(this.wsUrl)
    this.wireEvents()

    await this.cdp.send('Page.enable')
    await this.cdp.send('Network.enable', { maxTotalBufferSize: 10000000, maxResourceBufferSize: 5000000 })
    await this.cdp.send('Runtime.enable')
    await this.cdp.send('DOMStorage.enable')
    await this.cdp.send('Network.setCacheDisabled', { cacheDisabled: true })

    this.connected = true
    this.pushEvent('system', 'CDP conectado', `Porta ${CDP_PORT}`)
    return { connected: true, port: CDP_PORT, url: this.currentUrl }
  }

  async navigate(url) {
    if (!this.connected) await this.connect()
    await this.cdp.send('Page.navigate', { url })
    this.currentUrl = url
    this.pushEvent('navigation', 'Navegação solicitada', url)
    await this.startScreencast()
    return { url }
  }

  async startScreencast() {
    if (this.screencastActive) return
    try {
      await this.cdp.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 60,
        maxWidth: 1280,
        maxHeight: 800,
        everyNthFrame: 2,
      })
      this.screencastActive = true
    } catch {
      /* fallback to screenshot polling */
    }
  }

  async screenshot() {
    if (!this.connected) return { data: this.lastFrame }
    if (this.lastFrame) return { data: this.lastFrame }
    try {
      const shot = await this.cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 55 })
      this.lastFrame = `data:image/jpeg;base64,${shot.data}`
      return { data: this.lastFrame }
    } catch {
      return { data: null }
    }
  }

  async getCookies() {
    if (!this.connected) return []
    try {
      const { cookies } = await this.cdp.send('Network.getAllCookies')
      return cookies || []
    } catch {
      return []
    }
  }

  async getStorage() {
    if (!this.connected) return { local: [], session: [] }
    const local = []
    const session = []
    try {
      const { origins } = await this.cdp.send('Storage.getStorageKeyForFrame', {
        frameId: (await this.cdp.send('Page.getFrameTree')).frameTree?.frame?.id,
      }).catch(() => ({ origins: [] }))

      // Enumerate DOM storage via targets
      const frames = await this.cdp.send('Page.getFrameTree')
      const collect = async (frame) => {
        if (!frame?.frame?.id) return
        const frameId = frame.frame.id
        const securityOrigin = frame.frame.securityOrigin || frame.frame.url
        if (!securityOrigin || securityOrigin === '://') {
          if (frame.childFrames) {
            for (const child of frame.childFrames) await collect(child)
          }
          return
        }
        try {
          const localId = await this.cdp.send('DOMStorage.getDOMStorageItems', {
            storageId: { securityOrigin, isLocalStorage: true },
          })
          if (localId?.entries?.length) {
            local.push({ origin: securityOrigin, entries: localId.entries })
          }
        } catch { /* */ }
        try {
          const sessionId = await this.cdp.send('DOMStorage.getDOMStorageItems', {
            storageId: { securityOrigin, isLocalStorage: false },
          })
          if (sessionId?.entries?.length) {
            session.push({ origin: securityOrigin, entries: sessionId.entries })
          }
        } catch { /* */ }
        if (frame.childFrames) {
          for (const child of frame.childFrames) await collect(child)
        }
      }
      await collect(frames.frameTree)
    } catch {
      /* ignore */
    }
    return { local, session }
  }

  async snapshot() {
    const [cookies, storage, shot] = await Promise.all([
      this.getCookies(),
      this.getStorage(),
      this.screenshot(),
    ])
    return {
      at: new Date().toISOString(),
      url: this.currentUrl,
      title: this.title,
      screenshot: shot.data,
      cookies,
      storage,
      network: this.network.slice(0, 100),
      events: this.events.slice(0, 100),
      eventCount: this.events.length,
      networkCount: this.network.length,
    }
  }

  status() {
    return {
      connected: this.connected,
      port: CDP_PORT,
      url: this.currentUrl,
      title: this.title,
      eventCount: this.events.length,
      networkCount: this.network.length,
      hasFrame: Boolean(this.lastFrame),
    }
  }

  getEvents() {
    return { events: this.events, network: this.network }
  }

  clearEvents() {
    this.events = []
    this.network = []
    this.requestMap.clear()
  }

  disconnect() {
    this.screencastActive = false
    this.unsubscribe?.()
    this.unsubscribe = null
    this.cdp.close()
    this.connected = false
  }
}

const session = new ExplorerCdpSession()

export function bindExplorerCdpBroadcast(wss) {
  screencastWss = wss
}

export async function handleExplorerCdpRequest(url, req, res, readBody) {
  if (!url.pathname.startsWith('/explorer/cdp/')) return false

  try {
    if (url.pathname === '/explorer/cdp/status' && req.method === 'GET') {
      jsonResponse(res, 200, session.status())
      return true
    }

    if (url.pathname === '/explorer/cdp/connect' && req.method === 'POST') {
      const result = await session.connect()
      jsonResponse(res, 200, result)
      return true
    }

    if (url.pathname === '/explorer/cdp/navigate' && req.method === 'POST') {
      const body = await readBody(req)
      if (!body.url) {
        jsonResponse(res, 400, { error: 'url obrigatória' })
        return true
      }
      const result = await session.navigate(body.url)
      jsonResponse(res, 200, result)
      return true
    }

    if (url.pathname === '/explorer/cdp/events' && req.method === 'GET') {
      jsonResponse(res, 200, session.getEvents())
      return true
    }

    if (url.pathname === '/explorer/cdp/screenshot' && req.method === 'GET') {
      const shot = await session.screenshot()
      jsonResponse(res, 200, shot)
      return true
    }

    if (url.pathname === '/explorer/cdp/snapshot' && req.method === 'POST') {
      const snap = await session.snapshot()
      jsonResponse(res, 200, snap)
      return true
    }

    if (url.pathname === '/explorer/cdp/clear' && req.method === 'POST') {
      session.clearEvents()
      jsonResponse(res, 200, { ok: true })
      return true
    }

    if (url.pathname === '/explorer/cdp/disconnect' && req.method === 'POST') {
      session.disconnect()
      jsonResponse(res, 200, { ok: true })
      return true
    }

    jsonResponse(res, 404, { error: 'rota CDP não encontrada' })
    return true
  } catch (err) {
    jsonResponse(res, 500, { error: err instanceof Error ? err.message : 'Erro CDP' })
    return true
  }
}

function jsonResponse(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(data))
}

export function handleExplorerCdpWs(ws, req) {
  const url = new URL(req.url || '/', `http://127.0.0.1`)
  if (url.pathname !== '/explorer/cdp/stream') return false

  if (session.lastFrame) {
    ws.send(JSON.stringify({ type: 'frame', data: session.lastFrame }))
  }
  for (const event of session.events.slice(0, 20)) {
    ws.send(JSON.stringify({ type: 'event', event }))
  }

  return true
}
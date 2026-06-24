import { spawn } from 'node:child_process'
import http from 'node:http'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import {
  bindExplorerCdpBroadcast,
  handleExplorerCdpRequest,
  handleExplorerCdpWs,
} from './explorer-cdp.mjs'
const PORT = 1421
const HERMES_DASHBOARD_PORT = 9119
const OPEN_DESIGN_PORT = 7456
const sessions = new Map()
let hermesDashboardStarting = false
let openDesignStarting = false

function openDesignDeployDir() {
  const candidates = [
    path.join(process.cwd(), 'caios-data', 'open-design', 'repo', 'deploy'),
    path.join(process.cwd(), 'caios-data', 'open-design', 'deploy'),
    path.join(process.env.USERPROFILE || os.homedir(), 'caios', 'caios-data', 'open-design', 'repo', 'deploy'),
    path.join(process.env.USERPROFILE || os.homedir(), 'caios', 'caios-data', 'open-design', 'deploy'),
  ]
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'docker-compose.yml'))) return dir
  }
  return candidates[1]
}

function checkHermesDashboardOnline() {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port: HERMES_DASHBOARD_PORT,
        path: '/',
        timeout: 500,
      },
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

function hermesWebDistReady() {
  const local = process.env.LOCALAPPDATA
  if (!local) return false
  const index = path.join(local, 'hermes', 'hermes-agent', 'hermes_cli', 'web_dist', 'index.html')
  return fs.existsSync(index)
}

async function startHermesDashboard() {
  if (await checkHermesDashboardOnline()) {
    return { online: true, starting: false }
  }
  if (hermesDashboardStarting) {
    return { online: false, starting: true }
  }

  const exe = defaultHermesPath()
  if (!fs.existsSync(exe)) {
    throw new Error('Hermes não encontrado. Configure em Settings.')
  }

  const args = ['dashboard', '--no-open']
  if (hermesWebDistReady()) args.push('--skip-build')

  hermesDashboardStarting = true
  const proc = spawn(exe, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    env: process.env,
  })
  proc.unref()
  proc.on('error', () => {
    hermesDashboardStarting = false
  })

  return { online: false, starting: true }
}

function checkOpenDesignOnline() {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port: OPEN_DESIGN_PORT,
        path: '/api/health',
        timeout: 1200,
      },
      (res) => {
        resolve(res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300)
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

function runDockerCompose(args, deployDir) {
  return new Promise((resolve, reject) => {
    const proc = spawn('docker', ['compose', ...args], {
      cwd: deployDir,
      stdio: 'pipe',
      windowsHide: true,
      env: process.env,
    })
    let stderr = ''
    proc.stderr?.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    proc.on('close', (code) => {
      if (code === 0) resolve(stderr)
      else reject(new Error(stderr.trim() || `docker compose ${args.join(' ')} falhou (exit ${code})`))
    })
    proc.on('error', (err) => reject(err))
  })
}

async function startOpenDesign() {
  if (await checkOpenDesignOnline()) {
    return { online: true, starting: false }
  }
  if (openDesignStarting) {
    return { online: false, starting: true }
  }

  const deployDir = openDesignDeployDir()
  if (!fs.existsSync(path.join(deployDir, 'docker-compose.yml'))) {
    throw new Error(`Open Design não configurado em ${deployDir}`)
  }

  openDesignStarting = true
  try {
    await runDockerCompose(['up', '-d'], deployDir)
  } catch (err) {
    openDesignStarting = false
    throw err
  }

  return { online: false, starting: true }
}

async function stopOpenDesign() {
  const deployDir = openDesignDeployDir()
  if (!fs.existsSync(path.join(deployDir, 'docker-compose.yml'))) {
    throw new Error(`Open Design não configurado em ${deployDir}`)
  }
  await runDockerCompose(['down'], deployDir)
  openDesignStarting = false
  return { online: false, starting: false }
}

let ptyModule = null
async function loadPty() {
  if (ptyModule) return ptyModule
  try {
    ptyModule = await import('@lydell/node-pty')
    return ptyModule
  } catch (err) {
    console.error('[CaiOS PTY] Falha ao carregar node-pty:', err.message)
    return null
  }
}

function defaultClaudePath() {
  const appData = process.env.APPDATA
  if (!appData) return 'claude'
  const candidate = path.join(
    appData,
    'npm',
    'node_modules',
    '@anthropic-ai',
    'claude-code',
    'bin',
    'claude.exe'
  )
  return fs.existsSync(candidate) ? candidate : 'claude'
}

function defaultGrokPath() {
  const home = process.env.USERPROFILE || os.homedir()
  const candidate = path.join(home, '.grok', 'bin', 'grok.exe')
  return fs.existsSync(candidate) ? candidate : 'grok'
}

function defaultHermesPath() {
  const local = process.env.LOCALAPPDATA
  if (local) {
    const candidate = path.join(local, 'hermes', 'hermes-agent', 'venv', 'Scripts', 'hermes.exe')
    if (fs.existsSync(candidate)) return candidate
  }
  const home = process.env.USERPROFILE || os.homedir()
  const fallback = path.join(home, '.hermes', 'bin', 'hermes.exe')
  return fs.existsSync(fallback) ? fallback : 'hermes'
}

function defaultCodexPath() {
  const appData = process.env.APPDATA
  if (!appData) return 'codex'
  const candidate = path.join(
    appData,
    'npm',
    'node_modules',
    '@openai',
    'codex',
    'node_modules',
    '@openai',
    'codex-win32-x64',
    'vendor',
    'x86_64-pc-windows-msvc',
    'bin',
    'codex.exe'
  )
  return fs.existsSync(candidate) ? candidate : 'codex'
}

function resolveCommand(command) {
  const trimmed = (command || '').trim()
  if (!trimmed) return defaultClaudePath()
  const first = trimmed.split(/\s+/)[0].toLowerCase()
  if (first === 'claude' || first.endsWith('claude.exe')) return defaultClaudePath()
  if (first === 'codex' || first.endsWith('codex.exe')) return defaultCodexPath()
  if (first === 'grok' || first.endsWith('grok.exe')) return defaultGrokPath()
  if (first === 'hermes' || first.endsWith('hermes.exe')) return defaultHermesPath()
  if (trimmed.includes('codex') && trimmed.endsWith('.exe')) return trimmed
  if (trimmed.includes('claude') && trimmed.endsWith('.exe')) return trimmed
  return trimmed
}

function detectCli(getPath) {
  const cmd = getPath()
  return new Promise((resolve) => {
    if (!fs.existsSync(cmd)) {
      resolve({ found: false })
      return
    }
    const proc = spawn(cmd, ['--version'], { env: process.env })
    let out = ''
    proc.stdout.on('data', (d) => { out += d.toString() })
    proc.stderr.on('data', (d) => { out += d.toString() })
    proc.on('close', (code) => {
      resolve({
        found: code === 0,
        path: cmd,
        version: out.trim() || undefined,
      })
    })
    proc.on('error', () => resolve({ found: false }))
  })
}

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g
const TAG_RE = /(?:^|\s)#([a-zA-Z0-9_\-/]+)/g

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function parseMarkdownFile(fullPath, vaultRoot) {
  const raw = fs.readFileSync(fullPath, 'utf8')
  const base = path.basename(fullPath, path.extname(fullPath))
  const rel = path.relative(vaultRoot, fullPath).replace(/\\/g, '/')
  const folder = path.dirname(rel).replace(/\\/g, '/')

  let title = base
  const h1 = raw.match(/^#\s+(.+)$/m)
  if (h1) title = h1[1].trim()

  const links = []
  let m
  WIKILINK_RE.lastIndex = 0
  while ((m = WIKILINK_RE.exec(raw)) !== null) {
    const link = m[1].trim()
    if (link && !links.includes(link)) links.push(link)
  }

  const tags = []
  TAG_RE.lastIndex = 0
  while ((m = TAG_RE.exec(raw)) !== null) {
    const tag = m[1].trim()
    if (tag && !tags.includes(tag)) tags.push(tag)
  }

  return { path: fullPath.replace(/\\/g, '/'), title, links, tags, folder: folder === '.' ? '' : folder }
}

function walkVault(dir, vaultRoot, results, depth = 0) {
  if (depth > 12) return
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.obsidian' || entry.name === 'node_modules') continue
      walkVault(full, vaultRoot, results, depth + 1)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      try {
        results.push(parseMarkdownFile(full, vaultRoot))
      } catch {
        // skip unreadable
      }
    }
  }
}

function jsonResponse(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(data))
}

function safeSend(ws, payload) {
  if (ws.readyState !== ws.OPEN) return
  try {
    ws.send(payload)
  } catch (err) {
    if (err.code !== 'EAGAIN') {
      console.error('[CaiOS PTY] Falha ao enviar:', err.message)
    }
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  if (url.pathname === '/fs/health') {
    jsonResponse(res, 200, { ok: true })
    return
  }

  if (url.pathname === '/fs/write' && req.method === 'POST') {
    try {
      const { path: filePath, content } = await readBody(req)
      if (!filePath) throw new Error('path obrigatório')
      const dir = path.dirname(filePath)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(filePath, content, 'utf8')
      jsonResponse(res, 200, { ok: true })
    } catch (err) {
      jsonResponse(res, 500, { error: err.message })
    }
    return
  }

  if (url.pathname === '/fs/mkdir' && req.method === 'POST') {
    try {
      const { path: dirPath } = await readBody(req)
      if (!dirPath) throw new Error('path obrigatório')
      fs.mkdirSync(dirPath, { recursive: true })
      jsonResponse(res, 200, { ok: true })
    } catch (err) {
      jsonResponse(res, 500, { error: err.message })
    }
    return
  }

  if (url.pathname === '/fs/delete' && req.method === 'POST') {
    try {
      const { path: filePath } = await readBody(req)
      if (!filePath) throw new Error('path obrigatório')
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      jsonResponse(res, 200, { ok: true })
    } catch (err) {
      jsonResponse(res, 500, { error: err.message })
    }
    return
  }

  if (url.pathname === '/fs/delete-match' && req.method === 'POST') {
    try {
      const { dir, idPrefix } = await readBody(req)
      if (!dir || !idPrefix) throw new Error('dir e idPrefix obrigatórios')
      const needle = `(${idPrefix})`
      if (fs.existsSync(dir)) {
        for (const name of fs.readdirSync(dir)) {
          if (name.endsWith('.md') && name.includes(needle)) {
            fs.unlinkSync(path.join(dir, name))
          }
        }
      }
      jsonResponse(res, 200, { ok: true })
    } catch (err) {
      jsonResponse(res, 500, { error: err.message })
    }
    return
  }

  if (url.pathname === '/fs/scan' && req.method === 'GET') {
    try {
      const vault = url.searchParams.get('vault')
      if (!vault || !fs.existsSync(vault)) {
        jsonResponse(res, 400, { error: 'Vault inválido ou inexistente' })
        return
      }
      const results = []
      walkVault(vault, vault, results)
      jsonResponse(res, 200, results)
    } catch (err) {
      jsonResponse(res, 500, { error: err.message })
    }
    return
  }

  if (req.url === '/detect/claude') {
    const result = await detectCli(defaultClaudePath)
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(result))
    return
  }
  if (req.url === '/detect/codex') {
    const result = await detectCli(defaultCodexPath)
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(result))
    return
  }
  if (req.url === '/detect/grok') {
    const result = await detectCli(defaultGrokPath)
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(result))
    return
  }
  if (req.url === '/detect/hermes') {
    const result = await detectCli(defaultHermesPath)
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(result))
    return
  }
  if (req.url === '/hermes/dashboard/status') {
    const online = await checkHermesDashboardOnline()
    if (online) hermesDashboardStarting = false
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify({ online, starting: hermesDashboardStarting && !online }))
    return
  }
  if (req.url === '/hermes/dashboard/start' && req.method === 'POST') {
    try {
      const result = await startHermesDashboard()
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      res.end(JSON.stringify(result))
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      res.end(JSON.stringify({ error: err.message }))
    }
    return
  }
  if (req.url === '/open-design/status') {
    const online = await checkOpenDesignOnline()
    if (online) openDesignStarting = false
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(
      JSON.stringify({
        online,
        starting: openDesignStarting && !online,
        url: `http://127.0.0.1:${OPEN_DESIGN_PORT}`,
        deployDir: openDesignDeployDir(),
      }),
    )
    return
  }
  if (req.url === '/open-design/start' && req.method === 'POST') {
    try {
      const result = await startOpenDesign()
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      res.end(JSON.stringify(result))
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      res.end(JSON.stringify({ error: err.message }))
    }
    return
  }
  if (req.url === '/open-design/stop' && req.method === 'POST') {
    try {
      const result = await stopOpenDesign()
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      res.end(JSON.stringify(result))
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      res.end(JSON.stringify({ error: err.message }))
    }
    return
  }

  if (await handleExplorerCdpRequest(url, req, res, readBody)) return

  res.writeHead(404)
  res.end()
})
const wss = new WebSocketServer({ server })
bindExplorerCdpBroadcast(wss)

wss.on('connection', (ws, req) => {
  if (handleExplorerCdpWs(ws, req)) return

  let sessionId = null

  ws.on('error', (err) => {
    if (err.code !== 'EAGAIN') {
      console.error('[CaiOS PTY] Erro no WebSocket:', err.message)
    }
  })

  ws.on('message', async (raw) => {
    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (msg.type === 'spawn') {
      const pty = await loadPty()
      if (!pty) {
        safeSend(ws, JSON.stringify({ type: 'error', message: 'node-pty não disponível. Rode npm install.' }))
        return
      }

      sessionId = msg.sessionId
      const command = resolveCommand(msg.command)
      let cwd = msg.cwd && fs.existsSync(msg.cwd) ? msg.cwd : null
      if (!cwd) {
        const fallback = path.join(process.env.USERPROFILE || os.homedir(), 'caios-data', 'workspace')
        if (!fs.existsSync(fallback)) fs.mkdirSync(fallback, { recursive: true })
        cwd = fallback
      }
      const cols = msg.cols || 120
      const rows = msg.rows || 30

      const shell = process.platform === 'win32' ? command : command
      const args = process.platform === 'win32' && command.endsWith('.exe') ? [] : []

      try {
        const proc = pty.spawn(shell, args, {
          name: 'xterm-256color',
          cols,
          rows,
          cwd,
          env: { ...process.env, TERM: 'xterm-256color', COLORTERM: 'truecolor' },
        })

        sessions.set(sessionId, proc)

        proc.onData((data) => {
          safeSend(ws, JSON.stringify({ type: 'output', sessionId, data }))
        })

        proc.onExit(() => {
          sessions.delete(sessionId)
          safeSend(ws, JSON.stringify({ type: 'exit', sessionId }))
        })

        safeSend(ws, JSON.stringify({ type: 'spawned', sessionId, command: shell, cwd }))
      } catch (err) {
        safeSend(ws, JSON.stringify({ type: 'error', message: err.message }))
      }
    }

    if (msg.type === 'write' && msg.sessionId) {
      const proc = sessions.get(msg.sessionId)
      proc?.write(msg.data)
    }

    if (msg.type === 'resize' && msg.sessionId) {
      const proc = sessions.get(msg.sessionId)
      proc?.resize(msg.cols, msg.rows)
    }

    if (msg.type === 'kill' && msg.sessionId) {
      const proc = sessions.get(msg.sessionId)
      proc?.kill()
      sessions.delete(msg.sessionId)
    }
  })

  ws.on('close', () => {
    if (sessionId) {
      sessions.get(sessionId)?.kill()
      sessions.delete(sessionId)
    }
  })
})

server.on('error', (err) => {
  console.error('[CaiOS PTY] Erro no servidor HTTP:', err.message)
})

wss.on('error', (err) => {
  console.error('[CaiOS PTY] Erro no WebSocketServer:', err.message)
})

server.listen(PORT, () => {
  console.log(`[CaiOS PTY] Servidor em ws://localhost:${PORT}`)
})
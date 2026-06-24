/**
 * Retoma sessão Explorer e envia nudge se o agente não respondeu.
 * Uso: node scripts/explorer/resume-session.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROFILE = 'explorer'
const DASHBOARD_URL = `http://127.0.0.1:9119/?profile=${PROFILE}`
const CAIOS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const META_PATH = path.join(CAIOS_ROOT, 'caios-data/explorer/last-session.json')
const TOKEN_RE = /__HERMES_SESSION_TOKEN__="([^"]+)"/

async function fetchToken() {
  const res = await fetch(DASHBOARD_URL, { credentials: 'include' })
  if (!res.ok) throw new Error(`Dashboard offline (${res.status})`)
  const html = await res.text()
  const match = html.match(TOKEN_RE)
  if (!match?.[1]) throw new Error('Token não encontrado')
  return match[1]
}

function connectWs(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    const timer = setTimeout(() => {
      ws.close()
      reject(new Error('Timeout WebSocket'))
    }, 15_000)
    ws.addEventListener('open', () => {
      clearTimeout(timer)
      resolve(ws)
    })
    ws.addEventListener('error', () => {
      clearTimeout(timer)
      reject(new Error('Falha WebSocket'))
    })
  })
}

function wsRequest(ws, method, params = {}, timeoutMs = 120_000) {
  const id = `resume-${Date.now()}`
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener('message', onMessage)
      reject(new Error(`Timeout: ${method}`))
    }, timeoutMs)
    function onMessage(ev) {
      try {
        const data = JSON.parse(ev.data)
        if (data.id !== id) return
        clearTimeout(timer)
        ws.removeEventListener('message', onMessage)
        if (data.error) reject(new Error(data.error.message ?? JSON.stringify(data.error)))
        else resolve(data.result ?? data)
      } catch {
        /* ignore */
      }
    }
    ws.addEventListener('message', onMessage)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function main() {
  if (!fs.existsSync(META_PATH)) throw new Error(`Metadata ausente: ${META_PATH}`)
  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'))
  const sessionId = meta.stored_session_id
  if (!sessionId) throw new Error('stored_session_id ausente em last-session.json')

  const token = await fetchToken()
  const ws = await connectWs(`ws://127.0.0.1:9119/api/ws?token=${encodeURIComponent(token)}`)

  try {
    const resumed = await wsRequest(ws, 'session.resume', {
      session_id: sessionId,
      close_on_disconnect: false,
    })
    console.log(`Retomada: ${resumed.session_id ?? sessionId}`)
    console.log(`Mensagens: ${resumed.message_count ?? '?'}`)
    console.log(`Rodando: ${resumed.running ?? false}`)

    if (!resumed.running) {
      const nudge =
        'Retome o briefing Explorer. Leia a skill caios-explorer e os arquivos em caios-data/explorer/. ' +
        'Confirme o escopo e proponha o plano de implementação do módulo no CaiOS. ' +
        'Qual sistema vamos investigar primeiro — modo Investigação ou exploração rotineira?'
      await wsRequest(ws, 'prompt.submit', { session_id: resumed.session_id ?? sessionId, text: nudge }, 30_000)
      console.log('Nudge enviado — aguarde resposta no dashboard.')
    } else {
      console.log('Agente já em execução — acompanhe no dashboard.')
    }
  } finally {
    ws.close()
  }
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
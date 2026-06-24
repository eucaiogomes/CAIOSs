/**
 * Cria sessão Hermes dedicada ao Explorer Agent (profile explorer).
 * Uso: node scripts/explorer/bootstrap-hermes-session.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERMES_BIN =
  process.env.HERMES_BIN ??
  'C:/Users/gcaio/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe'
const PROFILE = 'explorer'
const DASHBOARD_URL =
  process.env.HERMES_DASHBOARD_URL ?? `http://127.0.0.1:9119/?profile=${PROFILE}`
const SESSION_TITLE = 'Explorer — Módulo CaiOS'
const CAIOS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const BRIEFING_PATH = path.join(CAIOS_ROOT, 'caios-data/explorer/session-briefing.md')

const TOKEN_RE = /__HERMES_SESSION_TOKEN__="([^"]+)"/

async function fetchToken() {
  const res = await fetch(`${DASHBOARD_URL}/`, { credentials: 'include' })
  if (!res.ok) throw new Error(`Dashboard offline (${res.status}). Rode: hermes -p ${PROFILE} dashboard`)
  const html = await res.text()
  const match = html.match(TOKEN_RE)
  if (!match?.[1]) throw new Error('Token de sessão não encontrado')
  return match[1]
}

function wsUrl(token) {
  return `ws://127.0.0.1:9119/api/ws?token=${encodeURIComponent(token)}`
}

function connectWs(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    const timer = setTimeout(() => {
      ws.close()
      reject(new Error('Timeout conectando ao WebSocket Hermes'))
    }, 15_000)

    ws.addEventListener('open', () => {
      clearTimeout(timer)
      resolve(ws)
    })
    ws.addEventListener('error', () => {
      clearTimeout(timer)
      reject(new Error('Falha no WebSocket Hermes'))
    })
  })
}

function wsRequest(ws, method, params = {}, timeoutMs = 30_000) {
  const id = `explorer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
  if (!fs.existsSync(BRIEFING_PATH)) {
    throw new Error(`Briefing não encontrado: ${BRIEFING_PATH}`)
  }

  const briefing = fs.readFileSync(BRIEFING_PATH, 'utf8')
  const token = await fetchToken()
  const ws = await connectWs(wsUrl(token))

  try {
    const created = await wsRequest(ws, 'session.create', {
      title: SESSION_TITLE,
      close_on_disconnect: false,
    })

    const sessionId = created.session_id
    const storedId = created.stored_session_id ?? sessionId

    const prompt = [
      briefing,
      '',
      '---',
      '',
      'Leia a skill `caios-explorer` e os arquivos em `caios-data/explorer/`.',
      'Confirme que entendeu o escopo e proponha o plano de implementação do módulo Explorer no CaiOS.',
      'A UI deve ser simples visualmente, mas intencional — só o necessário em tela, funcional.',
      'Integração: agente Hermes + navegador do usuário.',
    ].join('\n')

    await wsRequest(ws, 'prompt.submit', { session_id: sessionId, text: prompt }, 60_000)

    const out = {
      profile: PROFILE,
      title: SESSION_TITLE,
      session_id: sessionId,
      stored_session_id: storedId,
      dashboard: DASHBOARD_URL,
      briefing: BRIEFING_PATH,
      hermes_cli: `${HERMES_BIN.replace(/\\/g, '/')} -p ${PROFILE} chat`,
    }

    const outPath = path.join(CAIOS_ROOT, 'caios-data/explorer/last-session.json')
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2))

    console.log('\n✅ Sessão Explorer criada no Hermes\n')
    console.log(`   Profile:     ${PROFILE}`)
    console.log(`   Título:      ${SESSION_TITLE}`)
    console.log(`   Session ID:  ${storedId}`)
    console.log(`   Dashboard:   ${DASHBOARD_URL}`)
    console.log(`   Briefing:    ${BRIEFING_PATH}`)
    console.log(`   Metadata:    ${outPath}`)
    console.log(`\n   Retomar:     hermes -p ${PROFILE} --resume ${storedId}`)
    console.log(`   Chat CLI:    hermes -p ${PROFILE} chat`)
    console.log(`   CaiOS:       /hermes (selecione a sessão "${SESSION_TITLE}")\n`)
  } finally {
    ws.close()
  }
}

main().catch((err) => {
  console.error(`\n❌ ${err.message ?? err}`)
  console.error(`\n   Inicie o dashboard do profile explorer:`)
  console.error(`   hermes -p ${PROFILE} dashboard --no-open\n`)
  process.exit(1)
})
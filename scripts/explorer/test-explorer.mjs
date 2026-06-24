/**
 * Teste ponta-a-ponta do Explorer: CDP + Hermes (profile explorer)
 * Uso: node scripts/explorer/test-explorer.mjs
 */

const PTY = 'http://localhost:1421'
const HERMES_BASE = 'http://127.0.0.1:9119'
const HERMES_PROFILE = 'explorer'
const TOKEN_RE = /__HERMES_SESSION_TOKEN__="([^"]+)"/

async function fetchJson(url, init = {}) {
  const res = await fetch(url, init)
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data))
  return data
}

function hermesUrl(path) {
  const sep = path.includes('?') ? '&' : '?'
  return `${HERMES_BASE}${path}${sep}profile=${encodeURIComponent(HERMES_PROFILE)}`
}

async function getHermesToken() {
  const html = await fetch(`${HERMES_BASE}/?profile=${HERMES_PROFILE}`).then((r) => r.text())
  const m = html.match(TOKEN_RE)
  if (!m?.[1]) throw new Error('Token Hermes não encontrado')
  return m[1]
}

async function hermesApi(path, init = {}) {
  const token = await getHermesToken()
  const headers = new Headers(init.headers)
  headers.set('X-Hermes-Session-Token', token)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetchJson(hermesUrl(path), { ...init, headers })
}

function findGrokProvider(providers) {
  return (
    providers.find((p) => p.slug === 'xai-oauth' && p.authenticated) ??
    providers.find((p) => /grok|xai/i.test(p.slug) && p.authenticated) ??
    providers.find((p) => /grok|xai/i.test(p.name) && p.authenticated)
  )
}

async function setGrokModel() {
  const options = await hermesApi('/api/model/options')
  const grok = findGrokProvider(options.providers ?? [])
  if (!grok) {
    console.log('⚠ Provedor Grok não encontrado. Provedores:', (options.providers ?? []).map((p) => p.slug).join(', '))
    return { ok: false, reason: 'grok_not_found' }
  }

  const model =
    grok.models?.find((m) => /grok-4\.3/i.test(m)) ??
    grok.models?.find((m) => /grok-4\.20.*reasoning/i.test(m)) ??
    grok.models?.find((m) => /grok/i.test(m) && !/image|video/i.test(m)) ??
    grok.models?.[0] ??
    options.model

  console.log(`→ Trocando modelo: ${grok.slug} / ${model}`)
  const result = await hermesApi('/api/model/set', {
    method: 'POST',
    body: JSON.stringify({
      scope: 'main',
      provider: grok.slug,
      model,
      confirm_expensive_model: true,
    }),
  })

  const info = await hermesApi('/api/model/info')
  console.log(`✓ Modelo ativo: ${info.provider} / ${info.model}`)
  return { ok: result.ok !== false, provider: info.provider, model: info.model }
}

async function testCdp() {
  console.log('\n── CDP ──')
  const health = await fetchJson(`${PTY}/fs/health`)
  console.log('✓ PTY online:', health.ok)

  const status = await fetchJson(`${PTY}/explorer/cdp/status`)
  console.log('  status:', status)

  const connect = await fetchJson(`${PTY}/explorer/cdp/connect`, { method: 'POST' })
  console.log('✓ CDP conectado:', connect)

  const nav = await fetchJson(`${PTY}/explorer/cdp/navigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' }),
  })
  console.log('✓ Navegação:', nav.url)

  await new Promise((r) => setTimeout(r, 2500))

  const events = await fetchJson(`${PTY}/explorer/cdp/events`)
  console.log(`✓ Eventos: ${events.events?.length ?? 0}, Rede: ${events.network?.length ?? 0}`)

  const snap = await fetchJson(`${PTY}/explorer/cdp/snapshot`, { method: 'POST' })
  console.log(`✓ Snapshot: url=${snap.url}, cookies=${snap.cookies?.length ?? 0}, rede=${snap.network?.length ?? 0}`)

  return {
    ok: true,
    events: events.events?.length ?? 0,
    network: events.network?.length ?? 0,
    snapshot: Boolean(snap.url),
  }
}

async function testHermesPrompt() {
  console.log('\n── Hermes (envio teste) ──')
  const token = await getHermesToken()
  const wsUrl = `ws://127.0.0.1:9119/api/ws?token=${encodeURIComponent(token)}&profile=explorer`

  const { WebSocket } = await import('ws')
  const ws = new WebSocket(wsUrl)

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('WS timeout')), 10000)
    ws.on('open', () => {
      clearTimeout(t)
      resolve()
    })
    ws.on('error', reject)
  })

  let rpcId = 1
  const rpc = (method, params) =>
    new Promise((resolve, reject) => {
      const id = `c${rpcId++}`
      const timer = setTimeout(() => reject(new Error(`RPC timeout: ${method}`)), 30000)
      const onMsg = (raw) => {
        const msg = JSON.parse(raw.toString())
        if (msg.id !== id) return
        clearTimeout(timer)
        ws.off('message', onMsg)
        if (msg.error) reject(new Error(msg.error.message || 'RPC error'))
        else resolve(msg.result)
      }
      ws.on('message', onMsg)
      ws.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }))
    })

  const session = await rpc('session.create', {
    close_on_disconnect: false,
    title: 'Explorer — Teste Automático',
  })
  console.log('✓ Sessão criada:', session.session_id)

  await rpc('prompt.submit', {
    session_id: session.session_id,
    text: '[Explorer — teste automático] Responda só: OK GROK FUNCIONANDO',
  })
  console.log('✓ Prompt enviado, aguardando resposta…')

  let reply = ''
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.close()
      if (reply.trim()) resolve()
      else reject(new Error('Sem resposta do Hermes em 180s'))
    }, 180000)

    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString())
      if (msg.method !== 'event') return
      const ev = msg.params || {}
      if (ev.type === 'message.start') reply = ''
      if (ev.type === 'message.delta' && ev.payload?.text) reply += ev.payload.text
      if (ev.type === 'message.complete') {
        reply = ev.payload?.text || ev.payload?.rendered || reply
        clearTimeout(timer)
        ws.close()
        resolve()
      }
      if (ev.type === 'session.info' && ev.payload?.running === false && reply.trim()) {
        clearTimeout(timer)
        ws.close()
        resolve()
      }
      if (ev.type === 'error') {
        clearTimeout(timer)
        ws.close()
        reject(new Error(ev.payload?.message || 'Erro Hermes'))
      }
    })
  })

  console.log('✓ Resposta Hermes:', reply.trim().slice(0, 200))
  return { ok: /ok|grok|funcionando/i.test(reply), reply: reply.trim().slice(0, 300) }
}

async function main() {
  console.log('Explorer — teste automático\n')
  const results = { cdp: null, model: null, hermes: null }

  try {
    results.model = await setGrokModel()
  } catch (err) {
    results.model = { ok: false, error: err.message }
    console.error('✗ Modelo:', err.message)
  }

  try {
    results.cdp = await testCdp()
  } catch (err) {
    results.cdp = { ok: false, error: err.message }
    console.error('✗ CDP:', err.message)
  }

  try {
    results.hermes = await testHermesPrompt()
  } catch (err) {
    results.hermes = { ok: false, error: err.message }
    console.error('✗ Hermes:', err.message)
  }

  console.log('\n── Resumo ──')
  console.log(JSON.stringify(results, null, 2))

  const allOk =
    results.cdp?.ok && results.hermes?.ok && (results.model?.ok ?? true)
  process.exit(allOk ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
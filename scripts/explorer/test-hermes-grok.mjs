import { WebSocket } from 'ws'

const TOKEN_RE = /__HERMES_SESSION_TOKEN__="([^"]+)"/
const html = await fetch('http://127.0.0.1:9119/?profile=explorer').then((r) => r.text())
const token = html.match(TOKEN_RE)?.[1]
if (!token) throw new Error('no token')

const ws = new WebSocket(`ws://127.0.0.1:9119/api/ws?token=${encodeURIComponent(token)}&profile=explorer`)
await new Promise((res, rej) => {
  ws.on('open', res)
  ws.on('error', rej)
  setTimeout(() => rej(new Error('ws open timeout')), 10000)
})

let id = 1
const rpc = (method, params) =>
  new Promise((resolve, reject) => {
    const rid = `c${id++}`
    const t = setTimeout(() => reject(new Error(`timeout ${method}`)), 45000)
    const onMsg = (raw) => {
      const msg = JSON.parse(raw.toString())
      if (msg.id !== rid) return
      clearTimeout(t)
      ws.off('message', onMsg)
      if (msg.error) reject(new Error(msg.error.message))
      else resolve(msg.result)
    }
    ws.on('message', onMsg)
    ws.send(JSON.stringify({ jsonrpc: '2.0', id: rid, method, params }))
  })

const session = await rpc('session.create', { close_on_disconnect: false, title: 'grok-test' })
console.log('session', session.session_id)

await rpc('prompt.submit', {
  session_id: session.session_id,
  text: 'Responda apenas: OK GROK',
})

let reply = ''
await new Promise((resolve, reject) => {
  const t = setTimeout(() => {
    ws.close()
    reject(new Error(`timeout reply="${reply}"`))
  }, 180000)
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString())
    if (msg.method !== 'event') return
    const ev = msg.params || {}
    console.log('evt', ev.type)
    if (ev.type === 'message.delta' && ev.payload?.text) reply += ev.payload.text
    if (ev.type === 'message.complete') {
      reply = ev.payload?.text || ev.payload?.rendered || reply
      clearTimeout(t)
      ws.close()
      resolve()
    }
    if (ev.type === 'error') {
      clearTimeout(t)
      ws.close()
      reject(new Error(ev.payload?.message || 'Erro Hermes'))
    }
  })
})

console.log('reply:', reply.trim())
process.exit(/ok|grok/i.test(reply) ? 0 : 1)
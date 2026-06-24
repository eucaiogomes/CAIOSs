const TOKEN_RE = /__HERMES_SESSION_TOKEN__="([^"]+)"/
const PROFILE = 'explorer'
const PROVIDER = process.env.EXPLORER_GROK_PROVIDER || 'xai-oauth'
const MODEL = process.env.EXPLORER_GROK_MODEL || 'grok-4.3'

const html = await fetch(`http://127.0.0.1:9119/?profile=${PROFILE}`).then((r) => r.text())
const token = html.match(TOKEN_RE)?.[1]
if (!token) throw new Error('Token não encontrado')

const headers = {
  'Content-Type': 'application/json',
  'X-Hermes-Session-Token': token,
}

const set = await fetch(`http://127.0.0.1:9119/api/model/set?profile=${PROFILE}`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    scope: 'main',
    provider: PROVIDER,
    model: MODEL,
    confirm_expensive_model: true,
  }),
}).then((r) => r.json())

const info = await fetch(`http://127.0.0.1:9119/api/model/info?profile=${PROFILE}`, {
  headers: { 'X-Hermes-Session-Token': token },
}).then((r) => r.json())

console.log('set:', set)
console.log('ativo:', info)
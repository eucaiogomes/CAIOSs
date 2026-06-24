import { spawnSync } from 'node:child_process'

const TOKEN_RE = /__HERMES_SESSION_TOKEN__="([^"]+)"/
const html = await fetch('http://127.0.0.1:9119/?profile=explorer').then((r) => r.text())
const token = html.match(TOKEN_RE)?.[1]
if (!token) throw new Error('no token')

const headers = {
  'Content-Type': 'application/json',
  'X-Hermes-Session-Token': token,
}

const candidates = [
  ['xai-oauth', 'grok-composer-2.5-fast'],
  ['openrouter', 'x-ai/grok-4.3'],
  ['xai-oauth', 'grok-4.3'],
]

for (const [provider, model] of candidates) {
  const set = await fetch('http://127.0.0.1:9119/api/model/set?profile=explorer', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      scope: 'main',
      provider,
      model,
      confirm_expensive_model: true,
    }),
  }).then((r) => r.json())

  console.log('\n→', provider, model, set.ok ? 'ok' : set)
  const run = spawnSync('node', ['scripts/explorer/test-hermes-grok.mjs'], {
    encoding: 'utf8',
    timeout: 150000,
  })
  process.stdout.write(run.stdout || '')
  process.stderr.write(run.stderr || '')
  if (run.status === 0) {
    console.log('✓ Funcionou com', provider, model)
    process.exit(0)
  }
}

process.exit(1)
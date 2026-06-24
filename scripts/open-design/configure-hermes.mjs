/**
 * Configura Open Design para usar Hermes (Local CLI) e registrar o Juris8.
 * Uso: node scripts/open-design/configure-hermes.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveOpenDesignUrl } from './resolve-url.mjs'

const HERMES_BIN =
  process.env.HERMES_BIN ??
  'C:/Users/gcaio/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe'
const JURIS8_SRC =
  process.env.JURIS8_PATH ?? 'C:/Users/gcaio/Downloads/Juris8 Design System'
const CAIOS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const JURIS8_CAIOS = path.join(CAIOS_ROOT, 'caios-data', 'design-systems', 'juris8')

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(from, to)
    else fs.copyFileSync(from, to)
  }
}

async function syncJuris8() {
  if (!fs.existsSync(JURIS8_SRC)) {
    console.warn(`[CaiOS] Juris8 não encontrado em: ${JURIS8_SRC}`)
    return null
  }
  if (fs.existsSync(JURIS8_CAIOS)) {
    console.log(`[CaiOS] Juris8 já em: ${JURIS8_CAIOS}`)
    return JURIS8_CAIOS
  }
  console.log(`[CaiOS] Copiando Juris8 → ${JURIS8_CAIOS}`)
  copyDir(JURIS8_SRC, JURIS8_CAIOS)
  return JURIS8_CAIOS
}

async function getAppConfig(odUrl) {
  const res = await fetch(`${odUrl}/api/app-config`)
  if (!res.ok) throw new Error(`GET app-config falhou (${res.status})`)
  const data = await res.json()
  return data.config ?? data
}

async function putAppConfig(odUrl, prefs) {
  const res = await fetch(`${odUrl}/api/app-config`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(prefs),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PUT app-config falhou (${res.status}): ${text}`)
  }
  return (await res.json()).config
}

async function checkHermesAgent(odUrl) {
  const res = await fetch(`${odUrl}/api/agents`)
  if (!res.ok) throw new Error(`GET agents falhou (${res.status})`)
  const data = await res.json()
  const agents = data.agents ?? data
  const hermes = agents.find((a) => a.id === 'hermes')
  return hermes ?? null
}

export async function configureHermes() {
  const resolved = await resolveOpenDesignUrl()
  const OD_URL = process.env.OPEN_DESIGN_URL ?? resolved.url
  console.log(`[CaiOS] Open Design: ${OD_URL} (${resolved.source})`)

  const juris8Path = (await syncJuris8()) ?? JURIS8_SRC.replace(/\\/g, '/')
  const hermes = await checkHermesAgent(OD_URL)

  if (!hermes?.available) {
    console.error('\n❌ Hermes NÃO detectado pelo Open Design.')
    console.error('   Rode: .\\scripts\\open-design\\run-native.ps1')
    process.exit(1)
  }

  const current = await getAppConfig(OD_URL)
  const next = {
    ...current,
    onboardingCompleted: true,
    agentId: 'hermes',
    agentCliEnv: {
      ...(current.agentCliEnv ?? {}),
      hermes: {
        ...(current.agentCliEnv?.hermes ?? {}),
        HERMES_BIN: HERMES_BIN.replace(/\\/g, '/'),
      },
    },
    projectLocations: [
      ...(current.projectLocations ?? []).filter((p) => p.id !== 'juris8'),
      {
        id: 'juris8',
        name: 'Juris8 Design System',
        path: juris8Path.replace(/\\/g, '/'),
      },
    ],
    defaultProjectLocationId: current.defaultProjectLocationId ?? 'juris8',
    customInstructions: [
      current.customInstructions ?? '',
      '',
      'Use o design system Juris8 em modo local-first.',
      `Pasta canônica: ${juris8Path}`,
      'Leia SKILL.md e readme.md antes de gerar UI. Reutilize tokens/ e components/.',
    ]
      .filter(Boolean)
      .join('\n')
      .trim(),
  }

  const saved = await putAppConfig(OD_URL, next)
  console.log('\n✅ Open Design configurado para Hermes (Local CLI)')
  console.log(`   agentId: ${saved.agentId}`)
  console.log(`   HERMES_BIN: ${saved.agentCliEnv?.hermes?.HERMES_BIN}`)
  console.log(`   Juris8: ${juris8Path}`)
  console.log('\n   No Open Design: Settings → Execution mode = Local CLI → Hermes')
}

if (import.meta.url.startsWith('file:')) {
  const invoked = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
  if (invoked) {
    configureHermes().catch((err) => {
      console.error(err.message ?? err)
      process.exit(1)
    })
  }
}
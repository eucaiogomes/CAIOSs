/**
 * Descobre a URL do Open Design (Docker 7456 ou portable com porta dinâmica).
 */

import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CAIOS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const RUNTIME_URL_FILE = path.join(CAIOS_ROOT, 'caios-data', 'open-design', 'runtime-url.json')
const DEFAULT_URL = 'http://127.0.0.1:7456'
const NAMESPACE = 'release-stable-win'

function appDataNamespaceRoot() {
  const appData = process.env.APPDATA
  if (!appData) return null
  return path.join(appData, 'Open Design', 'namespaces', NAMESPACE)
}

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function parseUrlFromLog(logPath) {
  try {
    if (!fs.existsSync(logPath)) return null
    const content = fs.readFileSync(logPath, 'utf8')
    const matches = [...content.matchAll(/"url"\s*:\s*"(http:\/\/127\.0\.0\.1:\d+)"/g)]
    return matches.length ? matches[matches.length - 1][1] : null
  } catch {
    return null
  }
}

export function discoverOpenDesignUrlCandidates() {
  const candidates = []
  const seen = new Set()
  const add = (url, source) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    candidates.push({ url, source })
  }

  const runtime = readJsonIfExists(RUNTIME_URL_FILE)
  if (runtime?.webUrl) add(runtime.webUrl, 'runtime-url.json')
  if (runtime?.daemonUrl) add(runtime.daemonUrl, 'runtime-url.json-daemon')

  const nsRoot = appDataNamespaceRoot()
  if (nsRoot) {
    const webIdentity = readJsonIfExists(path.join(nsRoot, 'runtime', 'web-root.json'))
    if (webIdentity?.url) add(webIdentity.url, 'web-root.json')

    add(parseUrlFromLog(path.join(nsRoot, 'logs', 'web', 'latest.log')), 'web-log')
    add(parseUrlFromLog(path.join(nsRoot, 'logs', 'daemon', 'latest.log')), 'daemon-log')
  }

  add(DEFAULT_URL, 'default-7456')
  return candidates
}

export function checkUrlHealth(url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    let parsed
    try {
      parsed = new URL(url)
    } catch {
      resolve(false)
      return
    }
    const req = http.get(
      {
        hostname: parsed.hostname,
        port: parsed.port || 80,
        path: '/api/health',
        timeout: timeoutMs,
      },
      (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 300)
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

export async function resolveOpenDesignUrl() {
  for (const candidate of discoverOpenDesignUrlCandidates()) {
    if (await checkUrlHealth(candidate.url)) {
      return candidate
    }
  }
  return { url: DEFAULT_URL, source: 'default-7456' }
}

export function writeRuntimeUrl({ webUrl, daemonUrl, source }) {
  fs.mkdirSync(path.dirname(RUNTIME_URL_FILE), { recursive: true })
  fs.writeFileSync(
    RUNTIME_URL_FILE,
    JSON.stringify({ webUrl, daemonUrl, source, updatedAt: new Date().toISOString() }, null, 2),
    'utf8',
  )
}

export async function waitForOpenDesignUrl(timeoutMs = 180_000, intervalMs = 2000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const resolved = await resolveOpenDesignUrl()
    if (resolved.source !== 'default-7456' || (await checkUrlHealth(DEFAULT_URL))) {
      return resolved
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return null
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('resolve-url.mjs')) {
  const resolved = await resolveOpenDesignUrl()
  console.log(JSON.stringify(resolved, null, 2))
}
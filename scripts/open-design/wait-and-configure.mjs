/**
 * Aguarda Open Design nativo ficar online e configura Hermes + Juris8.
 */
import { configureHermes } from './configure-hermes.mjs'
import { waitForOpenDesignUrl, writeRuntimeUrl } from './resolve-url.mjs'

const resolved = await waitForOpenDesignUrl()
if (!resolved) {
  console.error('Open Design não respondeu a tempo.')
  process.exit(1)
}

writeRuntimeUrl({
  webUrl: resolved.url,
  daemonUrl: resolved.url,
  source: resolved.source,
})

process.env.OPEN_DESIGN_URL = resolved.url
await configureHermes()
console.log(`\nURL ativa: ${resolved.url} (${resolved.source})`)
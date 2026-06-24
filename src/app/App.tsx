import { seedDatabaseIfNeeded } from '@/lib/seed'
import * as tauriBridge from '@/lib/tauri-bridge'
import { cliConfigService } from '@/services/cli-config.service'
import { evolutionService } from '@/services/evolution.service'
import { knowledgeSyncService } from '@/services/knowledge-sync.service'
import { BrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout'

seedDatabaseIfNeeded()
knowledgeSyncService.migrateVaultPath()
cliConfigService.migrateGrokTerminal()
cliConfigService.migrateHermesDashboard()
evolutionService.touch()

setTimeout(() => {
  knowledgeSyncService.syncAll().catch(() => {})
}, 2000)

Promise.all([
  tauriBridge.detectClaude(),
  tauriBridge.detectCodex(),
  tauriBridge.detectGrok(),
  tauriBridge.detectHermes(),
]).then(([claude, codex, grok, hermes]) => {
  const settings = cliConfigService.get()
  if (claude && !settings.claudeCode.verified) cliConfigService.applyClaudeDetection(claude)
  if (codex && !settings.codex.verified) cliConfigService.applyCodexDetection(codex)
  if (grok && !settings.grok.verified) cliConfigService.applyGrokDetection(grok)
  if (hermes && !settings.hermes.verified) cliConfigService.applyHermesDetection(hermes)
})

export function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
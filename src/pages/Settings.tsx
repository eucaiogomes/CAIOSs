import { CliToolSetup } from '@/components/settings/CliToolSetup'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { CLAUDE_CODE_TOOL_ID, CODEX_TOOL_ID, GROK_TOOL_ID, HERMES_TOOL_ID, STORAGE_KEYS } from '@/lib/constants'
import { storageRemove } from '@/lib/db'
import { seedDatabaseIfNeeded } from '@/lib/seed'
import { isTauri, detectClaude, detectCodex, detectGrok, detectHermes, verifyCli } from '@/lib/tauri-bridge'
import { cliConfigService } from '@/services/cli-config.service'
import { logsService } from '@/services/logs.service'
import { formatRelative } from '@/lib/utils'
import { Database, RefreshCw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

export function Settings() {
  const recentLogs = useMemo(() => logsService.list().slice(0, 10), [])
  const [cliSettings, setCliSettings] = useState(() => cliConfigService.get())

  const refreshCli = () => setCliSettings(cliConfigService.get())

  const handleResetData = () => {
    if (!confirm('Isso vai apagar todos os dados e recarregar os mocks. Continuar?')) return
    Object.values(STORAGE_KEYS).forEach((key) => storageRemove(key))
    seedDatabaseIfNeeded()
    window.location.reload()
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure seus CLIs e preferências do CaiOS."
      />

      <div className="grid gap-4 max-w-2xl">
        <h2 className="text-sm font-semibold text-text-secondary">Ferramentas CLI</h2>

        <CliToolSetup
          toolId={CLAUDE_CODE_TOOL_ID}
          title="Claude Code"
          icon="🤖"
          description="Agente de código Anthropic — terminal interativo dentro do CaiOS."
          installHint="npm install -g @anthropic-ai/claude-code"
          authHint="Na primeira execução o Claude Code pede login Anthropic no terminal."
          detectEndpoint="/detect/claude"
          config={cliSettings.claudeCode}
          onDetect={detectClaude}
          onVerify={verifyCli}
          onUpdate={(patch) => { const r = cliConfigService.updateClaudeCode(patch); refreshCli(); return r }}
          onMarkUnverified={() => { cliConfigService.markClaudeUnverified(); refreshCli() }}
        />

        <CliToolSetup
          toolId={CODEX_TOOL_ID}
          title="Codex"
          icon="⚡"
          description="Agente de código OpenAI — terminal interativo dentro do CaiOS."
          installHint="npm install -g @openai/codex"
          authHint="Na primeira execução o Codex pede autenticação OpenAI/ChatGPT no terminal."
          detectEndpoint="/detect/codex"
          config={cliSettings.codex}
          onDetect={detectCodex}
          onVerify={verifyCli}
          onUpdate={(patch) => { const r = cliConfigService.updateCodex(patch); refreshCli(); return r }}
          onMarkUnverified={() => { cliConfigService.markCodexUnverified(); refreshCli() }}
        />

        <CliToolSetup
          toolId={GROK_TOOL_ID}
          title="Grok"
          icon="🧠"
          description="Grok CLI da xAI — terminal interativo dentro do CaiOS."
          installHint="Instale via https://x.ai/cli"
          authHint="Na primeira execução o Grok pede autenticação xAI no terminal."
          detectEndpoint="/detect/grok"
          config={cliSettings.grok}
          onDetect={detectGrok}
          onVerify={verifyCli}
          onUpdate={(patch) => { const r = cliConfigService.updateGrok(patch); refreshCli(); return r }}
          onMarkUnverified={() => { cliConfigService.markGrokUnverified(); refreshCli() }}
        />

        <CliToolSetup
          toolId={HERMES_TOOL_ID}
          title="Hermes"
          icon="📡"
          description="Hermes Agent — abre no dashboard web integrado do CaiOS (não no terminal)."
          installHint="Instale via pip: pip install hermes-agent (ou o instalador oficial)"
          authHint="Rode hermes setup no terminal para configurar modelos e API keys."
          detectEndpoint="/detect/hermes"
          config={cliSettings.hermes}
          onDetect={detectHermes}
          onVerify={verifyCli}
          onUpdate={(patch) => { const r = cliConfigService.updateHermes(patch); refreshCli(); return r }}
          onMarkUnverified={() => { cliConfigService.markHermesUnverified(); refreshCli() }}
        />

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Ambiente
              </CardTitle>
              <CardDescription className="mt-1">
                {isTauri()
                  ? 'Rodando como app desktop — PTY, opener e webview ativos.'
                  : 'Rodando no browser — npm run dev sobe PTY + Vite juntos.'}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Logs recentes</CardTitle>
              <CardDescription className="mt-1">Histórico de ações de ferramentas.</CardDescription>
            </div>
          </CardHeader>
          {recentLogs.length === 0 ? (
            <p className="text-xs text-text-muted">Nenhum log ainda.</p>
          ) : (
            <ul className="space-y-2">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-start justify-between gap-2 text-xs">
                  <span className={log.type === 'error' ? 'text-danger' : 'text-text-secondary'}>
                    {log.message}
                  </span>
                  <span className="shrink-0 text-text-muted">{formatRelative(log.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Dados</CardTitle>
              <CardDescription className="mt-1">Resetar para dados mock iniciais.</CardDescription>
            </div>
          </CardHeader>
          <Button variant="danger" onClick={handleResetData}>
            <Trash2 className="h-4 w-4" /> Resetar dados
          </Button>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sobre</CardTitle>
              <CardDescription className="mt-1">CaiOS — Caio + OS</CardDescription>
            </div>
          </CardHeader>
          <p className="text-xs text-text-muted leading-relaxed">
            CaiOS não é um agente. CaiOS é o lugar onde Caio organiza e acessa todos os seus agentes,
            ferramentas, projetos, prompts e testes.
          </p>
          <p className="mt-2 text-[11px] text-text-muted flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Versão MVP 0.1.0
          </p>
        </Card>
      </div>
    </div>
  )
}
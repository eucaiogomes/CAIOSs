import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import * as tauriBridge from '@/lib/tauri-bridge'
import type { Tool } from '@/types/tool'
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface WebToolState {
  tool: Tool
}

export function WebTool() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as WebToolState | null
  const tool = state?.tool
  const [iframeKey, setIframeKey] = useState(0)
  const [blocked, setBlocked] = useState(false)

  const url = tool?.url ?? ''

  const title = useMemo(() => tool?.name ?? 'Web Tool', [tool])

  if (!tool || !url) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-muted">Ferramenta web não encontrada.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/tools')}>
          <ArrowLeft className="h-4 w-4" /> Voltar para Tools
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      <PageHeader
        title={title}
        description={url}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIframeKey((k) => k + 1)}>
              <RefreshCw className="h-4 w-4" /> Recarregar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => tauriBridge.openUrl(url)}>
              <ExternalLink className="h-4 w-4" /> Abrir externo
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </>
        }
      />

      {blocked && (
        <div className="mb-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          Este site pode bloquear exibição em iframe. Use &quot;Abrir externo&quot; se a página não carregar.
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-border bg-bg-panel">
        <iframe
          key={iframeKey}
          src={url}
          title={title}
          className="h-full w-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onError={() => setBlocked(true)}
        />
      </div>

      {!tauriBridge.isTauri() && (
        <p className="mt-2 text-[11px] text-text-muted">
          Modo browser — no app Tauri você também pode abrir em janela dedicada.
        </p>
      )}
    </div>
  )
}
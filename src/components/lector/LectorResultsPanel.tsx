import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { LectorResult } from '@/types/lector'
import { Save, ExternalLink } from 'lucide-react'

interface LectorResultsPanelProps {
  result?: LectorResult
  obsidianPath?: string
  onSaveToObsidian: () => void
  isSaving?: boolean
}

export function LectorResultsPanel({ 
  result, 
  obsidianPath, 
  onSaveToObsidian, 
  isSaving 
}: LectorResultsPanelProps) {
  if (!result) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">Resultados Estruturados</CardTitle>
        </CardHeader>
        <div className="p-6 text-center text-text-muted text-sm">
          Os resultados estruturados aparecerão aqui após a execução.
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Resultados Estruturados</CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onSaveToObsidian}
            disabled={isSaving}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Salvando...' : 'Salvar no Obsidian'}
          </Button>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-auto px-4 pb-4 space-y-4 text-sm">
        {result.title && (
          <div>
            <div className="font-medium text-text-muted text-xs mb-1">TÍTULO</div>
            <div className="font-semibold">{result.title}</div>
          </div>
        )}

        {result.summary && (
          <div>
            <div className="font-medium text-text-muted text-xs mb-1">RESUMO</div>
            <div className="text-text-secondary whitespace-pre-wrap">{result.summary}</div>
          </div>
        )}

        {result.createdItems && result.createdItems.length > 0 && (
          <div>
            <div className="font-medium text-text-muted text-xs mb-1">ITENS CRIADOS</div>
            <ul className="space-y-1">
              {result.createdItems.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-bg-soft">{item.type}</span>
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.links && result.links.length > 0 && (
          <div>
            <div className="font-medium text-text-muted text-xs mb-1">LINKS</div>
            <div className="space-y-1">
              {result.links.map((link, i) => (
                <a 
                  key={i} 
                  href={link.url || '#'} 
                  className="flex items-center gap-1 text-blue hover:underline text-xs"
                  target="_blank"
                >
                  {link.label} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        )}

         {obsidianPath {obsidianPath && ({obsidianPath && ( (
          <div className="pt-2 border-t text-xs text-emerald">
            ✅ Salvo no Obsidian: <span className="font-mono">{obsidianPath.split('/').pop()}</span>
          </div>
        )}
          <div className="pt-2 border-t text-xs text-text-muted">
            Salvo em: <span className="font-mono">{obsidianPath}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

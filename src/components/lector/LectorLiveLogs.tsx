import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import type { LectorLog } from '@/types/lector'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface LectorLiveLogsProps {
  logs: LectorLog[]
}

export function LectorLiveLogs({ logs }: LectorLiveLogsProps) {
  const getLogColor = (type: LectorLog['type']) => {
    switch (type) {
      case 'error': return 'text-danger'
      case 'success': return 'text-emerald'
      case 'tool': return 'text-blue'
      case 'obsidian': return 'text-violet'
      case 'streaming': return 'text-text-primary'
      default: return 'text-text-secondary'
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" /> Logs em Tempo Real
        </CardTitle>
      </CardHeader>

      <div className="flex-1 overflow-auto px-4 pb-4 font-mono text-xs space-y-1">
        {logs.length === 0 && (
          <div className="text-text-muted italic py-8 text-center">
            Os logs aparecerão aqui durante a execução...
          </div>
        )}

        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-text-muted shrink-0">
              {new Date(log.timestamp).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </span>
            <span className={cn('flex-1', getLogColor(log.type))}>
              {log.toolName && <span className="font-medium">[{log.toolName}]</span>} {log.message}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

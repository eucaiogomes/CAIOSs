import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Tool } from '@/types/tool'
import { ExternalLink, Play, Star, Trash2 } from 'lucide-react'

interface ToolCardProps {
  tool: Tool
  onLaunch: (tool: Tool) => void
  onToggleFavorite?: (tool: Tool) => void
  onDelete?: (tool: Tool) => void
  onEdit?: (tool: Tool) => void
}

export function ToolCard({ tool, onLaunch, onToggleFavorite, onDelete, onEdit }: ToolCardProps) {
  return (
    <Card
      className="group cursor-pointer"
      onClick={() => onLaunch(tool)}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-soft text-lg">
            {tool.icon ?? '🔧'}
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">{tool.name}</CardTitle>
            <CardDescription className="truncate">{tool.description}</CardDescription>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(tool)}
              title={tool.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
            >
              <Star className={cn('h-3.5 w-3.5', tool.isFavorite && 'fill-primary text-primary')} />
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(tool)}>
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(tool)}>
              <Trash2 className="h-3.5 w-3.5 text-danger" />
            </Button>
          )}
        </div>
      </CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <Badge variant="primary">{tool.type}</Badge>
          <Badge>{tool.category}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onLaunch(tool) }}>
          {tool.type === 'web' ? <ExternalLink className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          Abrir
        </Button>
      </div>
    </Card>
  )
}
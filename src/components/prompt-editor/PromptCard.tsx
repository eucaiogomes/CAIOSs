import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelative } from '@/lib/utils'
import type { Prompt } from '@/types/prompt'
import { Copy, Edit, Files } from 'lucide-react'

interface PromptCardProps {
  prompt: Prompt
  toolName?: string
  onCopy: (prompt: Prompt) => void
  onEdit?: (prompt: Prompt) => void
  onDuplicate?: (prompt: Prompt) => void
}

export function PromptCard({ prompt, toolName, onCopy, onEdit, onDuplicate }: PromptCardProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{prompt.title}</CardTitle>
          <CardDescription className="line-clamp-2 mt-1">{prompt.content}</CardDescription>
        </div>
      </CardHeader>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge variant="primary">{prompt.category}</Badge>
        {toolName && <Badge>{toolName}</Badge>}
        {prompt.tags.map((tag) => (
          <Badge key={tag} variant="muted">#{tag}</Badge>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-text-muted">{formatRelative(prompt.updatedAt)}</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onCopy(prompt)}>
            <Copy className="h-3.5 w-3.5" /> Copiar
          </Button>
          {onDuplicate && (
            <Button variant="ghost" size="sm" onClick={() => onDuplicate(prompt)}>
              <Files className="h-3.5 w-3.5" />
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(prompt)}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
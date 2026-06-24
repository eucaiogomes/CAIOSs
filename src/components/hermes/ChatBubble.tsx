import type { HermesChatMessage } from '@/hooks/useHermesChat'
import { cn } from '@/lib/utils'
import { Bot, Sparkles, User, Wrench } from 'lucide-react'

interface ChatBubbleProps {
  message: HermesChatMessage
}

function formatContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const inner = part.slice(3, -3).replace(/^\w+\n/, '')
      return (
        <pre
          key={i}
          className="my-2 overflow-x-auto rounded-lg border border-border/60 bg-bg-main/80 px-3 py-2 font-mono text-[12px] leading-relaxed text-text-secondary"
        >
          {inner.trim()}
        </pre>
      )
    }
    return (
      <span key={i} className="whitespace-pre-wrap break-words">
        {part}
      </span>
    )
  })
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center px-4 py-2">
        <div className="max-w-md rounded-full border border-border/50 bg-bg-soft/60 px-4 py-2 text-center text-[12px] text-text-muted backdrop-blur-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3 px-4 py-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1',
          isUser
            ? 'bg-primary/15 text-primary ring-primary/25'
            : 'bg-bg-soft text-primary ring-border/80',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn('flex max-w-[min(720px,85%)] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'rounded-tr-md bg-primary text-white shadow-primary/15'
              : 'rounded-tl-md border border-border/70 bg-bg-panel/90 text-text-primary',
            message.streaming && !isUser && 'hermes-stream-pulse',
          )}
        >
          {message.content ? (
            formatContent(message.content)
          ) : message.streaming ? (
            <span className="inline-flex items-center gap-1 text-text-muted">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
              Escrevendo…
            </span>
          ) : null}
        </div>

        {message.tools && message.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.tools.map((tool) => (
              <span
                key={tool.id}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium',
                  tool.status === 'running'
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-success/25 bg-success/10 text-success',
                )}
              >
                <Wrench className="h-3 w-3" />
                {tool.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
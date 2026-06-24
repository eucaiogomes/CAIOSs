import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowUp, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

const SUGGESTIONS = [
  'Resuma meus projetos no CaiOS',
  'Crie um plano de tarefas no kanban',
  'Pesquise skills úteis para automação',
]

interface ChatComposerProps {
  disabled?: boolean
  busy?: boolean
  placeholder?: string
  autoFocus?: boolean
  onSend: (text: string) => void
}

export function ChatComposer({
  disabled,
  busy,
  placeholder = 'Mensagem para o Hermes…',
  autoFocus,
  onSend,
}: ChatComposerProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus && !disabled && !busy) {
      textareaRef.current?.focus()
    }
  }, [autoFocus, disabled, busy])

  const submit = () => {
    const value = text.trim()
    if (!value || disabled || busy) return
    onSend(value)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    textareaRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const onInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const inputDisabled = disabled || busy

  return (
    <div className="relative z-20 shrink-0 border-t border-border/60 bg-bg-panel/95 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-4">
      <div className="mx-auto w-full max-w-3xl">
        {!disabled && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={inputDisabled}
                onClick={() => onSend(s)}
                className="rounded-full border border-border/70 bg-bg-soft/50 px-3 py-1.5 text-[11px] text-text-secondary transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div
          className={cn(
            'flex items-end gap-2 rounded-2xl border bg-bg-main p-2 shadow-[0_0_40px_-20px_rgba(255,122,26,0.35)] transition-shadow',
            inputDisabled
              ? 'border-border/50 opacity-70'
              : 'border-border/80 focus-within:border-primary/40 focus-within:shadow-[0_0_50px_-15px_rgba(255,122,26,0.45)]',
          )}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            onInput={onInput}
            rows={1}
            disabled={inputDisabled}
            placeholder={placeholder}
            aria-label="Mensagem para o Hermes"
            className="max-h-40 min-h-[48px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
          />
          <Button
            size="sm"
            className="mb-0.5 h-10 w-10 shrink-0 rounded-xl p-0"
            onClick={submit}
            disabled={inputDisabled || !text.trim()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-text-muted">
          {disabled
            ? 'Aguarde a conexão com o Hermes…'
            : 'Enter para enviar · Shift+Enter para nova linha'}
        </p>
      </div>
    </div>
  )
}
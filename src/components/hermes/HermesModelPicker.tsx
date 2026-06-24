import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  fetchHermesModelOptions,
  formatModelLabel,
  setHermesModelAssignment,
  shortModelName,
  type HermesModelProvider,
} from '@/lib/hermes-api'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Cpu, Loader2, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface HermesModelPickerProps {
  currentModel?: string
  currentProvider?: string
  disabled?: boolean
  profile?: string
  sessionResetHint?: string
  onApplied: (provider: string, model: string) => void
}

export function HermesModelPicker({
  currentModel = '',
  currentProvider = '',
  disabled,
  profile = 'default',
  sessionResetHint = 'Inicia uma nova conversa com o modelo selecionado',
  onApplied,
}: HermesModelPickerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [providers, setProviders] = useState<HermesModelProvider[]>([])
  const [selectedSlug, setSelectedSlug] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [query, setQuery] = useState('')
  const [pendingConfirm, setPendingConfirm] = useState<{
    provider: string
    model: string
    message: string
  } | null>(null)

  const panelRef = useRef<HTMLDivElement>(null)

  const selectedProvider = useMemo(
    () => providers.find((p) => p.slug === selectedSlug),
    [providers, selectedSlug],
  )

  const filteredModels = useMemo(() => {
    const models = selectedProvider?.models ?? []
    const q = query.trim().toLowerCase()
    if (!q) return models
    return models.filter((m) => m.toLowerCase().includes(q))
  }, [selectedProvider, query])

  const loadOptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHermesModelOptions(profile)
      const list = data.providers ?? []
      setProviders(list)
      const current = list.find((p) => p.is_current) ?? list[0]
      setSelectedSlug(current?.slug ?? data.provider ?? '')
      setSelectedModel(data.model ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar modelos')
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    if (!open) return
    void loadOptions()
  }, [open, loadOptions])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
        setPendingConfirm(null)
      }
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const applyModel = async (provider: string, model: string, confirmExpensive = false) => {
    setApplying(true)
    setError(null)
    try {
      const result = await setHermesModelAssignment(provider, model, confirmExpensive, profile)
      if (result.confirm_required) {
        setPendingConfirm({
          provider,
          model,
          message:
            result.confirm_message ??
            'Este modelo tem custo elevado. Deseja continuar?',
        })
        return
      }
      if (!result.ok) throw new Error('Falha ao aplicar modelo')
      onApplied(provider, model)
      setOpen(false)
      setPendingConfirm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao trocar modelo')
    } finally {
      setApplying(false)
    }
  }

  const label = formatModelLabel(currentModel, currentProvider)

  return (
    <div className="relative max-w-full" ref={panelRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-left transition-colors sm:max-w-[220px]',
          'border-border/70 bg-bg-soft/60 hover:border-primary/40 hover:bg-primary/5',
          open && 'border-primary/40 bg-primary/5',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <Cpu className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate text-[11px] font-medium text-text-secondary">{label}</span>
        <ChevronDown className={cn('h-3 w-3 shrink-0 text-text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 w-[min(520px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/80 bg-bg-panel shadow-2xl shadow-black/40 sm:right-auto">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Provedor e modelo</p>
              <p className="text-[11px] text-text-muted">Troca o cérebro do Hermes</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-text-muted hover:bg-bg-soft hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {pendingConfirm ? (
            <div className="space-y-4 p-4">
              <p className="text-sm text-text-secondary">{pendingConfirm.message}</p>
              <p className="text-xs text-text-muted">
                {shortModelName(pendingConfirm.model)} · {pendingConfirm.provider}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    void applyModel(
                      pendingConfirm.provider,
                      pendingConfirm.model,
                      true,
                    )
                  }
                  disabled={applying}
                >
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPendingConfirm(null)}
                  disabled={applying}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Carregando provedores…
            </div>
          ) : (
            <div className="grid max-h-[420px] grid-cols-1 sm:grid-cols-[180px_1fr]">
              <div className="border-b border-border/60 sm:border-b-0 sm:border-r sm:border-border/60">
                <p className="px-3 pt-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Provedor
                </p>
                <div className="max-h-72 overflow-y-auto p-2">
                  {providers.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => {
                        setSelectedSlug(p.slug)
                        setSelectedModel('')
                        setQuery('')
                      }}
                      className={cn(
                        'mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors',
                        selectedSlug === p.slug
                          ? 'bg-primary/15 text-primary'
                          : 'text-text-secondary hover:bg-bg-soft',
                      )}
                    >
                      <span className="truncate font-medium">{p.name}</span>
                      {p.is_current && (
                        <span className="ml-1 shrink-0 text-[9px] uppercase text-success">ativo</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-0 flex-col">
                <div className="border-b border-border/60 p-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar modelo…"
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto p-2">
                  {filteredModels.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-text-muted">
                      {selectedProvider ? 'Nenhum modelo encontrado' : 'Selecione um provedor'}
                    </p>
                  ) : (
                    filteredModels.map((m) => {
                      const activeSlug =
                        providers.find((pr) => pr.is_current)?.slug ?? currentProvider
                      const isCurrent = m === currentModel && selectedSlug === activeSlug
                      const isSelected = m === selectedModel
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedModel(m)}
                          className={cn(
                            'mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors',
                            isSelected
                              ? 'bg-primary/15 text-primary ring-1 ring-primary/25'
                              : 'text-text-secondary hover:bg-bg-soft',
                          )}
                        >
                          <span className="truncate font-mono">{shortModelName(m)}</span>
                          {(isSelected || isCurrent) && (
                            <Check className="h-3.5 w-3.5 shrink-0" />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>

                {error && (
                  <p className="border-t border-danger/20 bg-danger/10 px-4 py-2 text-xs text-danger">
                    {error}
                  </p>
                )}

                <div className="mt-auto border-t border-border/60 p-3">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!selectedSlug || !selectedModel || applying}
                    onClick={() => void applyModel(selectedSlug, selectedModel)}
                  >
                    {applying ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Aplicando…
                      </>
                    ) : (
                      'Usar este modelo'
                    )}
                  </Button>
                  <p className="mt-2 text-center text-[10px] text-text-muted">
                    {sessionResetHint}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
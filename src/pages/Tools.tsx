import { ToolCard } from '@/components/tool-card/ToolCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { TOOL_TYPES } from '@/lib/constants'
import { toolLauncher } from '@/services/tool-launcher.service'
import { toolsService } from '@/services/tools.service'
import type { CreateToolInput, Tool, ToolType } from '@/types/tool'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const emptyForm: CreateToolInput = {
  name: '',
  type: 'web',
  category: '',
  description: '',
  command: '',
  url: '',
  path: '',
  icon: '🔧',
  isFavorite: false,
  openMode: 'external',
}

export function Tools() {
  const navigate = useNavigate()
  const [tools, setTools] = useState(() => toolsService.list())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateToolInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = () => setTools(toolsService.list())

  const handleLaunch = (tool: Tool) => {
    toolLauncher
      .launch(tool, { navigate })
      .catch((err) => console.error('[CaiOS]', err))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    if (editingId) {
      toolsService.update(editingId, form)
    } else {
      toolsService.create(form)
    }

    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    refresh()
  }

  const handleEdit = (tool: Tool) => {
    setForm({
      name: tool.name,
      type: tool.type,
      category: tool.category,
      description: tool.description,
      command: tool.command ?? '',
      url: tool.url ?? '',
      path: tool.path ?? '',
      icon: tool.icon ?? '🔧',
      isFavorite: tool.isFavorite,
      openMode: tool.openMode,
    })
    setEditingId(tool.id)
    setShowForm(true)
  }

  const handleDelete = (tool: Tool) => {
    if (confirm(`Remover "${tool.name}"?`)) {
      toolsService.remove(tool.id)
      refresh()
    }
  }

  return (
    <div>
      <PageHeader
        title="Tools"
        description="Cadastre e gerencie suas ferramentas de IA."
        actions={
          <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}>
            <Plus className="h-4 w-4" /> Add Tool
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-bg-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{editingId ? 'Editar ferramenta' : 'Nova ferramenta'}</h3>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ToolType })}>
                {TOOL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="code-agent, ai-chat..." />
            </div>
            <div>
              <Label>Ícone</Label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </div>
            {form.type === 'web' && (
              <>
                <div>
                  <Label>URL</Label>
                  <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label>Abrir</Label>
                  <Select value={form.openMode} onChange={(e) => setForm({ ...form, openMode: e.target.value as 'internal' | 'external' })}>
                    <option value="external">Navegador externo</option>
                    <option value="internal">Dentro do CaiOS</option>
                  </Select>
                </div>
              </>
            )}
            {form.type === 'terminal' && (
              <div>
                <Label>Comando</Label>
                <Input value={form.command} onChange={(e) => setForm({ ...form, command: e.target.value })} placeholder="claude, codex..." />
              </div>
            )}
            {(form.type === 'folder' || form.type === 'app') && (
              <div className="sm:col-span-2">
                <Label>Caminho</Label>
                <Input value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} placeholder="C:/Users/..." />
              </div>
            )}
            <div className="sm:col-span-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="favorite"
                checked={form.isFavorite}
                onChange={(e) => setForm({ ...form, isFavorite: e.target.checked })}
                className="accent-primary"
              />
              <Label htmlFor="favorite" className="mb-0">Favorito (aparece na sidebar)</Label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit">{editingId ? 'Salvar' : 'Criar ferramenta'}</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {tools.length === 0 ? (
        <EmptyState
          icon="🔧"
          title="Nenhuma ferramenta cadastrada"
          description="Adicione Claude Code, Grok, Obsidian e outras ferramentas que você usa no dia a dia."
          action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add Tool</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onLaunch={handleLaunch}
              onToggleFavorite={() => { toolsService.toggleFavorite(tool.id); refresh() }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
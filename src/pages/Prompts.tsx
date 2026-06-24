import { PromptCard } from '@/components/prompt-editor/PromptCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { PROMPT_CATEGORIES } from '@/lib/constants'
import { projectsService } from '@/services/projects.service'
import { promptsService } from '@/services/prompts.service'
import { toolsService } from '@/services/tools.service'
import type { CreatePromptInput, Prompt, PromptCategory } from '@/types/prompt'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'

const emptyForm: CreatePromptInput = {
  title: '',
  category: 'Código',
  content: '',
  recommendedToolId: '',
  projectId: '',
  tags: [],
}

export function Prompts() {
  const [prompts, setPrompts] = useState(() => promptsService.list())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreatePromptInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tagsInput, setTagsInput] = useState('')

  const tools = toolsService.list()
  const projects = projectsService.list()

  const refresh = () => setPrompts(promptsService.list())

  const handleCopy = async (prompt: Prompt) => {
    await navigator.clipboard.writeText(prompt.content)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return

    const data: CreatePromptInput = {
      ...form,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      recommendedToolId: form.recommendedToolId || undefined,
      projectId: form.projectId || undefined,
    }

    if (editingId) {
      promptsService.update(editingId, data)
    } else {
      promptsService.create(data)
    }

    setForm(emptyForm)
    setTagsInput('')
    setEditingId(null)
    setShowForm(false)
    refresh()
  }

  const handleEdit = (prompt: Prompt) => {
    setForm({
      title: prompt.title,
      category: prompt.category,
      content: prompt.content,
      recommendedToolId: prompt.recommendedToolId ?? '',
      projectId: prompt.projectId ?? '',
      tags: prompt.tags,
    })
    setTagsInput(prompt.tags.join(', '))
    setEditingId(prompt.id)
    setShowForm(true)
  }

  return (
    <div>
      <PageHeader
        title="Prompts"
        description="Biblioteca de prompts reutilizáveis."
        actions={
          <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setTagsInput('') }}>
            <Plus className="h-4 w-4" /> Novo prompt
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-bg-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{editingId ? 'Editar prompt' : 'Novo prompt'}</h3>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as PromptCategory })}>
                {PROMPT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Ferramenta recomendada</Label>
              <Select value={form.recommendedToolId} onChange={(e) => setForm({ ...form, recommendedToolId: e.target.value })}>
                <option value="">Nenhuma</option>
                {tools.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Projeto</Label>
              <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">Nenhum</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="vendas, live, código" />
            </div>
            <div className="sm:col-span-2">
              <Label>Conteúdo</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="min-h-[160px] font-mono" required />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit">{editingId ? 'Salvar' : 'Criar prompt'}</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {prompts.length === 0 ? (
        <EmptyState
          icon="💬"
          title="Biblioteca vazia"
          description="Salve prompts reutilizáveis para código, pesquisa, design e agentes."
          action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Novo prompt</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              toolName={prompt.recommendedToolId ? toolsService.getById(prompt.recommendedToolId)?.name : undefined}
              onCopy={handleCopy}
              onEdit={handleEdit}
              onDuplicate={() => { promptsService.duplicate(prompt.id); refresh() }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
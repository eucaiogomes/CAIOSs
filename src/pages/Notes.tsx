import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { formatRelative } from '@/lib/utils'
import { notesService } from '@/services/notes.service'
import { projectsService } from '@/services/projects.service'
import type { CreateNoteInput, Note, NoteScope } from '@/types/note'
import { FileText, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const emptyForm: CreateNoteInput = {
  title: '',
  content: '',
  scope: 'general',
  projectId: '',
}

export function Notes() {
  const location = useLocation()
  const preselectedNoteId = (location.state as { noteId?: string } | null)?.noteId
  const [notes, setNotes] = useState(() => notesService.list())
  const [selectedId, setSelectedId] = useState<string | null>(preselectedNoteId ?? notes[0]?.id ?? null)

  useEffect(() => {
    if (preselectedNoteId) setSelectedId(preselectedNoteId)
  }, [preselectedNoteId])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateNoteInput>(emptyForm)

  const projects = projectsService.list()
  const selected = selectedId ? notesService.getById(selectedId) : null

  const refresh = () => {
    const list = notesService.list()
    setNotes(list)
    if (selectedId && !list.find((n) => n.id === selectedId)) {
      setSelectedId(list[0]?.id ?? null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const note = notesService.create({
      ...form,
      projectId: form.projectId || undefined,
    })
    setForm(emptyForm)
    setShowForm(false)
    setSelectedId(note.id)
    refresh()
  }

  const handleSave = (note: Note) => {
    notesService.update(note.id, { title: note.title, content: note.content })
    refresh()
  }

  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')

  useEffect(() => {
    if (selected) {
      setEditTitle(selected.title)
      setEditContent(selected.content)
    }
  }, [selected])

  const selectNote = (note: Note) => {
    setSelectedId(note.id)
  }

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Notas Markdown locais — por projeto, ferramenta ou geral."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Nova nota
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-bg-panel p-5">
          <h3 className="mb-4 text-sm font-semibold">Nova nota</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <Label>Escopo</Label>
              <Select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as NoteScope })}>
                <option value="general">Geral</option>
                <option value="project">Projeto</option>
                <option value="tool">Ferramenta</option>
                <option value="test">Teste</option>
              </Select>
            </div>
            {form.scope === 'project' && (
              <div className="sm:col-span-2">
                <Label>Projeto</Label>
                <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">Selecionar...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </div>
            )}
            <div className="sm:col-span-2">
              <Label>Conteúdo (Markdown)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="min-h-[200px] font-mono" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit">Criar nota</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Nenhuma nota"
          description="Crie notas em Markdown para projetos, ferramentas e experimentos."
          action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Nova nota</Button>}
        />
      ) : (
        <div className="grid min-h-[min(60vh,500px)] gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
          <div className="overflow-y-auto space-y-2">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => selectNote(note)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedId === note.id
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-bg-panel hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-text-muted" />
                  <span className="truncate text-sm font-medium">{note.title}</span>
                </div>
                <p className="mt-1 text-[11px] text-text-muted">{formatRelative(note.updatedAt)}</p>
              </button>
            ))}
          </div>

          {selected && (
            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="border-b border-border">
                <Input
                  value={editTitle || selected.title}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-base font-semibold border-none bg-transparent px-0 focus:ring-0"
                />
                <Button
                  size="sm"
                  onClick={() => handleSave({ ...selected, title: editTitle || selected.title, content: editContent || selected.content })}
                >
                  Salvar
                </Button>
              </CardHeader>
              <Textarea
                value={editContent || selected.content}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 min-h-0 rounded-none border-none bg-transparent font-mono text-sm resize-none focus:ring-0"
              />
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
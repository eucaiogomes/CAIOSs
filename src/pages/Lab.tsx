import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { formatRelative } from '@/lib/utils'
import { experimentsService } from '@/services/experiments.service'
import { projectsService } from '@/services/projects.service'
import { toolsService } from '@/services/tools.service'
import type { CreateExperimentInput } from '@/types/experiment'
import { FlaskConical, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const emptyForm: CreateExperimentInput = {
  title: '',
  objective: '',
  result: '',
  rating: 5,
  shouldContinue: true,
  projectId: '',
  toolsUsed: [],
  commandsUsed: '',
  logs: '',
}

export function Lab() {
  const location = useLocation()
  const preselectedProject = (location.state as { projectId?: string } | null)?.projectId
  const [experiments, setExperiments] = useState(() => experimentsService.list())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateExperimentInput>({
    ...emptyForm,
    projectId: preselectedProject ?? '',
  })

  useEffect(() => {
    if (preselectedProject) {
      setForm((f) => ({ ...f, projectId: preselectedProject }))
      setShowForm(true)
    }
  }, [preselectedProject])

  const projects = projectsService.list()
  const tools = toolsService.list()

  const refresh = () => setExperiments(experimentsService.list())

  const toggleTool = (toolId: string) => {
    setForm((prev) => ({
      ...prev,
      toolsUsed: prev.toolsUsed.includes(toolId)
        ? prev.toolsUsed.filter((id) => id !== toolId)
        : [...prev.toolsUsed, toolId],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    experimentsService.create({
      ...form,
      projectId: form.projectId || undefined,
    })
    setForm(emptyForm)
    setShowForm(false)
    refresh()
  }

  const handleDelete = (id: string) => {
    if (confirm('Remover este experimento?')) {
      experimentsService.remove(id)
      refresh()
    }
  }

  return (
    <div>
      <PageHeader
        title="Lab"
        description="Registre experimentos e testes com ferramentas de IA."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Novo teste
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-bg-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Registrar experimento</h3>
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
              <Label>Projeto</Label>
              <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">Nenhum</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Objetivo</Label>
              <Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Ferramentas usadas</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {tools.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTool(t.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      form.toolsUsed.includes(t.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-secondary hover:border-border/80'
                    }`}
                  >
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Comandos usados</Label>
              <Textarea value={form.commandsUsed} onChange={(e) => setForm({ ...form, commandsUsed: e.target.value })} className="font-mono" placeholder="npm run dev&#10;claude ..." />
            </div>
            <div className="sm:col-span-2">
              <Label>Resultado</Label>
              <Textarea value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} />
            </div>
            <div>
              <Label>Nota (0-10)</Label>
              <Input type="number" min={0} max={10} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="continue"
                checked={form.shouldContinue}
                onChange={(e) => setForm({ ...form, shouldContinue: e.target.checked })}
                className="accent-primary"
              />
              <Label htmlFor="continue" className="mb-0">Vale a pena continuar?</Label>
            </div>
            <div className="sm:col-span-2">
              <Label>Logs</Label>
              <Textarea value={form.logs} onChange={(e) => setForm({ ...form, logs: e.target.value })} className="font-mono text-xs" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit"><FlaskConical className="h-4 w-4" /> Salvar teste</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {experiments.length === 0 ? (
        <EmptyState
          icon="🧪"
          title="Nenhum experimento ainda"
          description="Registre testes de ferramentas novas, integrações e protótipos."
          action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Novo teste</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {experiments.map((exp) => (
            <Card key={exp.id}>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-warning" />
                    {exp.title}
                  </CardTitle>
                  <CardDescription className="mt-1">{exp.objective}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(exp.id)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <p className="mb-3 text-sm text-text-secondary">{exp.result}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {exp.toolsUsed.map((tid) => {
                  const tool = toolsService.getById(tid)
                  return tool ? <Badge key={tid}>{tool.name}</Badge> : null
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>
                  Nota: {exp.rating}/10 · {exp.shouldContinue ? '✓ Continuar' : '✗ Parar'}
                </span>
                <span>{formatRelative(exp.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
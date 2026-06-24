import { ProjectQuickActions } from '@/components/project/ProjectQuickActions'
import { ProjectStats } from '@/components/project/ProjectStats'
import { PromptCard } from '@/components/prompt-editor/PromptCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { useProjectContext } from '@/contexts/ProjectContext'
import { PROJECT_STATUSES } from '@/lib/constants'
import * as tauriBridge from '@/lib/tauri-bridge'
import { formatRelative } from '@/lib/utils'
import { experimentsService } from '@/services/experiments.service'
import { logsService } from '@/services/logs.service'
import { notesService } from '@/services/notes.service'
import { projectsService } from '@/services/projects.service'
import { promptsService } from '@/services/prompts.service'
import { toolLauncher } from '@/services/tool-launcher.service'
import { toolsService } from '@/services/tools.service'
import type { ProjectStatus } from '@/types/project'
import { ArrowLeft, Edit, ExternalLink, FolderOpen, Link2, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setCurrentProject, refresh: refreshContext } = useProjectContext()
  const [refreshKey, setRefreshKey] = useState(0)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', status: 'idea' as ProjectStatus, localPath: '' })
  const [newLink, setNewLink] = useState({ label: '', url: '' })
  const [newNote, setNewNote] = useState({ title: '', content: '' })
  const [showNoteForm, setShowNoteForm] = useState(false)

  const project = useMemo(() => (id ? projectsService.getById(id) : undefined), [id, refreshKey])
  const linkedToolIds = useMemo(() => (id ? projectsService.getLinkedToolIds(id) : []), [id, refreshKey])
  const linkedTools = useMemo(() => linkedToolIds.map((tid) => toolsService.getById(tid)).filter(Boolean), [linkedToolIds])
  const prompts = useMemo(() => (id ? promptsService.getByProject(id) : []), [id, refreshKey])
  const notes = useMemo(() => (id ? notesService.getByProject(id) : []), [id, refreshKey])
  const experiments = useMemo(() => (id ? experimentsService.getByProject(id) : []), [id, refreshKey])
  const projectLogs = useMemo(() => (id ? logsService.getByProject(id).slice(0, 8) : []), [id, refreshKey])
  const allTools = useMemo(() => toolsService.list(), [refreshKey])
  const unlinkedPrompts = useMemo(() => promptsService.list().filter((p) => !p.projectId || p.projectId !== id), [id, refreshKey])

  useEffect(() => {
    if (id) setCurrentProject(id)
  }, [id, setCurrentProject])

  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name,
        description: project.description,
        status: project.status,
        localPath: project.localPath ?? '',
      })
    }
  }, [project])

  const refresh = () => {
    setRefreshKey((k) => k + 1)
    refreshContext()
  }

  if (!project) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-muted">Projeto não encontrado.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
    )
  }

  const status = PROJECT_STATUSES.find((s) => s.value === project.status)
  const unlinkedTools = allTools.filter((t) => !linkedToolIds.includes(t.id))

  const handleSaveEdit = () => {
    projectsService.update(project.id, editForm)
    logsService.add({ type: 'project', message: 'Projeto atualizado', projectId: project.id })
    setEditing(false)
    refresh()
  }

  const handleDelete = () => {
    if (!confirm(`Excluir "${project.name}"? Esta ação não pode ser desfeita.`)) return
    projectsService.remove(project.id)
    setCurrentProject(null)
    navigate('/projects')
  }

  const handleLinkTool = (toolId: string) => {
    projectsService.linkTool(project.id, toolId)
    refresh()
  }

  const handleUnlinkTool = (toolId: string) => {
    projectsService.unlinkTool(project.id, toolId)
    refresh()
  }

  const handleAddLink = () => {
    if (!newLink.label.trim() || !newLink.url.trim()) return
    projectsService.addLink(project.id, newLink)
    setNewLink({ label: '', url: '' })
    refresh()
  }

  const handleLinkPrompt = (promptId: string) => {
    promptsService.update(promptId, { projectId: project.id })
    refresh()
  }

  const handleCreateNote = () => {
    if (!newNote.title.trim()) return
    notesService.create({
      title: newNote.title,
      content: newNote.content || `# ${newNote.title}\n\n`,
      scope: 'project',
      projectId: project.id,
    })
    setNewNote({ title: '', content: '' })
    setShowNoteForm(false)
    refresh()
  }

  const handleCopyPrompt = async (prompt: { content: string }) => {
    await navigator.clipboard.writeText(prompt.content)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link to="/projects" className="mb-3 inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> Projetos
          </Link>

          {editing ? (
            <div className="space-y-3 rounded-xl border border-border bg-bg-panel p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Nome</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ProjectStatus })}>
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Pasta local</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editForm.localPath}
                      onChange={(e) => setEditForm({ ...editForm, localPath: e.target.value })}
                      placeholder="C:/Users/Caio/Projects/..."
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={async () => {
                        const path = await tauriBridge.pickFolder()
                        if (path) setEditForm({ ...editForm, localPath: path })
                      }}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label>Descrição</Label>
                  <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit}><Save className="h-4 w-4" /> Salvar</Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <p className="mt-1 text-sm text-text-secondary">{project.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className={status?.color}>{status?.label}</Badge>
                {project.localPath && (
                  <Badge
                    variant="muted"
                    className="cursor-pointer hover:border-primary/30"
                    onClick={() => tauriBridge.openPath(project.localPath!)}
                  >
                    {project.localPath}
                  </Badge>
                )}
                <span className="text-[11px] text-text-muted">
                  Atualizado {formatRelative(project.updatedAt)}
                </span>
              </div>
            </>
          )}
        </div>

        {!editing && (
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4" /> Editar
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <ProjectStats
        tools={linkedTools.length}
        prompts={prompts.length}
        notes={notes.length}
        experiments={experiments.length}
      />

      <ProjectQuickActions project={project} />

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Ferramentas vinculadas</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {linkedTools.map((tool) => tool && (
            <Badge
              key={tool.id}
              variant="primary"
              className="cursor-pointer gap-2 pr-1 hover:bg-primary/25"
              onClick={() =>
                toolLauncher.launch(tool, {
                  navigate,
                  cwd: project.localPath,
                  projectName: project.name,
                  projectId: project.id,
                })
              }
            >
              {tool.icon} {tool.name}
              <button
                onClick={(e) => { e.stopPropagation(); handleUnlinkTool(tool.id) }}
                className="ml-1 hover:text-danger"
              >
                ×
              </button>
            </Badge>
          ))}
          {linkedTools.length === 0 && (
            <p className="text-xs text-text-muted">Nenhuma ferramenta vinculada.</p>
          )}
        </div>
        {unlinkedTools.length > 0 && (
          <div className="flex items-center gap-2">
            <Label className="mb-0">Adicionar:</Label>
            <Select
              defaultValue=""
              onChange={(e) => { if (e.target.value) handleLinkTool(e.target.value); e.target.value = '' }}
            >
              <option value="">Selecionar ferramenta...</option>
              {unlinkedTools.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Links úteis</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {project.links.map((link) => (
            <Button
              key={link.id}
              variant="secondary"
              size="sm"
              onClick={() => tauriBridge.openUrl(link.url)}
            >
              <ExternalLink className="h-3.5 w-3.5" /> {link.label}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  projectsService.removeLink(project.id, link.id)
                  refresh()
                }}
                className="ml-1 text-text-muted hover:text-danger"
              >
                ×
              </button>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Nome do link"
            value={newLink.label}
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            className="max-w-[160px]"
          />
          <Input
            placeholder="https://..."
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            className="max-w-[240px]"
          />
          <Button size="sm" variant="ghost" onClick={handleAddLink}>
            <Link2 className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary">Prompts</h2>
            {unlinkedPrompts.length > 0 && (
              <Select
                defaultValue=""
                className="h-8 max-w-[180px] text-xs"
                onChange={(e) => { if (e.target.value) handleLinkPrompt(e.target.value); e.target.value = '' }}
              >
                <option value="">Vincular prompt...</option>
                {unlinkedPrompts.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </Select>
            )}
          </div>
          {prompts.length === 0 ? (
            <p className="text-xs text-text-muted">Nenhum prompt vinculado.</p>
          ) : (
            <div className="space-y-3">
              {prompts.map((p) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  toolName={p.recommendedToolId ? toolsService.getById(p.recommendedToolId)?.name : undefined}
                  onCopy={handleCopyPrompt}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary">Notas</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowNoteForm((v) => !v)}>
              <Plus className="h-4 w-4" /> Nova nota
            </Button>
          </div>
          {showNoteForm && (
            <div className="mb-3 rounded-lg border border-border bg-bg-panel p-3 space-y-2">
              <Input
                placeholder="arquitetura.md"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
              <Textarea
                placeholder="# Título\n\nConteúdo..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="font-mono text-xs min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateNote}>Criar</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNoteForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {notes.length === 0 ? (
            <p className="text-xs text-text-muted">Nenhuma nota para este projeto.</p>
          ) : (
            <div className="space-y-2">
              {notes.map((n) => (
                <Card
                  key={n.id}
                  className="cursor-pointer hover:border-primary/30"
                  onClick={() => navigate('/notes', { state: { noteId: n.id } })}
                >
                  <CardHeader className="mb-0">
                    <CardTitle>{n.title}</CardTitle>
                  </CardHeader>
                  <pre className="mt-2 max-h-24 overflow-auto rounded-lg bg-bg-soft p-3 text-xs font-mono text-text-muted whitespace-pre-wrap">
                    {n.content}
                  </pre>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Testes no Lab</h2>
        {experiments.length === 0 ? (
          <p className="text-xs text-text-muted">Nenhum experimento registrado.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {experiments.map((exp) => (
              <Card key={exp.id}>
                <CardHeader className="mb-0">
                  <CardTitle>{exp.title}</CardTitle>
                  <CardDescription>{exp.result}</CardDescription>
                </CardHeader>
                <p className="text-[11px] text-text-muted">Nota: {exp.rating}/10</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Logs do projeto</h2>
        {projectLogs.length === 0 ? (
          <p className="text-xs text-text-muted">Nenhuma atividade registrada ainda.</p>
        ) : (
          <ul className="space-y-2 rounded-xl border border-border bg-bg-panel p-4">
            {projectLogs.map((log) => (
              <li key={log.id} className="flex items-center justify-between text-xs">
                <span className={log.type === 'error' ? 'text-danger' : 'text-text-secondary'}>
                  {log.message}
                </span>
                <span className="text-text-muted">{formatRelative(log.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
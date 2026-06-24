import { ProjectCard } from '@/components/project-card/ProjectCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { useProjectContext } from '@/contexts/ProjectContext'
import { PROJECT_STATUSES } from '@/lib/constants'
import * as tauriBridge from '@/lib/tauri-bridge'
import { projectsService } from '@/services/projects.service'
import type { CreateProjectInput, ProjectStatus } from '@/types/project'
import { FolderOpen, FolderPlus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const emptyForm: CreateProjectInput = {
  name: '',
  description: '',
  status: 'idea',
  localPath: '',
  links: [],
}

export function Projects() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const { setCurrentProject } = useProjectContext()
  const [projects, setProjects] = useState(() => projectsService.list())
  const [search, setSearch] = useState(initialSearch)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateProjectInput>(emptyForm)

  const refresh = () => {
    const list = projectsService.list()
    setProjects(list)
  }

  const filteredProjects = search.trim()
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      )
    : projects

  const handlePickFolder = async () => {
    const path = await tauriBridge.pickFolder()
    if (path) setForm({ ...form, localPath: path })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const project = projectsService.create(form)
    setCurrentProject(project.id)
    setForm(emptyForm)
    setShowForm(false)
    refresh()
    navigate(`/projects/${project.id}`)
  }

  const handleOpenProject = (projectId: string) => {
    setCurrentProject(projectId)
    navigate(`/projects/${projectId}`)
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Espaços de trabalho para organizar ferramentas, prompts e notas."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Novo projeto
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Filtrar projetos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-bg-panel p-5">
          <h3 className="mb-4 text-sm font-semibold">Criar projeto</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Pasta local</Label>
              <div className="flex gap-2">
                <Input
                  value={form.localPath}
                  onChange={(e) => setForm({ ...form, localPath: e.target.value })}
                  placeholder="C:/Users/Caio/Projects/..."
                />
                <Button type="button" variant="secondary" onClick={handlePickFolder}>
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit"><FolderPlus className="h-4 w-4" /> Criar</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="Nenhum projeto ainda"
          description="Crie um projeto para vincular ferramentas, prompts e notas."
          action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Novo projeto</Button>}
        />
      ) : (
        <>
          {search && (
            <div className="mb-3 text-xs text-text-muted">
              Filtrando por: <span className="text-text-primary">"{search}"</span> — {filteredProjects.length} resultado(s)
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <div key={project.id} onClick={() => handleOpenProject(project.id)}>
                <ProjectCard
                  project={project}
                  toolCount={projectsService.getLinkedToolIds(project.id).length}
                />
              </div>
            ))}
          </div>
          {filteredProjects.length === 0 && projects.length > 0 && (
            <p className="text-sm text-text-muted">Nenhum projeto corresponde à busca.</p>
          )}
        </>
      )}
    </div>
  )
}
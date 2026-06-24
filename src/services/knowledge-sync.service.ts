import { deleteMatch, ensureDir, writeFile } from '@/lib/fs-api'
import { evolutionService } from '@/services/evolution.service'
import { experimentsService } from '@/services/experiments.service'
import { logsService } from '@/services/logs.service'
import { notesService } from '@/services/notes.service'
import { projectsService } from '@/services/projects.service'
import { promptsService } from '@/services/prompts.service'
import { toolsService } from '@/services/tools.service'
import { vaultService } from '@/services/vault.service'
import type { Experiment } from '@/types/experiment'
import type { LogEntry } from '@/types/log'
import type { Note } from '@/types/note'
import type { Project } from '@/types/project'
import type { Prompt } from '@/types/prompt'
import type { SyncEntityType } from '@/types/brain'

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[<>:"/\\|?*]/g, '')
    .trim()
    .slice(0, 80) || 'sem-titulo'
}

function filePath(folder: string, title: string, id: string): string {
  const base = vaultService.getCaiOSFolder()
  return `${base}/${folder}/${slugify(title)} (${id.slice(0, 8)}).md`
}

function fm(data: Record<string, string | number | boolean | string[] | undefined>): string {
  const lines = ['---']
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === '') continue
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map((x) => `"${x}"`).join(', ')}]`)
    } else if (typeof v === 'string' && v.includes('\n')) {
      lines.push(`${k}: |`)
      v.split('\n').forEach((line) => lines.push(`  ${line}`))
    } else {
      lines.push(`${k}: ${JSON.stringify(v)}`)
    }
  }
  lines.push('---', '')
  return lines.join('\n')
}

function projectMd(p: Project): string {
  const tools = projectsService
    .getLinkedToolIds(p.id)
    .map((id) => toolsService.getById(id)?.name)
    .filter(Boolean) as string[]

  const toolLinks = projectsService
    .getLinkedToolIds(p.id)
    .map((id) => {
      const t = toolsService.getById(id)
      return t ? `[[${t.name}]]` : ''
    })
    .filter(Boolean)
    .join(' · ')

  return [
    fm({
      caios_id: p.id,
      caios_type: 'project',
      status: p.status,
      created: p.createdAt,
      updated: p.updatedAt,
      tools,
      tags: ['caios', 'projeto'],
    }),
    `# ${p.name}`,
    '',
    `> ${p.description}`,
    '',
    '## Status',
    `- **Estado:** ${p.status}`,
    p.localPath ? `- **Pasta:** \`${p.localPath}\`` : '',
    '',
    toolLinks ? `## Ferramentas\n${toolLinks}` : '',
    p.links.length
      ? `## Links\n${p.links.map((l) => `- [${l.label}](${l.url})`).join('\n')}`
      : '',
    '',
    '---',
    '*Gerado automaticamente pelo CaiOS*',
  ]
    .filter(Boolean)
    .join('\n')
}

function noteMd(n: Note): string {
  const project = n.projectId ? projectsService.getById(n.projectId) : undefined
  const tool = n.toolId ? toolsService.getById(n.toolId) : undefined

  return [
    fm({
      caios_id: n.id,
      caios_type: 'note',
      scope: n.scope,
      project: project?.name,
      tool: tool?.name,
      created: n.createdAt,
      updated: n.updatedAt,
      tags: ['caios', 'nota'],
    }),
    `# ${n.title}`,
    '',
    project ? `Projeto: [[${project.name}]]` : '',
    tool ? `Ferramenta: [[${tool.name}]]` : '',
    '',
    n.content,
    '',
    '---',
    '*Gerado automaticamente pelo CaiOS*',
  ]
    .filter(Boolean)
    .join('\n')
}

function promptMd(p: Prompt): string {
  const project = p.projectId ? projectsService.getById(p.projectId) : undefined
  const tool = p.recommendedToolId ? toolsService.getById(p.recommendedToolId) : undefined

  return [
    fm({
      caios_id: p.id,
      caios_type: 'prompt',
      category: p.category,
      project: project?.name,
      tool: tool?.name,
      tags: ['caios', 'prompt', ...p.tags],
      created: p.createdAt,
      updated: p.updatedAt,
    }),
    `# ${p.title}`,
    '',
    `**Categoria:** ${p.category}`,
    project ? `**Projeto:** [[${project.name}]]` : '',
    tool ? `**Ferramenta:** [[${tool.name}]]` : '',
    '',
    '## Prompt',
    '```',
    p.content,
    '```',
    '',
    '---',
    '*Gerado automaticamente pelo CaiOS*',
  ]
    .filter(Boolean)
    .join('\n')
}

function experimentMd(e: Experiment): string {
  const project = e.projectId ? projectsService.getById(e.projectId) : undefined
  const toolNames = e.toolsUsed
    .map((id) => toolsService.getById(id)?.name)
    .filter(Boolean) as string[]

  return [
    fm({
      caios_id: e.id,
      caios_type: 'experiment',
      rating: e.rating,
      continue: e.shouldContinue,
      project: project?.name,
      tools: toolNames,
      tags: ['caios', 'experimento'],
      created: e.createdAt,
      updated: e.updatedAt,
    }),
    `# ${e.title}`,
    '',
    project ? `Projeto: [[${project.name}]]` : '',
    toolNames.length ? `Ferramentas: ${toolNames.map((t) => `[[${t}]]`).join(' · ')}` : '',
    '',
    '## Objetivo',
    e.objective,
    '',
    '## Resultado',
    e.result,
    '',
    `**Nota:** ${e.rating}/5 · **Continuar?** ${e.shouldContinue ? 'Sim' : 'Não'}`,
    e.commandsUsed ? `\n## Comandos\n\`\`\`\n${e.commandsUsed}\n\`\`\`` : '',
    e.logs ? `\n## Logs\n\`\`\`\n${e.logs}\n\`\`\`` : '',
    '',
    '---',
    '*Gerado automaticamente pelo CaiOS*',
  ]
    .filter(Boolean)
    .join('\n')
}

function logMd(l: LogEntry): string {
  const project = l.projectId ? projectsService.getById(l.projectId) : undefined
  const tool = l.toolId ? toolsService.getById(l.toolId) : undefined

  return [
    fm({
      caios_id: l.id,
      caios_type: 'log',
      log_type: l.type,
      project: project?.name,
      tool: tool?.name,
      tags: ['caios', 'log'],
      created: l.createdAt,
    }),
    `# Log — ${l.type}`,
    '',
    project ? `Projeto: [[${project.name}]]` : '',
    tool ? `Ferramenta: [[${tool.name}]]` : '',
    '',
    l.message,
    '',
    '---',
    '*Gerado automaticamente pelo CaiOS*',
  ]
    .filter(Boolean)
    .join('\n')
}

function indexMd(): string {
  const projects = projectsService.list()
  const notes = notesService.list()
  const prompts = promptsService.list()
  const experiments = experimentsService.list()

  const section = (title: string, items: { title: string }[]) => {
    if (!items.length) return ''
    return [
      `## ${title}`,
      ...items.map((i) => `- [[${i.title}]]`),
      '',
    ].join('\n')
  }

  return [
    fm({
      caios_type: 'index',
      updated: new Date().toISOString(),
      tags: ['caios', 'indice'],
    }),
    '# CaiOS — Segundo Cérebro',
    '',
    '> Tudo que você cria no CaiOS vive aqui. Cada dia, este grafo cresce.',
    '',
    `- **Projetos:** ${projects.length}`,
    `- **Notas:** ${notes.length}`,
    `- **Prompts:** ${prompts.length}`,
    `- **Experimentos:** ${experiments.length}`,
    '',
    section('Projetos', projects.map((p) => ({ title: p.name }))),
    section('Notas', notes),
    section('Prompts', prompts),
    section('Experimentos', experiments),
    '',
    '[[CaiOS]]',
    '',
    '---',
    '*Índice gerado automaticamente pelo CaiOS*',
  ]
    .filter(Boolean)
    .join('\n')
}

let syncQueue: Promise<void> = Promise.resolve()

function enqueue(task: () => Promise<void>): void {
  syncQueue = syncQueue.then(task).catch((err) => {
    console.warn('[CaiOS Sync]', err)
  })
}

async function writeEntity(
  folder: string,
  title: string,
  id: string,
  content: string,
): Promise<void> {
  const base = vaultService.getCaiOSFolder()
  await ensureDir(`${base}/${folder}`)
  await writeFile(filePath(folder, title, id), content)
}

export const knowledgeSyncService = {
  schedule(type: SyncEntityType, id?: string): void {
    enqueue(async () => {
      evolutionService.recordAction()
      if (type === 'index') {
        await this.syncIndex()
        return
      }
      if (type === 'project' && id) {
        const p = projectsService.getById(id)
        if (p) await writeEntity('Projetos', p.name, p.id, projectMd(p))
        else if (id) await this.removeEntity('Projetos', id)
      }
      if (type === 'note' && id) {
        const n = notesService.getById(id)
        if (n) await writeEntity('Notas', n.title, n.id, noteMd(n))
        else await this.removeEntity('Notas', id)
      }
      if (type === 'prompt' && id) {
        const p = promptsService.getById(id)
        if (p) await writeEntity('Prompts', p.title, p.id, promptMd(p))
        else await this.removeEntity('Prompts', id)
      }
      if (type === 'experiment' && id) {
        const e = experimentsService.getById(id)
        if (e) await writeEntity('Experimentos', e.title, e.id, experimentMd(e))
        else await this.removeEntity('Experimentos', id)
      }
      if (type === 'log' if (type === 'log' && id) {if (type === 'log' && id) { id) {
        const l = logsService.list().find((x) => x.id === id)
        if (l) await writeEntity('Logs', `${l.type} ${l.createdAt.slice(0, 10)}`, l.id, logMd(l))
      }
      if (type === 'lector-execution' if (type === 'log' && id) {if (type === 'log' && id) { id) {
        // Lector executions are primarily saved directly via lector.service
        console.log('[knowledgeSync] Lector execution sync requested', id)
      }
      await this.syncIndex()
        const l = logsService.list().find((x) => x.id === id)
        if (l) await writeEntity('Logs', `${l.type} ${l.createdAt.slice(0, 10)}`, l.id, logMd(l))
      }
      await this.syncIndex()
    })
  },

  async syncIndex(): Promise<void> {
    const base = vaultService.getCaiOSFolder()
    await ensureDir(base)
    await writeFile(`${base}/00 - Índice CaiOS.md`, indexMd())
  },

  async removeEntity(folder: string, id: string): Promise<void> {
    const prefix = id.slice(0, 8)
    const dir = `${vaultService.getCaiOSFolder()}/${folder}`
    try {
      await deleteMatch(dir, prefix)
    } catch {
      // best-effort
    }
  },

  async syncAll(): Promise<void> {
    const base = vaultService.getCaiOSFolder()
    await ensureDir(base)
    for (const folder of ['Projetos', 'Notas', 'Prompts', 'Experimentos', 'Logs']) {
      await ensureDir(`${base}/${folder}`)
    }

    for (const p of projectsService.list()) {
      await writeEntity('Projetos', p.name, p.id, projectMd(p))
    }
    for (const n of notesService.list()) {
      await writeEntity('Notas', n.title, n.id, noteMd(n))
    }
    for (const p of promptsService.list()) {
      await writeEntity('Prompts', p.title, p.id, promptMd(p))
    }
    for (const e of experimentsService.list()) {
      await writeEntity('Experimentos', e.title, e.id, experimentMd(e))
    }
    for (const l of logsService.list().slice(0, 50)) {
      await writeEntity('Logs', `${l.type} ${l.createdAt.slice(0, 10)}`, l.id, logMd(l))
    }
    await this.syncIndex()
    evolutionService.recordAction(projectsService.list().length + notesService.list().length)
  },

  migrateVaultPath(): void {
    const tool = toolsService.getById('tool-obsidian')
    if (tool?.path?.includes('Caio/Documents/ObsidianVault')) {
      vaultService.setVaultPath('C:/Users/gcaio/OneDrive/Documentos/caio')
    }
  },
}
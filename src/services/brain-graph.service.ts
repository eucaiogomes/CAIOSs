import { scanVault } from '@/lib/fs-api'
import { experimentsService } from '@/services/experiments.service'
import { logsService } from '@/services/logs.service'
import { notesService } from '@/services/notes.service'
import { projectsService } from '@/services/projects.service'
import { promptsService } from '@/services/prompts.service'
import { toolsService } from '@/services/tools.service'
import { vaultService } from '@/services/vault.service'
import type { BrainGraphData, BrainLink, BrainNode, BrainNodeKind } from '@/types/brain'

const NODE_COLORS: Record<BrainNodeKind, string> = {
  'caios-root': '#ff7a1a',
  vault: '#a78bfa',
  project: '#2563eb',
  note: '#22c55e',
  prompt: '#f59e0b',
  experiment: '#ec4899',
  tool: '#06b6d4',
  log: '#6f778b',
  tag: '#8b5cf6',
}

function nodeId(kind: BrainNodeKind, id: string): string {
  return `${kind}:${id}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function addNode(
  nodes: Map<string, BrainNode>,
  kind: BrainNodeKind,
  id: string,
  label: string,
  source: 'caios' | 'obsidian',
  sizeBoost = 0,
  meta?: Record<string, string>,
): string {
  const nid = nodeId(kind, id)
  if (!nodes.has(nid)) {
    const baseSize =
      kind === 'caios-root' ? 14
      : kind === 'project' ? 8
      : kind === 'vault' ? 10
      : kind === 'tool' ? 6
      : 5
    nodes.set(nid, {
      id: nid,
      label,
      kind,
      size: baseSize + sizeBoost,
      color: NODE_COLORS[kind],
      source,
      meta,
    })
  }
  return nid
}

function addLink(
  links: BrainLink[],
  seen: Set<string>,
  source: string,
  target: string,
  kind: BrainLink['kind'],
  strength = 0.6,
): void {
  if (source === target) return
  const key = `${source}|${target}|${kind}`
  if (seen.has(key)) return
  seen.add(key)
  links.push({ source, target, kind, strength })
}

export const brainGraphService = {
  async build(): Promise<BrainGraphData> {
    const nodes = new Map<string, BrainNode>()
    const links: BrainLink[] = []
    const seen = new Set<string>()

    const rootId = addNode(nodes, 'caios-root', 'main', 'CaiOS', 'caios', 4)

    const projects = projectsService.list()
    for (const p of projects) {
      const pid = addNode(nodes, 'project', p.id, p.name, 'caios', 1, { status: p.status })
      addLink(links, seen, rootId, pid, 'belongs', 0.9)

      for (const toolId of projectsService.getLinkedToolIds(p.id)) {
        const tool = toolsService.getById(toolId)
        if (!tool) continue
        const tid = addNode(nodes, 'tool', tool.id, tool.name, 'caios')
        addLink(links, seen, pid, tid, 'uses', 0.7)
        addLink(links, seen, rootId, tid, 'related', 0.4)
      }
    }

    for (const note of notesService.list()) {
      const nid = addNode(nodes, 'note', note.id, note.title, 'caios')
      addLink(links, seen, rootId, nid, 'belongs', 0.5)
      if (note.projectId) {
        const pid = nodeId('project', note.projectId)
        if (nodes.has(pid)) addLink(links, seen, nid, pid, 'belongs', 0.8)
      }
      if (note.toolId) {
        const tid = nodeId('tool', note.toolId)
        if (nodes.has(tid)) addLink(links, seen, nid, tid, 'related', 0.6)
      }
    }

    for (const prompt of promptsService.list()) {
      const prid = addNode(nodes, 'prompt', prompt.id, prompt.title, 'caios')
      addLink(links, seen, rootId, prid, 'belongs', 0.5)
      if (prompt.projectId) {
        const pid = nodeId('project', prompt.projectId)
        if (nodes.has(pid)) addLink(links, seen, prid, pid, 'belongs', 0.7)
      }
      if (prompt.recommendedToolId) {
        const tid = nodeId('tool', prompt.recommendedToolId)
        if (nodes.has(tid)) addLink(links, seen, prid, tid, 'uses', 0.6)
      }
      for (const tag of prompt.tags) {
        const tagId = addNode(nodes, 'tag', slugify(tag), `#${tag}`, 'caios', 0)
        addLink(links, seen, prid, tagId, 'tag', 0.4)
      }
    }

    for (const exp of experimentsService.list()) {
      const eid = addNode(nodes, 'experiment', exp.id, exp.title, 'caios')
      addLink(links, seen, rootId, eid, 'belongs', 0.5)
      if (exp.projectId) {
        const pid = nodeId('project', exp.projectId)
        if (nodes.has(pid)) addLink(links, seen, eid, pid, 'belongs', 0.8)
      }
      for (const toolId of exp.toolsUsed) {
        const tid = nodeId('tool', toolId)
        if (nodes.has(tid)) addLink(links, seen, eid, tid, 'uses', 0.6)
      }
    }

    for (const log of logsService.list().slice(0, 30)) {
      const lid = addNode(nodes, 'log', log.id, log.message.slice(0, 40), 'caios', 0)
      addLink(links, seen, rootId, lid, 'related', 0.2)
      if (log.projectId) {
        const pid = nodeId('project', log.projectId)
        if (nodes.has(pid)) addLink(links, seen, lid, pid, 'belongs', 0.5)
      }
    }

    try {
      const vaultPath = vaultService.getVaultPath()
      const vaultRootId = addNode(nodes, 'vault', 'root', 'Obsidian', 'obsidian', 3)
      addLink(links, seen, rootId, vaultRootId, 'related', 0.95)

      const files = await scanVault(vaultPath)
      const titleToNode = new Map<string, string>()

      for (const file of files) {
        const fid = addNode(
          nodes,
          'note',
          `vault-${slugify(file.title)}`,
          file.title,
          'obsidian',
          file.folder.includes('CaiOS') ? 2 : 0,
          { path: file.path },
        )
        titleToNode.set(file.title.toLowerCase(), fid)
        addLink(links, seen, vaultRootId, fid, 'belongs', 0.5)

        for (const tag of file.tags) {
          const tagId = addNode(nodes, 'tag', `vault-${slugify(tag)}`, `#${tag}`, 'obsidian', 0)
          addLink(links, seen, fid, tagId, 'tag', 0.35)
        }
      }

      for (const file of files) {
        const fromId = titleToNode.get(file.title.toLowerCase())
        if (!fromId) continue
        for (const linkTitle of file.links) {
          const toId = titleToNode.get(linkTitle.toLowerCase())
          if (toId) addLink(links, seen, fromId, toId, 'wikilink', 0.85)
        }
      }
    } catch (err) {
      console.warn('[CaiOS Brain] Vault scan falhou:', err)
    }

    return {
      nodes: Array.from(nodes.values()),
      links,
    }
  },
}
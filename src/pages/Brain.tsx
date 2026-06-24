import { PageFullBleed } from '@/components/layout/PageFullBleed'
import { Button } from '@/components/ui/button'
import { brainGraphService } from '@/services/brain-graph.service'
import { evolutionService } from '@/services/evolution.service'
import { knowledgeSyncService } from '@/services/knowledge-sync.service'
import { vaultService } from '@/services/vault.service'
import { openPath } from '@/lib/tauri-bridge'
import type { BrainGraphData, BrainNode } from '@/types/brain'
import {
  Brain,
  ExternalLink,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D, {
  type ForceGraphMethods,
  type LinkObject,
} from 'react-force-graph-2d'

type GraphNode = BrainNode & { x?: number; y?: number }
type GraphLink = LinkObject<GraphNode>

export function BrainPage() {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(undefined)
  const [data, setData] = useState<BrainGraphData>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [hovered, setHovered] = useState<BrainNode | null>(null)
  const [filter, setFilter] = useState<'all' | 'caios' | 'obsidian'>('all')

  const metrics = useMemo(
    () => evolutionService.getMetrics(data.nodes.length, data.links.length),
    [data],
  )

  const filteredData = useMemo(() => {
    if (filter === 'all') return data
    const nodes = data.nodes.filter((n) => n.source === filter || n.kind === 'caios-root')
    const ids = new Set(nodes.map((n) => n.id))
    const links = data.links.filter((l) => {
      const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
      const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
      return ids.has(s) && ids.has(t)
    })
    return { nodes, links }
  }, [data, filter])

  const loadGraph = useCallback(async () => {
    setLoading(true)
    try {
      const graph = await brainGraphService.build()
      setData(graph)
      evolutionService.recordSnapshot(graph.nodes.length, graph.links.length)
      evolutionService.touch()
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSync = useCallback(async () => {
    setSyncing(true)
    try {
      await knowledgeSyncService.syncAll()
      await loadGraph()
    } finally {
      setSyncing(false)
    }
  }, [loadGraph])

  useEffect(() => {
    loadGraph()
  }, [loadGraph])

  useEffect(() => {
    const t = setTimeout(() => {
      graphRef.current?.zoomToFit(500, 60)
    }, 800)
    return () => clearTimeout(t)
  }, [filteredData])

  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = (node.size ?? 5) / globalScale
    const glow = node.kind === 'caios-root' ? size * 3 : size * 1.8

    const grad = ctx.createRadialGradient(node.x ?? 0, node.y ?? 0, 0, node.x ?? 0, node.y ?? 0, glow)
    grad.addColorStop(0, `${node.color}55`)
    grad.addColorStop(1, `${node.color}00`)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(node.x ?? 0, node.y ?? 0, glow, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = node.color
    ctx.beginPath()
    ctx.arc(node.x ?? 0, node.y ?? 0, size, 0, 2 * Math.PI)
    ctx.fill()

    if (globalScale > 0.8 && size > 3) {
      ctx.font = `${Math.max(10 / globalScale, 2.5)}px IBM Plex Sans, sans-serif`
      ctx.fillStyle = '#f5f7fab3'
      ctx.textAlign = 'center'
      ctx.fillText(node.label.slice(0, 28), node.x ?? 0, (node.y ?? 0) + size + 8 / globalScale)
    }
  }, [])

  const paintLink = useCallback((link: GraphLink, ctx: CanvasRenderingContext2D) => {
    const src = link.source as GraphNode
    const tgt = link.target as GraphNode
    if (src.x == null || tgt.x == null) return

    const kind = (link as { kind?: string }).kind
    const alpha = kind === 'wikilink' ? 0.45 : kind === 'belongs' ? 0.35 : 0.2

    ctx.strokeStyle = `rgba(255, 122, 26, ${alpha})`
    ctx.lineWidth = kind === 'wikilink' ? 1.2 : 0.6
    ctx.beginPath()
    ctx.moveTo(src.x!, src.y!)
    ctx.lineTo(tgt.x!, tgt.y!)
    ctx.stroke()
  }, [])

  return (
    <PageFullBleed className="flex flex-col">
      <div className="brain-mesh relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 brain-mesh-glow" />

        {!loading && (
          <ForceGraph2D
            ref={graphRef}
            graphData={filteredData}
            backgroundColor="transparent"
            nodeCanvasObject={paintNode}
            linkCanvasObject={paintLink}
            nodePointerAreaPaint={(node, color, ctx) => {
              const n = node as GraphNode
              const size = (n.size ?? 5) * 1.5
              ctx.fillStyle = color
              ctx.beginPath()
              ctx.arc(n.x ?? 0, n.y ?? 0, size, 0, 2 * Math.PI)
              ctx.fill()
            }}
            linkDirectionalParticles={1}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.004}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            warmupTicks={80}
            cooldownTicks={200}
            onNodeHover={(node) => setHovered((node as BrainNode | null) ?? null)}
            onNodeClick={(node) => {
              const n = node as BrainNode
              if (n.meta?.path) openPath(n.meta.path)
            }}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg-main/90 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-main/80 to-transparent" />

        <header className="absolute left-0 right-0 top-0 z-10 flex flex-wrap items-start justify-between gap-2 p-3 sm:gap-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold tracking-tight">Segundo Cérebro</h1>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                {metrics.maturityLabel}
              </span>
            </div>
            <p className="mt-1 max-w-md text-xs text-text-muted">
              Dia {metrics.daysSinceStart} · {data.nodes.length} neurônios · {data.links.length} sinapses
            </p>
          </div>

          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border bg-bg-panel/80 p-0.5 backdrop-blur">
              {(['all', 'caios', 'obsidian'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    filter === f ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {f === 'all' ? 'Tudo' : f === 'caios' ? 'CaiOS' : 'Obsidian'}
                </button>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSync}
              disabled={syncing || loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
              Sync Obsidian
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openPath(vaultService.getVaultPath())}
              title="Abrir pasta do vault no explorador"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] text-text-muted ml-2 truncate max-w-[220px]" title={vaultService.getVaultPath()}>
              {vaultService.getVaultPath()}
            </span>
          </div>
        </header>

        <aside className="pointer-events-auto absolute bottom-3 left-3 z-10 hidden w-52 space-y-3 sm:bottom-5 sm:left-5 sm:block sm:w-56">
          <div className="rounded-xl border border-border bg-bg-panel/85 p-4 backdrop-blur">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              <TrendingUp className="h-3 w-3" />
              Evolução
            </div>
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-bg-soft">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue transition-all duration-700"
                style={{ width: `${metrics.level}%` }}
              />
            </div>
            <p className="text-2xl font-semibold tabular-nums">{metrics.level}%</p>
            <p className="text-[10px] text-text-muted">
              {metrics.daysActive} dias ativos · {metrics.totalActions} ações
            </p>
            {metrics.growthPercent > 0 && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-success">
                <Sparkles className="h-3 w-3" />
                +{metrics.growthPercent}% desde o início
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-bg-panel/85 p-3 backdrop-blur">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Legenda
            </p>
            <ul className="space-y-1 text-[10px] text-text-secondary">
              <li><span className="inline-block h-2 w-2 rounded-full bg-primary mr-1.5" />CaiOS</li>
              <li><span className="inline-block h-2 w-2 rounded-full bg-blue mr-1.5" />Projetos</li>
              <li><span className="inline-block h-2 w-2 rounded-full bg-success mr-1.5" />Notas</li>
              <li><span className="inline-block h-2 w-2 rounded-full bg-warning mr-1.5" />Prompts</li>
              <li><span className="inline-block h-2 w-2 rounded-full bg-[#a78bfa] mr-1.5" />Obsidian</li>
            </ul>
          </div>
        </aside>

        {hovered && (
          <div className="pointer-events-none absolute bottom-3 right-3 z-10 max-w-[min(280px,90vw)] rounded-xl border border-border bg-bg-panel/90 p-3 backdrop-blur sm:bottom-5 sm:right-5 sm:max-w-xs sm:p-4">
            <p className="text-sm font-medium">{hovered.label}</p>
            <p className="mt-0.5 text-[10px] capitalize text-text-muted">
              {hovered.kind} · {hovered.source}
            </p>
            {hovered.meta?.path && (
              <p className="mt-1 truncate text-[10px] text-text-muted">{hovered.meta.path}</p>
            )}
          </div>
        )}

        {(loading || syncing) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg-main/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Zap className="h-8 w-8 animate-pulse text-primary" />
              <p className="text-sm text-text-secondary">
                {syncing ? 'Sincronizando com Obsidian...' : 'Mapeando seu cérebro...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageFullBleed>
  )
}
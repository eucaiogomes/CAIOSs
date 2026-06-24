import {
  explorerCdpService,
  getExplorerCdpStreamUrl,
  type ExplorerCdpEvent,
} from '@/services/explorer-cdp.service'
import { explorerService } from '@/services/explorer.service'
import type { ExplorerEventKind } from '@/types/explorer'
import { useCallback, useEffect, useRef, useState } from 'react'

const CDP_KINDS = new Set<ExplorerEventKind>([
  'navigation',
  'interaction',
  'network',
  'entity',
  'flow',
  'evidence',
  'inference',
  'insight',
  'system',
])

function mapCdpKind(kind: string): ExplorerEventKind {
  if (CDP_KINDS.has(kind as ExplorerEventKind)) return kind as ExplorerEventKind
  return 'evidence'
}

export function useExplorerCdp(onEventsChanged?: () => void) {
  const [available, setAvailable] = useState(false)
  const [connected, setConnected] = useState(false)
  const [previewFrame, setPreviewFrame] = useState<string | null>(null)
  const [cdpError, setCdpError] = useState<string | null>(null)
  const [navigating, setNavigating] = useState(false)
  const seenIdsRef = useRef(new Set<string>())
  const wsRef = useRef<WebSocket | null>(null)

  const ingestEvent = useCallback(
    (event: ExplorerCdpEvent) => {
      if (seenIdsRef.current.has(event.id)) return
      seenIdsRef.current.add(event.id)
      explorerService.addTimelineEvent(
        mapCdpKind(event.kind),
        event.label,
        event.detail,
        event.url,
      )
      onEventsChanged?.()
    },
    [onEventsChanged],
  )

  const connectStream = useCallback(() => {
    wsRef.current?.close()
    const ws = new WebSocket(getExplorerCdpStreamUrl())
    wsRef.current = ws
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as {
          type: string
          data?: string
          event?: ExplorerCdpEvent
        }
        if (msg.type === 'frame' && msg.data) setPreviewFrame(msg.data)
        if (msg.type === 'event' && msg.event) ingestEvent(msg.event)
      } catch {
        /* ignore */
      }
    }
    ws.onerror = () => setCdpError('Stream CDP desconectado')
  }, [ingestEvent])

  const boot = useCallback(async () => {
    setCdpError(null)
    try {
      await explorerCdpService.status()
      setAvailable(true)
      const result = await explorerCdpService.connect()
      setConnected(result.connected)
      connectStream()
      const shot = await explorerCdpService.screenshot()
      if (shot.data) setPreviewFrame(shot.data)
    } catch (err) {
      setAvailable(false)
      setConnected(false)
      setCdpError(err instanceof Error ? err.message : 'CDP indisponível')
    }
  }, [connectStream])

  useEffect(() => {
    void boot()
    return () => {
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [boot])

  const navigate = useCallback(
    async (url: string) => {
      setNavigating(true)
      setCdpError(null)
      try {
        if (!connected) {
          await explorerCdpService.connect()
          setConnected(true)
          connectStream()
        }
        await explorerCdpService.navigate(url)
        explorerService.setCurrentUrl(url)
        onEventsChanged?.()
      } catch (err) {
        setCdpError(err instanceof Error ? err.message : 'Falha na navegação CDP')
        throw err
      } finally {
        setNavigating(false)
      }
    },
    [connected, connectStream, onEventsChanged],
  )

  const captureSnapshot = useCallback(async () => {
    return explorerCdpService.snapshot()
  }, [])

  return {
    available,
    connected,
    previewFrame,
    cdpError,
    navigating,
    navigate,
    captureSnapshot,
    retry: boot,
  }
}
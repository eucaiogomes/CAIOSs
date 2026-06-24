import {
  fetchHermesCronJobs,
  fetchHermesKanbanBoard,
  type HermesCronJob,
  type KanbanBoardResponse,
} from '@/lib/hermes-api'
import { ensureDashboard } from '@/services/hermes-dashboard.service'
import { useCallback, useEffect, useRef, useState } from 'react'

const POLL_MS = 5_000

export function useMissionControlFeed() {
  const [board, setBoard] = useState<KanbanBoardResponse | null>(null)
  const [cronJobs, setCronJobs] = useState<HermesCronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reqRef = useRef(0)

  const refresh = useCallback(async () => {
    const myReq = ++reqRef.current
    try {
      const ok = await ensureDashboard()
      if (reqRef.current !== myReq) return
      setOnline(ok)
      if (!ok) {
        setError('Hermes offline — inicie o dashboard para ver kanban e cron jobs')
        return
      }

      const [boardRes, cronRes] = await Promise.all([
        fetchHermesKanbanBoard(),
        fetchHermesCronJobs('all'),
      ])
      if (reqRef.current !== myReq) return

      setBoard(boardRes)
      setCronJobs(cronRes)
      setError(null)
    } catch (err) {
      if (reqRef.current !== myReq) return
      setOnline(false)
      setError(err instanceof Error ? err.message : 'Falha ao carregar Mission Control')
    } finally {
      if (reqRef.current === myReq) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const timer = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  const activeTaskCount = board
    ? board.columns
        .filter((c) => c.name !== 'done' && c.name !== 'archived')
        .reduce((sum, c) => sum + c.tasks.length, 0)
    : 0

  const runningCount =
    board?.columns.find((c) => c.name === 'running')?.tasks.length ?? 0

  return {
    board,
    cronJobs,
    loading,
    online,
    error,
    activeTaskCount,
    runningCount,
    refresh,
  }
}
import { useCallback, useEffect, useRef, useState } from 'react'
import { HermesGateway } from '@/lib/hermes-gateway'
import {
  fetchHermesSessionToken,
  getHermesWsUrl,
} from '@/lib/hermes-api'
import { ensureDashboard } from '@/services/hermes-dashboard.service'
import { lectorService } from '@/services/lector.service'
import { knowledgeSyncService } from '@/services/knowledge-sync.service'
import type { LectorAgent, LectorExecution, LectorLog } from '@/types/lector'

let persistentLectorGateway: HermesGateway | null = null

function getOrCreateGateway(): HermesGateway {
  if (!persistentLectorGateway) {
    persistentLectorGateway = new HermesGateway()
  }
  return persistentLectorGateway
}

export function useLectorAgent() {
  const [currentAgent, setCurrentAgent] = useState<LectorAgent | null>(null)
  const [execution, setExecution] = useState<LectorExecution | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gatewayRef = useRef<HermesGateway | null>(null)
  const mountedRef = useRef(true)

  // Setup gateway and listeners
  useEffect(() => {
    mountedRef.current = true
    const gw = getOrCreateGateway()
    gatewayRef.current = gw

    const unsub = [
      gw.on('tool.start', (ev: any) => {
        if (!mountedRef.current || !execution) return
        updateExecutionWithLog({
          type: 'tool',
          message: `Ferramenta: ${ev.payload?.tool || 'desconhecida'}`,
          toolName: ev.payload?.tool,
        })
      }),
      gw.on('tool.complete', (ev: any) => {
        if (!mountedRef.current || !execution) return
        updateExecutionWithLog({
          type: 'success',
          message: `Concluído: ${ev.payload?.tool || 'ação'}`,
          toolName: ev.payload?.tool,
        })
      }),
      gw.on('message.complete', (ev: any) => {
        if (!mountedRef.current) return
        const text = ev.payload?.text || ev.payload || ''
        handleMessageComplete(String(text))
      }),
      gw.on('error', (ev: any) => {
        if (!mountedRef.current) return
        setError(String(ev.payload?.message || 'Erro na conexão Hermes'))
        setIsRunning(false)
      }),
    ]

    return () => {
      mountedRef.current = false
      unsub.forEach((fn) => fn())
    }
  }, [execution])

  const updateExecutionWithLog = useCallback((log: Omit<LectorLog, 'id' | 'timestamp'>) => {
    setExecution((prev) => {
      if (!prev) return prev
      return lectorService.addLog(prev, log)
    })
  }, [])

  const handleMessageComplete = useCallback((text: string) => {
    if (!currentAgent || !execution) return

    const result = lectorService.parseResult(text, currentAgent)
    let completed = lectorService.completeExecution(execution, result)

    setExecution(completed)
    setIsRunning(false)

    // === FASE 4: Dupla garantia de salvamento no Obsidian ===
    // 1. Via prompt no Hermes
    // 2. Escrita direta pelo CaiOS
    setTimeout(async () => {
      if (mountedRef.current) {
        try {
          // Escrita direta (mais confiável)
          const path = await lectorService.saveExecutionToObsidian(completed)
          if (path) {
            completed.obsidianPath = path
            setExecution(completed)
          }
        } catch (e) {
          console.warn('Falha no save direto, tentando via Hermes')
        }
        
        // Também pede via Hermes
        triggerObsidianSave(currentAgent, completed)
        
        // Tenta registrar no knowledge sync
        try {
          knowledgeSyncService.schedule('lector-execution' as any, completed.id)
        } catch {}
      }
    }, 800)
  }, [currentAgent, execution])

  const triggerObsidianSave = async (agent: LectorAgent, exec: LectorExecution) => {
    updateExecutionWithLog({
      type: 'obsidian',
      message: 'Solicitando salvamento automático no Obsidian...',
    })
    const savePrompt = lectorService.buildObsidianSavePrompt(agent, exec)
    await submitPrompt(savePrompt, true)
  }

  const submitPrompt = useCallback(async (text: string, silent = false) => {
    const gw = gatewayRef.current
    if (!gw) throw new Error('Gateway não disponível')

    try {
      await ensureDashboard()

      if (gw.state !== 'open') {
        const token = await fetchHermesSessionToken()
        const wsUrl = getHermesWsUrl(token)
        await gw.connect(wsUrl)
      }

      // Use the request method like Explorer does
      await gw.request?.('prompt.submit', {
        text: text.trim(),
      }, 90000)

      return true
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'Falha ao comunicar com Hermes')
      }
      throw err
    }
  }, [])

  // Public API
  const selectAgent = useCallback((agent: LectorAgent) => {
    setCurrentAgent(agent)
    setExecution(null)
    setError(null)
  }, [])

  const sendRequest = useCallback(async (userPrompt: string) => {
    if (!currentAgent) return

    setError(null)
    setIsRunning(true)

    const newExec = lectorService.createExecution(currentAgent, userPrompt)
    setExecution(newExec)

    updateExecutionWithLog({
      type: 'info',
      message: `Agente ${currentAgent.name} iniciado`,
    })

    try {
      const fullPrompt = lectorService.buildLectorPrompt(currentAgent, userPrompt)
      await submitPrompt(fullPrompt)
    } catch (err: any) {
      const failed = lectorService.failExecution(newExec, err.message)
      setExecution(failed)
      setIsRunning(false)
    }
  }, [currentAgent, submitPrompt, updateExecutionWithLog])

  const saveToObsidian = useCallback(async () => {
    if (!currentAgent || !execution) return
    const savePrompt = lectorService.buildObsidianSavePrompt(currentAgent, execution)
    await submitPrompt(savePrompt, true)
  }, [currentAgent, execution, submitPrompt])

  const reset = useCallback(() => {
    setCurrentAgent(null)
    setExecution(null)
    setError(null)
    setIsRunning(false)
  }, [])

  return {
    currentAgent,
    execution,
    isRunning,
    error,
    selectAgent,
    sendRequest,
    saveToObsidian,
    reset,
  }
}

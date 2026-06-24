import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { LectorLiveLogs } from './LectorLiveLogs'
import { LectorResultsPanel } from './LectorResultsPanel'
import { useLectorAgent } from '@/hooks/useLectorAgent'
import type { LectorAgent, LectorExecution } from '@/types/lector'
import { Play, RotateCcw, Save } from 'lucide-react'

interface LectorWorkspaceProps {
  agent: LectorAgent
  onBack: () => void
  onComplete?: (execution: LectorExecution) => void
}

export function LectorWorkspace({ agent, onBack, onComplete }: LectorWorkspaceProps) {
  const {
    execution,
    isRunning,
    error,
    sendRequest,
    saveToObsidian,
    reset,
  } = useLectorAgent()

  const [prompt, setPrompt] = useState(agent.promptTemplate.replace('{quantidade}', '5'))
  const [quantity, setQuantity] = useState(5)

  // Atualiza prompt quando quantidade muda (apenas para agente de cadastro)
  useEffect(() => {
    if (agent.id === 'cadastro-usuarios') {
      setPrompt(agent.promptTemplate.replace('{quantidade}', String(quantity)))
    }
  }, [quantity, agent])

  useEffect(() => {
    if (execution && execution.status === "success" && onComplete) {
      onComplete(execution)
    }
  }, [execution, onComplete])

  const handleExecute = () => {
    if (!prompt.trim()) return
    sendRequest(prompt)
  }

  const handleSave = () => {
    saveToObsidian()
  }

  const handleReset = () => {
    reset()
    setPrompt(agent.promptTemplate)
  }

  const currentExecution = execution

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${agent.color || 'bg-primary/10 text-primary'}`}>
            <span className="text-lg">{agent.icon}</span>
          </div>
          <div>
            <div className="font-semibold text-lg">{agent.name}</div>
            <div className="text-xs text-text-muted">{agent.skill}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onBack}>
            Voltar para lista
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-4 w-4" /> Reiniciar
          </Button>
        </div>
      </div>

      {/* Prompt Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descreva o que você precisa</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5 space-y-3">
          {agent.id === 'cadastro-usuarios' && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-text-secondary">Quantidade de usuários:</label>
              <input
                type="number"
                min={1}
                max={50}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 rounded border border-border bg-bg-panel px-2 py-1 text-sm text-text-primary"
              />
            </div>
          )}

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[110px] font-mono text-sm"
            placeholder="Descreva o treinamento, avaliação ou conteúdo..."
            disabled={isRunning}
          />

          <div className="flex gap-3">
            <Button 
              onClick={handleExecute} 
              disabled={!prompt.trim() || isRunning}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Executando...' : 'Executar Agente'}
            </Button>

            {currentExecution && (
              <Button 
                variant="secondary" 
                onClick={handleSave}
                disabled={isRunning}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Forçar salvar no Obsidian
              </Button>
            )}
          </div>

          {error && (
            <div className="text-sm text-danger">{error}</div>
          )}
        </div>
      </Card>

      {/* Main Workspace - Logs + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[420px]">
        <LectorLiveLogs logs={currentExecution?.logs || []} />
        <LectorResultsPanel 
          result={currentExecution?.result} 
          obsidianPath={currentExecution?.obsidianPath}
          onSaveToObsidian={handleSave}
          isSaving={isRunning}
        />
      </div>

      {/* Status Bar */}
      {currentExecution && (
        <div className="text-xs text-text-muted flex items-center gap-4 px-1">
          <span>Status: <span className="font-medium text-text-primary">{currentExecution.status}</span></span>
          {currentExecution.completedAt && (
            <span>Finalizado em {new Date(currentExecution.completedAt).toLocaleTimeString()}</span>
          )}
          <span>Logs: {currentExecution.logs.length}</span>
        </div>
      )}
    </div>
  )
}

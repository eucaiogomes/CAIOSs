import { useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { lectorService } from '@/services/lector.service'
import { LectorWorkspace } from '@/components/lector/LectorWorkspace'
import type { LectorAgent, LectorExecution } from '@/types/lector'
import { ArrowRight, BookOpen, History } from 'lucide-react'

export function LectorAgentes() {
  const [selectedAgent, setSelectedAgent] = useState<LectorAgent | null>(null)
  const [history, setHistory] = useState<LectorExecution[]>([])
  const agents = lectorService.getAgents()

  const handleSelectAgent = (agent: LectorAgent) => {
    setSelectedAgent(agent)
  }

  const handleBack = () => {
    setSelectedAgent(null)
  }

  // Simple history collector (can be improved with persistent storage later)
  const onExecutionComplete = (exec: LectorExecution) => {
    setHistory(prev => [exec, ...prev].slice(0, 10))
  }

  if (selectedAgent) {
    return (
      <div className="max-w-6xl mx-auto">
        <LectorWorkspace 
          agent={selectedAgent} 
          onBack={handleBack} 
          onComplete={onExecutionComplete}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/10 text-blue">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lector Agentes</h1>
          <p className="text-sm text-text-muted">
            Agentes especializados que executam skills do Lector Live e salvam automaticamente no Obsidian.
          </p>
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className="group cursor-pointer transition-all hover:border-primary/40 hover:shadow-lg active:scale-[0.985] flex flex-col h-full"
            onClick={() => handleSelectAgent(agent)}
          >
            <CardHeader className="flex-1">
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${agent.color || 'bg-primary/10 text-primary'} shrink-0 mt-0.5`}>
                  <span className="text-xl">{agent.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="group-hover:text-primary transition-colors text-base">
                    {agent.name}
                  </CardTitle>
                  <CardDescription className="mt-1.5 text-xs leading-relaxed line-clamp-3">
                    {agent.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-border/60 text-xs text-text-muted mt-auto">
              <span className="font-mono truncate pr-2">{agent.skill}</span>
              <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition" />
            </div>
          </Card>
        ))}
      </div>

      {/* Histórico Recente - Fase 5 */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3 px-1">
            <History className="h-4 w-4" />
            <h3 className="font-medium">Histórico Recente</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {history.slice(0, 4).map((exec, index) => (
              <div key={index} className="rounded-lg border border-border bg-bg-panel p-3 text-sm">
                <div className="font-medium">{exec.agentName}</div>
                <div className="text-xs text-text-muted line-clamp-1 mt-1">{exec.prompt}</div>
                <div className="text-[10px] text-emerald mt-1">
                  {exec.obsidianPath ? '✅ Salvo no Obsidian' : 'Processado'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-bg-panel p-5 text-sm">
        <div className="font-medium mb-2">Como funciona o Workspace Dedicado (Fase 4+):</div>
        <ul className="text-xs space-y-1 text-text-secondary list-disc pl-5">
          <li>Selecione um agente → abra a interface dedicada (fica tudo aqui)</li>
          <li>Escreva seu pedido e clique em "Executar Agente"</li>
          <li>Acompanhe logs em tempo real (ferramentas, progresso)</li>
          <li>Resultados estruturados aparecem automaticamente</li>
          <li><strong>Salvamento no Obsidian é automático</strong> (dupla garantia: prompt + escrita direta)</li>
          <li>Você pode forçar salvamento manual a qualquer momento</li>
        </ul>
        <p className="text-[10px] text-text-muted mt-3">
          Todos os agentes seguem o Soul do Agente e atualizam sua base de conhecimento Lector Live.
        </p>
      </div>
    </div>
  )
}

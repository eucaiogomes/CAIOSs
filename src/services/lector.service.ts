import { generateId, nowISO } from '@/lib/utils'
import { ensureDir, writeFile } from '@/lib/fs-api'
import { vaultService } from '@/services/vault.service'
import type {
  LectorAgent,
  LectorExecution,
  LectorLog,
  LectorResult,
} from '@/types/lector'

// ============================================
// AGENT DEFINITIONS (centralized and complete)
// ============================================

export const LECTOR_AGENTS: LectorAgent[] = [
  {
    id: 'treinamentos',
    name: 'Criador de Treinamentos',
    description: 'Cria treinamentos completos no Lector Live (Portal 9), com título curado, SCORM e turma.',
    icon: 'BookOpen',
    skill: 'lector-portal-9-criar-treinamentos',
    obsidianFolder: 'Lector/Treinamentos',
    promptTemplate: 'Crie um treinamento completo sobre [TEMA] para [PÚBLICO]. Use título editorial específico. Gere SCORM e turma gratuita se possível.',
    color: 'bg-blue/10 text-blue',
  },
  {
    id: 'avaliacoes',
    name: 'Criador de Avaliações',
    description: 'Monta avaliações completas com questões, cabeçalho, nota mínima e tags.',
    icon: 'FileText',
    skill: 'lector-criar-avaliacao-completa',
    obsidianFolder: 'Lector/Avaliacoes',
    promptTemplate: 'Crie uma avaliação completa sobre [TEMA] com [QTD] questões. Inclua cabeçalho, nota mínima e tags.',
    color: 'bg-emerald/10 text-emerald',
  },
  {
    id: 'questoes',
    name: 'Criador de Questões',
    description: 'Gera e valida questões de alta qualidade para avaliações.',
    icon: 'HelpCircle',
    skill: 'lector-criar-questoes-api',
    obsidianFolder: 'Lector/Questoes',
    promptTemplate: 'Gere 8-12 questões de qualidade sobre [TEMA]. Misture múltipla escolha e dissertativas.',
    color: 'bg-amber/10 text-amber',
  },
  {
    id: 'scorm',
    name: 'Criador de SCORMs',
    description: 'Gera pacotes SCORM 1.2 completos com roteiro, HTML interativo e quiz.',
    icon: 'Package',
    skill: 'lector-criar-conteudos-scorm',
    obsidianFolder: 'Lector/SCORMs',
    promptTemplate: 'Crie um pacote SCORM completo sobre [TEMA] com roteiro didático, HTML interativo e avaliação.',
    color: 'bg-violet/10 text-violet',
  },
  {
    id: 'capas',
    name: 'Criador de Capas',
    description: 'Gera imagens profissionais de capa (16:9, banner, square) para treinamentos.',
    icon: 'Image',
    skill: 'lector-criar-imagens-capa',
    obsidianFolder: 'Lector/Capas',
    promptTemplate: 'Crie imagens de capa profissionais para um treinamento sobre [TEMA] chamado "[TÍTULO]".',
    color: 'bg-pink/10 text-pink',
  },
  {
    id: 'turmas',
    name: 'Criador de Turmas',
    description: 'Configura turmas (incluindo gratuitas) em treinamentos existentes.',
    icon: 'Users',
    skill: 'lector-criar-turmas',
    obsidianFolder: 'Lector/Turmas',
    promptTemplate: 'Configure uma turma para o treinamento [NOME/ ID]. Torne gratuita se pedido.',
    color: 'bg-cyan/10 text-cyan',
  },
  {
    id: 'videos',
    name: 'Criador de Vídeos / Hyperframes',
    description: 'Cria treinamentos em vídeo ou hyperframes estruturados.',
    icon: 'Video',
    skill: 'lector-criar-treinamento-video-hyperframes',
    obsidianFolder: 'Lector/Videos',
    promptTemplate: 'Crie um treinamento em vídeo/hyperframes sobre [TEMA]. Estruture o roteiro.',
    color: 'bg-red/10 text-red',
  },
  {
    id: 'curadoria',
    name: 'Curadoria de Nomes de Treinamentos',
    description: 'Sugere nomes editoriais de alta qualidade para treinamentos.',
    icon: 'Sparkles',
    skill: 'lector-curadoria-nomes-treinamentos',
    obsidianFolder: 'Lector/Curadoria',
    promptTemplate: 'Sugira 5-7 nomes editoriais curados para um treinamento sobre [TEMA].',
    color: 'bg-indigo/10 text-indigo',
  },
  {
    id: 'validacao',
    name: 'Validador de Avaliações',
    description: 'Valida qualidade de avaliações e questões existentes.',
    icon: 'CheckCircle',
    skill: 'lector-validar-avaliacoes-api',
    obsidianFolder: 'Lector/Validacoes',
    promptTemplate: 'Valide esta avaliação ou conjunto de questões. Dê feedback e sugestões de melhoria.',
    color: 'bg-teal/10 text-teal',
  },
  {
    id: 'orquestrador',
    name: 'Orquestrador Lector',
    description: 'Coordena múltiplos skills Lector conforme a solicitação.',
    icon: 'Workflow',
    skill: 'multi-lector',
    obsidianFolder: 'Lector/Historico',
    promptTemplate: 'Quero [AÇÃO] sobre [TEMA]. Use os skills necessários do Lector e salve tudo na base.',
    color: 'bg-primary/10 text-primary',
  },
]

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

function createEmptyExecution(agent: LectorAgent, prompt: string): LectorExecution {
  return {
    id: generateId(),
    agentId: agent.id,
    agentName: agent.name,
    prompt,
    startedAt: nowISO(),
    status: 'running',
    logs: [],
  }
}
  getAgents(): LectorAgent[] {
    return LECTOR_AGENTS
  },

  getAgent(id: string): LectorAgent | undefined {
    return LECTOR_AGENTS.find((a) => a.id === id)
  },

  // --- Execution Management ---
  createExecution(agent: LectorAgent, userPrompt: string): LectorExecution {
    return createEmptyExecution(agent, userPrompt)
  },

  addLog(execution: LectorExecution, log: Omit<LectorLog, 'id' | 'timestamp'>): LectorExecution {
    const newLog: LectorLog = {
      id: generateId(),
      timestamp: nowISO(),
      ...log,
    }
    return {
      ...execution,
      logs: [...execution.logs, newLog],
    }
  },

  updateExecution(execution: LectorExecution, updates: Partial<LectorExecution>): LectorExecution {
    return { ...execution, ...updates }
  },

  completeExecution(execution: LectorExecution, result: LectorResult): LectorExecution {
    return {
      ...execution,
      status: 'success',
      completedAt: nowISO(),
      result,
      logs: [
        ...execution.logs,
        {
          id: generateId(),
          timestamp: nowISO(),
          type: 'success',
          message: 'Execução concluída com sucesso.',
        },
      ],
    }
  },

  failExecution(execution: LectorExecution, error: string): LectorExecution {
    return {
      ...execution,
      status: 'error',
      completedAt: nowISO(),
      error,
      logs: [
        ...execution.logs,
        {
          id: generateId(),
          timestamp: nowISO(),
          type: 'error',
          message: `Erro: ${error}`,
        },
      ],
    }
  },

  // --- Prompt Builders (CRITICAL for Obsidian guarantee) ---
  buildLectorPrompt(agent: LectorAgent, userInput: string): string {
    return [
      `Você é um especialista em Lector Live e deve usar o skill: **${agent.skill}**`,
      '',
      'REGRAS OBRIGATÓRIAS:',
      '1. Execute o skill completo usando os parâmetros corretos.',
      '2. Ao terminar, **obrigatoriamente** salve um resumo estruturado no Obsidian.',
      `3. Salve na pasta: CaiOS/${agent.obsidianFolder}/`,
      '4. Inclua wikilinks para outros itens da base Lector.',
      '5. Retorne IDs criados, links e resumo claro.',
      '',
      'Pedido do usuário:',
      userInput,
      '',
      `Pasta alvo no Obsidian: CaiOS/${agent.obsidianFolder}`,
    ].join('\n')
  },

  buildObsidianSavePrompt(agent: LectorAgent, execution: LectorExecution): string {
    return [
      'SALVE O RESULTADO DESTA EXECUÇÃO NO OBSIDIAN AGORA.',
      '',
      `Agente: ${agent.name}`,
      `Skill usado: ${agent.skill}`,
      '',
      'Prompt original:',
      execution.prompt,
      '',
      'Instruções obrigatórias:',
      `- Crie um arquivo Markdown em: CaiOS/${agent.obsidianFolder}/`,
      '- Nome do arquivo: [Título Curado] (data).md',
      '- Inclua: resumo, itens criados (IDs, links), prompt usado',
      '- Use wikilinks para conectar com a base Lector Live',
      '- Marque como conhecimento da base',
      '',
      'Conteúdo da execução:',
      execution.result?.summary || 'Ver logs da execução',
    ].join('\n')
  },

  // --- Result Parsing (basic version, can be improved) ---
  parseResult(rawText: string, agent: LectorAgent): LectorResult {
    // Simple extraction - will be improved in later phases
    const titleMatch = rawText.match(/(?:título|title|nome)[:\s]+([^\n]+)/i)
    const summary = rawText.slice(0, 600)

    return {
      title: titleMatch ? titleMatch[1].trim() : `${agent.name} - ${new Date().toLocaleDateString('pt-BR')}`,
      summary,
      createdItems: [],
      links: [],
      rawOutput: rawText,
    }
  },

  // --- Obsidian Integration Helpers ---
  getObsidianFolder(agent: LectorAgent): string {
    return `CaiOS/${agent.obsidianFolder}`
  },

  // ============================================
  // DIRECT OBSIDIAN SAVE - FASE 4 (Salvamento Obrigatório)
  // ============================================
  async saveExecutionToObsidian(execution: LectorExecution): Promise<string | null> {
    try {
      const agent = this.getAgent(execution.agentId)
      if (!agent) return null

      const base = vaultService.getCaiOSFolder()
      const folder = `${base}/${agent.obsidianFolder}`
      await ensureDir(folder)

      const title = execution.result?.title || execution.prompt.slice(0, 60)
      const slug = this.slugify(title)
      const filename = `${slug}-${execution.id.slice(0, 8)}.md`
      const fullPath = `${folder}/${filename}`

      const md = this.executionToMarkdown(execution, agent)

      await writeFile(fullPath, md)

      // Update execution with path
      execution.obsidianPath = fullPath

      return fullPath
    } catch (error) {
      console.error('[Lector] Falha ao salvar no Obsidian:', error)
      return null
    }
  },

  slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[<>:\"\/\|?*]/g, '')
      .trim()
      .slice(0, 70)
      .toLowerCase() || 'execucao-lector'
  },

  executionToMarkdown(execution: LectorExecution, agent: LectorAgent): string {
    const date = new Date(execution.startedAt).toLocaleDateString('pt-BR')
    const frontmatter = [
      '---',
      `caios_id: ${execution.id}`,
      `caios_type: lector-execution`,
      `agent: ${agent.name}`,
      `skill: ${agent.skill}`,
      `status: ${execution.status}`,
      `created: ${execution.startedAt}`,
      execution.completedAt ? `completed: ${execution.completedAt}` : '',
      `obsidian_folder: ${agent.obsidianFolder}`,
      'tags: [lector, caios, treinamento]',
      '---',
      '',
    ].filter(Boolean).join('\n')

    const content = [
      `# ${execution.result?.title || agent.name}`,
      '',
      `> **Agente:** ${agent.name}  `,
      `> **Skill:** \`${agent.skill}\`  `,
      `> **Data:** ${date}  `,
      '',
      '## Prompt Original',
      '```',
      execution.prompt,
      '```',
      '',
      '## Resultado',
      execution.result?.summary || 'Sem resumo estruturado.',
      '',
      execution.result?.createdItems?.length
        ? '## Itens Criados\n' + execution.result.createdItems.map(i => `- ${i.type}: ${i.name}`).join('\n')
        : '',
      '',
      execution.result?.links?.length
        ? '## Links\n' + execution.result.links.map(l => `- [${l.label}](${l.url || l.path || '#'})`).join('\n')
        : '',
      '',
      '## Logs da Execução',
      execution.logs.map(l => `- ${l.timestamp.slice(11,19)} [${l.type}] ${l.message}`).join('\n'),
      '',
      '---',
      '*Gerado automaticamente pelo CaiOS - Lector Agentes*',
      '*Salvo na base de conhecimento Lector Live*',
    ].filter(Boolean).join('\n')

    return frontmatter + '\n' + content
  },
}

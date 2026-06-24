import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageSet } from '@/lib/db'
import { generateId, nowISO } from '@/lib/utils'
import type {
  LiveCallActiveState,
  LiveCallChatEntry,
  LiveCallPlatform,
  LiveCallSession,
  LiveCallSuggestion,
  LiveCallTranscriptEntry,
} from '@/types/live-call'

const DEFAULT_ACTIVE: LiveCallActiveState = {
  sessionId: null,
  meetingUrl: '',
  title: '',
  participants: [],
  isLive: false,
  transcribing: false,
}

export function detectPlatform(url: string): LiveCallPlatform {
  const u = url.toLowerCase()
  if (u.includes('zoom.us')) return 'Zoom'
  if (u.includes('meet.google')) return 'Google Meet'
  if (u.includes('teams.microsoft') || u.includes('teams.live')) return 'Microsoft Teams'
  if (u.includes('electro')) return 'Electro'
  return 'Outro'
}

function loadArchive(): LiveCallSession[] {
  return storageGet<LiveCallSession[]>(STORAGE_KEYS.liveCallArchive) ?? []
}

function saveArchive(sessions: LiveCallSession[]): void {
  storageSet(STORAGE_KEYS.liveCallArchive, sessions.slice(0, 100))
}

function loadActive(): LiveCallActiveState {
  return storageGet<LiveCallActiveState>(STORAGE_KEYS.liveCallActive) ?? { ...DEFAULT_ACTIVE }
}

function saveActive(state: LiveCallActiveState): void {
  storageSet(STORAGE_KEYS.liveCallActive, state)
}

function getSession(id: string): LiveCallSession | undefined {
  return loadArchive().find((s) => s.id === id)
}

function upsertSession(session: LiveCallSession): void {
  const list = loadArchive().filter((s) => s.id !== session.id)
  saveArchive([session, ...list])
}

export const liveCallService = {
  getActive(): LiveCallActiveState {
    return loadActive()
  },

  setActive(patch: Partial<LiveCallActiveState>): LiveCallActiveState {
    const next = { ...loadActive(), ...patch }
    saveActive(next)
    return next
  },

  getArchive(): LiveCallSession[] {
    return loadArchive()
  },

  getSession(id: string): LiveCallSession | undefined {
    return getSession(id)
  },

  startSession(meetingUrl: string, title: string, participants: string[]): LiveCallSession {
    const session: LiveCallSession = {
      id: generateId(),
      startedAt: nowISO(),
      meetingUrl,
      platform: detectPlatform(meetingUrl),
      title: title.trim() || detectPlatform(meetingUrl),
      participants: participants.filter(Boolean),
      transcript: [],
      suggestions: [],
      chat: [],
    }
    upsertSession(session)
    saveActive({
      sessionId: session.id,
      meetingUrl,
      title: session.title,
      participants: session.participants,
      isLive: true,
      transcribing: false,
    })
    return session
  },

  addTranscript(sessionId: string, text: string, isFinal: boolean, speaker?: string): LiveCallTranscriptEntry | null {
    const session = getSession(sessionId)
    if (!session || !text.trim()) return null
    const entry: LiveCallTranscriptEntry = {
      id: generateId(),
      at: nowISO(),
      text: text.trim(),
      speaker,
      isFinal,
    }
    if (isFinal) {
      session.transcript.push(entry)
    } else {
      const last = session.transcript[session.transcript.length - 1]
      if (last && !last.isFinal) {
        last.text = entry.text
        last.at = entry.at
        upsertSession(session)
        return last
      }
      session.transcript.push(entry)
    }
    upsertSession(session)
    return entry
  },

  addSuggestion(sessionId: string, text: string, context?: string): LiveCallSuggestion | null {
    const session = getSession(sessionId)
    if (!session || !text.trim()) return null
    const suggestion: LiveCallSuggestion = {
      id: generateId(),
      at: nowISO(),
      text: text.trim(),
      context,
    }
    session.suggestions = [suggestion, ...session.suggestions].slice(0, 30)
    upsertSession(session)
    return suggestion
  },

  addChat(sessionId: string, role: LiveCallChatEntry['role'], content: string): LiveCallChatEntry | null {
    const session = getSession(sessionId)
    if (!session || !content.trim()) return null
    const entry: LiveCallChatEntry = {
      id: generateId(),
      at: nowISO(),
      role,
      content: content.trim(),
    }
    session.chat.push(entry)
    upsertSession(session)
    return entry
  },

  endSession(sessionId: string, summary?: string): LiveCallSession | null {
    const session = getSession(sessionId)
    if (!session) return null
    session.endedAt = nowISO()
    if (summary) session.summary = summary
    upsertSession(session)
    saveActive({ ...DEFAULT_ACTIVE })
    return session
  },

  buildSuggestionPrompt(session: LiveCallSession, recentLines: string[]): string {
    const transcript = session.transcript
      .filter((t) => t.isFinal)
      .slice(-12)
      .map((t) => `${t.speaker ? `[${t.speaker}] ` : ''}${t.text}`)
      .join('\n')

    return [
      '[Live Call Coach — assistente em tempo real]',
      `Chamada: ${session.title}`,
      `Plataforma: ${session.platform}`,
      `Participantes: ${session.participants.join(', ') || 'não informados'}`,
      '',
      'Transcrição recente:',
      transcript || recentLines.join('\n') || '(aguardando áudio)',
      '',
      'Com base na conversa e na base de conhecimento CaiOS, sugira 2-3 frases curtas que o usuário pode falar agora.',
      'Formato: uma sugestão por linha, começando com "→". Seja direto e prático.',
    ].join('\n')
  },

  buildQuestionPrompt(session: LiveCallSession, question: string): string {
    const transcript = session.transcript
      .filter((t) => t.isFinal)
      .slice(-20)
      .map((t) => `${t.speaker ? `[${t.speaker}] ` : ''}${t.text}`)
      .join('\n')

    return [
      '[Live Call Coach — pergunta durante chamada]',
      `Chamada: ${session.title}`,
      `Participantes: ${session.participants.join(', ') || 'não informados'}`,
      '',
      'Transcrição até agora:',
      transcript || '(nenhuma transcrição ainda)',
      '',
      `Pergunta do usuário: ${question}`,
      '',
      'Responda de forma concisa, útil para falar na reunião agora. Use a base de conhecimento quando relevante.',
    ].join('\n')
  },

  buildSummaryPrompt(session: LiveCallSession): string {
    const transcript = session.transcript
      .filter((t) => t.isFinal)
      .map((t) => `[${t.at.slice(11, 19)}] ${t.speaker ? `${t.speaker}: ` : ''}${t.text}`)
      .join('\n')

    const chat = session.chat
      .map((c) => `[${c.role}] ${c.content}`)
      .join('\n')

    return [
      'Gere o relatório final desta chamada de vídeo para a base CaiOS/LiveCall.',
      `Título: ${session.title}`,
      `Plataforma: ${session.platform}`,
      `Participantes: ${session.participants.join(', ') || 'não informados'}`,
      `Início: ${session.startedAt}`,
      '',
      '## Transcrição completa',
      transcript || '(sem transcrição)',
      '',
      '## Interações com o coach',
      chat || '(nenhuma)',
      '',
      'Inclua: resumo executivo, tópicos discutidos, decisões, action items, riscos, próximos passos.',
      'Estruture para salvar no Obsidian em CaiOS/LiveCall/.',
    ].join('\n')
  },
}
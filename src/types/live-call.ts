export type LiveCallPlatform = 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Electro' | 'Outro'

export interface LiveCallTranscriptEntry {
  id: string
  at: string
  text: string
  speaker?: string
  isFinal: boolean
}

export interface LiveCallSuggestion {
  id: string
  at: string
  text: string
  context?: string
}

export interface LiveCallChatEntry {
  id: string
  at: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LiveCallSession {
  id: string
  startedAt: string
  endedAt?: string
  meetingUrl: string
  platform: LiveCallPlatform
  title: string
  participants: string[]
  transcript: LiveCallTranscriptEntry[]
  suggestions: LiveCallSuggestion[]
  chat: LiveCallChatEntry[]
  summary?: string
  hermesSessionId?: string
}

export interface LiveCallActiveState {
  sessionId: string | null
  meetingUrl: string
  title: string
  participants: string[]
  isLive: boolean
  transcribing: boolean
}
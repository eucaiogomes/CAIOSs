import { useCallback, useEffect, useRef, useState } from 'react'

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: { transcript: string }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onresult: ((ev: SpeechRecognitionEvent) => void) | null
  onerror: ((ev: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export interface TranscriptChunk {
  text: string
  isFinal: boolean
}

export function useSpeechTranscription(onChunk: (chunk: TranscriptChunk) => void) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognitionInstance | null>(null)
  const shouldRestartRef = useRef(false)
  const onChunkRef = useRef(onChunk)
  onChunkRef.current = onChunk

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognition()))
  }, [])

  const stop = useCallback(() => {
    shouldRestartRef.current = false
    recRef.current?.stop()
    setListening(false)
  }, [])

  const start = useCallback(() => {
    const Ctor = getSpeechRecognition()
    if (!Ctor) {
      setError('Transcrição por voz não suportada neste navegador')
      return
    }

    setError(null)
    shouldRestartRef.current = true

    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'pt-BR'
    rec.maxAlternatives = 1

    rec.onresult = (ev) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i]
        const text = result[0]?.transcript?.trim()
        if (!text) continue
        onChunkRef.current({ text, isFinal: result.isFinal })
      }
    }

    rec.onerror = (ev) => {
      if (ev.error === 'not-allowed') {
        setError('Permissão de microfone negada')
        shouldRestartRef.current = false
        setListening(false)
      } else if (ev.error !== 'no-speech' && ev.error !== 'aborted') {
        setError(`Erro de transcrição: ${ev.error}`)
      }
    }

    rec.onend = () => {
      if (shouldRestartRef.current) {
        try {
          rec.start()
        } catch {
          setListening(false)
        }
        return
      }
      setListening(false)
    }

    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao iniciar microfone')
      setListening(false)
    }
  }, [])

  useEffect(() => () => {
    shouldRestartRef.current = false
    recRef.current?.abort()
  }, [])

  return { supported, listening, error, start, stop }
}
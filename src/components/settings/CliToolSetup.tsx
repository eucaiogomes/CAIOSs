import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import type { CliToolConfig } from '@/types/cli-config'
import { isTauri } from '@/lib/tauri-bridge'
import { CheckCircle, Play, RefreshCw, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export interface CliToolSetupProps {
  toolId: string
  title: string
  description: string
  installHint: string
  authHint: string
  icon?: string
  config: CliToolConfig
  detectEndpoint: string
  onDetect: () => Promise<{ path: string; version?: string } | null>
  onVerify: (command: string) => Promise<string>
  onUpdate: (patch: Partial<CliToolConfig>) => CliToolConfig
  onMarkUnverified: () => void
}

export function CliToolSetup({
  toolId,
  title,
  description,
  installHint,
  authHint,
  icon = '⚡',
  config,
  detectEndpoint,
  onDetect,
  onVerify,
  onUpdate,
  onMarkUnverified,
}: CliToolSetupProps) {
  const navigate = useNavigate()
  const [localConfig, setLocalConfig] = useState(config)
  const [command, setCommand] = useState(config.command)
  const [detecting, setDetecting] = useState(false)
  const [testing, setTesting] = useState(false)
  const [ptyOnline, setPtyOnline] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setLocalConfig(config)
    setCommand(config.command)
  }, [config])

  const checkPty = useCallback(async () => {
    if (isTauri()) {
      setPtyOnline(true)
      return
    }
    try {
      const res = await fetch(`http://localhost:1421${detectEndpoint}`, { signal: AbortSignal.timeout(2000) })
      setPtyOnline(res.ok)
    } catch {
      setPtyOnline(false)
    }
  }, [detectEndpoint])

  useEffect(() => {
    checkPty()
    if (!config.verified) handleDetect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDetect = async () => {
    setDetecting(true)
    setMessage('')
    try {
      const result = await onDetect()
      if (!result) {
        setMessage(`Não encontrado. Instale com: ${installHint}`)
        onMarkUnverified()
        return
      }
      onUpdate({
        command: result.path,
        detectedPath: result.path,
        version: result.version,
        verified: true,
      })
      setCommand(result.path)
      setMessage(`Detectado: ${result.version ?? result.path}`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro na detecção')
    } finally {
      setDetecting(false)
    }
  }

  const handleSave = () => {
    onUpdate({ command: command.trim(), verified: false })
    setMessage('Caminho salvo. Clique em Testar para verificar.')
  }

  const handleTest = async () => {
    setTesting(true)
    setMessage('')
    try {
      const version = await onVerify(command)
      onUpdate({ command: command.trim(), verified: true, version })
      setMessage(`OK — ${version}`)
    } catch (err) {
      onMarkUnverified()
      setMessage(err instanceof Error ? err.message : 'Falha no teste')
    } finally {
      setTesting(false)
    }
  }

  const handleLaunch = () => {
    navigate('/terminal', {
      state: {
        tool: { id: toolId, command, type: 'terminal', name: title },
        cwd: undefined,
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <span>{icon}</span>
            {title}
            {localConfig.verified ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" /> Configurado
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1">
                <XCircle className="h-3 w-3" /> Não verificado
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
      </CardHeader>

      <div className="space-y-4">
        <div>
          <Label>Caminho do executável</Label>
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="font-mono text-xs"
            placeholder="C:/Users/.../codex.exe"
          />
          {localConfig.version && (
            <p className="mt-1 text-[11px] text-text-muted">Versão: {localConfig.version}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={handleDetect} disabled={detecting}>
            <RefreshCw className={`h-4 w-4 ${detecting ? 'animate-spin' : ''}`} />
            Detectar automaticamente
          </Button>
          <Button size="sm" variant="ghost" onClick={handleSave}>Salvar caminho</Button>
          <Button size="sm" onClick={handleTest} disabled={testing || !command.trim()}>
            {testing ? 'Testando...' : 'Testar CLI'}
          </Button>
          <Button size="sm" variant="primary" onClick={handleLaunch} disabled={!localConfig.verified}>
            <Play className="h-4 w-4" /> Abrir {title}
          </Button>
        </div>

        {message && (
          <p className={`text-xs ${localConfig.verified ? 'text-success' : 'text-text-secondary'}`}>
            {message}
          </p>
        )}

        <div className="rounded-lg border border-border bg-bg-soft p-3 text-[11px] text-text-muted space-y-1">
          <p>
            <strong className="text-text-secondary">PTY:</strong>{' '}
            {isTauri()
              ? 'App desktop (Tauri) — terminal nativo'
              : ptyOnline
                ? 'Servidor local ativo (ws://localhost:1421)'
                : 'Servidor offline — reinicie com npm run dev'}
          </p>
          <p>Instalação: <code className="text-primary">{installHint}</code></p>
          <p>{authHint}</p>
        </div>
      </div>
    </Card>
  )
}
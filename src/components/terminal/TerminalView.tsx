import * as ptyClient from '@/lib/pty-client'
import { CLAUDE_CODE_TOOL_ID, CODEX_TOOL_ID, GROK_TOOL_ID, HERMES_TOOL_ID } from '@/lib/constants'
import { cliConfigService } from '@/services/cli-config.service'
import * as tauriBridge from '@/lib/tauri-bridge'
import { generateId } from '@/lib/utils'
import { terminalService } from '@/services/terminal.service'
import type { Tool } from '@/types/tool'
import { listen } from '@tauri-apps/api/event'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { useEffect, useRef } from 'react'

interface TerminalViewProps {
  tool?: Tool
  command?: string
  cwd?: string
  projectName?: string
  projectId?: string
}

function resolveCommand(tool?: Tool, command?: string): string {
  const configured = tool?.id ? cliConfigService.getCommandForTool(tool.id) : null
  if (configured) return configured
  if (tool?.id === CLAUDE_CODE_TOOL_ID) return cliConfigService.getClaudeCommand()
  if (tool?.id === CODEX_TOOL_ID) return cliConfigService.getCodexCommand()
  if (tool?.id === GROK_TOOL_ID) return cliConfigService.getGrokCommand()
  if (tool?.id === HERMES_TOOL_ID) return cliConfigService.getHermesCommand()
  if (tool?.command) return tool.command
  if (command) return command
  return tauriBridge.defaultShellCommand()
}

export function TerminalView({ tool, command, cwd, projectName }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string>(generateId())
  const fitAddonRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const sessionId = sessionIdRef.current
    const term = new Terminal({
      theme: {
        background: '#0f1117',
        foreground: '#f5f7fa',
        cursor: '#ff7a1a',
        selectionBackground: '#ff7a1a33',
        black: '#1e2230',
        brightBlack: '#6f778b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#f59e0b',
        blue: '#2563eb',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#f5f7fa',
      },
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      scrollback: 5000,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)
    fitAddon.fit()
    fitAddonRef.current = fitAddon

    const prompt = cwd ? `[${cwd}]` : '[~]'
    term.writeln('\x1b[38;2;255;122;26mCaiOS Terminal\x1b[0m — local-first workspace')
    if (projectName) {
      term.writeln(`\x1b[90mProjeto: ${projectName}\x1b[0m`)
    }
    term.writeln('')

    let unlistenTauri: (() => void) | undefined
    let unlistenWs: (() => void) | undefined
    let unlistenExit: (() => void) | undefined

    const cmdToRun = resolveCommand(tool, command)

    const startPty = async () => {
      if (tauriBridge.isTauri()) {
        term.writeln(`\x1b[90mIniciando: ${cmdToRun}\x1b[0m`)
        const eventName = tauriBridge.ptyOutputEvent(sessionId)
        unlistenTauri = await listen<string>(eventName, (event) => {
          term.write(event.payload)
        })
        await tauriBridge.ptySpawn({
          sessionId,
          command: cmdToRun,
          cwd,
          cols: term.cols,
          rows: term.rows,
        })
        return
      }

      const available = await ptyClient.isPtyServerAvailable()
      if (!available) {
        term.writeln(`${prompt} $ ${cmdToRun}`)
        term.writeln('\x1b[33mPTY server offline.\x1b[0m')
        term.writeln('\x1b[90mRode: npm run dev (inicia o servidor PTY automaticamente)\x1b[0m')
        term.writeln('\x1b[90mOu configure em Settings → Claude Code\x1b[0m')
        return
      }

      term.writeln(`\x1b[90mIniciando: ${cmdToRun}\x1b[0m`)
      if (cwd) term.writeln(`\x1b[90mDiretório: ${cwd}\x1b[0m`)

      unlistenWs = ptyClient.onPtyOutput(sessionId, (data) => term.write(data))
      unlistenExit = ptyClient.onPtyExit(sessionId, () => {
        term.writeln('\r\n\x1b[90m[processo encerrado]\x1b[0m')
      })

      await ptyClient.ptySpawn({
        sessionId,
        command: cmdToRun,
        cwd,
        cols: term.cols,
        rows: term.rows,
      })
    }

    term.onData((data) => {
      if (tauriBridge.isTauri()) {
        tauriBridge.ptyWrite(sessionId, data)
      } else {
        ptyClient.ptyWrite(sessionId, data).catch(() => {})
      }
    })

    if (!tool && !command) {
      term.writeln(`${prompt} $ _`)
      term.writeln('\x1b[90mAbrindo shell padrão...\x1b[0m')
    }

    startPty().catch((err) => {
      term.writeln(`\x1b[31mErro: ${err}\x1b[0m`)
      if (tool) {
        const lines = terminalService.simulateOutput(tool)
        lines.forEach((line) => term.writeln(`\x1b[90m${line}\x1b[0m`))
      }
    })

    const handleResize = () => {
      fitAddon.fit()
      if (tauriBridge.isTauri()) {
        tauriBridge.ptyResize(sessionId, term.cols, term.rows)
      } else {
        ptyClient.ptyResize(sessionId, term.cols, term.rows).catch(() => {})
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      unlistenTauri?.()
      unlistenWs?.()
      unlistenExit?.()
      if (tauriBridge.isTauri()) {
        tauriBridge.ptyKill(sessionId).catch(() => {})
      } else {
        ptyClient.ptyKill(sessionId).catch(() => {})
      }
      term.dispose()
    }
  }, [tool, command, cwd, projectName])

  return (
    <div className="h-full overflow-hidden rounded-xl border border-border bg-bg-main">
      <div ref={containerRef} className="h-full p-2" />
    </div>
  )
}
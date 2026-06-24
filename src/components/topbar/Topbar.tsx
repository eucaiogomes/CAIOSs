import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShell } from '@/contexts/ShellContext'
import { useProjectTerminal } from '@/hooks/useProjectTerminal'
import { Menu, Search, Terminal } from 'lucide-react'
import { useMemo } from 'react'

export function Topbar() {
  const { openTerminal } = useProjectTerminal()
  const { toggleSidebar } = useShell()

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }, [])

  return (
    <header className="shrink-0 border-b border-border bg-bg-main/80 backdrop-blur-sm">
      <div className="flex min-h-14 flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 lg:flex-nowrap">
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <p className="hidden min-w-0 truncate text-sm text-text-secondary md:block">
          {greeting}, <span className="font-medium text-text-primary">Caio</span>
        </p>

        <div className="relative order-last w-full min-w-0 sm:order-none sm:flex-1 sm:max-w-md lg:mx-auto lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Buscar ferramentas, projetos, prompts..."
            className="h-9 w-full bg-bg-panel pl-9 text-sm"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openTerminal()}
            title="Terminal"
          >
            <Terminal className="h-4 w-4" />
            <span className="hidden md:inline">Terminal</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
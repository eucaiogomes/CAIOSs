import { Sidebar } from '@/components/sidebar/Sidebar'
import { Topbar } from '@/components/topbar/Topbar'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { ShellProvider } from '@/contexts/ShellContext'
import { AppRoutes } from './routes'

export function AppLayout() {
  return (
    <ProjectProvider>
      <ShellProvider>
        <div className="flex h-full min-h-0 overflow-hidden">
          <Sidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
                <AppRoutes />
              </div>
            </main>
          </div>
        </div>
      </ShellProvider>
    </ProjectProvider>
  )
}
import { BrainPage } from '@/pages/Brain'
import { Dashboard } from '@/pages/Dashboard'
import { ExplorerPage } from '@/pages/Explorer'
import { LiveCallPage } from '@/pages/LiveCall'
import { HermesPage } from '@/pages/Hermes'
import { OpenDesignPage } from '@/pages/OpenDesign'
import { MissionControl } from '@/pages/MissionControl'
import { Lab } from '@/pages/Lab'
import { Notes } from '@/pages/Notes'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { Projects } from '@/pages/Projects'
import { Prompts } from '@/pages/Prompts'
import { Settings } from '@/pages/Settings'
import { TerminalPage } from '@/pages/Terminal'
import { Tools } from '@/pages/Tools'
import { WebTool } from '@/pages/WebTool'
import { LectorAgentes } from '@/pages/LectorAgentes'
import { Route, Routes } from 'react-router-dom'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/brain" element={<BrainPage />} />
      <Route path="/hermes" element={<HermesPage />} />
      <Route path="/explorer" element={<ExplorerPage />} />
      <Route path="/live-call" element={<LiveCallPage />} />
      <Route path="/open-design" element={<OpenDesignPage />} />
      <Route path="/mission-control" element={<MissionControl />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/prompts" element={<Prompts />} />
      <Route path="/lab" element={<Lab />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/terminal" element={<TerminalPage />} />
      <Route path="/tool/web" element={<WebTool />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/lector" element={<LectorAgentes />} />
    </Routes>
  )
}
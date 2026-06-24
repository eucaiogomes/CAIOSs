import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PROJECT_STATUSES } from '@/lib/constants'
import { formatRelative } from '@/lib/utils'
import type { Project } from '@/types/project'
import { FolderOpen } from 'lucide-react'
interface ProjectCardProps {
  project: Project
  toolCount?: number
}

export function ProjectCard({ project, toolCount = 0 }: ProjectCardProps) {
  const status = PROJECT_STATUSES.find((s) => s.value === project.status)

  return (
      <Card className="group h-full cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue/10 text-blue">
              <FolderOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <CardTitle className="group-hover:text-primary transition-colors">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="flex items-center justify-between text-xs">
          <Badge variant="muted" className={status?.color}>
            {status?.label}
          </Badge>
          <span className="text-text-muted">
            {toolCount} ferramentas · {formatRelative(project.updatedAt)}
          </span>
        </div>
      </Card>
  )
}
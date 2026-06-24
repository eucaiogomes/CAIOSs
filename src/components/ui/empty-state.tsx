import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-panel/50 px-8 py-16 text-center">
      {icon && <div className="mb-4 text-3xl opacity-60">{icon}</div>}
      <h3 className="text-sm font-medium text-text-primary">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
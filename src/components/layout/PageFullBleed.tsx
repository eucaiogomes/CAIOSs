import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageFullBleedProps {
  children: ReactNode
  className?: string
}

/** Ocupa a área útil do main sem depender de calc(100vh). */
export function PageFullBleed({ children, className }: PageFullBleedProps) {
  return (
    <div className={cn('-m-4 h-full min-h-0 overflow-hidden sm:-m-6', className)}>
      {children}
    </div>
  )
}
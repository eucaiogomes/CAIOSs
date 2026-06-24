import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'muted'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-bg-soft text-text-secondary border-border',
  primary: 'bg-primary/15 text-primary border-primary/30',
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  muted: 'bg-bg-soft text-text-muted border-border',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
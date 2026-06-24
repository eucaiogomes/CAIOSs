import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-lg border border-border bg-bg-soft px-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/30',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-border bg-bg-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-y min-h-[100px]',
        className
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block text-xs font-medium text-text-secondary', className)}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-lg border border-border bg-bg-soft px-3 text-sm text-text-primary outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/30',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
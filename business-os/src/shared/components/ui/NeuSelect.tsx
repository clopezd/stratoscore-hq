'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

export const NeuSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--interactive)] transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  }
)

NeuSelect.displayName = 'NeuSelect'

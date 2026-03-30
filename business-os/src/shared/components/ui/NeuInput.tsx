'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

export const NeuInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--foreground-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--interactive)] transition-colors ${className}`}
        {...props}
      />
    )
  }
)

NeuInput.displayName = 'NeuInput'

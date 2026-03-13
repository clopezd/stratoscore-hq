'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

// Stub temporal para desbloquear build
export const NeuSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  }
)

NeuSelect.displayName = 'NeuSelect'

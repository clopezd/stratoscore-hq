'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

// Stub temporal para desbloquear build
export const NeuButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }
>(({ children, className = '', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

NeuButton.displayName = 'NeuButton'

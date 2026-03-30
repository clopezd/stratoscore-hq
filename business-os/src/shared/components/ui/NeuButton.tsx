'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--interactive)] hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-active)] text-white dark:text-black font-medium',
  secondary:
    'bg-[var(--card)] hover:bg-[var(--card-raised)] text-[var(--foreground)] border border-[var(--border)]',
  ghost:
    'bg-transparent hover:bg-[var(--card-raised)] text-[var(--foreground-muted)]',
  destructive:
    'bg-[var(--status-error)] hover:opacity-90 text-white font-medium',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export const NeuButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    size?: ButtonSize
  }
>(({ children, className = '', variant = 'primary', size = 'md', disabled, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

NeuButton.displayName = 'NeuButton'

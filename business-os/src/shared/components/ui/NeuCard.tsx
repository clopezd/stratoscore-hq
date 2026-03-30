'use client'

import { HTMLAttributes } from 'react'

type CardVariant = 'default' | 'raised' | 'elevated'

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-[var(--card)] border border-[var(--border)] shadow-[var(--card-shadow)]',
  raised:
    'bg-[var(--card-raised)] border border-[var(--border)] shadow-[var(--card-shadow-raised)]',
  elevated:
    'bg-[var(--card-elevated)] border border-[var(--border)] shadow-[var(--card-shadow-raised)]',
}

export function NeuCard({
  children,
  className = '',
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }) {
  return (
    <div
      className={`rounded-xl p-4 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

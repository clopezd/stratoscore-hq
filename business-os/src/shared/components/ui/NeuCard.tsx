'use client'

import { HTMLAttributes } from 'react'

// Stub temporal para desbloquear build
export function NeuCard({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

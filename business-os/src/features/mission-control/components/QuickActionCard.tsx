'use client'

import Link from 'next/link'

interface QuickActionCardProps {
  icon: string
  label: string
  count?: number
  href: string
}

export function QuickActionCard({ icon, label, count, href }: QuickActionCardProps) {
  const isAnchor = href.startsWith('#')

  const handleClick = (e: React.MouseEvent) => {
    if (isAnchor) {
      e.preventDefault()
      const el = document.querySelector(href)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const content = (
    <div className="group relative overflow-hidden rounded-xl p-4 bg-white/[0.05] border border-white/[0.12] hover:bg-white/[0.10] hover:border-cyan-500/30 transition-all duration-300 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
            {label}
          </p>
          {count !== undefined && (
            <p className="text-xs text-white/60 mt-0.5">{count} items</p>
          )}
        </div>
        <div className="text-white/40 group-hover:text-white/70 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )

  if (isAnchor) {
    return <a href={href} onClick={handleClick}>{content}</a>
  }

  return <Link href={href}>{content}</Link>
}

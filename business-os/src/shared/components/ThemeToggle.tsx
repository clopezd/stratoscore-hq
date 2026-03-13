'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-8 h-8" />
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-lg transition-all duration-200
        text-black/40 hover:text-black/70 hover:bg-black/[0.06]
        dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/[0.08]"
    >
      {isDark
        ? <Sun  size={16} />
        : <Moon size={16} />
      }
    </button>
  )
}

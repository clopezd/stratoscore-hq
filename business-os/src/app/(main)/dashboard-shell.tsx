'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '@/shared/components/Header'
import { SearchDialog } from '@/features/search/components'
import { SidebarNav } from '@/shared/components/SidebarNav'
import { useLayoutStore } from '@/shared/stores/layout-store'
import { useGlobalShortcuts } from '@/shared/hooks/useGlobalShortcuts'
import { KeyboardShortcutsHelp } from '@/shared/components/KeyboardShortcutsHelp'
import { X } from 'lucide-react'
import { RouteGuard } from '@/shared/components/RouteGuard'
import { ChatBubble } from '@/shared/components/ChatBubble'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { leftSidebarOpen, closeLeftSidebar } = useLayoutStore()
  const [helpOpen, setHelpOpen] = useState(false)
  const pathname = usePathname()

  // Persist last visited route for cross-session restore (desktop)
  useEffect(() => {
    if (pathname) {
      localStorage.setItem('mc_lastRoute', pathname)
    }
  }, [pathname])

  const handleCreateTask = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openclaw:create-task'))
  }, [])

  const handleShowHelp = useCallback(() => {
    setHelpOpen(true)
  }, [])

  useGlobalShortcuts({
    onCreateTask: handleCreateTask,
    onShowHelp: handleShowHelp,
  })

  // Sync --app-h with visual viewport ONLY when iOS keyboard is open.
  // When keyboard is closed, remove --app-h so the fallback 100dvh is used.
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    let rafId: number
    const sync = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const isKeyboard = vv.height < window.innerHeight * 0.75
        document.documentElement.classList.toggle('keyboard-open', isKeyboard)
        if (isKeyboard) {
          document.documentElement.style.setProperty('--app-h', `${vv.height}px`)
        } else {
          document.documentElement.style.removeProperty('--app-h')
        }
      })
    }
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Reset viewport after keyboard dismissal (iOS can leave state stuck)
  useEffect(() => {
    const handleFocusOut = (e: FocusEvent) => {
      const related = e.relatedTarget as HTMLElement | null
      if (related?.tagName === 'TEXTAREA' || related?.tagName === 'INPUT') return
      setTimeout(() => {
        document.documentElement.style.removeProperty('--app-h')
        document.documentElement.classList.remove('keyboard-open')
        window.scrollTo(0, 0)
      }, 300)
    }
    document.addEventListener('focusout', handleFocusOut)
    return () => document.removeEventListener('focusout', handleFocusOut)
  }, [])

  return (
    <div className="fixed inset-0" style={{ backgroundColor: 'var(--app-page-bg)' }} data-dashboard-shell>
    <div
      className="flex flex-col md:overflow-hidden"
      style={{
        height: 'var(--app-h, 100dvh)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Aurora orbs */}
      <div className="fixed top-[-30%] left-[-15%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none" style={{ backgroundColor: 'var(--app-orb-purple)' }} />
      <div className="fixed bottom-[-30%] right-[-15%] w-[45%] h-[45%] rounded-full blur-[150px] pointer-events-none" style={{ backgroundColor: 'var(--app-orb-blue)' }} />

      {/* Header */}
      <Header />

      {/* Body */}
      <div className="flex-1 flex md:overflow-hidden relative min-h-0">
        {/* Mobile overlay */}
        {leftSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={closeLeftSidebar}
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`
            ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            fixed md:relative z-40 md:z-0
            w-64 ${leftSidebarOpen ? 'md:w-60' : 'md:w-0'}
            border-r
            transition-all duration-300 ease-in-out
            flex flex-col overflow-hidden shrink-0
          `}
          style={{
            backgroundColor: 'var(--app-sidebar-bg)',
            borderColor: 'var(--sidebar-border)',
            height: 'calc(var(--app-h, 100dvh) - 3.5rem - env(safe-area-inset-top, 0px))',
          }}
        >
          <button
            onClick={closeLeftSidebar}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/[0.08] text-white/40 md:hidden z-10"
          >
            <X size={16} />
          </button>

          <SidebarNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto md:overflow-hidden min-w-0">
          <RouteGuard>{children}</RouteGuard>
        </main>
      </div>

      <SearchDialog />
      <KeyboardShortcutsHelp isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <ChatBubble />
    </div>
    </div>
  )
}

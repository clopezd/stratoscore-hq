<<<<<<< Updated upstream
'use client'
import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { KanbanBoard, ListView } from '@/features/tasks/components'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { useLayoutStore } from '@/shared/stores/layout-store'
import { useFiltersStore } from '@/shared/stores/filters-store'
import { useAuth } from '@/hooks/useAuth'
import { LayoutGrid, List } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  useTasks()
  const selectedView = useLayoutStore((s) => s.selectedView)
  const setSelectedView = useLayoutStore((s) => s.setSelectedView)

  // Apply view from URL query param
  useEffect(() => {
    const viewParam = searchParams.get('view')
    if (viewParam === 'list' || viewParam === 'kanban') {
      setSelectedView(viewParam)
    }
  }, [searchParams, setSelectedView])
  const { profile, isOwner, loading } = useAuth()
  const setFilter = useFiltersStore((s) => s.setFilter)
  const didAutoFilter = useRef(false)

  // Owner default: redirect ONCE per session on initial app open (desktop only)
  useEffect(() => {
    if (loading) return
    if (!isOwner) return

    // Only redirect on the very first load of the session
    const initialized = sessionStorage.getItem('mc_initialized')
    if (initialized) return

    sessionStorage.setItem('mc_initialized', 'true')

    const isMobile = window.matchMedia('(max-width: 767px)').matches

    if (!isMobile) {
      // Desktop: restore last visited route, default to dashboard
      const lastRoute = localStorage.getItem('mc_lastRoute')
      if (lastRoute && lastRoute !== '/' && lastRoute !== '/dashboard') {
        router.replace(lastRoute)
      }
    }
    // Mobile: stay on dashboard (show Board/Tasks)
  }, [loading, isOwner, router])

  // Auto-filter members to their own tasks on first load
  useEffect(() => {
    if (loading || didAutoFilter.current) return
    if (!isOwner && profile?.id) {
      setFilter('assigneeId', profile.id)
      didAutoFilter.current = true
    }
  }, [loading, isOwner, profile, setFilter])

  return (
    <div className="h-full flex flex-col">

      {/* View toggle */}
      <div className="flex items-center gap-1 px-4 pb-1">
        <button
          onClick={() => setSelectedView('kanban')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-colors
            ${selectedView === 'kanban' ? 'bg-white/[0.08] text-white/70' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}
          `}
        >
          <LayoutGrid size={12} />
          Board
        </button>
        <button
          onClick={() => setSelectedView('list')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-colors
            ${selectedView === 'list' ? 'bg-white/[0.08] text-white/70' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}
          `}
        >
          <List size={12} />
          List
        </button>
      </div>

      {/* View content */}
      <div className="flex-1 min-h-0">
        {selectedView === 'list' ? <ListView /> : <KanbanBoard />}
      </div>
    </div>
  )
=======
import { MissionControlDashboard } from '@/features/mission-control/components/MissionControlDashboard'

export default function MissionControlPage() {
  return <MissionControlDashboard />
>>>>>>> Stashed changes
}

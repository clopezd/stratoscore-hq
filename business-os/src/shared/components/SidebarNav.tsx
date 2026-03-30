'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFiltersStore } from '@/shared/stores/filters-store'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutGrid,
  Activity,
  Settings,
  Users,
  CircleUserRound,
  Bookmark,
  X,
  ChevronDown,
  ChevronRight,
  PenLine,
  Bot,
  LogOut,
  BarChart2,
  DollarSign,
  Cpu,
} from 'lucide-react'
import { Logo } from '@/shared/components/Logo'
import { VidendumLogo } from '@/shared/components/VidendumLogo'
import { useTenant } from '@/shared/hooks/useTenant'
import { signout } from '@/actions/auth'
import type { Profile, TaskStatus, TaskPriority, UserRole } from '@/types/database'

interface SavedView {
  id: string
  name: string
  filters: Record<string, unknown>
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  adminOnly?: boolean
  ownerOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Board',     icon: LayoutGrid },
  { href: '/settings',  label: 'Settings',  icon: Settings   },
  { href: '/draw',      label: 'Draw',      icon: PenLine,   adminOnly: true },
  { href: '/agents',    label: 'Agentes',   icon: Cpu,       ownerOnly: true, exact: false },
  { href: '/chat',      label: 'Chat',      icon: Bot,       ownerOnly: true },
  { href: '/finanzas',  label: 'Finanzas',  icon: DollarSign, ownerOnly: true, exact: false },
  { href: '/activity',  label: 'Activity',  icon: Activity,  ownerOnly: true },
  { href: '/videndum',  label: 'Videndum',  icon: BarChart2, ownerOnly: true, exact: false },
]

function filterNavItems(items: NavItem[], role: UserRole): NavItem[] {
  return items.filter(item => {
    if (item.ownerOnly) return role === 'owner'
    if (item.adminOnly) return role === 'owner' || role === 'admin'
    return true
  })
}

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { setFilter, resetFilters } = useFiltersStore()
  const assigneeFilter = useFiltersStore((s) => s.filters.assigneeId)
  const { isOwner, role, profile } = useAuth()
  const tenant = useTenant()

  const [members, setMembers] = useState<Profile[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [viewsExpanded, setViewsExpanded] = useState(false)
  const [teamExpanded, setTeamExpanded] = useState(false)

  const fetchSidebarData = useCallback(async () => {
    const supabase = createClient()
    const [viewsRes, profilesRes] = await Promise.all([
      supabase.from('saved_views').select('id, name, filters').order('name'),
      supabase.from('profiles').select('*').order('full_name'),
    ])
    if (viewsRes.data) setSavedViews(viewsRes.data as unknown as SavedView[])
    if (profilesRes.data) {
      setMembers(profilesRes.data as Profile[])
      setMembersLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSidebarData()
  }, [fetchSidebarData])

  const handleMyTasks = () => {
    if (!profile) return
    const current = useFiltersStore.getState().filters.assigneeId
    if (current === profile.id) {
      setFilter('assigneeId', null)
    } else {
      resetFilters()
      setFilter('assigneeId', profile.id)
    }
    if (pathname !== '/dashboard') router.push('/dashboard')
  }

  const handleMemberClick = (profileId: string) => {
    router.push(`/team/${profileId}`)
  }

  const handleLoadView = (view: SavedView) => {
    resetFilters()
    const f = view.filters
    if (f.priority !== undefined && f.priority !== null) setFilter('priority', f.priority as TaskPriority)
    if (f.assigneeId) setFilter('assigneeId', f.assigneeId as string)
    if (f.labelId) setFilter('labelId', f.labelId as string)
    if (f.status !== undefined && f.status !== null) setFilter('status', f.status as TaskStatus)
    if (f.search) setFilter('search', f.search as string)
  }

  const handleDeleteView = async (viewId: string) => {
    const supabase = createClient()
    await supabase.from('saved_views').delete().eq('id', viewId)
    setSavedViews((prev) => prev.filter((v) => v.id !== viewId))
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  const myTasksActive = !!(profile && assigneeFilter === profile.id)

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">

      {/* Logo — StratosCore por defecto, Videndum solo en rutas /videndum */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        {pathname.startsWith('/videndum') ? (
          <VidendumLogo width={120} className="text-vid-fg" />
        ) : (
          <>
            <Logo
              size={32}
              src={tenant.logoUrl}
              alt={tenant.name}
              className="rounded-md shrink-0"
            />
            {!tenant.logoUrl && (
              <span className="text-xs font-semibold text-vid-fg tracking-tight truncate">
                {tenant.name}
              </span>
            )}
          </>
        )}
      </div>

      <div className="mx-3 border-t border-vid" />

      {/* My Tasks */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={handleMyTasks}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200
            ${myTasksActive
              ? 'bg-blue-500/15 text-blue-600 border border-blue-500/25 dark:text-blue-400 dark:border-blue-500/20'
              : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-raised)] border border-transparent'
            }`}
        >
          <CircleUserRound size={15} />
          <span className="flex-1 text-left">My Tasks</span>
        </button>
      </div>

      <div className="mx-3 border-t border-vid" />

      {/* Navigation Links */}
      <div className="px-3 pt-2 pb-2 space-y-0.5">
        {filterNavItems(NAV_ITEMS, role).map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact === false
            ? pathname.startsWith(href)
            : pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${isActive
                  ? 'bg-[var(--card-elevated)] text-[var(--foreground)]'
                  : 'text-[var(--foreground-subtle)] hover:text-[var(--foreground)] hover:bg-[var(--card-raised)]'
                }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </div>

      {isOwner && (
      <>
      {/* Team Members */}
      <div className="flex flex-col min-h-0">
        <div
          onClick={() => setTeamExpanded(!teamExpanded)}
          onKeyDown={(e) => handleKeyDown(e, () => setTeamExpanded(!teamExpanded))}
          role="button"
          tabIndex={0}
          className="flex items-center justify-between px-5 py-2 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {teamExpanded ? <ChevronDown size={12} className="text-vid-faint" /> : <ChevronRight size={12} className="text-vid-faint" />}
            <Users size={14} className="text-vid-subtle" />
            <span className="text-[10px] uppercase tracking-widest text-vid-subtle font-semibold">Team</span>
          </div>
          <span className="text-[9px] bg-[var(--card-raised)] px-1.5 py-0.5 rounded-full text-vid-faint">
            {members.length}
          </span>
        </div>

        {teamExpanded && (
          <div className="overflow-y-auto max-h-64 px-2 pb-2 space-y-0.5">
            {membersLoading ? (
              <div className="space-y-2 px-1">
                {[1, 2].map(i => (
                  <div key={i} className="h-10 rounded-xl bg-[var(--card-raised)] animate-pulse" />
                ))}
              </div>
            ) : (
              members.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleMemberClick(member.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200
                    hover:bg-[var(--card-raised)] border border-transparent"
                >
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--card-elevated)] flex items-center justify-center text-xs text-vid-muted flex-shrink-0">
                      {(member.full_name ?? '?')[0]}
                    </div>
                  )}
                  <div className="min-w-0 text-left">
                    <span className="text-xs text-vid-muted truncate block">{member.full_name ?? 'User'}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Saved Views */}
      {savedViews.length > 0 && (
        <>
          <div className="mx-3 border-t border-vid" />
          <div className="px-3 py-2">
            <button
              onClick={() => setViewsExpanded(!viewsExpanded)}
              className="w-full flex items-center gap-2 px-2.5 py-1 mb-1"
            >
              {viewsExpanded ? <ChevronDown size={12} className="text-vid-faint" /> : <ChevronRight size={12} className="text-vid-faint" />}
              <Bookmark size={14} className="text-vid-subtle" />
              <span className="text-[10px] uppercase tracking-widest text-vid-subtle font-semibold">Views</span>
              <span className="text-[9px] bg-[var(--card-raised)] px-1 py-0.5 rounded-full text-vid-faint ml-auto">
                {savedViews.length}
              </span>
            </button>
            {viewsExpanded && (
              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {savedViews.map((view) => (
                  <div key={view.id} className="group flex items-center">
                    <button
                      onClick={() => handleLoadView(view)}
                      className="flex-1 text-left px-2.5 py-1 rounded-lg text-xs text-vid-subtle hover:text-vid-fg hover:bg-[var(--card-raised)] transition-colors truncate"
                    >
                      {view.name}
                    </button>
                    <button
                      onClick={() => handleDeleteView(view.id)}
                      className="p-1 text-vid-faint hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      </>
      )}

      </div>{/* end scrollable content */}

      {/* Sign out — fixed at bottom */}
      <div
        className="flex-shrink-0 px-3 border-t border-vid"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Powered by Stratoscore */}
        <div className="flex items-center justify-center gap-1.5 py-2 opacity-30 hover:opacity-50 transition-opacity">
          <span className="text-[9px] text-vid-subtle tracking-widest uppercase">Powered by</span>
          <span className="text-[9px] font-semibold text-vid-fg tracking-tight">Stratoscore</span>
        </div>

        <form action={signout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-vid-faint hover:text-red-500 hover:bg-red-500/[0.06] transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}

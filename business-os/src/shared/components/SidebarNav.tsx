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
  ScanLine,
  Crosshair,
  Accessibility,
  Calculator,
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

/**
 * Nav item visibility:
 *   (no flag)    → todos los roles (member, admin, owner)
 *   adminOnly    → admin + owner   (no visible para member)
 *   ownerOnly    → solo owner      (herramientas de gestión/inteligencia)
 */
interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  adminOnly?: boolean
  ownerOnly?: boolean
  section?: string
}

const NAV_ITEMS: NavItem[] = [
  // Principal
  { href: '/dashboard', label: 'Mission Control', icon: LayoutGrid, section: 'principal' },
  { href: '/finanzas',  label: 'Finanzas',        icon: DollarSign, ownerOnly: true, exact: false, section: 'principal' },

  // Clientes
  { href: '/videndum',    label: 'Videndum',    icon: BarChart2,     ownerOnly: true, exact: false, section: 'clientes' },
  { href: '/mobility',    label: 'Mobility',    icon: Accessibility, ownerOnly: true, exact: false, section: 'clientes' },
  { href: '/bidhunter',   label: 'BidHunter',   icon: Crosshair,     ownerOnly: true, exact: false, section: 'clientes' },
  { href: '/contacr',     label: 'ContaCR',     icon: Calculator,    ownerOnly: true, exact: false, section: 'clientes' },

  // Herramientas
  { href: '/agents',   label: 'Agentes',  icon: Cpu,      ownerOnly: true, exact: false, section: 'tools' },
  { href: '/chat',     label: 'Chat IA',  icon: Bot,      ownerOnly: true, section: 'tools' },
  { href: '/draw',     label: 'Draw',     icon: PenLine,  adminOnly: true, section: 'tools' },
  { href: '/activity', label: 'Actividad', icon: Activity, ownerOnly: true, section: 'tools' },
]

const SECTION_LABELS: Record<string, string> = {
  principal: '',
  clientes: 'Clientes',
  tools: 'Herramientas',
}

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

  const myTasksActive = !!(profile && assigneeFilter === profile.id)

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">

      {/* Logo del tenant — dinámico vía useTenant() o Videndum si estás en /videndum */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        {pathname.startsWith('/videndum') ? (
          <VidendumLogo width={120} className="text-white" />
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
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
              : 'text-black/60 hover:text-black/90 hover:bg-black/[0.06] dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.08] border border-transparent'
            }`}
        >
          <CircleUserRound size={15} />
          <span className="flex-1 text-left">My Tasks</span>
        </button>
      </div>

      <div className="mx-3 border-t border-vid" />

      {/* Navigation Links — agrupados por sección */}
      <div className="px-3 pt-2 pb-2">
        {(() => {
          const filtered = filterNavItems(NAV_ITEMS, role)
          const sections = [...new Set(filtered.map(i => i.section || 'principal'))]
          return sections.map(section => {
            const items = filtered.filter(i => (i.section || 'principal') === section)
            if (items.length === 0) return null
            const label = SECTION_LABELS[section]
            return (
              <div key={section} className={section !== 'principal' ? 'mt-3' : ''}>
                {label && (
                  <div className="px-2.5 pb-1.5 pt-1">
                    <span className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">{label}</span>
                  </div>
                )}
                <div className="space-y-0.5">
                  {items.map(({ href, label: itemLabel, icon: Icon, exact }) => {
                    const isActive = exact === false
                      ? pathname.startsWith(href)
                      : pathname === href
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                          ${isActive
                            ? 'bg-cyan-500/15 text-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-300'
                            : 'text-black/60 hover:text-black/90 hover:bg-black/[0.05] dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.08]'
                          }`}
                      >
                        <Icon size={15} />
                        {itemLabel}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })
        })()}
      </div>

      {isOwner && (
      <>
      {/* Team Members */}
      <div className="flex flex-col min-h-0">
        <div
          onClick={() => setTeamExpanded(!teamExpanded)}
          role="button"
          className="flex items-center justify-between px-5 py-2 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {teamExpanded ? <ChevronDown size={12} className="text-white/50" /> : <ChevronRight size={12} className="text-white/50" />}
            <Users size={14} className="text-white/60" />
            <span className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">Team</span>
          </div>
          <span className="text-[9px] bg-white/[0.06] px-1.5 py-0.5 rounded-full text-white/50">
            {members.length}
          </span>
        </div>

        {teamExpanded && (
          <div className="overflow-y-auto max-h-64 px-2 pb-2 space-y-0.5">
            {membersLoading ? (
              <div className="space-y-2 px-1">
                {[1, 2].map(i => (
                  <div key={i} className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />
                ))}
              </div>
            ) : (
              members.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleMemberClick(member.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200
                    hover:bg-white/[0.04] border border-transparent"
                >
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/[0.1] flex items-center justify-center text-xs text-white/60 flex-shrink-0">
                      {(member.full_name ?? '?')[0]}
                    </div>
                  )}
                  <div className="min-w-0 text-left">
                    <span className="text-xs text-white/80 truncate block">{member.full_name ?? 'User'}</span>
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
              {viewsExpanded ? <ChevronDown size={12} className="text-white/50" /> : <ChevronRight size={12} className="text-white/50" />}
              <Bookmark size={14} className="text-white/60" />
              <span className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">Views</span>
              <span className="text-[9px] bg-white/[0.06] px-1 py-0.5 rounded-full text-white/50 ml-auto">
                {savedViews.length}
              </span>
            </button>
            {viewsExpanded && (
              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {savedViews.map((view) => (
                  <div key={view.id} className="group flex items-center">
                    <button
                      onClick={() => handleLoadView(view)}
                      className="flex-1 text-left px-2.5 py-1 rounded-lg text-xs text-white/60 hover:text-white/70 hover:bg-white/[0.05] transition-colors truncate"
                    >
                      {view.name}
                    </button>
                    <button
                      onClick={() => handleDeleteView(view.id)}
                      className="p-1 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
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
        <div className="flex items-center justify-center gap-1.5 py-2 opacity-50 hover:opacity-70 transition-opacity">
          <span className="text-[9px] text-white/60 tracking-widest uppercase">Powered by</span>
          <span className="text-[9px] font-semibold text-white/80 tracking-tight">Stratoscore</span>
        </div>

        <form action={signout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-black/30 hover:text-red-600/70 hover:bg-red-400/[0.05] dark:text-white/70 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}

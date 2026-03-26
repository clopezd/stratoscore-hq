'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Search, PanelLeft, MessageSquare, Plus } from 'lucide-react'
import { AvatarLightbox } from '@/shared/components/AvatarLightbox'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { Logo } from '@/shared/components/Logo'
import { VidendumLogo } from '@/shared/components/VidendumLogo'
import { useTenant } from '@/shared/hooks/useTenant'
import { useLayoutStore } from '@/shared/stores/layout-store'
import { useSearchStore } from '@/features/search/components'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

export function Header() {
  const { toggleLeftSidebar, toggleChatSessionsPanel } = useLayoutStore()
  const pathname = usePathname()
  const isChatPage = pathname === '/chat'
  const [avatarOpen, setAvatarOpen] = useState(false)
  const tenant = useTenant()

  const handleNewChat = () => {
    window.dispatchEvent(new CustomEvent('openclaw:new-chat'))
  }

  return (
    <header
      className="h-14 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 md:relative z-10 border-b shrink-0"
      style={{ backgroundColor: 'var(--app-header-bg)', borderColor: 'var(--app-border)' }}
    >
      {/* Specular rim */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Left: Sidebar toggle + sessions toggle on mobile chat */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLeftSidebar}
          className="p-2 rounded-lg transition-colors
            text-black/40 hover:text-black/70 hover:bg-black/[0.06]
            dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/[0.08]"
        >
          <PanelLeft size={18} />
        </button>

        {/* Mobile chat: sessions toggle */}
        {isChatPage && (
          <button
            onClick={toggleChatSessionsPanel}
            className="md:hidden p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white/80"
            title="Conversations"
          >
            <MessageSquare size={18} />
          </button>
        )}
      </div>

      {/* Center: Assistant info on mobile chat, MISSION CONTROL badge elsewhere */}
      <div className="flex items-center gap-2">
        {isChatPage ? (
          <>
            {/* Mobile: Assistant avatar + name */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setAvatarOpen(true)} className="relative rounded-full focus:outline-none" title="View profile">
                <img src="/avatar.png" alt="Assistant" className="w-7 h-7 rounded-full object-cover border border-violet-400/30 hover:border-violet-400/70 transition-colors" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0a0a0f]" />
              </button>
              <div className="select-none pointer-events-none">
                <p className="text-sm font-semibold text-white leading-none">Assistant</p>
                <p className="text-[10px] text-white/40 mt-0.5">Agent</p>
              </div>
            </div>
            {avatarOpen && <AvatarLightbox src="/avatar.png" alt="Assistant" onClose={() => setAvatarOpen(false)} />}
            {/* Desktop: logo del tenant o Videndum */}
            <div className="hidden md:flex items-center gap-2">
              {pathname.startsWith('/videndum') ? (
                <VidendumLogo width={110} className="text-white" />
              ) : (
                <>
                  <Logo size={28} src={tenant.logoUrl} alt={tenant.name} className="rounded-md" />
                  <span className="text-sm font-semibold text-vid-fg tracking-tight">{tenant.name}</span>
                </>
              )}
            </div>
          </>
        ) : pathname.startsWith('/videndum') ? (
          <VidendumLogo width={110} className="text-white" />
        ) : (
          <div className="flex items-center gap-2">
            <Logo size={28} src={tenant.logoUrl} alt={tenant.name} className="rounded-md" />
            <span className="text-sm font-semibold text-vid-fg tracking-tight">{tenant.name}</span>
          </div>
        )}
      </div>

      {/* Right: new chat (mobile chat only) + search + theme toggle + notifications */}
      <div className="flex items-center gap-1">
        {isChatPage && (
          <button
            onClick={handleNewChat}
            title="New conversation"
            className="md:hidden p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white/80"
          >
            <Plus size={18} />
          </button>
        )}
        <button
          onClick={() => useSearchStore.getState().toggle()}
          className="p-2 rounded-lg transition-colors
            text-black/40 hover:text-black/70 hover:bg-black/[0.06]
            dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/[0.08]"
        >
          <Search size={18} />
        </button>
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  )
}

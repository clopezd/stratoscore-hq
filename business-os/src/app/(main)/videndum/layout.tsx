import { VidendumTabs } from './VidendumTabs'
import { V18FloatingButton } from '@/features/videndum/components/V18FloatingButton'

export default function VidendumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <VidendumTabs />
      <div className="flex-1">
        {children}
      </div>

      {/* VIDEO 18 — Floating AI Assistant (aparece en todas las páginas de Videndum) */}
      <V18FloatingButton />
    </div>
  )
}

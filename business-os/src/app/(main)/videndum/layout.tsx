import { VidendumTabs } from './VidendumTabs'

export default function VidendumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <VidendumTabs />
      <div className="flex-1 min-h-0 overflow-auto">
        {children}
      </div>
    </div>
  )
}

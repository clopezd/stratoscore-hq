import { VidendumTabs } from './VidendumTabs'

export default function VidendumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <VidendumTabs />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

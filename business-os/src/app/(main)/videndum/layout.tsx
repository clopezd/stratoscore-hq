import { VidendumTabs } from './VidendumTabs'

export default function VidendumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full w-full">
      <VidendumTabs />
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  )
}

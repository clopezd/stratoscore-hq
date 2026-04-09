import { FitSyncTabs } from './FitSyncTabs'

export default function FitSyncLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <FitSyncTabs />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

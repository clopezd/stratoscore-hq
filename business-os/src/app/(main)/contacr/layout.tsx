import { ContaCRTabs } from './ContaCRTabs'

export default function ContaCRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <ContaCRTabs />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

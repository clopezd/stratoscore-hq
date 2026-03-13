export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="relative min-h-dvh overflow-hidden pt-[env(safe-area-inset-top)]"
      style={{ backgroundColor: 'var(--app-page-bg)' }}
    >
      {/* Aurora orbs — adaptativos */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse dark:bg-purple-600/15 bg-purple-400/10" style={{ animationDuration: '8s' }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse dark:bg-blue-600/12 bg-blue-400/8" style={{ animationDuration: '12s' }} />
      <div className="fixed top-[40%] right-[15%] w-[35%] h-[35%] rounded-full blur-[100px] animate-pulse dark:bg-cyan-600/8 bg-cyan-400/5" style={{ animationDuration: '10s' }} />

      {/* Content */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4">
        {children}
      </div>
    </div>
  )
}

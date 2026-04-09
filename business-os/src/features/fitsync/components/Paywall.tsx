'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { UpgradeModal } from './UpgradeModal'

interface PaywallProps {
  children: React.ReactNode
  isPaid: boolean
  feature: string
}

/**
 * Wraps content that requires a paid tier.
 * Shows content if paid, otherwise shows a lock overlay with upgrade prompt.
 */
export function Paywall({ children, isPaid, feature }: PaywallProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (isPaid) return <>{children}</>

  return (
    <>
      <div className="relative">
        <div className="opacity-30 pointer-events-none select-none blur-[2px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setShowUpgrade(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <Lock size={16} className="text-emerald-500" />
            <span className="text-sm font-medium text-gray-700">
              Upgrade to Pro
            </span>
          </button>
        </div>
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} feature={feature} />
    </>
  )
}

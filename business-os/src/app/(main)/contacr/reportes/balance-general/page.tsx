'use client'

import { EmpresaSelector } from '@/features/contacr/components/EmpresaSelector'
import { BalanceGeneral } from '@/features/contacr/components/BalanceGeneral'

export default function BalanceGeneralPage() {
  return (
    <div>
      <div className="px-4 md:px-6 py-3 flex items-center justify-between border-b border-white/[0.06]">
        <h1 className="text-sm font-medium text-white/60">Balance General</h1>
        <EmpresaSelector />
      </div>
      <BalanceGeneral />
    </div>
  )
}

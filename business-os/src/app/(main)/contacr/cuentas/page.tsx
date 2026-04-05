'use client'

import { EmpresaSelector } from '@/features/contacr/components/EmpresaSelector'
import { PlanCuentasTree } from '@/features/contacr/components/PlanCuentasTree'

export default function ContaCRCuentasPage() {
  return (
    <div>
      <div className="px-4 md:px-6 py-3 flex items-center justify-between border-b border-white/[0.06]">
        <h1 className="text-sm font-medium text-white/60">Plan de cuentas</h1>
        <EmpresaSelector />
      </div>
      <PlanCuentasTree />
    </div>
  )
}

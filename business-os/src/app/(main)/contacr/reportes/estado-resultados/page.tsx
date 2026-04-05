'use client'

import { EmpresaSelector } from '@/features/contacr/components/EmpresaSelector'
import { EstadoResultados } from '@/features/contacr/components/EstadoResultados'

export default function EstadoResultadosPage() {
  return (
    <div>
      <div className="px-4 md:px-6 py-3 flex items-center justify-between border-b border-white/[0.06]">
        <h1 className="text-sm font-medium text-white/60">Estado de Resultados</h1>
        <EmpresaSelector />
      </div>
      <EstadoResultados />
    </div>
  )
}

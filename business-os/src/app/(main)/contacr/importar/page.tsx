'use client'

import { EmpresaSelector } from '@/features/contacr/components/EmpresaSelector'
import { CsvImportView } from '@/features/contacr/components/CsvImportView'
import { MovimientosTable } from '@/features/contacr/components/MovimientosTable'

export default function ContaCRImportarPage() {
  return (
    <div>
      <div className="px-4 md:px-6 py-3 flex items-center justify-between border-b border-white/[0.06]">
        <h1 className="text-sm font-medium text-white/60">Importar movimientos</h1>
        <EmpresaSelector />
      </div>
      <CsvImportView />
      <div className="px-4 md:px-6 pb-6">
        <MovimientosTable />
      </div>
    </div>
  )
}

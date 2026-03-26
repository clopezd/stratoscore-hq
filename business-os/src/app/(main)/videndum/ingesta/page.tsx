'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUploader, type IngestResult } from '@/features/data-ingestion/components/FileUploader'
import { Upload, LayoutDashboard } from 'lucide-react'

// ── Page ───────────────────────────────────────────────────────────────────────

export default function IngestaPage() {
  const router = useRouter()
  const [ingestResult, setIngestResult] = useState<IngestResult | null>(null)

  const handleSuccess = useCallback((result: IngestResult) => {
    setIngestResult(result)
  }, [])

  return (
    <div>
      <div className="p-3 md:p-5 space-y-4 md:space-y-5 max-w-7xl mx-auto pb-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Upload size={14} className="text-violet-400" />
            <h1 className="text-base font-semibold text-white">Ingesta de Datos</h1>
          </div>
          <p className="text-xs text-white/35">
            Carga archivos Excel de planeación · Los datos se guardan en{' '}
            <span className="font-mono text-white/50">planning_forecasts</span>
          </p>
        </div>

        {/* Upload central */}
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-[11px] text-white/25 uppercase tracking-widest">Archivo Excel</p>

          <FileUploader onSuccess={handleSuccess} />

          {/* Botón Ver Dashboard — aparece tras carga exitosa */}
          {ingestResult && (
            <button
              onClick={() => router.push('/videndum')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium
                bg-amber-500/80 hover:bg-amber-500 text-white shadow-[0_0_16px_rgba(245,158,11,0.2)] transition-all"
            >
              <LayoutDashboard size={12} />
              Ver Resumen Ejecutivo en el Dashboard
            </button>
          )}

          {/* Formato esperado */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-3">
            <p className="text-[11px] text-white/25 uppercase tracking-widest">Formatos soportados</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-[10px] text-white/40 font-medium">📊 Forecast Production</p>
                <FormatRow label="Hoja"    value='"Forecast Production"' />
                <FormatRow label="Fila 1"  value="Años (ej: 2024, 2025, 2026…)" />
                <FormatRow label="Fila 2"  value="Meses (ene, feb, mar…)" />
                <FormatRow label="Fila 3+" value="Part number · qty por mes" />
              </div>
              <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                <p className="text-[10px] text-white/40 font-medium">📈 Ventas Reales</p>
                <FormatRow label="Hoja"    value='"Ventas" o "Sales"' />
                <FormatRow label="Fila 1"  value='SKU, "September 2025", "October 2025"…' />
                <FormatRow label="Fila 2+" value="Part number · qty por mes" />
              </div>
            </div>
            <p className="text-[10px] text-white/20 pt-2 border-t border-white/[0.04]">
              ✅ Detección automática · UPSERT activo · Guarda en tabla correcta según tipo
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-white/30 w-16 shrink-0">{label}</span>
      <span className="text-[10px] font-mono text-white/50">{value}</span>
    </div>
  )
}

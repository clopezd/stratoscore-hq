'use client'

import { useState } from 'react'
import { FileText, Sheet, Loader2 } from 'lucide-react'
import type { SummaryKPIs } from '@/features/data-ingestion/services/summary'

interface ExportButtonsProps {
  kpis: SummaryKPIs
  summaryText?: string
}

export function ExportButtons({ kpis, summaryText }: ExportButtonsProps) {
  const [loadingPdf, setLoadingPdf]     = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)

  async function handlePdf() {
    setLoadingPdf(true)
    try {
      const { exportVidendumPDF } = await import('../services/exportPdf')
      await exportVidendumPDF(kpis, summaryText)
    } finally {
      setLoadingPdf(false)
    }
  }

  async function handleExcel() {
    setLoadingExcel(true)
    try {
      const { exportVidendumExcel } = await import('../services/exportExcel')
      await exportVidendumExcel(kpis)
    } finally {
      setLoadingExcel(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePdf}
        disabled={loadingPdf}
        title="Exportar PDF con branding Videndum"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
          bg-white/[0.05] hover:bg-white/[0.09] text-white/60 hover:text-white/80
          border border-white/[0.08] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loadingPdf
          ? <Loader2 size={10} className="animate-spin" />
          : <FileText size={10} />
        }
        PDF
      </button>

      <button
        onClick={handleExcel}
        disabled={loadingExcel}
        title="Exportar Excel con branding Videndum"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
          bg-white/[0.05] hover:bg-white/[0.09] text-white/60 hover:text-white/80
          border border-white/[0.08] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loadingExcel
          ? <Loader2 size={10} className="animate-spin" />
          : <Sheet size={10} />
        }
        Excel
      </button>
    </div>
  )
}

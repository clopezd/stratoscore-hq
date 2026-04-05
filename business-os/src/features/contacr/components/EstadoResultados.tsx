'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, Printer } from 'lucide-react'
import { useContaCRStore } from '../store'
import { formatCRC } from '../services/movimientos'

interface LineaReporte {
  categoria: string
  total: number
}

interface EstadoData {
  empresa: string
  cedula: string | null
  periodo: { desde: string; hasta: string }
  ingresos: LineaReporte[]
  totalIngresos: number
  gastos: LineaReporte[]
  totalGastos: number
  utilidadBruta: number
  utilidadNeta: number
  margenNeto: number
}

export function EstadoResultados() {
  const { empresaActiva } = useContaCRStore()
  const [data, setData] = useState<EstadoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [desde, setDesde] = useState(() => {
    const d = new Date()
    d.setMonth(0, 1)
    return d.toISOString().split('T')[0]
  })
  const [hasta, setHasta] = useState(() => new Date().toISOString().split('T')[0])
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!empresaActiva) { setLoading(false); return }
    setLoading(true)
    fetch(`/api/contacr/reportes/estado-resultados?empresa_id=${empresaActiva.id}&desde=${desde}&hasta=${hasta}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [empresaActiva, desde, hasta])

  const handlePrint = () => {
    const content = reportRef.current
    if (!content) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`
      <html><head><title>Estado de Resultados - ${data?.empresa}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 14px; color: #666; margin-bottom: 20px; font-weight: normal; }
        .subtitle { font-size: 12px; color: #999; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; border-bottom: 2px solid #1a1a1a; padding: 8px 0; }
        th:last-child { text-align: right; }
        td { padding: 6px 0; font-size: 13px; border-bottom: 1px solid #eee; }
        td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
        .total-row td { font-weight: 700; border-top: 2px solid #1a1a1a; border-bottom: none; padding-top: 10px; }
        .grand-total td { font-size: 16px; font-weight: 700; border-top: 3px double #1a1a1a; padding-top: 12px; }
        .section-header { font-size: 13px; font-weight: 600; padding-top: 16px; color: #333; }
        .positive { color: #15803d; }
        .negative { color: #b91c1c; }
        .note { font-size: 10px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
        @media print { body { padding: 20px; } }
      </style></head><body>${content.innerHTML}</body></html>
    `)
    w.document.close()
    w.print()
  }

  if (!empresaActiva) {
    return <div className="p-8 text-center text-white/30 text-sm">Selecciona una empresa</div>
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-white/[0.04] animate-pulse rounded-lg" />)}
      </div>
    )
  }

  if (!data) {
    return <div className="p-8 text-center text-white/30 text-sm">Sin datos disponibles</div>
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <label className="text-[10px] text-white/30 block mb-1">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
            className="px-3 py-1.5 bg-white/[0.06] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/40" />
        </div>
        <div>
          <label className="text-[10px] text-white/30 block mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
            className="px-3 py-1.5 bg-white/[0.06] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/40" />
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] border border-white/10 rounded-lg text-xs text-white/60 hover:text-white/80 transition-colors">
            <Printer size={13} /> Imprimir
          </button>
        </div>
      </div>

      {/* Reporte */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div ref={reportRef}>
          {/* Header del reporte */}
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h1 className="text-lg font-bold text-white">{data.empresa}</h1>
            {data.cedula && <p className="text-xs text-white/30 mt-0.5">{data.cedula}</p>}
            <h2 className="text-sm font-semibold text-blue-400 mt-2">Estado de Resultados</h2>
            <p className="text-[10px] text-white/30 mt-0.5">
              Del {data.periodo.desde} al {data.periodo.hasta}
            </p>
          </div>

          {/* Ingresos */}
          <div className="px-6 py-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left text-[10px] text-white/30 uppercase tracking-wider pb-2 font-medium">Concepto</th>
                  <th className="text-right text-[10px] text-white/30 uppercase tracking-wider pb-2 font-medium">Monto (CRC)</th>
                </tr>
              </thead>
              <tbody>
                {/* Ingresos */}
                <tr>
                  <td className="pt-4 pb-2 text-sm font-semibold text-emerald-400" colSpan={2}>INGRESOS</td>
                </tr>
                {data.ingresos.map((item) => (
                  <tr key={item.categoria} className="border-b border-white/[0.03]">
                    <td className="py-2 text-xs text-white/60 pl-4">{item.categoria}</td>
                    <td className="py-2 text-xs text-white/70 text-right tabular-nums">{formatCRC(item.total)}</td>
                  </tr>
                ))}
                <tr className="border-t border-white/[0.08]">
                  <td className="py-2.5 text-xs font-semibold text-white pl-4">Total Ingresos</td>
                  <td className="py-2.5 text-xs font-bold text-emerald-400 text-right tabular-nums">{formatCRC(data.totalIngresos)}</td>
                </tr>

                {/* Gastos */}
                <tr>
                  <td className="pt-6 pb-2 text-sm font-semibold text-red-400" colSpan={2}>GASTOS</td>
                </tr>
                {data.gastos.map((item) => (
                  <tr key={item.categoria} className="border-b border-white/[0.03]">
                    <td className="py-2 text-xs text-white/60 pl-4">{item.categoria}</td>
                    <td className="py-2 text-xs text-white/70 text-right tabular-nums">({formatCRC(item.total)})</td>
                  </tr>
                ))}
                <tr className="border-t border-white/[0.08]">
                  <td className="py-2.5 text-xs font-semibold text-white pl-4">Total Gastos</td>
                  <td className="py-2.5 text-xs font-bold text-red-400 text-right tabular-nums">({formatCRC(data.totalGastos)})</td>
                </tr>

                {/* Utilidad neta */}
                <tr className="border-t-2 border-white/20">
                  <td className="py-4 text-sm font-bold text-white">UTILIDAD NETA</td>
                  <td className={`py-4 text-lg font-bold text-right tabular-nums ${data.utilidadNeta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.utilidadNeta >= 0 ? formatCRC(data.utilidadNeta) : `(${formatCRC(Math.abs(data.utilidadNeta))})`}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Margen */}
            <div className="mt-4 flex items-center gap-4 px-4 py-3 bg-white/[0.03] rounded-lg">
              <div>
                <span className="text-[10px] text-white/30">Margen neto</span>
                <p className={`text-sm font-bold ${data.margenNeto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.margenNeto.toFixed(1)}%
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-white/30">Ingresos</span>
                <p className="text-sm font-medium text-white/70">{formatCRC(data.totalIngresos)}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-white/30">Gastos</span>
                <p className="text-sm font-medium text-white/70">{formatCRC(data.totalGastos)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

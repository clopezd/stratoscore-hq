'use client'

import { useState, useEffect, useRef } from 'react'
import { Printer, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useContaCRStore } from '../store'
import { formatCRC } from '../services/movimientos'

interface CuentaLinea {
  cuenta: string
  monto: number
}

interface SubSeccion {
  label: string
  items: CuentaLinea[]
}

interface Seccion {
  label: string
  items: SubSeccion[] | CuentaLinea[]
  total: number
}

interface BalanceData {
  empresa: string
  cedula: string | null
  fecha: string
  activos: Seccion
  pasivos: Seccion
  patrimonio: { label: string; items: CuentaLinea[]; total: number }
  totalActivos: number
  totalPasivos: number
  totalPatrimonio: number
  totalPasivoPatrimonio: number
  cuadra: boolean
  nota: string
}

export function BalanceGeneral() {
  const { empresaActiva } = useContaCRStore()
  const [data, setData] = useState<BalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasta, setHasta] = useState(() => new Date().toISOString().split('T')[0])
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!empresaActiva) { setLoading(false); return }
    setLoading(true)
    fetch(`/api/contacr/reportes/balance-general?empresa_id=${empresaActiva.id}&hasta=${hasta}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [empresaActiva, hasta])

  const handlePrint = () => {
    const content = reportRef.current
    if (!content) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`
      <html><head><title>Balance General - ${data?.empresa}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .header-info { font-size: 12px; color: #999; }
        .report-title { font-size: 14px; font-weight: 600; color: #1e40af; margin: 12px 0 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; border-bottom: 2px solid #1a1a1a; padding: 8px 0; }
        th:last-child { text-align: right; }
        td { padding: 5px 0; font-size: 12px; }
        td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
        .section-title td { font-weight: 700; font-size: 13px; padding-top: 14px; color: #333; }
        .subsection td { font-weight: 600; font-size: 12px; padding-top: 10px; color: #555; }
        .indent td:first-child { padding-left: 24px; }
        .total-row td { font-weight: 700; border-top: 1px solid #ccc; padding-top: 8px; }
        .grand-total td { font-size: 14px; font-weight: 800; border-top: 3px double #1a1a1a; padding-top: 12px; }
        .ecuacion { margin-top: 24px; padding: 16px; background: #f8f8f8; border-radius: 8px; text-align: center; }
        .ecuacion .label { font-size: 10px; color: #999; text-transform: uppercase; }
        .ecuacion .value { font-size: 16px; font-weight: 700; }
        .nota { font-size: 10px; color: #999; margin-top: 24px; border-top: 1px solid #eee; padding-top: 8px; }
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
          <label className="text-[10px] text-white/30 block mb-1">Al fecha</label>
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
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <h1 className="text-lg font-bold text-white">{data.empresa}</h1>
            {data.cedula && <p className="text-xs text-white/30 mt-0.5">{data.cedula}</p>}
            <h2 className="text-sm font-semibold text-blue-400 mt-2">Balance General</h2>
            <p className="text-[10px] text-white/30 mt-0.5">Al {data.fecha}</p>
          </div>

          <div className="px-6 py-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left text-[10px] text-white/30 uppercase tracking-wider pb-2 font-medium">Cuenta</th>
                  <th className="text-right text-[10px] text-white/30 uppercase tracking-wider pb-2 font-medium">Monto (CRC)</th>
                </tr>
              </thead>
              <tbody>
                {/* ACTIVOS */}
                <tr>
                  <td className="pt-4 pb-2 text-sm font-bold text-blue-400" colSpan={2}>ACTIVOS</td>
                </tr>
                {(data.activos.items as SubSeccion[]).map((sub) => (
                  <SubSeccionRows key={sub.label} subseccion={sub} />
                ))}
                <tr className="border-t border-white/[0.08]">
                  <td className="py-3 text-xs font-bold text-white">TOTAL ACTIVOS</td>
                  <td className="py-3 text-sm font-bold text-blue-400 text-right tabular-nums">{formatCRC(data.totalActivos)}</td>
                </tr>

                {/* PASIVOS */}
                <tr>
                  <td className="pt-6 pb-2 text-sm font-bold text-orange-400" colSpan={2}>PASIVOS</td>
                </tr>
                {(data.pasivos.items as SubSeccion[]).map((sub) => (
                  <SubSeccionRows key={sub.label} subseccion={sub} />
                ))}
                <tr className="border-t border-white/[0.06]">
                  <td className="py-2.5 text-xs font-semibold text-white pl-2">Total Pasivos</td>
                  <td className="py-2.5 text-xs font-bold text-orange-400 text-right tabular-nums">{formatCRC(data.totalPasivos)}</td>
                </tr>

                {/* PATRIMONIO */}
                <tr>
                  <td className="pt-6 pb-2 text-sm font-bold text-purple-400" colSpan={2}>PATRIMONIO</td>
                </tr>
                {data.patrimonio.items.map((item) => (
                  <tr key={item.cuenta} className="border-b border-white/[0.03]">
                    <td className="py-2 text-xs text-white/60 pl-6">{item.cuenta}</td>
                    <td className={`py-2 text-xs text-right tabular-nums ${item.monto >= 0 ? 'text-white/70' : 'text-red-400'}`}>
                      {item.monto >= 0 ? formatCRC(item.monto) : `(${formatCRC(Math.abs(item.monto))})`}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-white/[0.06]">
                  <td className="py-2.5 text-xs font-semibold text-white pl-2">Total Patrimonio</td>
                  <td className={`py-2.5 text-xs font-bold text-right tabular-nums ${data.totalPatrimonio >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                    {data.totalPatrimonio >= 0 ? formatCRC(data.totalPatrimonio) : `(${formatCRC(Math.abs(data.totalPatrimonio))})`}
                  </td>
                </tr>

                {/* TOTAL PASIVO + PATRIMONIO */}
                <tr className="border-t-2 border-white/20">
                  <td className="py-4 text-sm font-bold text-white">TOTAL PASIVO + PATRIMONIO</td>
                  <td className="py-4 text-lg font-bold text-white text-right tabular-nums">{formatCRC(data.totalPasivoPatrimonio)}</td>
                </tr>
              </tbody>
            </table>

            {/* Ecuación contable */}
            <div className={`mt-4 flex items-center justify-center gap-4 px-4 py-3 rounded-lg ${data.cuadra ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {data.cuadra ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={16} className="text-red-400" />
              )}
              <span className={`text-xs font-medium ${data.cuadra ? 'text-emerald-300' : 'text-red-300'}`}>
                Activos ({formatCRC(data.totalActivos)}) {data.cuadra ? '=' : '≠'} Pasivos + Patrimonio ({formatCRC(data.totalPasivoPatrimonio)})
              </span>
            </div>

            {/* Nota */}
            <p className="mt-4 text-[10px] text-white/20 italic">{data.nota}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubSeccionRows({ subseccion }: { subseccion: SubSeccion }) {
  return (
    <>
      <tr>
        <td className="pt-3 pb-1 text-xs font-semibold text-white/50 pl-3" colSpan={2}>{subseccion.label}</td>
      </tr>
      {subseccion.items.map((item) => (
        <tr key={item.cuenta} className="border-b border-white/[0.03]">
          <td className="py-2 text-xs text-white/60 pl-6">{item.cuenta}</td>
          <td className="py-2 text-xs text-white/70 text-right tabular-nums">{formatCRC(item.monto)}</td>
        </tr>
      ))}
    </>
  )
}

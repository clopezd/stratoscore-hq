'use client'

import { useState, useRef } from 'react'
import { Sparkles, RefreshCw, ChevronDown } from 'lucide-react'

const SOURCES = ['Manual', 'FRED', 'World Bank', 'IMF', 'Bloomberg']

export function AnalysisPanel() {
  const [growthRate, setGrowthRate] = useState('3')
  const [source, setSource] = useState('Manual')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function runAnalysis() {
    if (loading) {
      abortRef.current?.abort()
      return
    }

    const rate = parseFloat(growthRate)
    if (isNaN(rate)) return

    setLoading(true)
    setError(null)
    setOutput('')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/videndum/analysis-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market_growth_rate: rate, market_source: source, top_n: 15 }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(await res.text())

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setOutput(prev => prev + decoder.decode(value, { stream: true }))
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-indigo-400" />
          <p className="text-xs font-medium text-white/50">Análisis IA — MAPE + Contexto de Mercado</p>
        </div>
        <span className="text-[10px] text-white/20 bg-white/[0.04] px-2 py-0.5 rounded-full">
          Claude Sonnet · Top 15 productos
        </span>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3 mb-4">

        {/* Tasa de crecimiento */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-white/35 whitespace-nowrap">Crecimiento de mercado</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={growthRate}
              onChange={e => setGrowthRate(e.target.value)}
              step="0.5"
              className="w-16 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white text-right outline-none focus:border-indigo-500/50 transition-colors"
            />
            <span className="text-xs text-white/30">%</span>
          </div>
        </div>

        {/* Selector de fuente */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-white/35">Fuente</label>
          <div className="relative">
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="appearance-none bg-white/[0.05] border border-white/[0.08] rounded-lg pl-3 pr-7 py-1 text-xs text-white outline-none focus:border-indigo-500/50 cursor-pointer transition-colors"
            >
              {SOURCES.map(s => (
                <option key={s} value={s} className="bg-[#0d0d14]">{s}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={runAnalysis}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            loading
              ? 'bg-white/[0.05] text-white/40 hover:bg-red-500/15 hover:text-red-400 border border-white/[0.06]'
              : 'bg-indigo-500/80 text-white hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
          }`}
        >
          {loading
            ? <><RefreshCw size={11} className="animate-spin" /> Detener</>
            : <><Sparkles size={11} /> Analizar</>
          }
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Output */}
      {(output || loading) ? (
        <div className="relative bg-black/20 border border-white/[0.05] rounded-lg p-4 max-h-[520px] overflow-y-auto">
          {output ? (
            <pre className="text-xs text-white/75 leading-relaxed font-mono whitespace-pre-wrap">
              {output}
              {loading && (
                <span className="inline-block w-1.5 h-3.5 bg-indigo-400 align-text-bottom ml-0.5 animate-pulse" />
              )}
            </pre>
          ) : (
            <p className="text-xs text-white/20 animate-pulse">Generando análisis...</p>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-white/[0.06] rounded-lg py-8 text-center">
          <Sparkles size={18} className="text-white/10 mx-auto mb-2" />
          <p className="text-[11px] text-white/20">
            Configura el crecimiento esperado de mercado y presiona <span className="text-white/35">Analizar</span>
          </p>
        </div>
      )}
    </div>
  )
}

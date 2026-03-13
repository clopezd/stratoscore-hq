'use client'

import { useState, useRef } from 'react'
import { Sparkles, RefreshCw, ChevronDown, Download } from 'lucide-react'
import { useTenant } from '@/shared/hooks/useTenant'

const SOURCES = ['Manual', 'FRED', 'World Bank', 'IMF', 'Bloomberg']

// ── Logo loader: PNG url → base64 via canvas (100% frontend, sin backend) ──────
async function loadLogoBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width  = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(null); return }
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch { resolve(null) }
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export function AnalysisPanel() {
  const [growthRate, setGrowthRate] = useState('3')
  const [source, setSource]         = useState('Manual')
  const [output, setOutput]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const abortRef                    = useRef<AbortController | null>(null)
  const tenant                      = useTenant()

  async function handleDownloadPDF() {
    if (!output) return
    const { jsPDF } = await import('jspdf')

    // ── Intentar cargar logo (tenant DB → PNG público → fallback texto) ─────
    const logoSources = [
      tenant.logoUrl,
      '/assets/videndum-logo.png',
    ].filter(Boolean) as string[]

    let logoBase64: string | null = null
    for (const src of logoSources) {
      logoBase64 = await loadLogoBase64(src)
      if (logoBase64) break
    }

    // ── Constantes de layout ─────────────────────────────────────────────────
    const MARGIN  = 20          // ≥20mm pedido
    const pageW   = 210         // A4
    const pageH   = 297
    const contentW = pageW - MARGIN * 2
    const HEADER_H = 42         // altura de cabecera
    const FOOTER_H = 12
    const BODY_TOP = HEADER_H + 6

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    let y = BODY_TOP

    // ── Helper: nueva página con cabecera y pie ──────────────────────────────
    function drawHeaderFooter(page: number, total: number) {
      // Franja superior blanca con línea inferior gris
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pageW, HEADER_H, 'F')
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.4)
      doc.line(MARGIN, HEADER_H, pageW - MARGIN, HEADER_H)

      if (logoBase64) {
        // Logo Videndum a la izquierda — 38mm ancho, proporcional
        doc.addImage(logoBase64, 'PNG', MARGIN, 8, 38, 21)
      } else {
        // Fallback texto: "[ Videndum ]" simulando el logo con corchetes
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(30, 30, 30)
        doc.text('[', MARGIN, 22)
        doc.setFontSize(11)
        doc.text('Videndum', MARGIN + 5, 22)
        doc.setFontSize(14)
        doc.text(']', MARGIN + 37, 22)
      }

      // Título del informe (derecha)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(30, 30, 30)
      doc.text('Análisis Estratégico de Portfolio', pageW - MARGIN, 15, { align: 'right' })

      // Metadatos debajo del título
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(120, 120, 120)
      doc.text(
        `Fecha: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        pageW - MARGIN, 22, { align: 'right' }
      )
      doc.text(
        `Crecimiento de mercado: ${growthRate}%  ·  Fuente: ${source}`,
        pageW - MARGIN, 27, { align: 'right' }
      )

      // Pie de página
      doc.setFillColor(248, 248, 248)
      doc.rect(0, pageH - FOOTER_H, pageW, FOOTER_H, 'F')
      doc.setDrawColor(220, 220, 220)
      doc.line(MARGIN, pageH - FOOTER_H, pageW - MARGIN, pageH - FOOTER_H)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(140, 140, 140)
      doc.text('Generado por Stratoscore  |  Informe confidencial', MARGIN, pageH - 4.5)
      doc.text(`Página ${page} de ${total}`, pageW - MARGIN, pageH - 4.5, { align: 'right' })
    }

    // ── Helper: salto de página ──────────────────────────────────────────────
    function checkY(needed: number) {
      if (y + needed > pageH - FOOTER_H - 4) {
        doc.addPage()
        y = BODY_TOP
        doc.setTextColor(30, 30, 30)
      }
    }

    // ── Renderizar el cuerpo (markdown → jsPDF) ──────────────────────────────
    doc.setTextColor(30, 30, 30)

    for (const raw of output.split('\n')) {
      const line = raw.trimEnd()

      if (/^# /.test(line)) {
        checkY(14)
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(40, 40, 40)
        const wrapped = doc.splitTextToSize(line.replace(/^# /, ''), contentW)
        doc.text(wrapped, MARGIN, y)
        y += wrapped.length * 7 + 2
        doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.35)
        doc.line(MARGIN, y, pageW - MARGIN, y)
        y += 5; doc.setTextColor(30, 30, 30)
        continue
      }

      if (/^## /.test(line)) {
        checkY(10)
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(30, 30, 30)
        const wrapped = doc.splitTextToSize(line.replace(/^## /, ''), contentW)
        y += 4; doc.text(wrapped, MARGIN, y); y += wrapped.length * 6 + 2
        continue
      }

      if (/^### /.test(line)) {
        checkY(8)
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(90, 90, 90)
        const wrapped = doc.splitTextToSize(line.replace(/^### /, ''), contentW)
        y += 2; doc.text(wrapped, MARGIN, y); y += wrapped.length * 5.5 + 1
        doc.setTextColor(30, 30, 30)
        continue
      }

      if (/^[-]{3,}$/.test(line.trim())) {
        checkY(5)
        doc.setDrawColor(210, 210, 210); doc.setLineWidth(0.25)
        doc.line(MARGIN, y, pageW - MARGIN, y); y += 5
        continue
      }

      if (line.trim() === '') { y += 3.5; continue }

      if (/^[-*•] /.test(line)) {
        const text    = line.replace(/^[-*•] /, '').replace(/\*\*(.+?)\*\*/g, '$1')
        const wrapped = doc.splitTextToSize(`• ${text}`, contentW - 5)
        checkY(wrapped.length * 5 + 1)
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 30, 30)
        doc.text(wrapped, MARGIN + 5, y); y += wrapped.length * 5 + 1
        continue
      }

      // Texto normal con bold inline
      const lH    = 5.2
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      let xC      = MARGIN
      checkY(lH + 1)

      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
          const clean = part.slice(2, -2)
          const w = doc.getStringUnitWidth(clean) * 9 / doc.internal.scaleFactor
          if (xC + w > pageW - MARGIN) { y += lH; xC = MARGIN; checkY(lH) }
          doc.text(clean, xC, y); xC += w
        } else {
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
          const wrapped = doc.splitTextToSize(part, pageW - MARGIN - xC)
          if (wrapped.length === 1) {
            doc.text(wrapped[0], xC, y)
            xC += doc.getStringUnitWidth(wrapped[0]) * 9 / doc.internal.scaleFactor
          } else {
            doc.text(wrapped[0], xC, y)
            for (let i = 1; i < wrapped.length; i++) {
              y += lH; checkY(lH)
              doc.text(wrapped[i], MARGIN, y)
              xC = MARGIN + doc.getStringUnitWidth(wrapped[i]) * 9 / doc.internal.scaleFactor
            }
          }
        }
      }
      y += lH + 0.5
    }

    // ── Cabecera y pie en todas las páginas ──────────────────────────────────
    const total = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
    for (let p = 1; p <= total; p++) {
      doc.setPage(p)
      drawHeaderFooter(p, total)
    }

    doc.save(`Videndum_Analisis_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

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
    <div className="bg-vid-card border border-vid rounded-xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-indigo-400" />
          <p className="text-xs font-medium text-vid-muted">Análisis IA — MAPE + Contexto de Mercado</p>
        </div>
        <span className="text-[10px] text-vid-subtle bg-vid-raised px-2 py-0.5 rounded-full">
          Claude Sonnet · Top 15 productos
        </span>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3 mb-4">

        {/* Tasa de crecimiento */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-vid-subtle whitespace-nowrap">Crecimiento de mercado</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={growthRate}
              onChange={e => setGrowthRate(e.target.value)}
              step="0.5"
              className="w-16 bg-vid-raised border border-vid rounded-lg px-2 py-1 text-xs text-vid-fg text-right outline-none focus:border-indigo-500/50 transition-colors"
            />
            <span className="text-xs text-vid-subtle">%</span>
          </div>
        </div>

        {/* Selector de fuente */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-vid-subtle">Fuente</label>
          <div className="relative">
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="appearance-none bg-vid-raised border border-vid rounded-lg pl-3 pr-7 py-1 text-xs text-vid-fg outline-none focus:border-indigo-500/50 cursor-pointer transition-colors"
            >
              {SOURCES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-vid-subtle pointer-events-none" />
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={runAnalysis}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            loading
              ? 'bg-vid-raised text-vid-muted hover:bg-red-500/15 hover:text-red-500 dark:hover:text-red-400 border border-vid'
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
        <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Output */}
      {(output || loading) ? (
        <div className="rounded-lg border border-vid overflow-hidden">
          {/* Barra superior del bloque resultado */}
          <div className="flex items-center justify-between px-4 py-2 bg-vid-raised border-b border-vid">
            <span className="text-[10px] text-vid-subtle">Resultado del análisis</span>
            {output && !loading && (
              <button
                onClick={handleDownloadPDF}
                title="Descargar PDF"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 transition-all text-[11px] font-medium"
              >
                <Download size={11} />
                Descargar PDF
              </button>
            )}
          </div>

          {/* Contenido scrolleable */}
          <div className="bg-vid-raised p-4 max-h-[500px] overflow-y-auto">
            {output ? (
              <pre className="text-xs text-vid-fg leading-relaxed font-mono whitespace-pre-wrap">
                {output}
                {loading && (
                  <span className="inline-block w-1.5 h-3.5 bg-indigo-400 align-text-bottom ml-0.5 animate-pulse" />
                )}
              </pre>
            ) : (
              <p className="text-xs text-vid-muted animate-pulse">Generando análisis...</p>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-vid rounded-lg py-8 text-center">
          <Sparkles size={18} className="text-vid-faint mx-auto mb-2" />
          <p className="text-[11px] text-vid-faint">
            Configura el crecimiento esperado de mercado y presiona{' '}
            <span className="text-vid-subtle">Analizar</span>
          </p>
        </div>
      )}
    </div>
  )
}

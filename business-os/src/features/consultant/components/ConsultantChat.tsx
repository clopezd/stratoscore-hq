'use client'

import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { BrainCircuit, Send, Square, Trash2, BarChart2, TrendingUp, Radar, RefreshCw, CheckCircle2, Download } from 'lucide-react'
import { useConsultantChat } from '../hooks/useConsultantChat'
import { MarkdownMessage } from '@/features/chat/components/MarkdownMessage'
import type { ToolCall } from '../types'
import type { DecisionMatrixData } from '@/features/videndum/types'

// ── PDF export ──────────────────────────────────────────────────────────────────

async function downloadMessagePDF(question: string, answer: string) {
  const { jsPDF } = await import('jspdf')

  const doc      = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const marginL  = 15
  const marginR  = 15
  const pageW    = doc.internal.pageSize.getWidth()
  const pageH    = doc.internal.pageSize.getHeight()
  const maxW     = pageW - marginL - marginR
  let   y        = 20

  // ── Header ──
  doc.setFillColor(109, 40, 217)   // violet-700
  doc.rect(0, 0, pageW, 14, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('VIDENDUM — Consultor Estratégico IA', marginL, 9)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(new Date().toLocaleString('es-CO'), pageW - marginR, 9, { align: 'right' })

  function newPage() {
    doc.addPage()
    doc.setFillColor(109, 40, 217)
    doc.rect(0, 0, pageW, 14, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text('VIDENDUM — Consultor Estratégico IA', marginL, 9)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text(new Date().toLocaleString('es-CO'), pageW - marginR, 9, { align: 'right' })
    y = 22
    doc.setTextColor(30, 30, 30)
  }

  function checkY(needed: number) {
    if (y + needed > pageH - 14) newPage()
  }

  doc.setTextColor(30, 30, 30)

  // ── Pregunta ──
  checkY(18)
  doc.setFillColor(245, 243, 255)  // violet-50
  const qLines = doc.splitTextToSize(question, maxW - 8)
  const qBoxH  = qLines.length * 5 + 10
  doc.roundedRect(marginL, y - 5, maxW, qBoxH, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(109, 40, 217)
  doc.text('Pregunta', marginL + 4, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 30, 90)
  doc.text(qLines, marginL + 4, y)
  y += qLines.length * 5 + 8
  doc.setTextColor(30, 30, 30)

  // ── Respuesta ──
  const lines = answer.split('\n')

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (/^# /.test(line)) {
      checkY(12)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(79, 70, 229)
      const wrapped = doc.splitTextToSize(line.replace(/^# /, ''), maxW)
      doc.text(wrapped, marginL, y)
      y += wrapped.length * 7 + 2
      doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.4)
      doc.line(marginL, y, pageW - marginR, y)
      y += 4; doc.setTextColor(30, 30, 30)
      continue
    }

    if (/^## /.test(line)) {
      checkY(10)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(30, 30, 30)
      const wrapped = doc.splitTextToSize(line.replace(/^## /, ''), maxW)
      y += 3; doc.text(wrapped, marginL, y); y += wrapped.length * 6 + 2
      continue
    }

    if (/^### /.test(line)) {
      checkY(8)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(100, 100, 100)
      const wrapped = doc.splitTextToSize(line.replace(/^### /, ''), maxW)
      y += 2; doc.text(wrapped, marginL, y); y += wrapped.length * 5.5 + 1
      doc.setTextColor(30, 30, 30)
      continue
    }

    if (/^[-]{3,}$/.test(line.trim())) {
      checkY(5)
      doc.setDrawColor(210, 210, 210); doc.setLineWidth(0.3)
      doc.line(marginL, y, pageW - marginR, y); y += 5
      continue
    }

    if (line.trim() === '') { y += 3; continue }

    if (/^[-*•] /.test(line)) {
      const text    = line.replace(/^[-*•] /, '').replace(/\*\*(.+?)\*\*/g, '$1')
      const wrapped = doc.splitTextToSize(`• ${text}`, maxW - 4)
      checkY(wrapped.length * 5)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 30, 30)
      doc.text(wrapped, marginL + 4, y); y += wrapped.length * 5 + 1
      continue
    }

    // Texto normal con bold inline
    const lineH = 5
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    let xC = marginL
    checkY(lineH + 1)

    for (const part of parts) {
      if (part.startsWith('**') && part.endsWith('**')) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
        const clean = part.slice(2, -2)
        const w = doc.getStringUnitWidth(clean) * 9 / doc.internal.scaleFactor
        if (xC + w > pageW - marginR) { y += lineH; xC = marginL; checkY(lineH) }
        doc.text(clean, xC, y); xC += w
      } else {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
        const wrapped = doc.splitTextToSize(part, pageW - marginR - xC)
        if (wrapped.length === 1) {
          doc.text(wrapped[0], xC, y)
          xC += doc.getStringUnitWidth(wrapped[0]) * 9 / doc.internal.scaleFactor
        } else {
          doc.text(wrapped[0], xC, y)
          for (let i = 1; i < wrapped.length; i++) {
            y += lineH; checkY(lineH)
            doc.text(wrapped[i], marginL, y)
            xC = marginL + doc.getStringUnitWidth(wrapped[i]) * 9 / doc.internal.scaleFactor
          }
        }
      }
    }
    y += lineH + 0.5
  }

  // ── Footer en cada página ──
  const total = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFontSize(7); doc.setTextColor(160, 160, 160)
    doc.text(`Página ${p} de ${total}  ·  StratosCore Mission Control`, pageW / 2, pageH - 6, { align: 'center' })
  }

  const slug = question.slice(0, 40).replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_')
  doc.save(`Consultor_${slug}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ── Tool badge ─────────────────────────────────────────────────────────────────

const TOOL_META: Record<string, { label: string; icon: typeof BarChart2; color: string }> = {
  get_analytics:    { label: 'Analytics',    icon: BarChart2,  color: 'text-blue-400' },
  get_variance:     { label: 'Varianza',     icon: TrendingUp, color: 'text-amber-400' },
  get_intelligence: { label: 'Inteligencia', icon: Radar,      color: 'text-indigo-400' },
}

function ToolBadge({ call }: { call: ToolCall }) {
  const meta = TOOL_META[call.toolName] ?? { label: call.toolName, icon: BarChart2, color: 'text-vid-muted' }
  const Icon = meta.icon
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border bg-vid-card border-vid ${meta.color}`}
    >
      {call.status === 'running'
        ? <RefreshCw size={9} className="animate-spin" />
        : <Icon size={9} />
      }
      {meta.label}
    </span>
  )
}

// ── Suggested prompts ──────────────────────────────────────────────────────────

const SUGGESTED = [
  '¿Cuál es el estado actual del pipeline y qué SKUs tienen mayor order book?',
  '¿Qué productos están más por debajo de su forecast? ¿Por qué?',
  '¿Cuáles son los principales riesgos competitivos del portfolio hoy?',
  '¿Cuál es el Book-to-Bill del último mes y qué señal nos da?',
]

// ── Main component ─────────────────────────────────────────────────────────────

interface ConsultantChatProps {
  radarContext?: DecisionMatrixData | null
  /** Si se establece, se envía automáticamente como primer mensaje (una sola vez). */
  triggerMessage?: string | null
}

export function ConsultantChat({ radarContext, triggerMessage }: ConsultantChatProps = {}) {
  const serializedRadar = radarContext ? JSON.stringify(radarContext) : null
  const { messages, loading, sendMessage, clearMessages, stop } = useConsultantChat(serializedRadar)
  const [input, setInput] = useState('')
  const triggeredRef = useRef<string | null>(null)

  // Auto-enviar triggerMessage una sola vez cuando cambia y no está en loading
  useEffect(() => {
    if (triggerMessage && triggerMessage !== triggeredRef.current && !loading) {
      triggeredRef.current = triggerMessage
      sendMessage(triggerMessage)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerMessage])
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom only when there are actual messages (not on initial mount)
  useEffect(() => {
    if (messages.length === 0) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || loading) return
    sendMessage(input)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div className="bg-vid-card border border-vid rounded-xl overflow-hidden flex flex-col" style={{ height: 540 }}>

      {/* Header */}
      <div className="px-4 py-3 border-b border-vid flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit size={13} className="text-violet-400" />
          <p className="text-xs font-medium text-vid-muted">Consultor Estratégico</p>
          {radarContext ? (
            <span className="inline-flex items-center gap-1 text-[9px] text-violet-300/70 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full ml-1">
              <CheckCircle2 size={8} />
              Radar cargado
            </span>
          ) : (
            <span className="text-[9px] text-vid-faint bg-vid-raised px-2 py-0.5 rounded-full ml-1">
              Analytics · Varianza · Inteligencia
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1 text-[10px] text-vid-faint hover:text-vid-muted transition-colors"
          >
            <Trash2 size={10} />
            Limpiar
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <BrainCircuit size={28} className="text-vid-faint" />
            <p className="text-[11px] text-vid-faint text-center">
              Consulta datos en tiempo real del portfolio Videndum
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); textareaRef.current?.focus() }}
                  className="text-left text-[10px] text-vid-subtle hover:text-vid-muted bg-vid-card hover:bg-vid-raised border border-vid rounded-lg px-3 py-2 transition-all leading-relaxed"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-[80%] bg-vid-raised rounded-xl rounded-tr-sm px-3.5 py-2.5">
                <p className="text-[12px] text-vid-fg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            ) : (
              <div className="max-w-[90%] space-y-2">
                {/* Tool call badges */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {msg.toolCalls.map(tc => (
                      <ToolBadge key={tc.toolId} call={tc} />
                    ))}
                  </div>
                )}

                {/* Content */}
                {msg.content ? (
                  <div className={`bg-vid-card border rounded-xl rounded-tl-sm px-3.5 py-2.5 ${
                    msg.error ? 'border-red-500/20' : 'border-vid-subtle'
                  }`}>
                    {msg.error ? (
                      <p className="text-[12px] text-red-300">{msg.content}</p>
                    ) : (
                      <>
                        <MarkdownMessage content={msg.content} />
                        {/* Botón PDF — siempre visible cuando la respuesta está completa */}
                        {!msg.streaming && (
                          <div className="flex justify-end mt-2 pt-2 border-t border-vid-subtle">
                            <button
                              onClick={() => {
                                const prevUser = [...messages].slice(0, idx).reverse().find(m => m.role === 'user')
                                downloadMessagePDF(prevUser?.content ?? 'Consulta', msg.content)
                              }}
                              title="Descargar respuesta en PDF"
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 hover:text-violet-300 border border-violet-500/20 transition-all text-[10px] font-medium"
                            >
                              <Download size={10} />
                              Descargar PDF
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : msg.streaming && (!msg.toolCalls || msg.toolCalls.every(t => t.status === 'done')) ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-vid-subtle px-1">
                    <RefreshCw size={10} className="animate-spin" />
                    Analizando...
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-vid shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onInput={handleInput}
            placeholder="Pregunta sobre pipeline, varianza, riesgos competitivos..."
            rows={1}
            className="flex-1 resize-none bg-vid-card border border-vid rounded-lg px-3 py-2 text-[12px] text-vid-fg placeholder:text-vid-faint outline-none focus:border-violet-500/40 transition-colors leading-relaxed"
            style={{ minHeight: 36, maxHeight: 120 }}
          />
          {loading ? (
            <button
              onClick={stop}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
              title="Detener"
            >
              <Square size={12} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/80 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
            >
              <Send size={12} />
            </button>
          )}
        </div>
        <p className="text-[9px] text-vid-faint mt-1.5 text-center">Enter para enviar · Shift+Enter para nueva línea</p>
      </div>

    </div>
  )
}

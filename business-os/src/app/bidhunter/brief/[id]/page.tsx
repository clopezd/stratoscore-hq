'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Target, MapPin, Calendar, Building2, DollarSign,
  FileText, CheckCircle2, Shield, Ruler, ClipboardList, AlertTriangle,
  Loader2, Briefcase, Search, Database, Eye
} from 'lucide-react'

interface BriefData {
  opportunity: {
    id: string
    title: string
    gc_name: string | null
    location: string | null
    state_code: string | null
    deadline: string | null
    estimated_value: number | null
    building_sqft: number | null
    building_height_floors: number | null
    trades_required: string[] | null
    is_sdvosb_eligible: boolean
    scope_notes: string | null
    source_id: string | null
    status: string
    created_at: string
  }
  score: {
    score: number
    justification: string
    matching_services: string[] | null
    sdvosb_bonus: boolean
    bid_estimate: {
      exterior_sqft: number | null
      interior_sqft: number | null
      stucco_sqft: number | null
      total_estimate: number | null
      estimate_notes: string | null
    } | null
    scored_at: string
  } | null
  documents: Array<{
    id: string
    filename: string
    document_type: string
    file_size: number | null
    extraction_status: string
    extraction_method: string | null
    ocr_processed: boolean
    ocr_confidence: number | null
    extracted_at: string | null
  }>
  extractions: Array<{
    id: string
    document_id: string
    scope_summary: string | null
    trades_in_scope: string[] | null
    exclusions: string[] | null
    finish_schedule: Array<{ area: string; finish_type: string; sqft: number; notes: string | null }> | null
    total_painting_sqft: number | null
    exterior_painting_sqft: number | null
    interior_painting_sqft: number | null
    stucco_sqft: number | null
    materials_specified: Array<{ brand: string; product: string; spec_section: string | null }> | null
    bonding_required: boolean | null
    bonding_amount: number | null
    insurance_minimum: number | null
    prevailing_wage: boolean | null
    sdvosb_requirement: string | null
    liquidated_damages: number | null
    pre_bid_meeting: string | null
    bid_due_date: string | null
    confidence_score: number | null
  }>
  aggregated: {
    scope_summary: string | null
    trades_in_scope: string[]
    finish_schedule: Array<{ area: string; finish_type: string; sqft: number; notes: string | null }>
    total_painting_sqft: number | null
    exterior_painting_sqft: number | null
    interior_painting_sqft: number | null
    stucco_sqft: number | null
    materials: Array<{ brand: string; product: string; spec_section: string | null }>
    bonding_required: boolean | null
    bonding_amount: number | null
    insurance_minimum: number | null
    prevailing_wage: boolean | null
    sdvosb_requirement: string | null
    avg_confidence: number | null
  } | null
  pricing: {
    exterior: { sqft: number; rate: number; subtotal: number } | null
    interior: { sqft: number; rate: number; subtotal: number } | null
    stucco: { sqft: number; rate: number; subtotal: number } | null
    subtotal: number
    tax: number
    total: number
    highRise: boolean
    commission5pct: number
  } | null
}

function fmt(n: number | null | undefined) {
  if (n == null) return '—'
  return n.toLocaleString()
}

function fmtCurrency(n: number | null | undefined) {
  if (n == null) return '—'
  return `$${n.toLocaleString()}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(d: string | null | undefined) {
  if (!d) return null
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}

function docFilenameForId(docs: BriefData['documents'], id: string) {
  return docs.find(d => d.id === id)?.filename || 'Unknown file'
}

export default function BriefPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<BriefData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/bidhunter/brief?opportunity_id=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-white/30" size={32} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-red-400">
        Error: {error}
      </div>
    )
  }

  const { opportunity: opp, score, documents, extractions, aggregated, pricing } = data
  const days = daysUntil(opp.deadline)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back */}
        <Link href="/bidhunter" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 mb-6">
          <ArrowLeft size={14} /> Back to BidHunter
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            {score && (
              <div className={`shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold ${
                score.score >= 80 ? 'bg-green-500/20 text-green-400' :
                score.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {score.score}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{opp.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-white/50">
                {opp.gc_name && (
                  <span className="flex items-center gap-1"><Building2 size={14} /> {opp.gc_name}</span>
                )}
                {(opp.location || opp.state_code) && (
                  <span className="flex items-center gap-1"><MapPin size={14} /> {opp.location}{opp.state_code ? `, ${opp.state_code}` : ''}</span>
                )}
                {opp.deadline && (
                  <span className={`flex items-center gap-1 ${days != null && days <= 3 ? 'text-red-400' : days != null && days <= 7 ? 'text-amber-400' : ''}`}>
                    <Calendar size={14} /> {fmtDate(opp.deadline)} {days != null && `(${days}d)`}
                  </span>
                )}
                {opp.building_sqft && (
                  <span className="flex items-center gap-1"><Ruler size={14} /> {fmt(opp.building_sqft)} sqft</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ SECTION 1: Why Tico can do this ══════════ */}
        <Section icon={<Target size={16} />} title="Por qué Tico puede hacer este trabajo" color="green">
          {score ? (
            <div className="space-y-4">
              <p className="text-white/70 leading-relaxed">{score.justification}</p>

              {score.matching_services && score.matching_services.length > 0 && (
                <div>
                  <Label>Servicios de Tico que aplican:</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {score.matching_services.map(s => (
                      <span key={s} className="px-2 py-1 rounded-lg text-xs bg-green-500/15 text-green-400 border border-green-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {opp.trades_required && opp.trades_required.length > 0 && (
                <div>
                  <Label>Trades requeridos por el GC:</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {opp.trades_required.map(t => (
                      <span key={t} className="px-2 py-1 rounded-lg text-xs bg-white/[0.06] text-white/50">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {score.sdvosb_bonus && (
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <Shield size={14} />
                  SDVOSB eligible — Tico tiene certificación de veterano (+15 puntos)
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/30 italic">No ha sido evaluado aún. Score el proyecto primero.</p>
          )}
        </Section>

        {/* ══════════ SECTION 2: Data sources ══════════ */}
        <Section icon={<Database size={16} />} title="De dónde viene la información" color="blue">
          <div className="space-y-3">

            {/* Deep scan info from scope_notes */}
            {opp.scope_notes && opp.scope_notes.includes('DEEP SCAN') && (
              <SourceCard
                icon={<Search size={14} />}
                title="Deep Scan de BuildingConnected"
                confidence={null}
              >
                <pre className="text-xs text-white/50 whitespace-pre-wrap font-sans leading-relaxed">
                  {opp.scope_notes}
                </pre>
              </SourceCard>
            )}

            {/* Documents analyzed */}
            {documents.length > 0 ? (
              documents.map(doc => {
                const extraction = extractions.find(e => e.document_id === doc.id)
                return (
                  <SourceCard
                    key={doc.id}
                    icon={<FileText size={14} />}
                    title={doc.filename}
                    confidence={extraction?.confidence_score ?? null}
                  >
                    <div className="flex flex-wrap gap-3 text-[11px] text-white/40 mb-2">
                      <span>Tipo: {doc.document_type}</span>
                      {doc.file_size && <span>{(doc.file_size / 1024 / 1024).toFixed(1)}MB</span>}
                      <span>Método: {doc.extraction_method || 'text'}</span>
                      {doc.ocr_processed && <span>OCR: {doc.ocr_confidence?.toFixed(0)}% confidence</span>}
                      <span>Status: {doc.extraction_status}</span>
                    </div>
                    {extraction ? (
                      <div className="space-y-2">
                        {extraction.scope_summary && (
                          <div>
                            <MiniLabel>Scope encontrado en este archivo:</MiniLabel>
                            <p className="text-xs text-white/60">{extraction.scope_summary}</p>
                          </div>
                        )}
                        {extraction.trades_in_scope && extraction.trades_in_scope.length > 0 && (
                          <div>
                            <MiniLabel>Trades de pintura identificados:</MiniLabel>
                            <div className="flex flex-wrap gap-1">
                              {extraction.trades_in_scope.map(t => (
                                <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400/70">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {extraction.finish_schedule && extraction.finish_schedule.length > 0 && (
                          <div>
                            <MiniLabel>Finish Schedule extraído ({extraction.finish_schedule.length} items):</MiniLabel>
                            <div className="space-y-0.5 mt-1">
                              {extraction.finish_schedule.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px] bg-white/[0.03] rounded px-2 py-1">
                                  <span className="text-white/50">{item.area}</span>
                                  <span className="text-white/30">{item.finish_type}</span>
                                  <span className="text-green-400/70 font-medium">{item.sqft ? `${fmt(item.sqft)} sqft` : '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {extraction.materials_specified && extraction.materials_specified.length > 0 && (
                          <div>
                            <MiniLabel>Materiales especificados:</MiniLabel>
                            <div className="flex flex-wrap gap-1">
                              {extraction.materials_specified.map((m, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400/70">
                                  {m.brand} {m.product}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-white/25 italic">No se ha extraído data de este archivo aún</p>
                    )}
                  </SourceCard>
                )
              })
            ) : (
              <div className="text-sm text-white/30 italic py-2">
                No se han analizado documentos PDF. Los datos vienen del scoring IA basado en el título y trades del proyecto.
              </div>
            )}

            {/* Score source */}
            {score?.bid_estimate?.estimate_notes && (
              <SourceCard
                icon={<Eye size={14} />}
                title="Estimación IA (sin PDF)"
                confidence={null}
              >
                <p className="text-xs text-white/50 italic">{score.bid_estimate.estimate_notes}</p>
              </SourceCard>
            )}
          </div>
        </Section>

        {/* ══════════ SECTION 3: SqFt & Pricing ══════════ */}
        <Section icon={<DollarSign size={16} />} title="Estimado de precio" color="emerald">
          {pricing && pricing.total > 0 ? (
            <div className="space-y-4">
              {/* SqFt breakdown */}
              <div className="grid grid-cols-3 gap-3">
                {pricing.exterior && (
                  <PriceCard label="Exterior" sqft={pricing.exterior.sqft} rate={pricing.exterior.rate} total={pricing.exterior.subtotal} />
                )}
                {pricing.interior && (
                  <PriceCard label="Interior" sqft={pricing.interior.sqft} rate={pricing.interior.rate} total={pricing.interior.subtotal} />
                )}
                {pricing.stucco && (
                  <PriceCard label="Stucco" sqft={pricing.stucco.sqft} rate={pricing.stucco.rate} total={pricing.stucco.subtotal} />
                )}
              </div>

              {pricing.highRise && (
                <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                  <AlertTriangle size={14} />
                  Edificio &gt;4 pisos — requiere equipo extra (scaffolding/lift)
                </div>
              )}

              {/* Totals */}
              <div className="bg-white/[0.04] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Subtotal</span>
                  <span className="text-white/70">{fmtCurrency(pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Tax (7%)</span>
                  <span className="text-white/70">{fmtCurrency(pricing.tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-white/[0.08]">
                  <span className="text-white/70">Total Bid</span>
                  <span className="text-green-400">{fmtCurrency(pricing.total)}</span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-amber-400/70">Tu comisión (5%)</span>
                  <span className="text-amber-400 font-bold">{fmtCurrency(pricing.commission5pct)}</span>
                </div>
              </div>

              {/* Data source note */}
              <p className="text-[11px] text-white/25 italic">
                {aggregated ? '📄 Pricing basado en datos extraídos de PDFs del proyecto' : '🤖 Pricing basado en estimación IA (sin PDFs analizados)'}
                {' — '}Rates: Ext $2.10/sqft, Int $2.35/sqft, Stucco $15/sqft
              </p>
            </div>
          ) : (
            <p className="text-white/30 italic">No hay datos suficientes para estimar precio. Sube los specs del proyecto para obtener sqft exactos.</p>
          )}
        </Section>

        {/* ══════════ SECTION 4: Requirements ══════════ */}
        {aggregated && (aggregated.bonding_required != null || aggregated.insurance_minimum != null || aggregated.sdvosb_requirement) && (
          <Section icon={<Shield size={16} />} title="Requisitos contractuales" color="amber">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {aggregated.bonding_required != null && (
                <ReqItem label="Bonding" value={aggregated.bonding_required ? (aggregated.bonding_amount ? fmtCurrency(aggregated.bonding_amount) : 'Requerido') : 'No requerido'} warn={aggregated.bonding_required} />
              )}
              {aggregated.insurance_minimum != null && (
                <ReqItem label="Insurance Minimum" value={fmtCurrency(aggregated.insurance_minimum)} warn={true} />
              )}
              {aggregated.prevailing_wage != null && (
                <ReqItem label="Prevailing Wage" value={aggregated.prevailing_wage ? 'Sí (Davis-Bacon)' : 'No'} warn={aggregated.prevailing_wage} />
              )}
              {aggregated.sdvosb_requirement && (
                <ReqItem label="SDVOSB" value={aggregated.sdvosb_requirement} warn={false} good={true} />
              )}
            </div>
          </Section>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] text-center text-[11px] text-white/20">
          BidHunter by StratosCore — Generated {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

/* ── Reusable components ── */

function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    green: 'border-green-500/20 text-green-400',
    blue: 'border-blue-500/20 text-blue-400',
    emerald: 'border-emerald-500/20 text-emerald-400',
    amber: 'border-amber-500/20 text-amber-400',
  }
  return (
    <div className={`mb-8 border ${colors[color] || 'border-white/10 text-white/60'} rounded-xl overflow-hidden`}>
      <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">{children}</p>
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{children}</p>
}

function SourceCard({ icon, title, confidence, children }: { icon: React.ReactNode; title: string; confidence: number | null; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-white/70 font-medium">
          {icon} {title}
        </div>
        {confidence != null && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            confidence >= 0.7 ? 'bg-green-500/15 text-green-400' :
            confidence >= 0.4 ? 'bg-amber-500/15 text-amber-400' :
            'bg-red-500/15 text-red-400'
          }`}>
            {(confidence * 100).toFixed(0)}% confidence
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function PriceCard({ label, sqft, rate, total }: { label: string; sqft: number; rate: number; total: number }) {
  return (
    <div className="bg-white/[0.04] rounded-lg p-3 text-center">
      <p className="text-[11px] text-white/40 mb-1">{label}</p>
      <p className="text-lg font-bold text-green-400">{fmt(sqft)}</p>
      <p className="text-[10px] text-white/30">sqft × ${rate.toFixed(2)}</p>
      <p className="text-sm text-white/60 mt-1">{fmtCurrency(total)}</p>
    </div>
  )
}

function ReqItem({ label, value, warn, good }: { label: string; value: string; warn?: boolean; good?: boolean }) {
  return (
    <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2">
      <span className={good ? 'text-green-400' : warn ? 'text-amber-400' : 'text-white/40'}>
        {good ? <CheckCircle2 size={14} /> : warn ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
      </span>
      <div>
        <p className="text-[10px] text-white/30">{label}</p>
        <p className="text-xs text-white/70">{value}</p>
      </div>
    </div>
  )
}

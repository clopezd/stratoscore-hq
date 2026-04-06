'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { BidDraft, PricingLineItem, OpportunityWithScore } from '@/features/bidhunter/types'
import { Loader2, Printer, ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

function fmt(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)
}

function fmtDate(date?: string) {
  if (!date) return 'TBD'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const TAX_RATE = 0.07

export default function ProformaPage() {
  const params = useParams()
  const opportunityId = params.id as string

  const [draft, setDraft] = useState<BidDraft | null>(null)
  const [opp, setOpp] = useState<OpportunityWithScore | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tone, setTone] = useState('professional')
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    fetch('/api/bidhunter/opportunities?status=all')
      .then(r => r.json())
      .then(data => {
        const found = Array.isArray(data) ? data.find((o: { id: string }) => o.id === opportunityId) : null
        if (found) setOpp(found)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [opportunityId])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/bidhunter/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunityId, tone, language }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDraft(data.draft)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vid-bg text-vid-fg flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    )
  }

  // Pre-generate controls
  if (!draft) {
    return (
      <div className="min-h-screen bg-vid-bg text-vid-fg p-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/bidhunter" className="text-white/30 hover:text-white/60"><ArrowLeft size={18} /></Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText size={20} className="text-blue-400" />
              Generate Proforma
            </h1>
          </div>
          {opp && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-sm font-medium">{opp.title}</p>
              <p className="text-xs text-white/40 mt-1">GC: {opp.gc_name || 'Unknown'} — {opp.location}{opp.state_code ? `, ${opp.state_code}` : ''}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Tone</label>
              <select value={tone} onChange={e => setTone(e.target.value)} className="w-full px-3 py-2 text-sm bg-white/[0.06] border border-white/10 rounded-lg text-white focus:outline-none">
                <option value="professional">Professional</option>
                <option value="aggressive">Aggressive</option>
                <option value="conservative">Conservative</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-3 py-2 text-sm bg-white/[0.06] border border-white/10 rounded-lg text-white focus:outline-none">
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {generating ? 'Generating proforma...' : 'Generate Proforma'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate totals
  const pricing = draft.pricing_breakdown as PricingLineItem[]
  const subtotal = draft.total_amount
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const totalLabor = Math.round((subtotal + tax) * 100) / 100

  const bidNumber = `TR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  const projectName = opp?.title || 'Construction Project'
  const jobLocation = [opp?.location, opp?.state_code].filter(Boolean).join(', ')
  const gcName = opp?.gc_name || ''
  const deadline = opp?.deadline ? fmtDate(opp.deadline) : 'TBD'

  // Withdrawal date = 30 days from now
  const withdrawalDate = new Date()
  withdrawalDate.setDate(withdrawalDate.getDate() + 30)
  const withdrawalStr = withdrawalDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      {/* Screen-only toolbar */}
      <div className="print:hidden bg-vid-bg text-vid-fg p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/bidhunter" className="text-white/30 hover:text-white/60"><ArrowLeft size={18} /></Link>
          <span className="text-sm text-white/50">Proforma — {projectName}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white">
            {generating ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
            Regenerate
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500">
            <Printer size={13} />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Override browser title so PDF shows Tico brand only */}
      <title>{`Tico Restorations — Estimate ${bidNumber}`}</title>

      {/* ── PROFORMA DOCUMENT — Tico Restoration Bid Form Format ── */}
      <div className="bg-white min-h-screen print:bg-white">
        <div className="max-w-[850px] mx-auto px-10 py-8 text-gray-900 text-[13px] print:px-6 print:max-w-none">

          {/* ═══ HEADER: Estimate ═══ */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-wide border-b-2 border-gray-900 pb-3 inline-block px-8">
              Estimate
            </h1>
          </div>

          {/* ═══ PROJECT INFO ═══ */}
          <div className="grid grid-cols-2 gap-x-8 mb-4">
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-xs font-bold text-gray-600 shrink-0">Project Name</span>
                <span className="flex-1 border-b border-gray-300 text-sm font-medium pb-0.5">{projectName}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-xs font-bold text-gray-600 shrink-0">Job Location</span>
                <span className="flex-1 border-b border-gray-300 text-sm pb-0.5">{jobLocation || 'TBD'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-40 text-xs font-bold text-gray-600 shrink-0">Estimated Start Date</span>
                <span className="flex-1 border-b border-gray-300 text-sm pb-0.5">TBD</span>
              </div>
              <div className="flex">
                <span className="w-40 text-xs font-bold text-gray-600 shrink-0">Estimated Finish Date</span>
                <span className="flex-1 border-b border-gray-300 text-sm pb-0.5">TBD</span>
              </div>
              <div className="flex">
                <span className="w-40 text-xs font-bold text-gray-600 shrink-0">Bid Number</span>
                <span className="flex-1 border-b border-gray-300 text-sm font-medium pb-0.5">{bidNumber}</span>
              </div>
            </div>
          </div>

          {/* ═══ CONTRACTOR INFORMATION ═══ */}
          <div className="mt-6 mb-4">
            <h2 className="text-sm font-bold bg-gray-100 px-3 py-2 border border-gray-300">Contractor Information</h2>
            <table className="w-full border-collapse">
              <tbody>
                {[
                  ['Contractor Company Name', 'Tico Restorations'],
                  ['Contractor Contact Name', 'Scott McDonald'],
                  ['Address', '10490 Carlton Ave #266 Myakka City, FL 34251'],
                  ['Contractor Phone', '(941) 302-2837'],
                  ['Contractor Email', 'Scottm@ticoresto.com'],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-200">
                    <td className="py-1.5 px-3 text-xs font-medium text-gray-600 w-48 bg-gray-50">{label}</td>
                    <td className="py-1.5 px-3 text-sm">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ═══ SCOPE OF WORK ═══ */}
          <div className="mt-6 mb-4">
            <h2 className="text-sm font-bold bg-gray-100 px-3 py-2 border border-gray-300">Scope of Work</h2>
            <div className="border border-t-0 border-gray-300 p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[100px]">
              {draft.scope_of_work}
            </div>
          </div>

          {/* ═══ AGREEMENT TERMS ═══ */}
          <div className="mt-6 mb-4">
            <h2 className="text-sm font-bold bg-gray-100 px-3 py-2 border border-gray-300">Agreement Terms</h2>
            <div className="border border-t-0 border-gray-300 p-4 text-xs text-gray-600 space-y-2">
              <p>Contractor requires 15% Mobilization check 2 weeks prior to commencement of work.</p>
              <p>Proposal may be withdrawn if not accepted by date of <span className="font-bold text-gray-900">{withdrawalStr}</span></p>
            </div>
          </div>

          {/* ═══ ACCEPTANCE OF PROPOSAL ═══ */}
          <div className="mt-6 mb-6">
            <h2 className="text-sm font-bold bg-gray-100 px-3 py-2 border border-gray-300">Acceptance of Proposal</h2>
            <div className="border border-t-0 border-gray-300 p-4 space-y-6">
              <p className="text-xs text-gray-600 leading-relaxed">
                Proposed costs, specifications, and conditions detailed above are accepted, and specified work is authorized
                to begin on the agreed upon date. Payment for services rendered will be made as specified.
              </p>
              <div className="grid grid-cols-2 gap-12 pt-4">
                <div>
                  <div className="border-b border-gray-400 h-10 mb-1" />
                  <p className="text-[10px] text-gray-500">Authorized Client Signature</p>
                </div>
                <div>
                  <div className="border-b border-gray-400 h-10 mb-1" />
                  <p className="text-[10px] text-gray-500">Date of Acceptance</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ COST BREAKDOWN ═══ */}
          <div className="mt-6">
            <h2 className="text-sm font-bold bg-gray-100 px-3 py-2 border border-gray-300">Cost Breakdown</h2>
            <table className="w-full border-collapse border border-t-0 border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-300 w-10">#</th>
                  <th className="text-left py-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-300">Description</th>
                  <th className="text-right py-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-300 w-32">Amount</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((item, i) => (
                  <tr key={i} className={`border-b border-gray-200 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="py-2 px-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">
                      {item.description}
                      {item.quantity > 0 && item.unit !== 'ls' && (
                        <span className="text-xs text-gray-400 ml-2">
                          ({item.quantity.toLocaleString()} {item.unit} × {fmt(item.unit_price)})
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-sm font-medium text-gray-900">{fmt(item.total)}</td>
                  </tr>
                ))}
                {/* Empty rows to match form */}
                {pricing.length < 5 && Array.from({ length: 5 - pricing.length }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-gray-200">
                    <td className="py-2 px-3">&nbsp;</td>
                    <td className="py-2 px-3">&nbsp;</td>
                    <td className="py-2 px-3">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {/* Subtotal */}
                <tr className="border-t-2 border-gray-400">
                  <td colSpan={2} className="py-2 px-3 text-right text-xs font-bold text-gray-600 uppercase">Subtotal</td>
                  <td className="py-2 px-3 text-right text-sm font-bold text-gray-900">{fmt(subtotal)}</td>
                </tr>
                {/* Tax Rate 7% */}
                <tr className="border-t border-gray-200">
                  <td colSpan={2} className="py-2 px-3 text-right text-xs font-bold text-gray-600 uppercase">Tax Rate 7%</td>
                  <td className="py-2 px-3 text-right text-sm font-medium text-gray-700">{fmt(tax)}</td>
                </tr>
                {/* Total Labor */}
                <tr className="border-t-2 border-gray-900 bg-gray-900">
                  <td colSpan={2} className="py-3 px-3 text-right text-sm font-bold text-white uppercase tracking-wider">Total Labor</td>
                  <td className="py-3 px-3 text-right text-lg font-bold text-white">{fmt(totalLabor)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ═══ COVER LETTER (bonus — not in original form but adds value) ═══ */}
          <div className="mt-8 page-break-before">
            <h2 className="text-sm font-bold bg-gray-100 px-3 py-2 border border-gray-300">Cover Letter</h2>
            <div className="border border-t-0 border-gray-300 p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {draft.cover_letter}
            </div>
          </div>

          {/* ═══ SDVOSB NOTICE (if applicable) ═══ */}
          {opp?.is_sdvosb_eligible && (
            <div className="mt-4 border border-green-300 bg-green-50 rounded p-3 text-xs text-green-800">
              <p className="font-bold mb-1">SDVOSB Certification Notice</p>
              <p>Tico Restorations is a certified Service-Disabled Veteran-Owned Small Business (SDVOSB), eligible for federal and diversity set-aside programs. This qualification may provide contracting advantages for this project.</p>
            </div>
          )}

          {/* ═══ AI MATCH SCORE (bonus intel for internal use) ═══ */}
          {opp?.bh_opportunity_scores && (
            <div className="mt-4 border border-blue-200 bg-blue-50 rounded p-3 text-xs text-blue-800 print:hidden">
              <p className="font-bold mb-1">BidHunter Intelligence (internal — not printed)</p>
              <p>Match Score: {opp.bh_opportunity_scores.score}/100 — {opp.bh_opportunity_scores.justification}</p>
              {opp.bh_opportunity_scores.matching_services && (
                <p className="mt-1">Matching Services: {opp.bh_opportunity_scores.matching_services.join(', ')}</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-3 border-t border-gray-200 text-center text-[10px] text-gray-400 print:mt-4">
            <p>Tico Restorations &bull; 10490 Carlton Ave #266 Myakka City, FL 34251 &bull; (941) 302-2837 &bull; Scottm@ticoresto.com</p>
            <p className="mt-0.5">SDVOSB Certified &bull; Bid {bidNumber}</p>
          </div>

          {/* Override page title for print */}
          <style jsx global>{`
            @media print {
              title { visibility: hidden; }
            }
            @page { margin: 0.5in; }
          `}</style>
        </div>
      </div>
    </>
  )
}

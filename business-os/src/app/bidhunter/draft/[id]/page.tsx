'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLang, t } from '@/features/bidhunter/i18n'
import type { BidDraft, PricingLineItem } from '@/features/bidhunter/types'
import {
  FileText, Loader2, ArrowLeft, Languages, RotateCcw, Copy,
  CheckCircle2, Send, DollarSign, Printer
} from 'lucide-react'
import Link from 'next/link'

function formatValue(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}

export default function DraftPage() {
  const params = useParams()
  const opportunityId = params.id as string
  const [lang, toggleLang] = useLang()

  const [draft, setDraft] = useState<BidDraft | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [tone, setTone] = useState('professional')
  const [draftLang, setDraftLang] = useState('en')
  const [oppTitle, setOppTitle] = useState('')

  // Editable fields
  const [coverLetter, setCoverLetter] = useState('')
  const [scopeOfWork, setScopeOfWork] = useState('')

  // Load existing drafts
  useEffect(() => {
    setLoading(true)
    fetch(`/api/bidhunter/opportunities?status=all`)
      .then(r => r.json())
      .then(data => {
        const opp = Array.isArray(data) ? data.find((o: { id: string }) => o.id === opportunityId) : null
        if (opp) setOppTitle(opp.title)
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
        body: JSON.stringify({ opportunity_id: opportunityId, tone, language: draftLang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const d = data.draft as BidDraft
      setDraft(d)
      setCoverLetter(d.cover_letter)
      setScopeOfWork(d.scope_of_work)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async (markFinal: boolean) => {
    if (!draft?.id) return
    setSaving(true)
    try {
      const res = await fetch('/api/bidhunter/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id,
          cover_letter: coverLetter,
          scope_of_work: scopeOfWork,
          is_final: markFinal,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDraft(data.draft)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopied(section)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-vid-bg text-vid-fg p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Link href="/bidhunter" className="text-white/30 hover:text-white/60">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <FileText size={20} className="text-blue-400" />
              {t('draft_title', lang)}
            </h1>
            {oppTitle && <p className="text-xs text-white/40 mt-0.5">{oppTitle}</p>}
          </div>
        </div>
        <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors">
          <Languages size={13} />
          {lang === 'en' ? 'ES' : 'EN'}
        </button>
      </div>

      {/* Generate Controls */}
      {!draft && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold">{t('generate_draft', lang)}</h2>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('tone', lang)}</label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="px-3 py-2 text-xs bg-white/[0.06] border border-white/10 rounded-lg text-white focus:outline-none"
              >
                <option value="professional">{t('professional', lang)}</option>
                <option value="aggressive">{t('aggressive', lang)}</option>
                <option value="conservative">{t('conservative', lang)}</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('draft_language', lang)}</label>
              <select
                value={draftLang}
                onChange={e => setDraftLang(e.target.value)}
                className="px-3 py-2 text-xs bg-white/[0.06] border border-white/10 rounded-lg text-white focus:outline-none"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {generating ? t('generating_draft', lang) : t('generate_draft', lang)}
          </button>
        </div>
      )}

      {/* Draft Display */}
      {draft && (
        <div className="space-y-5">
          {/* Version info */}
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>{t('version', lang)} {draft.version} — {draft.tone} — {draft.language === 'es' ? 'Español' : 'English'}</span>
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20"
              >
                {generating ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                {t('regenerate', lang)}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20"
              >
                <Printer size={12} />
                PDF
              </button>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">{t('cover_letter', lang)}</h2>
              <button
                onClick={() => handleCopy(coverLetter, 'cover')}
                className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60"
              >
                {copied === 'cover' ? <CheckCircle2 size={11} className="text-green-400" /> : <Copy size={11} />}
                {t('copy_clipboard', lang)}
              </button>
            </div>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              rows={12}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-xs text-white/80 leading-relaxed focus:outline-none focus:border-white/15 resize-y"
            />
          </div>

          {/* Scope of Work */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">{t('scope_of_work', lang)}</h2>
              <button
                onClick={() => handleCopy(scopeOfWork, 'scope')}
                className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60"
              >
                {copied === 'scope' ? <CheckCircle2 size={11} className="text-green-400" /> : <Copy size={11} />}
                {t('copy_clipboard', lang)}
              </button>
            </div>
            <textarea
              value={scopeOfWork}
              onChange={e => setScopeOfWork(e.target.value)}
              rows={10}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-xs text-white/80 leading-relaxed focus:outline-none focus:border-white/15 resize-y"
            />
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <DollarSign size={14} className="text-green-400" />
                {t('pricing_breakdown', lang)}
              </h2>
              <button
                onClick={() => {
                  const text = (draft.pricing_breakdown as PricingLineItem[])
                    .map(item => `${item.description}\t${item.quantity} ${item.unit}\t${formatValue(item.unit_price)}\t${formatValue(item.total)}`)
                    .join('\n') + `\n\nTOTAL\t\t\t${formatValue(draft.total_amount)}`
                  handleCopy(text, 'pricing')
                }}
                className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60"
              >
                {copied === 'pricing' ? <CheckCircle2 size={11} className="text-green-400" /> : <Copy size={11} />}
                {t('copy_clipboard', lang)}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/30 text-[10px] uppercase tracking-wider border-b border-white/[0.06]">
                    <th className="text-left py-2">{t('description', lang)}</th>
                    <th className="text-right py-2">{t('qty', lang)}</th>
                    <th className="text-right py-2">{t('unit', lang)}</th>
                    <th className="text-right py-2">{t('unit_price', lang)}</th>
                    <th className="text-right py-2">{t('line_total', lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {(draft.pricing_breakdown as PricingLineItem[]).map((item, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className="py-2 text-white/60">{item.description}</td>
                      <td className="text-right py-2 text-white/50">{item.quantity.toLocaleString()}</td>
                      <td className="text-right py-2 text-white/40">{item.unit}</td>
                      <td className="text-right py-2 text-white/50">{formatValue(item.unit_price)}</td>
                      <td className="text-right py-2 text-white/70 font-medium">{formatValue(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-white/[0.1]">
                    <td colSpan={4} className="py-3 text-right font-bold text-white/70">{t('total_amount', lang)}</td>
                    <td className="py-3 text-right font-bold text-green-400 text-sm">{formatValue(draft.total_amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {t('save_draft', lang)}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              <Send size={13} />
              {t('save_final', lang)}
            </button>
            {draft.is_final && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> {t('draft_finalized', lang)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

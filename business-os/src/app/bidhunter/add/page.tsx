'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logPipelineAction } from '@/features/bidhunter/services/pipelineService'
import { useLang, t } from '@/features/bidhunter/i18n'
import {
  ArrowLeft, Plus, Check, Loader2, Building2, MapPin, Calendar,
  DollarSign, FileText, Zap, ChevronRight, X, Copy, Languages
} from 'lucide-react'

const COMMON_TRADES = [
  'Painting', 'Drywall', 'Window Restoration', 'General Restoration',
  'Waterproofing', 'Carpentry', 'Stucco', 'Flooring', 'Roofing',
  'HVAC', 'Electrical', 'Plumbing', 'Concrete', 'Masonry',
  'Demolition', 'Insulation', 'Fire Protection', 'Glazing',
]

interface QuickEntry {
  title: string
  description: string
  gc_name: string
  gc_contact: string
  location: string
  state_code: string
  deadline: string
  estimated_value: string
  trades_required: string[]
  is_sdvosb_eligible: boolean
  building_sqft: string
  building_height_floors: string
  scope_notes: string
  source_id: string
}

const EMPTY_ENTRY: QuickEntry = {
  title: '', description: '', gc_name: '', gc_contact: '',
  location: '', state_code: 'FL', deadline: '', estimated_value: '',
  trades_required: [], is_sdvosb_eligible: false,
  building_sqft: '', building_height_floors: '', scope_notes: '', source_id: '',
}

export default function QuickAddPage() {
  const router = useRouter()
  const [lang, toggleLang] = useLang()
  const titleRef = useRef<HTMLInputElement>(null)
  const [entry, setEntry] = useState<QuickEntry>({ ...EMPTY_ENTRY })
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [lastSaved, setLastSaved] = useState('')
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [bulkText, setBulkText] = useState('')
  const [bulkSaving, setBulkSaving] = useState(false)

  useEffect(() => { titleRef.current?.focus() }, [])

  const toggleTrade = (trade: string) => {
    setEntry(e => ({
      ...e,
      trades_required: e.trades_required.includes(trade)
        ? e.trades_required.filter(t => t !== trade)
        : [...e.trades_required, trade],
    }))
  }

  const handleSave = async () => {
    if (!entry.title.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/bidhunter/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: entry.title.trim(),
          description: entry.description.trim() || null,
          gc_name: entry.gc_name.trim() || null,
          gc_contact: entry.gc_contact.trim() || null,
          location: entry.location.trim() || null,
          state_code: entry.state_code.trim() || null,
          deadline: entry.deadline || null,
          estimated_value: entry.estimated_value ? Number(entry.estimated_value) : null,
          trades_required: entry.trades_required.length > 0 ? entry.trades_required : null,
          is_sdvosb_eligible: entry.is_sdvosb_eligible,
          building_sqft: entry.building_sqft ? Number(entry.building_sqft) : null,
          building_height_floors: entry.building_height_floors ? Number(entry.building_height_floors) : null,
          scope_notes: entry.scope_notes.trim() || null,
          source_platform: 'buildingconnected',
          source_id: entry.source_id.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setLastSaved(entry.title)
      setSavedCount(c => c + 1)
      setEntry({ ...EMPTY_ENTRY })
      titleRef.current?.focus()
    } catch (err) {
      alert(`Error: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleBulkSave = async () => {
    if (!bulkText.trim()) return
    setBulkSaving(true)
    try {
      const lines = bulkText.trim().split('\n').filter(l => l.trim())
      const opps = lines.map(line => {
        const parts = line.split('\t').length > 1 ? line.split('\t') : line.split('|')
        return {
          title: (parts[0] || '').trim(),
          gc_name: (parts[1] || '').trim() || null,
          location: (parts[2] || '').trim() || null,
          state_code: (parts[3] || 'FL').trim() || null,
          trades_required: (parts[4] || '').trim() ? (parts[4] || '').split(',').map((t: string) => t.trim()) : null,
          estimated_value: parts[5] ? Number(parts[5].replace(/[$,]/g, '')) || null : null,
          deadline: (parts[6] || '').trim() || null,
          source_platform: 'buildingconnected',
          status: 'new' as const,
        }
      }).filter(o => o.title)

      if (opps.length === 0) { alert(lang === 'es' ? 'No se encontraron filas válidas' : 'No valid rows found'); setBulkSaving(false); return }

      const res = await fetch('/api/bidhunter/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunities: opps }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSavedCount(c => c + opps.length)
      setBulkText('')
      setLastSaved(`${opps.length} ${t('opportunities', lang)}`)
    } catch (err) {
      alert(`Error: ${(err as Error).message}`)
    } finally {
      setBulkSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="min-h-screen bg-vid-bg text-vid-fg p-4 md:p-6" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/bidhunter')} className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Plus size={18} className="text-blue-400" />
              {t('quick_add', lang)}
            </h1>
            <p className="text-xs text-white/40">{t('add_subtitle', lang)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
          >
            <Languages size={13} />
            {lang === 'en' ? 'ES' : 'EN'}
          </button>
          {savedCount > 0 && (
            <span className="text-xs text-green-400">{savedCount} {t('added', lang)}</span>
          )}
          <button
            onClick={() => router.push('/bidhunter')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            {t('done', lang)} <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-5 bg-white/[0.03] rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('single')}
          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${mode === 'single' ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white/60'}`}
        >
          {t('one_by_one', lang)}
        </button>
        <button
          onClick={() => setMode('bulk')}
          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${mode === 'bulk' ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white/60'}`}
        >
          {t('bulk_paste', lang)}
        </button>
      </div>

      {/* Success banner */}
      {lastSaved && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
          <span className="text-xs text-green-400 flex items-center gap-1.5">
            <Check size={13} /> {t('saved', lang)} {lastSaved}
          </span>
          <button onClick={() => setLastSaved('')} className="text-white/20 hover:text-white/40">
            <X size={12} />
          </button>
        </div>
      )}

      {mode === 'single' ? (
        <div className="max-w-2xl space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">
              {t('project_title', lang)} <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              value={entry.title}
              onChange={e => setEntry({ ...entry, title: e.target.value })}
              placeholder="e.g. Miami Beach Convention Center - Exterior Restoration"
              className="w-full px-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">
                <Building2 size={10} className="inline mr-1" />{t('general_contractor', lang)}
              </label>
              <input
                value={entry.gc_name}
                onChange={e => setEntry({ ...entry, gc_name: e.target.value })}
                placeholder="Turner Construction"
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('gc_contact', lang)}</label>
              <input
                value={entry.gc_contact}
                onChange={e => setEntry({ ...entry, gc_contact: e.target.value })}
                placeholder={lang === 'es' ? 'correo o teléfono' : 'email or phone'}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">
                <MapPin size={10} className="inline mr-1" />{t('city', lang)}
              </label>
              <input
                value={entry.location}
                onChange={e => setEntry({ ...entry, location: e.target.value })}
                placeholder="Miami"
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('state', lang)}</label>
              <input
                value={entry.state_code}
                onChange={e => setEntry({ ...entry, state_code: e.target.value.toUpperCase() })}
                placeholder="FL"
                maxLength={2}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">
                <Calendar size={10} className="inline mr-1" />{t('deadline', lang)}
              </label>
              <input
                type="date"
                value={entry.deadline}
                onChange={e => setEntry({ ...entry, deadline: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">
                <DollarSign size={10} className="inline mr-1" />{t('est_value', lang)}
              </label>
              <input
                type="number"
                value={entry.estimated_value}
                onChange={e => setEntry({ ...entry, estimated_value: e.target.value })}
                placeholder="500000"
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('building_sqft', lang)}</label>
              <input
                type="number"
                value={entry.building_sqft}
                onChange={e => setEntry({ ...entry, building_sqft: e.target.value })}
                placeholder={lang === 'es' ? 'De los planos' : 'From drawings'}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('floors', lang)}</label>
              <input
                type="number"
                value={entry.building_height_floors}
                onChange={e => setEntry({ ...entry, building_height_floors: e.target.value })}
                placeholder={lang === 'es' ? '# de pisos' : '# of floors'}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-2">{t('trades_click', lang)}</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TRADES.map(trade => (
                <button
                  key={trade}
                  onClick={() => toggleTrade(trade)}
                  className={`px-2.5 py-1 text-[11px] rounded-full transition-colors ${
                    entry.trades_required.includes(trade)
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/60 hover:border-white/[0.1]'
                  }`}
                >
                  {trade}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={entry.is_sdvosb_eligible}
              onChange={e => setEntry({ ...entry, is_sdvosb_eligible: e.target.checked })}
              className="rounded border-white/20"
            />
            <span className="text-xs text-white/50">{t('sdvosb_eligible', lang)}</span>
          </label>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">
              <FileText size={10} className="inline mr-1" />{t('scope_notes', lang)}
            </label>
            <textarea
              value={entry.scope_notes}
              onChange={e => setEntry({ ...entry, scope_notes: e.target.value })}
              placeholder={t('scope_placeholder', lang)}
              rows={3}
              className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/20 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !entry.title.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {t('save_next', lang)}
            </button>
            <span className="text-[10px] text-white/20">{t('ctrl_enter', lang)}</span>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Copy size={13} className="text-blue-400" />
              <span className="text-xs font-medium">{t('paste_spreadsheet', lang)}</span>
            </div>
            <p className="text-[10px] text-white/30 mb-3">
              {lang === 'es' ? 'Formato: ' : 'Format: '}<code className="bg-white/[0.06] px-1 rounded">Title | GC Name | City | State | Trades (comma-sep) | Value | Deadline</code>
              <br />{t('format_hint', lang)}
            </p>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={`Miami Beach Convention Center|Turner Construction|Miami Beach|FL|Painting,Waterproofing|2500000|2026-04-15
VA Medical Center Orlando|Hensel Phelps|Orlando|FL|Painting,Drywall,Carpentry|1800000|2026-04-08`}
              rows={10}
              className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none font-mono"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-white/25">
                {bulkText.trim() ? bulkText.trim().split('\n').filter(l => l.trim()).length : 0} {t('rows', lang)}
              </span>
              <button
                onClick={handleBulkSave}
                disabled={bulkSaving || !bulkText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
              >
                {bulkSaving ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                {t('import_all', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

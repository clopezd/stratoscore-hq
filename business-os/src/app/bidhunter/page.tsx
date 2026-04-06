'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getOpportunities, updateOpportunityStatus, getOpportunityStats } from '@/features/bidhunter/services/pipelineService'
import type { OpportunityWithScore, OpportunityFilters } from '@/features/bidhunter/types'
import { useLang, t } from '@/features/bidhunter/i18n'
import DocumentsPanel from '@/features/bidhunter/components/DocumentsPanel'
import {
  Search, Filter, Target, Clock, Building2, MapPin, DollarSign,
  ThumbsUp, ThumbsDown, Loader2, FileUp, AlertTriangle, Mail, Phone,
  TrendingUp, CheckCircle2, XCircle, Send, Zap, RotateCcw, Calendar,
  ChevronDown, ChevronRight, ExternalLink, Calculator, Languages,
  BarChart3, FileText, Trophy, Ban, Shield
} from 'lucide-react'
import Link from 'next/link'

/* ── Helper components ─────────────────────────────────────────────── */

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80
    ? 'bg-green-500/20 text-green-400 border-green-500/30'
    : score >= 60
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : score >= 40
    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30'

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
      <Target size={11} />
      {score}
    </span>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
    </div>
  )
}

function formatValue(value: number | null) {
  if (!value) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatDeadline(deadline: string | null, lang: 'en' | 'es') {
  if (!deadline) return null
  const d = new Date(deadline)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const locale = lang === 'es' ? 'es-US' : 'en-US'
  const formatted = d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  const expiredLabel = lang === 'es' ? 'expirado' : 'expired'
  const leftLabel = lang === 'es' ? 'd restantes' : 'd left'
  if (diff < 0) return { text: `${formatted} (${expiredLabel})`, className: 'text-red-400', urgent: true }
  if (diff <= 3) return { text: `${formatted} (${diff}${leftLabel})`, className: 'text-amber-400', urgent: true }
  if (diff <= 7) return { text: `${formatted} (${diff}d)`, className: 'text-yellow-400/60', urgent: false }
  return { text: formatted, className: 'text-white/40', urgent: false }
}

/* ── Main Component ────────────────────────────────────────────────── */

export default function BidHunterPage() {
  const [lang, toggleLang] = useLang()
  const [opportunities, setOpportunities] = useState<OpportunityWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, new: 0, scored: 0, interested: 0, discarded: 0, bid_sent: 0, won: 0, lost: 0 })
  const [filters, setFilters] = useState<OpportunityFilters>({
    minScore: null,
    status: 'all',
    bcStatus: 'all',
    stateCode: null,
    trade: null,
    search: '',
    sdvosbOnly: false,
    hideSubmitted: false,
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [scoring, setScoring] = useState(false)
  const [scoringId, setScoringId] = useState<string | null>(null)
  const [scoreResult, setScoreResult] = useState<string | null>(null)
  const [wonModal, setWonModal] = useState<{ id: string; title: string } | null>(null)
  const [lostModal, setLostModal] = useState<{ id: string; title: string } | null>(null)
  const [wonValue, setWonValue] = useState('')
  const [lostReason, setLostReason] = useState('')
  const [linkBcModal, setLinkBcModal] = useState<{ id: string; title: string } | null>(null)
  const [bcLinkInput, setBcLinkInput] = useState('')

  const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    new:        { label: t('status_new', lang),        color: 'text-blue-400',   bg: 'bg-blue-500/15',   icon: Clock },
    scored:     { label: t('status_scored', lang),     color: 'text-purple-400', bg: 'bg-purple-500/15', icon: Target },
    interested: { label: t('status_interested', lang), color: 'text-green-400',  bg: 'bg-green-500/15',  icon: ThumbsUp },
    discarded:  { label: t('status_discarded', lang),  color: 'text-red-400',    bg: 'bg-red-500/15',    icon: XCircle },
    bid_sent:   { label: t('status_bid_sent', lang),   color: 'text-amber-400',  bg: 'bg-amber-500/15',  icon: Send },
    won:        { label: t('status_won', lang),        color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: Trophy },
    lost:       { label: t('status_lost', lang),       color: 'text-gray-400',   bg: 'bg-gray-500/15',   icon: Ban },
  }

  /* ── Derived data ── */
  const availableStates = useMemo(() => {
    const states = new Set<string>()
    opportunities.forEach(o => { if (o.state_code) states.add(o.state_code) })
    return Array.from(states).sort()
  }, [opportunities])

  const availableTrades = useMemo(() => {
    const trades = new Set<string>()
    opportunities.forEach(o => o.trades_required?.forEach(t => trades.add(t)))
    return Array.from(trades).sort()
  }, [opportunities])

  const filteredOpportunities = useMemo(() => {
    let result = opportunities
    if (filters.stateCode) result = result.filter(o => o.state_code === filters.stateCode)
    if (filters.trade) result = result.filter(o => o.trades_required?.includes(filters.trade!))
    if (filters.sdvosbOnly) result = result.filter(o => o.is_sdvosb_eligible)
    if (filters.hideSubmitted) result = result.filter(o => (o as Record<string, unknown>).bc_status !== 'submitted')
    if (filters.bcStatus !== 'all') result = result.filter(o => (o as Record<string, unknown>).bc_status === filters.bcStatus)
    return result
  }, [opportunities, filters.stateCode, filters.trade, filters.sdvosbOnly, filters.hideSubmitted, filters.bcStatus])

  const avgScore = useMemo(() => {
    const scored = filteredOpportunities.filter(o => o.bh_opportunity_scores)
    if (scored.length === 0) return null
    return Math.round(scored.reduce((sum, o) => sum + (o.bh_opportunity_scores?.score ?? 0), 0) / scored.length)
  }, [filteredOpportunities])

  const totalValue = useMemo(() => {
    return filteredOpportunities.reduce((sum, o) => sum + (o.estimated_value ?? 0), 0)
  }, [filteredOpportunities])

  /* ── Score all new ── */
  const handleScoreAll = async () => {
    setScoring(true)
    setScoreResult(null)
    try {
      const res = await fetch('/api/bidhunter/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setScoreResult(`${data.message}${data.high_scores > 0 ? ` — ${data.high_scores} high-score alerts sent to Telegram` : ''}`)
      load()
    } catch (err) {
      setScoreResult(`Error: ${(err as Error).message}`)
    } finally {
      setScoring(false)
    }
  }

  /* ── Score single ── */
  const handleScoreOne = async (id: string) => {
    setScoringId(id)
    try {
      const res = await fetch('/api/bidhunter/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      load()
    } catch (err) {
      setScoreResult(`Error scoring: ${(err as Error).message}`)
    } finally {
      setScoringId(null)
    }
  }

  /* ── Mark Won ── */
  const handleMarkWon = async () => {
    if (!wonModal) return
    try {
      const actualVal = wonValue ? Number(wonValue) : null
      const commissionPct = 10
      const commissionEarned = actualVal ? actualVal * (commissionPct / 100) : null

      const res = await fetch('/api/bidhunter/opportunities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: wonModal.id,
          status: 'won',
          actual_value: actualVal,
          commission_earned: commissionEarned,
          won_at: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setWonModal(null)
      setWonValue('')
      load()
    } catch (err) {
      console.error(err)
    }
  }

  /* ── Mark Lost ── */
  const handleMarkLost = async () => {
    if (!lostModal) return
    try {
      const res = await fetch('/api/bidhunter/opportunities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lostModal.id,
          status: 'lost',
          loss_reason: lostReason || null,
          lost_at: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setLostModal(null)
      setLostReason('')
      load()
    } catch (err) {
      console.error(err)
    }
  }

  /* ── Load data ── */
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, s] = await Promise.all([
        getOpportunities(filters),
        getOpportunityStats(),
      ])
      setOpportunities(data)
      setStats(s)
    } catch (err) {
      console.error('Error loading opportunities:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (id: string, status: string) => {
    await updateOpportunityStatus(id, status)
    load()
  }

  const resetFilters = () => setFilters({ minScore: null, status: 'all', bcStatus: 'all', stateCode: null, trade: null, search: '', sdvosbOnly: false, hideSubmitted: false })
  const hasActiveFilters = filters.status !== 'all' || filters.bcStatus !== 'all' || filters.minScore !== null || filters.stateCode !== null || filters.trade !== null || filters.search !== '' || filters.sdvosbOnly || filters.hideSubmitted

  return (
    <div className="min-h-screen bg-vid-bg text-vid-fg p-4 md:p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Target size={20} className="text-purple-400" />
            {t('bidhunter', lang)}
          </h1>
          <p className="text-xs text-white/40 mt-0.5">{t('subtitle', lang)}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
            title={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
          >
            <Languages size={13} />
            {lang === 'en' ? 'ES' : 'EN'}
          </button>
          <Link
            href="/bidhunter/kpis"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
          >
            <BarChart3 size={13} />
            KPIs
          </Link>
          <Link
            href="/bidhunter/profile"
            className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
          >
            {t('tico_profile', lang)}
          </Link>
          {stats.new > 0 && (
            <button
              onClick={handleScoreAll}
              disabled={scoring}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-purple-600/80 text-white hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              {scoring ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
              {t('score_new', lang)} {stats.new} {t('new_label', lang)}
            </button>
          )}
          <Link
            href="/bidhunter/add"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-600/80 text-white hover:bg-green-600 transition-colors"
          >
            + {t('quick_add', lang)}
          </Link>
          <Link
            href="/bidhunter/scrape"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            <FileUp size={13} />
            {t('scrape_bc', lang)}
          </Link>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
        {[
          { label: t('total', lang), key: 'total', value: stats.total, icon: Building2, color: 'text-white/60' },
          { label: t('new_label', lang), key: 'new', value: stats.new, icon: Clock, color: 'text-blue-400' },
          { label: t('scored', lang), key: 'scored', value: stats.scored, icon: Target, color: 'text-purple-400' },
          { label: t('interested', lang), key: 'interested', value: stats.interested, icon: CheckCircle2, color: 'text-green-400' },
          { label: t('bid_sent', lang), key: 'bid_sent', value: stats.bid_sent, icon: TrendingUp, color: 'text-amber-400' },
          { label: t('status_won', lang), key: 'won', value: stats.won, icon: Trophy, color: 'text-emerald-400' },
          { label: t('status_lost', lang), key: 'lost', value: stats.lost, icon: Ban, color: 'text-gray-400' },
          { label: t('avg_score', lang), key: 'avg_score', value: avgScore ?? '—', icon: Zap, color: 'text-purple-400' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => {
              if (s.key !== 'total' && s.key !== 'avg_score') {
                setFilters(f => ({ ...f, status: f.status === s.key ? 'all' : s.key as OpportunityFilters['status'] }))
              }
            }}
            className={`bg-white/[0.03] border rounded-xl p-3 text-left transition-colors ${
              filters.status === s.key
                ? 'border-white/20 bg-white/[0.06]'
                : 'border-white/[0.06] hover:border-white/[0.1]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={13} className={s.color} />
              <span className="text-[10px] uppercase tracking-wider text-white/30">{s.label}</span>
            </div>
            <span className="text-lg font-bold">{s.value}</span>
          </button>
        ))}
      </div>

      {/* ── Pipeline value ── */}
      {totalValue > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <DollarSign size={13} className="text-green-400/60" />
          <span className="text-xs text-white/40">{t('pipeline_value', lang)}</span>
          <span className="text-xs font-bold text-green-400">{formatValue(totalValue)}</span>
          <span className="text-[10px] text-white/20">({filteredOpportunities.length} {t('opportunities', lang)})</span>
        </div>
      )}

      {/* ── Score result banner ── */}
      {scoreResult && (
        <div className={`p-3 rounded-lg text-xs flex items-center justify-between ${scoreResult.startsWith('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'}`}>
          <span>{scoreResult}</span>
          <button onClick={() => setScoreResult(null)} className="text-white/30 hover:text-white/60">
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder={t('search_placeholder', lang)}
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value as OpportunityFilters['status'] }))}
          className="px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
        >
          <option value="all">{t('all_status', lang)}</option>
          <option value="new">{t('status_new', lang)}</option>
          <option value="scored">{t('status_scored', lang)}</option>
          <option value="interested">{t('status_interested', lang)}</option>
          <option value="bid_sent">{t('status_bid_sent', lang)}</option>
          <option value="won">{t('status_won', lang)}</option>
          <option value="lost">{t('status_lost', lang)}</option>
          <option value="discarded">{t('status_discarded', lang)}</option>
        </select>
        <select
          value={filters.minScore ?? ''}
          onChange={e => setFilters(f => ({ ...f, minScore: e.target.value ? Number(e.target.value) : null }))}
          className="px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
        >
          <option value="">{t('min_score', lang)}</option>
          <option value="80">80+ ({t('high', lang)})</option>
          <option value="60">60+ ({t('medium', lang)})</option>
          <option value="40">40+ ({t('low', lang)})</option>
        </select>
        {availableStates.length > 0 && (
          <select
            value={filters.stateCode ?? ''}
            onChange={e => setFilters(f => ({ ...f, stateCode: e.target.value || null }))}
            className="px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
          >
            <option value="">{t('all_states', lang)}</option>
            {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {availableTrades.length > 0 && (
          <select
            value={filters.trade ?? ''}
            onChange={e => setFilters(f => ({ ...f, trade: e.target.value || null }))}
            className="px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
          >
            <option value="">{t('all_trades', lang)}</option>
            {availableTrades.map(tr => <option key={tr} value={tr}>{tr}</option>)}
          </select>
        )}
        <button
          onClick={() => setFilters(f => ({ ...f, sdvosbOnly: !f.sdvosbOnly }))}
          className={`flex items-center gap-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
            filters.sdvosbOnly
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'
          }`}
        >
          <Shield size={12} />
          SDVOSB
        </button>
        <button
          onClick={() => setFilters(f => ({ ...f, hideSubmitted: !f.hideSubmitted }))}
          className={`flex items-center gap-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
            filters.hideSubmitted
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'
          }`}
        >
          <Send size={12} />
          {lang === 'es' ? 'Ocultar enviados' : 'Hide Submitted'}
        </button>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-2 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <RotateCcw size={12} />
            {t('clear', lang)}
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      {!loading && filteredOpportunities.length > 0 && hasActiveFilters && (
        <p className="text-[11px] text-white/30">
          {t('showing', lang)} {filteredOpportunities.length} {t('of', lang)} {stats.total} {t('opportunities', lang)}
        </p>
      )}

      {/* ── Won Modal ── */}
      {wonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setWonModal(null)}>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold flex items-center gap-2"><Trophy size={16} className="text-emerald-400" /> {t('mark_won', lang)}</h3>
            <p className="text-xs text-white/50">{wonModal.title}</p>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('actual_value', lang)}</label>
              <input
                type="number"
                value={wonValue}
                onChange={e => setWonValue(e.target.value)}
                placeholder="$"
                className="w-full px-3 py-2 text-sm bg-white/[0.06] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
                autoFocus
              />
              {wonValue && (
                <p className="text-[10px] text-emerald-400 mt-1">
                  {t('commission', lang)}: {formatValue(Number(wonValue) * 0.1)} (10%)
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setWonModal(null)} className="px-3 py-1.5 text-xs text-white/40 hover:text-white/60">{t('cancel', lang)}</button>
              <button onClick={handleMarkWon} className="px-4 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-500">{t('confirm', lang)}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lost Modal ── */}
      {lostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setLostModal(null)}>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold flex items-center gap-2"><Ban size={16} className="text-gray-400" /> {t('mark_lost', lang)}</h3>
            <p className="text-xs text-white/50">{lostModal.title}</p>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('loss_reason', lang)}</label>
              <input
                type="text"
                value={lostReason}
                onChange={e => setLostReason(e.target.value)}
                placeholder={t('loss_reason_placeholder', lang)}
                className="w-full px-3 py-2 text-sm bg-white/[0.06] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setLostModal(null)} className="px-3 py-1.5 text-xs text-white/40 hover:text-white/60">{t('cancel', lang)}</button>
              <button onClick={handleMarkLost} className="px-4 py-1.5 text-xs rounded-lg bg-gray-600 text-white hover:bg-gray-500">{t('confirm', lang)}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Link BC Modal ── */}
      {linkBcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setLinkBcModal(null)}>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold flex items-center gap-2"><ExternalLink size={16} className="text-violet-400" /> {lang === 'es' ? 'Vincular con BuildingConnected' : 'Link to BuildingConnected'}</h3>
            <p className="text-xs text-white/50">{linkBcModal.title}</p>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">
                {lang === 'es' ? 'Pega la URL del proyecto en BC' : 'Paste the BC project URL'}
              </label>
              <input
                type="text"
                value={bcLinkInput}
                onChange={e => setBcLinkInput(e.target.value)}
                placeholder="https://app.buildingconnected.com/projects/..."
                className="w-full px-3 py-2 text-sm bg-white/[0.06] border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/40 font-mono"
                autoFocus
              />
              {bcLinkInput && (() => {
                const m = bcLinkInput.match(/([a-f0-9]{10,})/i)
                return m ? (
                  <p className="text-[10px] text-green-400 mt-1">ID detectado: {m[1]}</p>
                ) : (
                  <p className="text-[10px] text-red-400 mt-1">{lang === 'es' ? 'No se detecta un ID válido' : 'No valid ID detected'}</p>
                )
              })()}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setLinkBcModal(null); setBcLinkInput('') }} className="px-3 py-1.5 text-xs text-white/40 hover:text-white/60">{t('cancel', lang)}</button>
              <button
                onClick={async () => {
                  const m = bcLinkInput.match(/([a-f0-9]{10,})/i)
                  if (!m) return
                  await fetch('/api/bidhunter/opportunities', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: linkBcModal.id, source_id: m[1] }),
                  })
                  setLinkBcModal(null)
                  setBcLinkInput('')
                  load()
                }}
                disabled={!bcLinkInput.match(/([a-f0-9]{10,})/i)}
                className="px-4 py-1.5 text-xs rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {lang === 'es' ? 'Vincular' : 'Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Opportunities List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-white/30" />
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle size={32} className="text-white/20 mb-3" />
          {stats.total === 0 ? (
            <>
              <p className="text-sm text-white/40">{t('no_opportunities', lang)}</p>
              <p className="text-xs text-white/25 mt-1">{t('scrape_to_pull', lang)}</p>
              <Link
                href="/bidhunter/scrape"
                className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                <FileUp size={13} />
                {t('scrape_buildingconnected', lang)}
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-white/40">{t('no_matches', lang)}</p>
              <button onClick={resetFilters} className="mt-3 text-xs text-blue-400 hover:text-blue-300">
                {t('clear_filters', lang)}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOpportunities.map(opp => {
            const score = opp.bh_opportunity_scores
            const statusInfo = STATUS_LABELS[opp.status] || STATUS_LABELS.new
            const isExpanded = expandedId === opp.id
            const isScoring = scoringId === opp.id
            const deadline = formatDeadline(opp.deadline, lang)

            return (
              <div
                key={opp.id}
                className={`bg-white/[0.03] border rounded-xl overflow-hidden transition-all ${
                  isExpanded ? 'border-white/[0.15]' : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {/* ── Main row ── */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                >
                  <div className="w-4 shrink-0">
                    {isExpanded
                      ? <ChevronDown size={14} className="text-white/25" />
                      : <ChevronRight size={14} className="text-white/15" />
                    }
                  </div>

                  <div className="w-16 shrink-0 text-center">
                    {score ? <ScoreBadge score={score.score} /> : (
                      <span className="text-[10px] text-white/20 italic">{t('unscored', lang)}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium truncate">{opp.title}</h3>
                      {opp.is_sdvosb_eligible && (
                        <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          SDVOSB
                        </span>
                      )}
                      {(opp as Record<string, unknown>).bc_status === 'submitted' && (
                        <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Send size={8} />
                          BC: Submitted
                          {(opp as Record<string, unknown>).bid_amount && (
                            <span className="ml-0.5 text-amber-300">
                              ({formatValue((opp as Record<string, unknown>).bid_amount as number)})
                            </span>
                          )}
                        </span>
                      )}
                      {(opp as Record<string, unknown>).bc_status === 'awarded' && (
                        <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          BC: Awarded
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-white/35">
                      {opp.gc_name && (
                        <span className="flex items-center gap-1">
                          <Building2 size={10} /> {opp.gc_name}
                        </span>
                      )}
                      {opp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {opp.location}{opp.state_code ? `, ${opp.state_code}` : ''}
                        </span>
                      )}
                      {opp.estimated_value && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={10} /> {formatValue(opp.estimated_value)}
                        </span>
                      )}
                      {opp.trades_required && opp.trades_required.length > 0 && (
                        <span className="hidden md:inline text-white/20">
                          {opp.trades_required.slice(0, 2).join(', ')}{opp.trades_required.length > 2 ? ` +${opp.trades_required.length - 2}` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {deadline && (
                    <div className={`shrink-0 text-[11px] flex items-center gap-1 ${deadline.className}`}>
                      <Calendar size={10} />
                      {deadline.text}
                    </div>
                  )}

                  <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                    <statusInfo.icon size={10} />
                    {statusInfo.label}
                  </span>
                </div>

                {score && !isExpanded && (
                  <div className="px-3 pb-2">
                    <ScoreBar score={score.score} />
                  </div>
                )}

                {/* ── Expanded details ── */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] p-4 space-y-4">
                    {/* ── BC Link bar ── */}
                    <div className="flex items-center gap-2">
                      {opp.source_id ? (
                        <a
                          href={`https://app.buildingconnected.com/opportunities/${opp.source_id}/info`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 border border-violet-500/30 transition-colors"
                        >
                          <ExternalLink size={12} /> {t('view_on_bc', lang)}
                        </a>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); setLinkBcModal({ id: opp.id, title: opp.title }); setBcLinkInput('') }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-violet-500/10 text-violet-400/70 hover:text-violet-300 hover:bg-violet-500/20 border border-violet-500/20 transition-colors"
                        >
                          <ExternalLink size={12} /> {lang === 'es' ? 'Vincular con BuildingConnected' : 'Link to BuildingConnected'}
                        </button>
                      )}
                    </div>

                    {opp.description && (
                      <p className="text-xs text-white/50 leading-relaxed">{opp.description}</p>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        {(opp.gc_name || opp.gc_contact) && (
                          <div className="bg-white/[0.03] rounded-lg p-3">
                            <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-2">{t('general_contractor', lang)}</span>
                            {opp.gc_name && <p className="text-xs font-medium text-white/70">{opp.gc_name}</p>}
                            {opp.gc_contact && (
                              <div className="flex items-center gap-2 mt-1">
                                {opp.gc_contact.includes('@') ? (
                                  <a href={`mailto:${opp.gc_contact}`} className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
                                    <Mail size={10} /> {opp.gc_contact}
                                  </a>
                                ) : (
                                  <a href={`tel:${opp.gc_contact}`} className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
                                    <Phone size={10} /> {opp.gc_contact}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {opp.trades_required && opp.trades_required.length > 0 && (
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1.5">{t('trades_required', lang)}</span>
                            <div className="flex flex-wrap gap-1">
                              {opp.trades_required.map(tr => (
                                <button
                                  key={tr}
                                  onClick={() => setFilters(f => ({ ...f, trade: f.trade === tr ? null : tr }))}
                                  className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                                    filters.trade === tr
                                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                      : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1]'
                                  }`}
                                >
                                  {tr}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {opp.location && (
                            <div>
                              <span className="text-[10px] text-white/30 block">{t('location', lang)}</span>
                              <span className="text-white/60">{opp.location}{opp.state_code ? `, ${opp.state_code}` : ''}</span>
                            </div>
                          )}
                          {opp.estimated_value && (
                            <div>
                              <span className="text-[10px] text-white/30 block">{t('est_value', lang)}</span>
                              <span className="text-white/60">{formatValue(opp.estimated_value)}</span>
                            </div>
                          )}
                          {deadline && (
                            <div>
                              <span className="text-[10px] text-white/30 block">{t('deadline', lang)}</span>
                              <span className={deadline.className}>{deadline.text}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] text-white/30 block">{t('source', lang)}</span>
                            <span className="text-white/60 capitalize">{opp.source_platform}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {score ? (
                          <div className="bg-white/[0.03] rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-wider text-white/30">{t('ai_score', lang)}</span>
                              <ScoreBadge score={score.score} />
                            </div>
                            <ScoreBar score={score.score} />
                            <p className="text-xs text-white/60 leading-relaxed">{score.justification}</p>
                            {score.matching_services && score.matching_services.length > 0 && (
                              <div>
                                <span className="text-[10px] text-white/30 block mb-1">{t('matching_services', lang)}</span>
                                <div className="flex flex-wrap gap-1">
                                  {score.matching_services.map(s => (
                                    <span key={s} className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {score.sdvosb_bonus && (
                              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 rounded px-2 py-1">
                                <CheckCircle2 size={11} />
                                {t('sdvosb_bonus', lang)}
                              </div>
                            )}
                            {score.bid_estimate && score.bid_estimate.total_estimate && (
                              <div className="border-t border-white/[0.06] pt-3 mt-1">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Calculator size={12} className="text-green-400" />
                                  <span className="text-[10px] uppercase tracking-wider text-white/30">{t('bid_estimate', lang)}</span>
                                </div>
                                <div className="space-y-1">
                                  {score.bid_estimate.exterior_sqft && (
                                    <div className="flex justify-between text-[11px]">
                                      <span className="text-white/40">{t('exterior_painting', lang)} ({score.bid_estimate.exterior_sqft.toLocaleString()} sqft × $2.10)</span>
                                      <span className="text-white/60 font-medium">{formatValue(score.bid_estimate.exterior_total)}</span>
                                    </div>
                                  )}
                                  {score.bid_estimate.interior_sqft && (
                                    <div className="flex justify-between text-[11px]">
                                      <span className="text-white/40">{t('interior_painting', lang)} ({score.bid_estimate.interior_sqft.toLocaleString()} sqft × $2.35)</span>
                                      <span className="text-white/60 font-medium">{formatValue(score.bid_estimate.interior_total)}</span>
                                    </div>
                                  )}
                                  {score.bid_estimate.stucco_sqft && (
                                    <div className="flex justify-between text-[11px]">
                                      <span className="text-white/40">{t('stucco_repairs', lang)} ({score.bid_estimate.stucco_sqft.toLocaleString()} sqft × $15.00)</span>
                                      <span className="text-white/60 font-medium">{formatValue(score.bid_estimate.stucco_total)}</span>
                                    </div>
                                  )}
                                  {score.bid_estimate.high_rise_surcharge && (
                                    <div className="flex justify-between text-[11px]">
                                      <span className="text-white/40">{t('high_rise_surcharge', lang)}</span>
                                      <span className="text-white/60 font-medium">{formatValue(score.bid_estimate.high_rise_surcharge)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-xs pt-1 border-t border-white/[0.06]">
                                    <span className="text-white/60 font-bold">{t('total_estimate', lang)}</span>
                                    <span className="text-green-400 font-bold">{formatValue(score.bid_estimate.total_estimate)}</span>
                                  </div>
                                  {score.bid_estimate.total_estimate && (
                                    <div className="flex justify-between text-xs mt-1">
                                      <span className="text-amber-400/60">💵 {lang === 'es' ? 'Tu comisión (5%)' : 'Your commission (5%)'}</span>
                                      <span className="text-amber-400 font-bold">{formatValue(Math.round(score.bid_estimate.total_estimate * 0.05))}</span>
                                    </div>
                                  )}
                                </div>
                                {score.bid_estimate.estimate_notes && (
                                  <p className="text-[10px] text-white/25 mt-1.5 italic">{score.bid_estimate.estimate_notes}</p>
                                )}
                              </div>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleScoreOne(opp.id) }}
                              disabled={isScoring}
                              className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors"
                            >
                              {isScoring ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
                              {t('re_score', lang)}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-white/[0.03] rounded-lg p-6 flex flex-col items-center justify-center">
                            <Target size={24} className="text-white/15 mb-2" />
                            <p className="text-xs text-white/30 mb-3">{t('not_scored_yet', lang)}</p>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleScoreOne(opp.id) }}
                              disabled={isScoring}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-purple-600/80 text-white hover:bg-purple-600 disabled:opacity-50 transition-colors"
                            >
                              {isScoring ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                              {t('score_with_ai', lang)}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Data Sources — de dónde viene la info ── */}
                    {score && (
                      <div className="bg-white/[0.03] border border-blue-500/15 rounded-lg p-3 space-y-2">
                        <h4 className="text-[11px] text-blue-400/70 uppercase tracking-wider flex items-center gap-1.5">
                          <Search size={12} />
                          {lang === 'es' ? 'Fuentes de datos' : 'Data Sources'}
                        </h4>

                        {/* Deep scan info */}
                        {opp.scope_notes && opp.scope_notes.includes('DEEP SCAN') && (
                          <div className="text-xs">
                            <span className="text-white/30 text-[10px]">🔍 BuildingConnected Deep Scan:</span>
                            <pre className="text-white/40 whitespace-pre-wrap font-sans leading-relaxed mt-0.5 pl-4 border-l border-white/[0.06]">
                              {opp.scope_notes.split('\n').filter((l: string) => !l.startsWith('===')).join('\n').trim()}
                            </pre>
                          </div>
                        )}

                        {/* Score source */}
                        {score.bid_estimate?.estimate_notes && (
                          <div className="text-xs">
                            <span className="text-white/30 text-[10px]">🤖 {lang === 'es' ? 'Estimación IA:' : 'AI Estimate:'}</span>
                            <p className="text-white/40 mt-0.5 pl-4 border-l border-white/[0.06] italic">{score.bid_estimate.estimate_notes}</p>
                          </div>
                        )}

                        {/* Score justification */}
                        <div className="text-xs">
                          <span className="text-white/30 text-[10px]">📋 {lang === 'es' ? 'Justificación del score:' : 'Score justification:'}</span>
                          <p className="text-white/40 mt-0.5 pl-4 border-l border-white/[0.06]">{score.justification}</p>
                        </div>

                        {/* Matching services */}
                        {score.matching_services && score.matching_services.length > 0 && (
                          <div className="text-xs">
                            <span className="text-white/30 text-[10px]">✅ {lang === 'es' ? 'Servicios de Tico que aplican:' : 'Matching Tico services:'}</span>
                            <div className="flex flex-wrap gap-1 mt-1 pl-4">
                              {score.matching_services.map((s: string) => (
                                <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400/70">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No PDF note */}
                        {!opp.scope_notes?.includes('DEEP SCAN') && !score.bid_estimate?.estimate_notes && (
                          <p className="text-[10px] text-white/20 italic">
                            {lang === 'es' ? 'Datos basados en título y trades del listado. Sube specs para datos exactos.' : 'Data based on listing title and trades. Upload specs for exact data.'}
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── PDF Documents ── */}
                    <DocumentsPanel
                      opportunityId={opp.id}
                      lang={lang}
                      onExtractionComplete={() => load()}
                    />

                    {/* ── Actions bar ── */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] flex-wrap">
                      {opp.status !== 'interested' && opp.status !== 'won' && opp.status !== 'lost' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(opp.id, 'interested') }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                        >
                          <ThumbsUp size={12} /> {t('mark_interested', lang)}
                        </button>
                      )}
                      {/* Draft Bid + Proforma buttons — visible when scored or interested */}
                      {score && (opp.status === 'scored' || opp.status === 'interested') && (
                        <>
                          <Link
                            href={`/bidhunter/draft/${opp.id}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                          >
                            <FileText size={12} /> {t('draft_bid', lang)}
                          </Link>
                          <Link
                            href={`/bidhunter/proforma/${opp.id}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
                          >
                            <FileText size={12} /> Proforma
                          </Link>
                        </>
                      )}
                      {opp.status !== 'bid_sent' && opp.status !== 'new' && opp.status !== 'won' && opp.status !== 'lost' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(opp.id, 'bid_sent') }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition-colors"
                        >
                          <Send size={12} /> {t('mark_bid_sent', lang)}
                        </button>
                      )}
                      {/* Won/Lost buttons — visible when bid_sent */}
                      {opp.status === 'bid_sent' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setWonModal({ id: opp.id, title: opp.title }) }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                          >
                            <Trophy size={12} /> {t('mark_won', lang)}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setLostModal({ id: opp.id, title: opp.title }) }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition-colors"
                          >
                            <Ban size={12} /> {t('mark_lost', lang)}
                          </button>
                        </>
                      )}
                      {opp.status !== 'discarded' && opp.status !== 'won' && opp.status !== 'lost' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(opp.id, 'discarded') }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-600/15 text-red-400/70 hover:bg-red-600/25 hover:text-red-400 transition-colors"
                        >
                          <ThumbsDown size={12} /> {t('discard', lang)}
                        </button>
                      )}
                      {opp.status !== 'new' && opp.status !== 'scored' && opp.status !== 'won' && opp.status !== 'lost' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(opp.id, 'new') }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-colors ml-auto"
                        >
                          <RotateCcw size={12} /> {t('reset', lang)}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

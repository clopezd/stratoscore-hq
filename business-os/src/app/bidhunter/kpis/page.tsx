'use client'

import { useState, useEffect } from 'react'
import { useLang, t } from '@/features/bidhunter/i18n'
import type { BidHunterKPIs, FunnelStage, WeeklySnapshot } from '@/features/bidhunter/types'
import {
  Target, TrendingUp, Trophy, Ban, DollarSign, BarChart3,
  Loader2, ArrowLeft, Languages, Shield, Zap, Send
} from 'lucide-react'
import Link from 'next/link'

function formatValue(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export default function KPIsPage() {
  const [lang, toggleLang] = useLang()
  const [kpis, setKpis] = useState<BidHunterKPIs | null>(null)
  const [funnel, setFunnel] = useState<FunnelStage[]>([])
  const [timeSeries, setTimeSeries] = useState<WeeklySnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/bidhunter/kpis?period=${period}`)
      .then(r => r.json())
      .then(data => {
        setKpis(data.kpis)
        setFunnel(data.funnel)
        setTimeSeries(data.timeSeries)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [period])

  const funnelColors: Record<string, string> = {
    new: 'bg-blue-500',
    scored: 'bg-purple-500',
    interested: 'bg-green-500',
    bid_sent: 'bg-amber-500',
    won: 'bg-emerald-500',
  }

  const funnelLabels: Record<string, string> = {
    new: t('status_new', lang),
    scored: t('status_scored', lang),
    interested: t('status_interested', lang),
    bid_sent: t('status_bid_sent', lang),
    won: t('status_won', lang),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vid-bg text-vid-fg flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    )
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
              <BarChart3 size={20} className="text-purple-400" />
              {t('kpi_dashboard', lang)}
            </h1>
            <p className="text-xs text-white/40 mt-0.5">BidHunter — Tico Restoration</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors">
            <Languages size={13} />
            {lang === 'en' ? 'ES' : 'EN'}
          </button>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
          >
            <option value="all">{t('all_time', lang)}</option>
            <option value="quarter">{t('quarter', lang)}</option>
            <option value="month">{t('month', lang)}</option>
            <option value="week">{t('week', lang)}</option>
          </select>
        </div>
      </div>

      {kpis && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: t('win_rate', lang), value: `${kpis.win_rate}%`, icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: t('response_rate', lang), value: `${kpis.response_rate}%`, icon: Send, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: t('bid_sent', lang), value: kpis.bid_sent, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: t('status_won', lang), value: kpis.won, icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: t('commission_earned', lang), value: formatValue(kpis.commission_earned), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: t('pipeline_value', lang), value: formatValue(kpis.pipeline_value), icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} border border-white/[0.06] rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={14} className={s.color} />
                  <span className="text-[10px] uppercase tracking-wider text-white/30">{s.label}</span>
                </div>
                <span className="text-xl font-bold">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Conversion Funnel */}
          {funnel.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-purple-400" />
                {t('conversion_funnel', lang)}
              </h2>
              <div className="space-y-3">
                {funnel.map(stage => (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-white/50 text-right">{funnelLabels[stage.stage] || stage.stage}</span>
                    <div className="flex-1 h-8 bg-white/[0.04] rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full ${funnelColors[stage.stage] || 'bg-gray-500'} rounded-lg transition-all duration-700`}
                        style={{ width: `${Math.max(stage.pct, 2)}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium">
                        {stage.count} ({stage.pct}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SDVOSB Stats */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Shield size={15} className="text-emerald-400" />
              {t('sdvosb_stats', lang)}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('sdvosb_opps', lang)}</span>
                <span className="text-lg font-bold text-emerald-400">{kpis.sdvosb_count}</span>
                <span className="text-[10px] text-white/25 ml-1">/ {kpis.total}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('sdvosb_pct', lang)}</span>
                <span className="text-lg font-bold text-emerald-400">
                  {kpis.total > 0 ? Math.round((kpis.sdvosb_count / kpis.total) * 100) : 0}%
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('avg_score', lang)}</span>
                <span className="text-lg font-bold">{kpis.avg_score || '—'}</span>
              </div>
            </div>
          </div>

          {/* Weekly Trends */}
          {timeSeries.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                <BarChart3 size={15} className="text-blue-400" />
                {t('weekly_trend', lang)}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30 text-[10px] uppercase tracking-wider">
                      <th className="text-left py-2 pr-4">{t('week', lang)}</th>
                      <th className="text-right py-2 px-2">{t('win_rate', lang)}</th>
                      <th className="text-right py-2 px-2">{t('bid_sent', lang)}</th>
                      <th className="text-right py-2 px-2">{t('status_won', lang)}</th>
                      <th className="text-right py-2 px-2">{t('pipeline_value', lang)}</th>
                      <th className="text-right py-2 pl-2">{t('commission', lang)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSeries.map(w => (
                      <tr key={w.week_start} className="border-t border-white/[0.04]">
                        <td className="py-2 pr-4 text-white/50">{new Date(w.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td className="text-right py-2 px-2">{w.win_rate}%</td>
                        <td className="text-right py-2 px-2 text-amber-400">{w.bids_sent}</td>
                        <td className="text-right py-2 px-2 text-emerald-400">{w.won}</td>
                        <td className="text-right py-2 px-2 text-purple-400">{formatValue(w.pipeline_value)}</td>
                        <td className="text-right py-2 pl-2 text-green-400">{formatValue(w.commission_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
              <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('total', lang)}</span>
              <span className="text-2xl font-bold">{kpis.total}</span>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
              <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('scored', lang)}</span>
              <span className="text-2xl font-bold text-purple-400">{kpis.scored}</span>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
              <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('status_lost', lang)}</span>
              <span className="text-2xl font-bold text-gray-400">{kpis.lost}</span>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
              <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('discarded', lang)}</span>
              <span className="text-2xl font-bold text-red-400">{kpis.discarded}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

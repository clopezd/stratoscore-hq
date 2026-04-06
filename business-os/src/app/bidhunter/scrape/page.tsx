'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang, t } from '@/features/bidhunter/i18n'
import {
  ArrowLeft, Globe, Loader2, Check, AlertTriangle,
  Eye, EyeOff, Zap, Building2, RefreshCw, Languages
} from 'lucide-react'

type Step = 'config' | 'scraping' | 'done' | 'error'

export default function ScrapePage() {
  const router = useRouter()
  const [lang, toggleLang] = useLang()
  const [step, setStep] = useState<Step>('config')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [maxPages, setMaxPages] = useState(10)
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<{
    scraped: number
    imported: number
    duplicates: number
    message: string
  } | null>(null)
  const [error, setError] = useState('')

  const handleScrape = async () => {
    if (!email || !password) return
    setStep('scraping')
    setLogs([lang === 'es' ? 'Iniciando extracción de BuildingConnected...' : 'Starting BuildingConnected scraper...'])
    setError('')

    try {
      const res = await fetch('/api/bidhunter/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, maxPages }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || (lang === 'es' ? 'La extracción falló' : 'Scraping failed'))
      }

      setLogs(data.logs || [])
      setResult({
        scraped: data.scraped || 0,
        imported: data.imported || 0,
        duplicates: data.duplicates || 0,
        message: data.message,
      })
      setStep('done')
    } catch (err) {
      setError((err as Error).message)
      setStep('error')
    }
  }

  const pageLabel = (n: number) => `${n} ${n === 1 ? t('page_singular', lang) : t('pages_plural', lang)}`

  return (
    <div className="min-h-screen bg-vid-bg text-vid-fg p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/bidhunter')} className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Globe size={18} className="text-blue-400" />
              {t('scrape_title', lang)}
            </h1>
            <p className="text-xs text-white/40">{t('scrape_subtitle', lang)}</p>
          </div>
        </div>
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
        >
          <Languages size={13} />
          {lang === 'en' ? 'ES' : 'EN'}
        </button>
      </div>

      {/* Config */}
      {step === 'config' && (
        <div className="max-w-md space-y-5">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Building2 size={14} className="text-blue-400" />
              {t('bc_credentials', lang)}
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('email', lang)}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('password', lang)}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('pages_to_scrape', lang)}</label>
              <select
                value={maxPages}
                onChange={e => setMaxPages(Number(e.target.value))}
                className="px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
              >
                <option value={3}>{pageLabel(3)}</option>
                <option value={5}>{pageLabel(5)}</option>
                <option value={10}>{pageLabel(10)}</option>
                <option value={15}>{pageLabel(15)}</option>
                <option value={25}>{pageLabel(25)}</option>
              </select>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <p className="text-[11px] text-amber-400/80 flex items-start gap-2">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              {t('credentials_warning', lang)}
            </p>
          </div>

          <button
            onClick={handleScrape}
            disabled={!email || !password}
            className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
          >
            <Zap size={15} />
            {t('start_scraping', lang)}
          </button>
        </div>
      )}

      {/* Scraping in progress */}
      {step === 'scraping' && (
        <div className="max-w-md space-y-5">
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Loader2 size={20} className="animate-spin text-blue-400" />
            <div>
              <p className="text-sm font-medium">{t('scraping_bc', lang)}</p>
              <p className="text-xs text-white/40 mt-0.5">{t('may_take', lang)}</p>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <div className="space-y-1.5 font-mono text-[11px]">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-white/20 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-white/50">{log}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-blue-400">
                <Loader2 size={10} className="animate-spin" />
                <span>{t('working', lang)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Done */}
      {step === 'done' && result && (
        <div className="max-w-md space-y-5">
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{result.message}</p>
              <div className="flex gap-4 mt-1 text-[11px]">
                <span className="text-white/40">{t('scraped_label', lang)} <span className="text-white/70">{result.scraped}</span></span>
                <span className="text-green-400">{t('new_label', lang)}: <span className="font-bold">{result.imported}</span></span>
                {result.duplicates > 0 && (
                  <span className="text-white/30">{t('duplicates_skipped', lang)} {result.duplicates}</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <div className="space-y-1 font-mono text-[10px]">
              {logs.map((log, i) => (
                <div key={i} className="text-white/35">{log}</div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/bidhunter')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              <Zap size={13} />
              {t('go_score_them', lang)}
            </button>
            <button
              onClick={() => { setStep('config'); setLogs([]); setResult(null) }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg border border-white/10 text-white/50 hover:text-white transition-colors"
            >
              <RefreshCw size={13} />
              {t('scrape_again', lang)}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {step === 'error' && (
        <div className="max-w-md space-y-5">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle size={20} className="text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-400">{t('scraping_failed', lang)}</p>
              <p className="text-xs text-white/40 mt-0.5">{error}</p>
            </div>
          </div>

          <button
            onClick={() => { setStep('config'); setError('') }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg border border-white/10 text-white/50 hover:text-white transition-colors"
          >
            {t('try_again', lang)}
          </button>
        </div>
      )}
    </div>
  )
}

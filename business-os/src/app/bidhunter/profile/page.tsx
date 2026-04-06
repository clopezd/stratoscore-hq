'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTicoProfile, updateTicoProfile } from '@/features/bidhunter/services/pipelineService'
import type { TicoProfile, TicoService } from '@/features/bidhunter/types'
import { useLang, t } from '@/features/bidhunter/i18n'
import { ArrowLeft, Save, Plus, X, Loader2, Building2, Languages } from 'lucide-react'

export default function TicoProfilePage() {
  const router = useRouter()
  const [lang, toggleLang] = useLang()
  const [profile, setProfile] = useState<TicoProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getTicoProfile().then(p => {
      setProfile(p)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      await updateTicoProfile(profile.id, {
        company_name: profile.company_name,
        services: profile.services,
        preferred_regions: profile.preferred_regions,
        preferred_states: profile.preferred_states,
        min_project_value: profile.min_project_value,
        max_project_value: profile.max_project_value,
        sdvosb_priority_boost: profile.sdvosb_priority_boost,
        pricing: profile.pricing,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const updateService = (idx: number, field: keyof TicoService, value: string | string[]) => {
    if (!profile) return
    const services = [...profile.services]
    services[idx] = { ...services[idx], [field]: value }
    setProfile({ ...profile, services })
  }

  const addService = () => {
    if (!profile) return
    setProfile({
      ...profile,
      services: [...profile.services, { name: '', keywords: [] }],
    })
  }

  const removeService = (idx: number) => {
    if (!profile) return
    setProfile({
      ...profile,
      services: profile.services.filter((_, i) => i !== idx),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vid-bg flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-vid-bg text-vid-fg p-6">
        <p className="text-white/50">{t('no_profile', lang)}</p>
      </div>
    )
  }

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
              <Building2 size={18} className="text-emerald-400" />
              {t('profile_title', lang)}
            </h1>
            <p className="text-xs text-white/40">{t('profile_subtitle', lang)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
          >
            <Languages size={13} />
            {lang === 'en' ? 'ES' : 'EN'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saved ? t('saved_btn', lang) : t('save', lang)}
          </button>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Company Name */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('company_name', lang)}</label>
          <input
            value={profile.company_name}
            onChange={e => setProfile({ ...profile, company_name: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Services */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] uppercase tracking-wider text-white/30">{t('services_keywords', lang)}</label>
            <button onClick={addService} className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
              <Plus size={11} /> {t('add_service', lang)}
            </button>
          </div>
          <div className="space-y-3">
            {profile.services.map((svc, idx) => (
              <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    value={svc.name}
                    onChange={e => updateService(idx, 'name', e.target.value)}
                    placeholder={t('service_name', lang)}
                    className="flex-1 px-2 py-1 text-xs bg-white/[0.04] border border-white/[0.08] rounded text-white placeholder-white/20 focus:outline-none"
                  />
                  <button onClick={() => removeService(idx)} className="text-white/20 hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <input
                  value={svc.keywords.join(', ')}
                  onChange={e => updateService(idx, 'keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                  placeholder={t('keywords_placeholder', lang)}
                  className="w-full px-2 py-1 text-[11px] bg-white/[0.04] border border-white/[0.06] rounded text-white/60 placeholder-white/20 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('preferred_regions', lang)}</label>
            <input
              value={profile.preferred_regions?.join(', ') ?? ''}
              onChange={e => setProfile({ ...profile, preferred_regions: e.target.value.split(',').map(r => r.trim()).filter(Boolean) })}
              placeholder="Miami-Dade, Broward, Palm Beach"
              className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder-white/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('preferred_states', lang)}</label>
            <input
              value={profile.preferred_states?.join(', ') ?? ''}
              onChange={e => setProfile({ ...profile, preferred_states: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="FL, TX, GA"
              className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder-white/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Value Range */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('min_project_value', lang)}</label>
            <input
              type="number"
              value={profile.min_project_value}
              onChange={e => setProfile({ ...profile, min_project_value: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('max_project_value', lang)}</label>
            <input
              type="number"
              value={profile.max_project_value ?? ''}
              onChange={e => setProfile({ ...profile, max_project_value: e.target.value ? Number(e.target.value) : null })}
              placeholder={t('no_limit', lang)}
              className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder-white/20 focus:outline-none"
            />
          </div>
        </div>

        {/* SDVOSB Boost */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('sdvosb_boost', lang)}</label>
          <input
            type="number"
            value={profile.sdvosb_priority_boost}
            onChange={e => setProfile({ ...profile, sdvosb_priority_boost: Number(e.target.value) })}
            className="w-32 px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
          />
          <p className="text-[10px] text-white/25 mt-1">{t('sdvosb_boost_desc', lang)}</p>
        </div>

        {/* Pricing Formulas */}
        <div className="border-t border-white/[0.06] pt-6">
          <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
            {t('pricing_formulas', lang)}
          </h2>
          <p className="text-[10px] text-white/30 mb-4">{t('pricing_desc', lang)}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('ext_painting_rate', lang)}</label>
              <input
                type="number"
                step="0.01"
                value={profile.pricing?.exterior_painting_sqft ?? 2.10}
                onChange={e => setProfile({ ...profile, pricing: { ...profile.pricing, exterior_painting_sqft: Number(e.target.value) } })}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
              />
              <p className="text-[10px] text-white/20 mt-0.5">{t('includes_materials', lang)}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('int_painting_rate', lang)}</label>
              <input
                type="number"
                step="0.01"
                value={profile.pricing?.interior_painting_sqft ?? 2.35}
                onChange={e => setProfile({ ...profile, pricing: { ...profile.pricing, interior_painting_sqft: Number(e.target.value) } })}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
              />
              <p className="text-[10px] text-white/20 mt-0.5">{t('includes_materials', lang)}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('stucco_rate', lang)}</label>
              <input
                type="number"
                step="0.01"
                value={profile.pricing?.stucco_repairs_sqft ?? 15.00}
                onChange={e => setProfile({ ...profile, pricing: { ...profile.pricing, stucco_repairs_sqft: Number(e.target.value) } })}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('high_rise_pct', lang)}</label>
              <input
                type="number"
                value={profile.pricing?.high_rise_surcharge_pct ?? 20}
                onChange={e => setProfile({ ...profile, pricing: { ...profile.pricing, high_rise_surcharge_pct: Number(e.target.value) } })}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
              />
              <p className="text-[10px] text-white/20 mt-0.5">{t('applied_above', lang)} {profile.pricing?.high_rise_floor_threshold ?? 4} {t('floors_word', lang)}</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">{t('high_rise_threshold', lang)}</label>
            <input
              type="number"
              value={profile.pricing?.high_rise_floor_threshold ?? 4}
              onChange={e => setProfile({ ...profile, pricing: { ...profile.pricing, high_rise_floor_threshold: Number(e.target.value) } })}
              className="w-32 px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none"
            />
            <p className="text-[10px] text-white/20 mt-0.5">{t('high_rise_threshold_desc', lang)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

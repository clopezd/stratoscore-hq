'use client'

import { useState } from 'react'
import { X, Check, Zap, Crown, Loader2 } from 'lucide-react'
import { useLocale } from '../i18n/useLocale'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
}

export function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const { t, locale } = useLocale()
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCheckout = async (productKey: string) => {
    setLoading(productKey)
    try {
      const res = await fetch('/api/fitsync/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setLoading(null)
    }
  }

  const plans = [
    {
      key: 'pro_monthly',
      name: 'Pro',
      price: locale === 'es' ? '$4.99' : '$9.99',
      period: '/mo',
      icon: Zap,
      color: 'emerald',
      features: locale === 'es'
        ? ['Fotos ilimitadas', 'Sync Engine', 'GPT-4o vision', 'Historial completo', 'Planes IA ilimitados']
        : ['Unlimited photos', 'Sync Engine', 'GPT-4o vision', 'Full history', 'Unlimited AI plans'],
      highlight: true,
    },
    {
      key: 'elite_monthly',
      name: 'Elite',
      price: locale === 'es' ? '$9.99' : '$19.99',
      period: '/mo',
      icon: Crown,
      color: 'purple',
      features: locale === 'es'
        ? ['Todo de Pro', 'Coach IA interactivo', 'Multi-modelo', 'Analytics avanzado', 'Exportar datos']
        : ['Everything in Pro', 'AI Coach (chat)', 'Multi-model', 'Advanced analytics', 'Export data'],
      highlight: false,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {locale === 'es' ? 'Desbloquea más' : 'Unlock more'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {feature && (
          <p className="text-sm text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-3">
            {locale === 'es'
              ? `"${feature}" es una función Pro. Mejora tu plan para acceder.`
              : `"${feature}" is a Pro feature. Upgrade to access.`}
          </p>
        )}

        <div className="space-y-3">
          {plans.map(plan => (
            <div
              key={plan.key}
              className={`rounded-xl border p-4 space-y-3 ${
                plan.highlight ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <plan.icon size={18} className={plan.highlight ? 'text-emerald-600' : 'text-purple-600'} />
                  <span className="font-semibold text-gray-900">{plan.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-1.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.key)}
                disabled={loading !== null}
                className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {loading === plan.key ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  locale === 'es' ? 'Comenzar prueba gratuita' : 'Start free trial'
                )}
              </button>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          {locale === 'es'
            ? 'Cancela cuando quieras. Sin compromisos.'
            : 'Cancel anytime. No commitments.'}
        </p>
      </div>
    </div>
  )
}

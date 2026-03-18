'use client'

import { useState } from 'react'
import type { ClientFeedbackPayload } from '@/app/api/videndum/feedback/route'

const MONTHS = [
  { value: '3_months', label: 'Últimos 3 meses' },
  { value: '6_months', label: 'Últimos 6 meses' },
  { value: 'full_year', label: 'Año completo (2025-2026)' },
  { value: 'other', label: 'Otro' }
]

const VISUALIZATIONS = [
  { value: 'single_screen', label: 'Todo en una pantalla (más denso, menos navegación)' },
  { value: 'tabs', label: 'Dividido en tabs (más limpio, requiere clicks)' },
  { value: 'interactive_dashboard', label: 'Dashboard interactivo (drill-down con clicks)' }
]

const FREQUENCIES = [
  { value: 'daily', label: 'Diario' },
  { value: '2_3_week', label: '2-3 veces por semana' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'only_problems', label: 'Solo cuando hay problemas' }
]

const OTHER_USERS_OPTIONS = [
  { value: 'only_me', label: 'Solo yo' },
  { value: 'planning_team_cr', label: 'Equipo de planeación (CR)' },
  { value: 'management_uk', label: 'Gerencia (UK)' },
  { value: 'other', label: 'Otro' }
]

export function ClientFeedbackForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ClientFeedbackPayload>({
    preferred_period: '6_months',
    preferred_period_other: '',
    priority_top_skus: 1,
    priority_mape: 2,
    priority_chart: 3,
    priority_recommendations: 4,
    filter_year: true,
    filter_month: true,
    filter_sku: false,
    filter_type: false,
    filter_other: '',
    action_high_deviation_1: '',
    action_high_deviation_2: '',
    missing_features: '',
    visualization_preference: 'tabs',
    usage_frequency: '2_3_week',
    other_users: ['only_me'],
    other_users_details: '',
    additional_comments: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/videndum/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error enviando feedback')
      }

      setSuccess(true)
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handlePriorityChange = (field: keyof Pick<ClientFeedbackPayload, 'priority_top_skus' | 'priority_mape' | 'priority_chart' | 'priority_recommendations'>, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }))
  }

  const handleOtherUsersChange = (value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      other_users: checked
        ? [...prev.other_users, value]
        : prev.other_users.filter(u => u !== value)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cuestionario - Sistema de Análisis Videndum</h1>
        <p className="text-gray-400">Objetivo: Definir prioridades para optimizar el dashboard Forecast vs Ventas Reales</p>
        <p className="text-sm text-gray-500 mt-1">⏱️ Tiempo estimado: 5 minutos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1️⃣ Período de Análisis */}
        <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">1️⃣ Período de Análisis</h2>
          <p className="text-gray-400 mb-4">¿Qué rango de tiempo necesitas ver más frecuentemente?</p>
          <div className="space-y-2">
            {MONTHS.map(option => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="preferred_period"
                  value={option.value}
                  checked={formData.preferred_period === option.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_period: e.target.value as any }))}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
          {formData.preferred_period === 'other' && (
            <input
              type="text"
              value={formData.preferred_period_other}
              onChange={(e) => setFormData(prev => ({ ...prev, preferred_period_other: e.target.value }))}
              placeholder="Especifica el período..."
              className="mt-3 w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
            />
          )}
        </section>

        {/* 2️⃣ KPIs Prioritarios */}
        <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">2️⃣ KPIs Prioritarios</h2>
          <p className="text-gray-400 mb-4">Ordena por importancia (1 = más importante, 4 = menos importante)</p>
          <div className="space-y-3">
            {[
              { field: 'priority_top_skus' as const, label: 'Top SKUs con mayor desviación' },
              { field: 'priority_mape' as const, label: 'MAPE (% de error global)' },
              { field: 'priority_chart' as const, label: 'Gráfico evolución mensual' },
              { field: 'priority_recommendations' as const, label: 'Recomendaciones de ajuste' }
            ].map(kpi => (
              <div key={kpi.field} className="flex items-center justify-between">
                <label className="text-gray-300">{kpi.label}</label>
                <select
                  value={formData[kpi.field]}
                  onChange={(e) => handlePriorityChange(kpi.field, parseInt(e.target.value))}
                  className="px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white"
                >
                  {[1, 2, 3, 4].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* 3️⃣ Filtros Necesarios */}
        <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">3️⃣ Filtros Necesarios</h2>
          <p className="text-gray-400 mb-4">¿Cuáles usarás regularmente?</p>
          <div className="space-y-2">
            {[
              { field: 'filter_year', label: 'Por año' },
              { field: 'filter_month', label: 'Por mes' },
              { field: 'filter_sku', label: 'Por SKU específico' },
              { field: 'filter_type', label: 'Por tipo (INV/PKG)' }
            ].map(filter => (
              <label key={filter.field} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[filter.field as keyof ClientFeedbackPayload] as boolean}
                  onChange={(e) => handleCheckboxChange(filter.field, e.target.checked)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-gray-300">{filter.label}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            value={formData.filter_other}
            onChange={(e) => setFormData(prev => ({ ...prev, filter_other: e.target.value }))}
            placeholder="Otro filtro..."
            className="mt-3 w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
          />
        </section>

        {/* 4️⃣ Acciones con el Análisis */}
        <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">4️⃣ Acciones con el Análisis</h2>
          <p className="text-gray-400 mb-4">Cuando detectas un SKU con alta desviación (&gt;30%), ¿qué haces?</p>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.action_high_deviation_1}
              onChange={(e) => setFormData(prev => ({ ...prev, action_high_deviation_1: e.target.value }))}
              placeholder="1. Acción principal..."
              className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
            />
            <input
              type="text"
              value={formData.action_high_deviation_2}
              onChange={(e) => setFormData(prev => ({ ...prev, action_high_deviation_2: e.target.value }))}
              placeholder="2. Acción secundaria..."
              className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
            />
          </div>
        </section>

        {/* 5️⃣ Lo que Falta */}
        <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">5️⃣ Lo que Falta</h2>
          <div className="mb-4">
            <p className="text-gray-400 mb-2">Actualmente tienes:</p>
            <ul className="list-none space-y-1 text-gray-300">
              <li>✅ Métricas globales (MAPE, Bias)</li>
              <li>✅ Top 10 mejores/peores SKUs</li>
              <li>✅ Gráfico temporal Forecast vs Real</li>
              <li>✅ Exportación a Excel</li>
              <li>✅ Recomendaciones de ajuste</li>
            </ul>
          </div>
          <textarea
            value={formData.missing_features}
            onChange={(e) => setFormData(prev => ({ ...prev, missing_features: e.target.value }))}
            placeholder="¿Qué está faltando o qué cambiarías?"
            rows={4}
            className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
          />
        </section>

        {/* 6️⃣ Preferencias de Visualización */}
        <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">6️⃣ Preferencias de Visualización</h2>
          <div className="space-y-2">
            {VISUALIZATIONS.map(option => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="visualization_preference"
                  value={option.value}
                  checked={formData.visualization_preference === option.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, visualization_preference: e.target.value as any }))}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 7️⃣ Frecuencia de Uso */}
        <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">7️⃣ Frecuencia de Uso</h2>
          <div className="space-y-2 mb-4">
            {FREQUENCIES.map(option => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="usage_frequency"
                  value={option.value}
                  checked={formData.usage_frequency === option.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, usage_frequency: e.target.value as any }))}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>

          <p className="text-gray-400 mb-2">¿Quién más lo usará?</p>
          <div className="space-y-2">
            {OTHER_USERS_OPTIONS.map(option => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.other_users.includes(option.value)}
                  onChange={(e) => handleOtherUsersChange(option.value, e.target.checked)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
          {formData.other_users.includes('other') && (
            <input
              type="text"
              value={formData.other_users_details}
              onChange={(e) => setFormData(prev => ({ ...prev, other_users_details: e.target.value }))}
              placeholder="Especifica otros usuarios..."
              className="mt-3 w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
            />
          )}
        </section>

        {/* Comentarios Adicionales */}
        <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Comentarios Adicionales</h2>
          <textarea
            value={formData.additional_comments}
            onChange={(e) => setFormData(prev => ({ ...prev, additional_comments: e.target.value }))}
            placeholder="Cualquier otro comentario o sugerencia..."
            rows={4}
            className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
          />
        </section>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar Feedback'}
          </button>

          {success && (
            <div className="text-green-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ¡Gracias! Tu feedback se guardó exitosamente.
            </div>
          )}

          {error && (
            <div className="text-red-400">
              ❌ {error}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

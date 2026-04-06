'use client'

import { useState } from 'react'
import type { PlatformRedesignPayload } from '@/app/api/videndum/platform-redesign/route'

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diario' },
  { value: '2-3_week', label: '2-3 veces por semana' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'never', label: 'Nunca / Casi nunca' }
]

export function PlatformRedesignForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState(1)

  const [formData, setFormData] = useState<PlatformRedesignPayload>({
    // Sección 1: Pestañas
    uses_dashboard: false,
    dashboard_frequency: 'never',
    dashboard_useful_elements: [],
    dashboard_missing: '',
    uses_planning: false,
    planning_frequency: 'never',
    planning_useful_elements: [],
    planning_missing: '',
    uses_ml_forecast: false,
    ml_forecast_frequency: 'never',
    ml_forecast_useful_elements: [],
    ml_forecast_missing: '',
    uses_analysis: false,
    analysis_frequency: 'never',
    analysis_useful_elements: [],
    analysis_missing: '',
    uses_ingesta: false,
    ingesta_frequency: 'never',
    ingesta_useful_elements: [],
    ingesta_missing: '',

    // Sección 2: KPIs
    current_kpis_used: [],
    missing_kpis: [],
    kpi_priority_order: [],

    // Sección 3: Visualizaciones
    useful_charts: [],
    missing_charts: [],
    preferred_chart_types: [],
    chart_complaints: '',

    // Sección 4: Filtros
    uses_year_filter: false,
    uses_month_filter: false,
    uses_sku_filter: false,
    uses_type_filter: false,
    missing_filters: [],
    filter_problems: '',

    // Sección 5: Flujo
    typical_workflow: '',
    time_spent_per_session: '',
    frequency_of_use: '',
    pain_points: '',
    manual_workarounds: '',

    // Sección 6: Preguntas
    key_questions: [],
    decision_types: [],

    // Sección 7: Organización
    preferred_tab_order: [],
    tabs_to_remove: [],
    tabs_to_merge: '',
    preferred_layout: '',

    // Sección 8: Funcionalidades
    needs_alerts: false,
    alert_examples: [],
    needs_export: false,
    export_formats_needed: [],
    needs_collaboration: false,
    collaboration_needs: '',
    needs_mobile: false,
    mobile_use_cases: '',

    // Sección 9: Feedback libre
    what_works_well: '',
    what_frustrates: '',
    dream_features: '',
    additional_comments: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/videndum/platform-redesign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error enviando feedback')
      }

      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleArrayChange = (field: keyof PlatformRedesignPayload, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, [field]: items }))
  }

  const totalSections = 9

  if (success) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Gracias por tu feedback!</h2>
          <p className="text-gray-300 mb-6">
            Tu feedback ha sido guardado. Lo usaremos para rediseñar la plataforma Videndum según tu forma de trabajar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Rediseño de Plataforma - Videndum</h1>
        <p className="text-gray-400">Cuéntanos cómo usas la plataforma actual para rediseñarla a tu medida</p>
        <p className="text-sm text-gray-500 mt-1">⏱️ Tiempo estimado: 8-10 minutos</p>

        {/* Progress bar */}
        <div className="mt-4 bg-white/[0.05] rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${(currentSection / totalSections) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Sección {currentSection} de {totalSections}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECCIÓN 1: Uso de las Pestañas Actuales */}
        {currentSection === 1 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">1️⃣ Uso de las Pestañas Actuales</h2>
            <p className="text-sm text-gray-400 mb-4">Para cada pestaña, indícanos si la usas, con qué frecuencia, y qué te parece útil o falta.</p>

            {/* Dashboard */}
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.uses_dashboard}
                  onChange={(e) => setFormData(prev => ({ ...prev, uses_dashboard: e.target.checked }))}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-white font-medium">📊 Dashboard (Vista general)</span>
              </label>
              {formData.uses_dashboard && (
                <div className="ml-7 space-y-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Con qué frecuencia la usas?</label>
                    <select
                      value={formData.dashboard_frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, dashboard_frequency: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm"
                    >
                      {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Qué elementos te son útiles? (separados por coma)</label>
                    <input
                      type="text"
                      value={formData.dashboard_useful_elements?.join(', ') || ''}
                      onChange={(e) => handleArrayChange('dashboard_useful_elements', e.target.value)}
                      placeholder="Ej: Cards de métricas, Gráfico principal, Tabla de SKUs"
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Qué falta o qué cambiarías?</label>
                    <input
                      type="text"
                      value={formData.dashboard_missing}
                      onChange={(e) => setFormData(prev => ({ ...prev, dashboard_missing: e.target.value }))}
                      placeholder="Ej: Necesito ver alertas, más filtros..."
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Planning */}
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.uses_planning}
                  onChange={(e) => setFormData(prev => ({ ...prev, uses_planning: e.target.checked }))}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-white font-medium">🏭 Planning (Órdenes de producción)</span>
              </label>
              {formData.uses_planning && (
                <div className="ml-7 space-y-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Con qué frecuencia la usas?</label>
                    <select
                      value={formData.planning_frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, planning_frequency: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm"
                    >
                      {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Qué elementos te son útiles?</label>
                    <input
                      type="text"
                      value={formData.planning_useful_elements?.join(', ') || ''}
                      onChange={(e) => handleArrayChange('planning_useful_elements', e.target.value)}
                      placeholder="Ej: Tabla de producción, Selector de SKU, Ajustes recomendados"
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Qué falta o qué cambiarías?</label>
                    <input
                      type="text"
                      value={formData.planning_missing}
                      onChange={(e) => setFormData(prev => ({ ...prev, planning_missing: e.target.value }))}
                      placeholder="Ej: Falta ver historial, necesito comparar semanas..."
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ML Forecast */}
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.uses_ml_forecast}
                  onChange={(e) => setFormData(prev => ({ ...prev, uses_ml_forecast: e.target.checked }))}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-white font-medium">🧠 ML Forecast (Predicciones del modelo)</span>
              </label>
              {formData.uses_ml_forecast && (
                <div className="ml-7 space-y-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Con qué frecuencia la usas?</label>
                    <select
                      value={formData.ml_forecast_frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, ml_forecast_frequency: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm"
                    >
                      {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Qué elementos te son útiles?</label>
                    <input
                      type="text"
                      value={formData.ml_forecast_useful_elements?.join(', ') || ''}
                      onChange={(e) => handleArrayChange('ml_forecast_useful_elements', e.target.value)}
                      placeholder="Ej: Tabla de forecast, Comparación con real, Gráfico de tendencia"
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Qué falta o qué cambiarías?</label>
                    <input
                      type="text"
                      value={formData.ml_forecast_missing}
                      onChange={(e) => setFormData(prev => ({ ...prev, ml_forecast_missing: e.target.value }))}
                      placeholder="Ej: Necesito entender cómo se calcula, ver confianza del modelo..."
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Análisis */}
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.uses_analysis}
                  onChange={(e) => setFormData(prev => ({ ...prev, uses_analysis: e.target.checked }))}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-white font-medium">🔬 Análisis (Forecast vs Ventas Reales)</span>
              </label>
              {formData.uses_analysis && (
                <div className="ml-7 space-y-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Con qué frecuencia la usas?</label>
                    <select
                      value={formData.analysis_frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, analysis_frequency: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm"
                    >
                      {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Qué elementos te son útiles?</label>
                    <input
                      type="text"
                      value={formData.analysis_useful_elements?.join(', ') || ''}
                      onChange={(e) => handleArrayChange('analysis_useful_elements', e.target.value)}
                      placeholder="Ej: MAPE, Top 10 SKUs, Gráfico temporal, Exportar a Excel"
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Qué falta o qué cambiarías?</label>
                    <input
                      type="text"
                      value={formData.analysis_missing}
                      onChange={(e) => setFormData(prev => ({ ...prev, analysis_missing: e.target.value }))}
                      placeholder="Ej: Necesito ver por categoría, comparar meses..."
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ingesta */}
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.uses_ingesta}
                  onChange={(e) => setFormData(prev => ({ ...prev, uses_ingesta: e.target.checked }))}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-white font-medium">📤 Ingesta (Carga de datos)</span>
              </label>
              {formData.uses_ingesta && (
                <div className="ml-7 space-y-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Con qué frecuencia la usas?</label>
                    <select
                      value={formData.ingesta_frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, ingesta_frequency: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm"
                    >
                      {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Qué elementos te son útiles?</label>
                    <input
                      type="text"
                      value={formData.ingesta_useful_elements?.join(', ') || ''}
                      onChange={(e) => handleArrayChange('ingesta_useful_elements', e.target.value)}
                      placeholder="Ej: Drag & drop, Vista previa, Validación de datos"
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">¿Qué falta o qué cambiarías?</label>
                    <input
                      type="text"
                      value={formData.ingesta_missing}
                      onChange={(e) => setFormData(prev => ({ ...prev, ingesta_missing: e.target.value }))}
                      placeholder="Ej: Subir múltiples archivos, templates descargables..."
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECCIÓN 2: KPIs y Métricas */}
        {currentSection === 2 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">2️⃣ KPIs y Métricas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">¿Qué KPIs actualmente miras o usas? (separados por coma)</label>
                <input
                  type="text"
                  value={formData.current_kpis_used?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('current_kpis_used', e.target.value)}
                  placeholder="Ej: MAPE, RMSE, Bias, Top 10 SKUs desviados"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Qué KPIs necesitas pero no están? (separados por coma)</label>
                <input
                  type="text"
                  value={formData.missing_kpis?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('missing_kpis', e.target.value)}
                  placeholder="Ej: Fill Rate, Inventory Turnover, Forecast Accuracy por categoría"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Orden de prioridad de KPIs (separados por coma, del más al menos importante)</label>
                <input
                  type="text"
                  value={formData.kpi_priority_order?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('kpi_priority_order', e.target.value)}
                  placeholder="Ej: Top SKUs desviados, MAPE, Gráfico temporal, Recomendaciones"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 3: Visualizaciones */}
        {currentSection === 3 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">3️⃣ Visualizaciones y Gráficos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">¿Qué gráficos actuales te son útiles? (separados por coma)</label>
                <input
                  type="text"
                  value={formData.useful_charts?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('useful_charts', e.target.value)}
                  placeholder="Ej: Gráfico temporal forecast vs real, Top 10 barras"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Qué gráficos necesitas pero no están? (separados por coma)</label>
                <input
                  type="text"
                  value={formData.missing_charts?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('missing_charts', e.target.value)}
                  placeholder="Ej: Heatmap de desviaciones, Distribución de errores, Comparación año vs año"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Tipos de gráficos preferidos (separados por coma)</label>
                <input
                  type="text"
                  value={formData.preferred_chart_types?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('preferred_chart_types', e.target.value)}
                  placeholder="Ej: Líneas temporales, Barras, Tablas, Heatmaps"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Algún problema con los gráficos actuales?</label>
                <textarea
                  value={formData.chart_complaints}
                  onChange={(e) => setFormData(prev => ({ ...prev, chart_complaints: e.target.value }))}
                  placeholder="Ej: Muy pequeños, colores confusos, falta interactividad..."
                  rows={2}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 4: Filtros y Segmentadores */}
        {currentSection === 4 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">4️⃣ Filtros y Segmentadores</h2>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">¿Qué filtros usas actualmente?</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.uses_year_filter}
                    onChange={(e) => setFormData(prev => ({ ...prev, uses_year_filter: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Filtro por Año</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.uses_month_filter}
                    onChange={(e) => setFormData(prev => ({ ...prev, uses_month_filter: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Filtro por Mes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.uses_sku_filter}
                    onChange={(e) => setFormData(prev => ({ ...prev, uses_sku_filter: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Filtro por SKU</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.uses_type_filter}
                    onChange={(e) => setFormData(prev => ({ ...prev, uses_type_filter: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Filtro por Tipo (INV/PKG)</span>
                </label>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Qué filtros faltan? (separados por coma)</label>
                <input
                  type="text"
                  value={formData.missing_filters?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('missing_filters', e.target.value)}
                  placeholder="Ej: Por categoría, Por cliente, Por región, Rango de fechas"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Algún problema con los filtros actuales?</label>
                <textarea
                  value={formData.filter_problems}
                  onChange={(e) => setFormData(prev => ({ ...prev, filter_problems: e.target.value }))}
                  placeholder="Ej: No se guardan las selecciones, necesito aplicar para que funcionen, muy lentos..."
                  rows={2}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 5: Flujo de Trabajo */}
        {currentSection === 5 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">5️⃣ Tu Flujo de Trabajo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Describe tu flujo típico cuando usas la plataforma</label>
                <textarea
                  value={formData.typical_workflow}
                  onChange={(e) => setFormData(prev => ({ ...prev, typical_workflow: e.target.value }))}
                  placeholder="Ej: Entro a Análisis → Filtro por mes actual → Veo Top 10 SKUs desviados → Exporto a Excel → Reviso en Planning si necesito ajustar producción"
                  rows={4}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Cuánto tiempo pasas típicamente en cada sesión?</label>
                <input
                  type="text"
                  value={formData.time_spent_per_session}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_spent_per_session: e.target.value }))}
                  placeholder="Ej: 10-15 minutos, 30 minutos, 1 hora"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Con qué frecuencia usas la plataforma en general?</label>
                <input
                  type="text"
                  value={formData.frequency_of_use}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency_of_use: e.target.value }))}
                  placeholder="Ej: Diario, 2-3 veces por semana, Semanal"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Problemas principales que enfrentas</label>
                <textarea
                  value={formData.pain_points}
                  onChange={(e) => setFormData(prev => ({ ...prev, pain_points: e.target.value }))}
                  placeholder="Ej: Toma mucho tiempo encontrar lo que busco, no puedo comparar períodos, falta contexto..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Qué haces manualmente fuera de la plataforma?</label>
                <textarea
                  value={formData.manual_workarounds}
                  onChange={(e) => setFormData(prev => ({ ...prev, manual_workarounds: e.target.value }))}
                  placeholder="Ej: Descargo a Excel y hago tablas dinámicas, cruzo con otros reportes, creo gráficos en Power BI..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 6: Preguntas Clave */}
        {currentSection === 6 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">6️⃣ Preguntas que Quieres Responder</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">¿Qué preguntas clave quieres responder con la plataforma? (separadas por coma)</label>
                <textarea
                  value={formData.key_questions?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('key_questions', e.target.value)}
                  placeholder="Ej: ¿Qué SKUs tienen más de 30% de desviación este mes?, ¿Cuál es el MAPE de los últimos 6 meses?, ¿Qué productos debo producir más la próxima semana?"
                  rows={4}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Qué decisiones tomas con la información? (separadas por coma)</label>
                <input
                  type="text"
                  value={formData.decision_types?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('decision_types', e.target.value)}
                  placeholder="Ej: Ajustar producción, Contactar proveedores, Revisar forecast, Escalar a gerencia"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 7: Organización */}
        {currentSection === 7 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">7️⃣ Organización de la Plataforma</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">¿En qué orden preferirías las pestañas? (separadas por coma)</label>
                <input
                  type="text"
                  value={formData.preferred_tab_order?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('preferred_tab_order', e.target.value)}
                  placeholder="Ej: Planning, Análisis, Dashboard, ML Forecast, Ingesta"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Hay pestañas que NO usas y se podrían quitar? (separadas por coma)</label>
                <input
                  type="text"
                  value={formData.tabs_to_remove?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('tabs_to_remove', e.target.value)}
                  placeholder="Ej: ML Forecast, Ingesta"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Sugerencias para fusionar pestañas?</label>
                <input
                  type="text"
                  value={formData.tabs_to_merge}
                  onChange={(e) => setFormData(prev => ({ ...prev, tabs_to_merge: e.target.value }))}
                  placeholder="Ej: Fusionar Dashboard y Análisis, Combinar Planning y ML Forecast"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Cómo preferirías la organización visual?</label>
                <input
                  type="text"
                  value={formData.preferred_layout}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_layout: e.target.value }))}
                  placeholder="Ej: Todo en una página con scroll, Tabs como ahora, Sidebar con navegación, Dashboard grid con widgets"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 8: Funcionalidades Adicionales */}
        {currentSection === 8 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">8️⃣ Funcionalidades Adicionales</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needs_alerts}
                    onChange={(e) => setFormData(prev => ({ ...prev, needs_alerts: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Necesito alertas automáticas</span>
                </label>
                {formData.needs_alerts && (
                  <input
                    type="text"
                    value={formData.alert_examples?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('alert_examples', e.target.value)}
                    placeholder="Ej: Alerta cuando MAPE >20%, SKU crítico con desviación >40%, Stockout risk"
                    className="mt-2 w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                )}
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needs_export}
                    onChange={(e) => setFormData(prev => ({ ...prev, needs_export: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Necesito exportar datos</span>
                </label>
                {formData.needs_export && (
                  <input
                    type="text"
                    value={formData.export_formats_needed?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('export_formats_needed', e.target.value)}
                    placeholder="Ej: Excel, PDF, CSV, API para integrar"
                    className="mt-2 w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                )}
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needs_collaboration}
                    onChange={(e) => setFormData(prev => ({ ...prev, needs_collaboration: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Necesito funcionalidades de colaboración</span>
                </label>
                {formData.needs_collaboration && (
                  <input
                    type="text"
                    value={formData.collaboration_needs}
                    onChange={(e) => setFormData(prev => ({ ...prev, collaboration_needs: e.target.value }))}
                    placeholder="Ej: Comentarios, Aprobaciones de gerencia, Compartir reportes, Notificaciones"
                    className="mt-2 w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                )}
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needs_mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, needs_mobile: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Necesito acceso desde móvil</span>
                </label>
                {formData.needs_mobile && (
                  <input
                    type="text"
                    value={formData.mobile_use_cases}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile_use_cases: e.target.value }))}
                    placeholder="Ej: Ver alertas, Aprobar producción, Revisar KPIs principales"
                    className="mt-2 w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 9: Feedback Libre */}
        {currentSection === 9 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">9️⃣ Feedback Libre</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">¿Qué SÍ te gusta de la plataforma actual?</label>
                <textarea
                  value={formData.what_works_well}
                  onChange={(e) => setFormData(prev => ({ ...prev, what_works_well: e.target.value }))}
                  placeholder="Lo que funciona bien y quieres que se mantenga..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Qué te frustra o no funciona bien?</label>
                <textarea
                  value={formData.what_frustrates}
                  onChange={(e) => setFormData(prev => ({ ...prev, what_frustrates: e.target.value }))}
                  placeholder="Lo que te hace perder tiempo o te complica el trabajo..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Features soñadas / Wish list</label>
                <textarea
                  value={formData.dream_features}
                  onChange={(e) => setFormData(prev => ({ ...prev, dream_features: e.target.value }))}
                  placeholder="Si pudieras tener cualquier funcionalidad, ¿cuál sería?..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Comentarios adicionales</label>
                <textarea
                  value={formData.additional_comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, additional_comments: e.target.value }))}
                  placeholder="Cualquier otra cosa que quieras compartir..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
          <button
            type="button"
            onClick={() => setCurrentSection(prev => Math.max(1, prev - 1))}
            disabled={currentSection === 1}
            className="px-6 py-2 bg-white/[0.05] hover:bg-white/[0.1] disabled:bg-white/[0.02] disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            ← Anterior
          </button>

          {error && (
            <div className="text-red-400 text-sm">
              ❌ {error}
            </div>
          )}

          {currentSection < totalSections ? (
            <button
              type="button"
              onClick={() => setCurrentSection(prev => Math.min(totalSections, prev + 1))}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar Feedback'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

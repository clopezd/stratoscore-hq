'use client'

import { useState } from 'react'
import type { ClientDiscoveryPayload } from '@/app/api/videndum/discovery/route'

export function ClientDiscoveryForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState(1)

  const [formData, setFormData] = useState<ClientDiscoveryPayload>({
    current_forecast_process: '',
    current_tools: '',
    time_spent_weekly: '',
    who_does_forecast: '',
    who_approves: '',
    approval_frequency: '',
    key_metrics_needed: [],
    comparison_needs: '',
    time_periods_needed: [],
    detail_level_needed: '',
    decision_frequency: '',
    decision_examples: [],
    decision_triggers: [],
    urgency_level: '',
    daily_questions: [],
    monthly_questions: [],
    strategic_questions: [],
    biggest_problem: '',
    second_problem: '',
    third_problem: '',
    manual_work: '',
    time_wasted: '',
    ideal_workflow: '',
    must_have_features: [],
    nice_to_have_features: [],
    success_looks_like: '',
    num_skus: undefined,
    forecast_horizon: '',
    has_historical_data: false,
    historical_months: undefined,
    data_sources: [],
    external_factors: [],
    team_size: undefined,
    team_locations: [],
    collaboration_needs: '',
    report_recipients: [],
    device_usage: '',
    technical_level: '',
    integration_needs: [],
    budget_timeline: '',
    additional_context: '',
    special_requirements: '',
    concerns: ''
  })

  // Raw text state for array fields — parse to array only on submit/navigation
  const [arrayTexts, setArrayTexts] = useState<Record<string, string>>({})

  const getArrayText = (field: keyof ClientDiscoveryPayload) => {
    if (field in arrayTexts) return arrayTexts[field as string]
    const val = formData[field]
    return Array.isArray(val) && val.length > 0 ? val.join(', ') : ''
  }

  const handleArrayTextChange = (field: keyof ClientDiscoveryPayload, value: string) => {
    setArrayTexts(prev => ({ ...prev, [field]: value }))
  }

  const flushArrayTexts = () => {
    const updates: Partial<ClientDiscoveryPayload> = {}
    for (const [field, text] of Object.entries(arrayTexts)) {
      const items = text.split(',').map(s => s.trim()).filter(Boolean)
      ;(updates as Record<string, string[]>)[field] = items
    }
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }))
      setArrayTexts({})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Merge any pending array texts into final payload
    const finalData = { ...formData }
    for (const [field, text] of Object.entries(arrayTexts)) {
      const items = text.split(',').map(s => s.trim()).filter(Boolean)
      ;(finalData as Record<string, unknown>)[field] = items
    }

    try {
      const response = await fetch('/api/videndum/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error enviando información')
      }

      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const totalSections = 6

  if (success) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Perfecto!</h2>
          <p className="text-gray-300 mb-6">
            Con esta información diseñaremos la plataforma Videndum exactamente como la necesitas para tu negocio.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Diseño de Plataforma Videndum</h1>
        <p className="text-gray-400">Cuéntanos cómo trabajas HOY para diseñar la herramienta perfecta para ti</p>
        <p className="text-sm text-gray-500 mt-1">⏱️ Tiempo estimado: 10-12 minutos</p>

        {/* Progress bar */}
        <div className="mt-4 bg-white/[0.05] rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${(currentSection / totalSections) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Sección {currentSection} de {totalSections}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          // Prevent Enter from auto-submitting the form (bug: last page auto-skipped)
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault()
          }
        }}
        className="space-y-8"
      >
        {/* SECCIÓN 1: Proceso Actual */}
        {currentSection === 1 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-white mb-4">1️⃣ ¿Cómo Trabajas HOY?</h2>
            <p className="text-sm text-gray-400 mb-6">Describe tu proceso actual de forecast y análisis</p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">¿Cómo hacen el forecast actualmente?</label>
                <textarea
                  value={formData.current_forecast_process}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_forecast_process: e.target.value }))}
                  placeholder="Ej: Descargamos ventas del mes anterior de Excel, calculamos promedios móviles manualmente, ajustamos según experiencia del equipo..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">¿Qué herramientas usan?</label>
                <input
                  type="text"
                  value={formData.current_tools}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_tools: e.target.value }))}
                  placeholder="Ej: Excel, Power BI, ERP SAP, Google Sheets"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">¿Cuántas horas/semana?</label>
                  <input
                    type="text"
                    value={formData.time_spent_weekly}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_spent_weekly: e.target.value }))}
                    placeholder="Ej: 10 horas"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">¿Cada cuánto aprueban?</label>
                  <input
                    type="text"
                    value={formData.approval_frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, approval_frequency: e.target.value }))}
                    placeholder="Ej: Semanal"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">¿Quién hace el forecast?</label>
                  <input
                    type="text"
                    value={formData.who_does_forecast}
                    onChange={(e) => setFormData(prev => ({ ...prev, who_does_forecast: e.target.value }))}
                    placeholder="Ej: Equipo planeación CR"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">¿Quién aprueba?</label>
                  <input
                    type="text"
                    value={formData.who_approves}
                    onChange={(e) => setFormData(prev => ({ ...prev, who_approves: e.target.value }))}
                    placeholder="Ej: Gerencia UK"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 2: Información Necesaria */}
        {currentSection === 2 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-white mb-4">2️⃣ ¿Qué Información Necesitas Ver?</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">¿Qué métricas clave necesitas ver? (separadas por coma)</label>
                <input
                  type="text"
                  value={getArrayText('key_metrics_needed')}
                  onChange={(e) => handleArrayTextChange('key_metrics_needed', e.target.value)}
                  placeholder="Ej: Precisión del forecast, SKUs con problemas, Tendencias de venta, Desviaciones grandes"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">¿Qué comparaciones necesitas hacer?</label>
                <input
                  type="text"
                  value={formData.comparison_needs}
                  onChange={(e) => setFormData(prev => ({ ...prev, comparison_needs: e.target.value }))}
                  placeholder="Ej: Forecast vs Real, Mes actual vs anterior, Este año vs año pasado"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">¿Qué períodos necesitas analizar? (separados por coma)</label>
                <input
                  type="text"
                  value={getArrayText('time_periods_needed')}
                  onChange={(e) => handleArrayTextChange('time_periods_needed', e.target.value)}
                  placeholder="Ej: Semana actual, Mes actual, Últimos 3 meses, Año completo"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">¿A qué nivel de detalle?</label>
                <input
                  type="text"
                  value={formData.detail_level_needed}
                  onChange={(e) => setFormData(prev => ({ ...prev, detail_level_needed: e.target.value }))}
                  placeholder="Ej: Por SKU individual, Por categoría, Por tipo (INV/PKG), Agregado total"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 3: Decisiones y Preguntas */}
        {currentSection === 3 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-white mb-4">3️⃣ Decisiones y Preguntas Clave</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">¿Qué decisiones tomas? (separadas por coma)</label>
                <input
                  type="text"
                  value={getArrayText('decision_examples')}
                  onChange={(e) => handleArrayTextChange('decision_examples', e.target.value)}
                  placeholder="Ej: Ajustar producción semanal, Contactar proveedores, Revisar inventario, Escalar a gerencia"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">¿Cada cuánto decides?</label>
                  <input
                    type="text"
                    value={formData.decision_frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, decision_frequency: e.target.value }))}
                    placeholder="Ej: Diario, Semanal"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">¿Qué tan urgente?</label>
                  <input
                    type="text"
                    value={formData.urgency_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, urgency_level: e.target.value }))}
                    placeholder="Ej: Mismo día, Semana"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Preguntas diarias/semanales que necesitas responder (separadas por coma)</label>
                <textarea
                  value={getArrayText('daily_questions')}
                  onChange={(e) => handleArrayTextChange('daily_questions', e.target.value)}
                  placeholder="Ej: ¿Qué debo producir esta semana?, ¿Hay algún SKU con problema crítico?, ¿Qué necesita ajuste urgente?"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Preguntas mensuales/estratégicas (separadas por coma)</label>
                <textarea
                  value={getArrayText('monthly_questions')}
                  onChange={(e) => handleArrayTextChange('monthly_questions', e.target.value)}
                  placeholder="Ej: ¿Cómo fue la precisión del mes?, ¿Qué SKUs están fallando consistentemente?, ¿Mejoramos vs trimestre pasado?"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 4: Problemas Actuales */}
        {currentSection === 4 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-white mb-4">4️⃣ Problemas Actuales</h2>
            <p className="text-sm text-gray-400 mb-6">¿Qué te hace perder tiempo o te complica el trabajo HOY?</p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Problema #1 (el más grande)</label>
                <input
                  type="text"
                  value={formData.biggest_problem}
                  onChange={(e) => setFormData(prev => ({ ...prev, biggest_problem: e.target.value }))}
                  placeholder="Ej: Toma 2 horas generar el reporte semanal manualmente"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Problema #2</label>
                <input
                  type="text"
                  value={formData.second_problem}
                  onChange={(e) => setFormData(prev => ({ ...prev, second_problem: e.target.value }))}
                  placeholder="Ej: No vemos problemas hasta que es tarde"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Problema #3 (opcional)</label>
                <input
                  type="text"
                  value={formData.third_problem}
                  onChange={(e) => setFormData(prev => ({ ...prev, third_problem: e.target.value }))}
                  placeholder="Ej: Difícil colaborar entre CR y UK"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">¿Qué trabajo manual haces que debería ser automático?</label>
                <textarea
                  value={formData.manual_work}
                  onChange={(e) => setFormData(prev => ({ ...prev, manual_work: e.target.value }))}
                  placeholder="Ej: Copiar datos entre Excel, Calcular MAPE a mano, Generar reportes en Power BI, Enviar emails con resumen"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">¿Dónde pierdes más tiempo?</label>
                <input
                  type="text"
                  value={formData.time_wasted}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_wasted: e.target.value }))}
                  placeholder="Ej: Buscando datos en diferentes archivos, Cruzando información, Esperando aprobaciones"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 5: Flujo Ideal */}
        {currentSection === 5 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-white mb-4">5️⃣ ¿Cómo Te Gustaría Trabajar?</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Describe tu flujo de trabajo ideal</label>
                <textarea
                  value={formData.ideal_workflow}
                  onChange={(e) => setFormData(prev => ({ ...prev, ideal_workflow: e.target.value }))}
                  placeholder="Ej: Entrar a la plataforma → Ver resumen ejecutivo con alertas → Identificar problemas críticos en segundos → Tomar decisión → Aprobar con un click"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Features IMPRESCINDIBLES (separadas por coma)</label>
                <input
                  type="text"
                  value={getArrayText('must_have_features')}
                  onChange={(e) => handleArrayTextChange('must_have_features', e.target.value)}
                  placeholder="Ej: Ver forecast vs real, Filtrar por SKU, Exportar a Excel, Ver desviaciones grandes"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Features DESEABLES (nice to have, separadas por coma)</label>
                <input
                  type="text"
                  value={getArrayText('nice_to_have_features')}
                  onChange={(e) => handleArrayTextChange('nice_to_have_features', e.target.value)}
                  placeholder="Ej: Alertas automáticas, Gráficos interactivos, Acceso móvil, Comentarios en tiempo real"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">¿Qué define el ÉXITO de esta plataforma?</label>
                <textarea
                  value={formData.success_looks_like}
                  onChange={(e) => setFormData(prev => ({ ...prev, success_looks_like: e.target.value }))}
                  placeholder="Ej: Tomar decisiones en 5 minutos en vez de 2 horas, MAPE <15%, Eliminar trabajo manual, Ver problemas antes de que exploten"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 6: Contexto y Equipo */}
        {currentSection === 6 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-white mb-4">6️⃣ Contexto y Equipo</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Cantidad de SKUs</label>
                  <input
                    type="number"
                    value={formData.num_skus || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, num_skus: parseInt(e.target.value) || undefined }))}
                    placeholder="Ej: 1500"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Horizonte de forecast</label>
                  <input
                    type="text"
                    value={formData.forecast_horizon}
                    onChange={(e) => setFormData(prev => ({ ...prev, forecast_horizon: e.target.value }))}
                    placeholder="Ej: 6 meses"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={formData.has_historical_data}
                    onChange={(e) => setFormData(prev => ({ ...prev, has_historical_data: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Tenemos datos históricos de ventas</span>
                </label>
                {formData.has_historical_data && (
                  <input
                    type="number"
                    value={formData.historical_months || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, historical_months: parseInt(e.target.value) || undefined }))}
                    placeholder="¿Cuántos meses? Ej: 24"
                    className="ml-7 w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Tamaño del equipo</label>
                  <input
                    type="number"
                    value={formData.team_size || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, team_size: parseInt(e.target.value) || undefined }))}
                    placeholder="Ej: 3 personas"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Ubicaciones del equipo</label>
                  <input
                    type="text"
                    value={getArrayText('team_locations')}
                    onChange={(e) => handleArrayTextChange('team_locations', e.target.value)}
                    placeholder="Ej: Costa Rica, UK"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Nivel técnico del equipo</label>
                <input
                  type="text"
                  value={formData.technical_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, technical_level: e.target.value }))}
                  placeholder="Ej: Avanzado Excel/Power BI, Intermedio Excel, Básico"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">¿Necesitan integrar con otros sistemas? (separados por coma)</label>
                <input
                  type="text"
                  value={getArrayText('integration_needs')}
                  onChange={(e) => handleArrayTextChange('integration_needs', e.target.value)}
                  placeholder="Ej: SAP, Odoo, Excel automático, Power BI, API"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Comentarios finales o preocupaciones</label>
                <textarea
                  value={formData.additional_context}
                  onChange={(e) => setFormData(prev => ({ ...prev, additional_context: e.target.value }))}
                  placeholder="Cualquier otra información importante que debamos saber..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 text-base min-h-[48px]"
                />
              </div>
            </div>
          </section>
        )}

        {/* Navigation Buttons */}
        {error && (
          <div className="text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-6 border-t border-white/[0.05]">
          <button
            type="button"
            onClick={() => {
              setCurrentSection(prev => Math.max(1, prev - 1))
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            disabled={currentSection === 1}
            className="px-5 sm:px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] disabled:bg-white/[0.02] disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm sm:text-base min-h-[48px]"
          >
            Anterior
          </button>

          {currentSection < totalSections ? (
            <button
              type="button"
              onClick={() => {
                flushArrayTexts()
                setCurrentSection(prev => Math.min(totalSections, prev + 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="px-5 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors text-sm sm:text-base min-h-[48px]"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 sm:px-8 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm sm:text-base min-h-[48px]"
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

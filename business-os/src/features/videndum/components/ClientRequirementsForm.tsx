'use client'

import { useState } from 'react'
import type { ClientRequirementsPayload } from '@/app/api/videndum/requirements/route'

export function ClientRequirementsForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState(1)

  const [formData, setFormData] = useState<ClientRequirementsPayload>({
    client_name: '',
    contact_role: '',
    business_type: '',
    number_of_skus: undefined,
    planning_team_size: undefined,
    current_tools: '',
    forecast_frequency: 'monthly',
    forecast_horizon_months: 6,
    forecast_method: '',
    forecast_pain_points: '',
    has_historical_sales: false,
    historical_sales_months: undefined,
    has_external_factors: false,
    external_factors_list: [],
    data_quality_issues: '',
    primary_kpis: [],
    acceptable_mape_threshold: undefined,
    critical_skus: [],
    planning_constraints: '',
    who_creates_forecast: '',
    who_approves_forecast: '',
    approval_frequency: '',
    actions_on_high_variance: '',
    needs_export: false,
    export_formats: [],
    needs_alerts: false,
    alert_triggers: [],
    integration_systems: [],
    preferred_charts: [],
    dashboard_users: [],
    report_frequency: '',
    mobile_access_needed: false,
    top_3_priorities: [],
    expected_improvement: '',
    timeline_urgency: 'flexible',
    budget_range: '',
    use_case_1: '',
    use_case_2: '',
    edge_cases: '',
    success_criteria: '',
    stakeholders: [],
    additional_notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/videndum/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error enviando requerimientos')
      }

      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleArrayChange = (field: keyof ClientRequirementsPayload, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, [field]: items }))
  }

  const totalSections = 10

  if (success) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Gracias por tu tiempo!</h2>
          <p className="text-gray-300 mb-6">
            Tus requerimientos han sido guardados exitosamente. Nuestro equipo los revisará y se pondrá en contacto contigo pronto para diseñar la solución perfecta para tu negocio.
          </p>
          <button
            onClick={() => {
              setSuccess(false)
              setCurrentSection(1)
              setFormData({
                client_name: '',
                contact_role: '',
                business_type: '',
                number_of_skus: undefined,
                planning_team_size: undefined,
                current_tools: '',
                forecast_frequency: 'monthly',
                forecast_horizon_months: 6,
                forecast_method: '',
                forecast_pain_points: '',
                has_historical_sales: false,
                historical_sales_months: undefined,
                has_external_factors: false,
                external_factors_list: [],
                data_quality_issues: '',
                primary_kpis: [],
                acceptable_mape_threshold: undefined,
                critical_skus: [],
                planning_constraints: '',
                who_creates_forecast: '',
                who_approves_forecast: '',
                approval_frequency: '',
                actions_on_high_variance: '',
                needs_export: false,
                export_formats: [],
                needs_alerts: false,
                alert_triggers: [],
                integration_systems: [],
                preferred_charts: [],
                dashboard_users: [],
                report_frequency: '',
                mobile_access_needed: false,
                top_3_priorities: [],
                expected_improvement: '',
                timeline_urgency: 'flexible',
                budget_range: '',
                use_case_1: '',
                use_case_2: '',
                edge_cases: '',
                success_criteria: '',
                stakeholders: [],
                additional_notes: ''
              })
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Enviar otro levantamiento
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Levantamiento de Requerimientos</h1>
        <p className="text-gray-400">Sistema de Análisis y Forecast - Videndum</p>
        <p className="text-sm text-gray-500 mt-1">⏱️ Tiempo estimado: 10-15 minutos</p>

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
        {/* Información Básica */}
        {currentSection === 1 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Información Básica</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nombre del Cliente / Empresa *</label>
                <input
                  type="text"
                  required
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Ej: Videndum Ltd"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Tu Rol</label>
                <input
                  type="text"
                  value={formData.contact_role}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_role: e.target.value }))}
                  placeholder="Ej: Planning Manager, Owner, Operations Director"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* 1️⃣ Contexto del Negocio */}
        {currentSection === 2 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">1️⃣ Contexto del Negocio</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Tipo de Negocio</label>
                <input
                  type="text"
                  value={formData.business_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                  placeholder="Ej: Manufactura de productos químicos, Distribución, Retail"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Cantidad de SKUs que manejan</label>
                <input
                  type="number"
                  value={formData.number_of_skus || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, number_of_skus: parseInt(e.target.value) || undefined }))}
                  placeholder="Ej: 1500"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Tamaño del equipo de planeación</label>
                <input
                  type="number"
                  value={formData.planning_team_size || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, planning_team_size: parseInt(e.target.value) || undefined }))}
                  placeholder="Ej: 3 personas"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Herramientas actuales que usan</label>
                <input
                  type="text"
                  value={formData.current_tools}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_tools: e.target.value }))}
                  placeholder="Ej: Excel, SAP, Power BI, Tableau"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* 2️⃣ Proceso Actual de Forecast */}
        {currentSection === 3 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">2️⃣ Proceso Actual de Forecast</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Frecuencia con que hacen forecast</label>
                <select
                  value={formData.forecast_frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, forecast_frequency: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Horizonte de forecast (meses)</label>
                <input
                  type="number"
                  value={formData.forecast_horizon_months || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, forecast_horizon_months: parseInt(e.target.value) || undefined }))}
                  placeholder="Ej: 6 meses"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Método actual de forecast</label>
                <input
                  type="text"
                  value={formData.forecast_method}
                  onChange={(e) => setFormData(prev => ({ ...prev, forecast_method: e.target.value }))}
                  placeholder="Ej: Promedio móvil manual en Excel, ML básico, Juicio de expertos"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Problemas principales con el proceso actual</label>
                <textarea
                  value={formData.forecast_pain_points}
                  onChange={(e) => setFormData(prev => ({ ...prev, forecast_pain_points: e.target.value }))}
                  placeholder="Ej: Toma mucho tiempo manual, alta varianza vs real, falta visibilidad de desviaciones"
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* 3️⃣ Datos Disponibles */}
        {currentSection === 4 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">3️⃣ Datos Disponibles</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_historical_sales}
                    onChange={(e) => setFormData(prev => ({ ...prev, has_historical_sales: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Tenemos historial de ventas reales</span>
                </label>
              </div>
              {formData.has_historical_sales && (
                <div className="ml-7">
                  <label className="block text-gray-300 mb-2">¿Cuántos meses de historial?</label>
                  <input
                    type="number"
                    value={formData.historical_sales_months || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, historical_sales_months: parseInt(e.target.value) || undefined }))}
                    placeholder="Ej: 24 meses"
                    className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                </div>
              )}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_external_factors}
                    onChange={(e) => setFormData(prev => ({ ...prev, has_external_factors: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Hay factores externos que afectan las ventas</span>
                </label>
              </div>
              {formData.has_external_factors && (
                <div className="ml-7">
                  <label className="block text-gray-300 mb-2">Lista de factores externos (separados por coma)</label>
                  <input
                    type="text"
                    value={formData.external_factors_list?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('external_factors_list', e.target.value)}
                    placeholder="Ej: Estacionalidad, Promociones, Clima, Eventos especiales"
                    className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-300 mb-2">Problemas con la calidad de los datos</label>
                <textarea
                  value={formData.data_quality_issues}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_quality_issues: e.target.value }))}
                  placeholder="Ej: Datos incompletos, duplicados, errores de captura manual"
                  rows={2}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* 4️⃣ Métricas y KPIs Críticos */}
        {currentSection === 5 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">4️⃣ Métricas y KPIs Críticos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">KPIs principales (separados por coma)</label>
                <input
                  type="text"
                  value={formData.primary_kpis?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('primary_kpis', e.target.value)}
                  placeholder="Ej: MAPE, Fill Rate, Stockout %, Inventory Turnover"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">MAPE aceptable (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.acceptable_mape_threshold || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptable_mape_threshold: parseFloat(e.target.value) || undefined }))}
                  placeholder="Ej: 15%"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">SKUs críticos (separados por coma)</label>
                <input
                  type="text"
                  value={formData.critical_skus?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('critical_skus', e.target.value)}
                  placeholder="Ej: V18-INV, V18-PKG, CHLOR-500"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Restricciones de planeación</label>
                <textarea
                  value={formData.planning_constraints}
                  onChange={(e) => setFormData(prev => ({ ...prev, planning_constraints: e.target.value }))}
                  placeholder="Ej: MOQ de 1000 unidades, Lead time de 4 semanas, Capacidad limitada de almacén"
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* 5️⃣ Flujo de Decisiones */}
        {currentSection === 6 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">5️⃣ Flujo de Decisiones</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">¿Quién crea el forecast inicial?</label>
                <input
                  type="text"
                  value={formData.who_creates_forecast}
                  onChange={(e) => setFormData(prev => ({ ...prev, who_creates_forecast: e.target.value }))}
                  placeholder="Ej: Equipo de planeación en Costa Rica"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Quién aprueba/valida el forecast?</label>
                <input
                  type="text"
                  value={formData.who_approves_forecast}
                  onChange={(e) => setFormData(prev => ({ ...prev, who_approves_forecast: e.target.value }))}
                  placeholder="Ej: Gerencia UK"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Frecuencia de aprobaciones</label>
                <input
                  type="text"
                  value={formData.approval_frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, approval_frequency: e.target.value }))}
                  placeholder="Ej: Semanal, Mensual"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Qué hacen cuando detectan alta varianza?</label>
                <textarea
                  value={formData.actions_on_high_variance}
                  onChange={(e) => setFormData(prev => ({ ...prev, actions_on_high_variance: e.target.value }))}
                  placeholder="Ej: Ajustamos producción, Contactamos proveedores, Revisamos demanda con ventas"
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* 6️⃣ Integración y Outputs */}
        {currentSection === 7 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">6️⃣ Integración y Outputs</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needs_export}
                    onChange={(e) => setFormData(prev => ({ ...prev, needs_export: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Necesitamos exportar datos</span>
                </label>
              </div>
              {formData.needs_export && (
                <div className="ml-7">
                  <label className="block text-gray-300 mb-2">Formatos de exportación (separados por coma)</label>
                  <input
                    type="text"
                    value={formData.export_formats?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('export_formats', e.target.value)}
                    placeholder="Ej: Excel, CSV, PDF, API"
                    className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                </div>
              )}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needs_alerts}
                    onChange={(e) => setFormData(prev => ({ ...prev, needs_alerts: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Necesitamos alertas automáticas</span>
                </label>
              </div>
              {formData.needs_alerts && (
                <div className="ml-7">
                  <label className="block text-gray-300 mb-2">Triggers de alertas (separados por coma)</label>
                  <input
                    type="text"
                    value={formData.alert_triggers?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('alert_triggers', e.target.value)}
                    placeholder="Ej: Varianza >30%, Riesgo de stockout, MAPE >15%"
                    className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-300 mb-2">Sistemas a integrar (separados por coma)</label>
                <input
                  type="text"
                  value={formData.integration_systems?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('integration_systems', e.target.value)}
                  placeholder="Ej: SAP, Odoo, WMS, CRM, Power BI"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* 7️⃣ Visualización y Reportes */}
        {currentSection === 8 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">7️⃣ Visualización y Reportes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Tipos de gráficos preferidos (separados por coma)</label>
                <input
                  type="text"
                  value={formData.preferred_charts?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('preferred_charts', e.target.value)}
                  placeholder="Ej: Líneas temporales, Barras comparativas, Heatmaps, Tablas"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">¿Quiénes usarán el dashboard? (separados por coma)</label>
                <input
                  type="text"
                  value={formData.dashboard_users?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('dashboard_users', e.target.value)}
                  placeholder="Ej: Equipo de planeación, Gerencia, Directores, Analistas"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Frecuencia de reportes ejecutivos</label>
                <input
                  type="text"
                  value={formData.report_frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, report_frequency: e.target.value }))}
                  placeholder="Ej: Semanal, Mensual, Trimestral"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mobile_access_needed}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile_access_needed: e.target.checked }))}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-gray-300">Se necesita acceso desde móvil</span>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* 8️⃣ Expectativas y Prioridades */}
        {currentSection === 9 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">8️⃣ Expectativas y Prioridades</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Top 3 prioridades (separadas por coma)</label>
                <input
                  type="text"
                  value={formData.top_3_priorities?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('top_3_priorities', e.target.value)}
                  placeholder="Ej: Precisión del forecast, Velocidad de análisis, Usabilidad"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Mejora esperada vs sistema actual</label>
                <textarea
                  value={formData.expected_improvement}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_improvement: e.target.value }))}
                  placeholder="Ej: Reducir MAPE de 35% a 15%, Ahorrar 10 horas/semana de trabajo manual"
                  rows={2}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Urgencia de implementación</label>
                <select
                  value={formData.timeline_urgency}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeline_urgency: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white"
                >
                  <option value="asap">Lo antes posible (ASAP)</option>
                  <option value="1_month">En 1 mes</option>
                  <option value="3_months">En 3 meses</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Rango de presupuesto (opcional)</label>
                <input
                  type="text"
                  value={formData.budget_range}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_range: e.target.value }))}
                  placeholder="Ej: $5,000 - $15,000 USD, Flexible"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* 9️⃣ y 🔟 Casos de Uso e Información Adicional */}
        {currentSection === 10 && (
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">9️⃣ Casos de Uso Específicos</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Caso de uso principal</label>
                  <textarea
                    value={formData.use_case_1}
                    onChange={(e) => setFormData(prev => ({ ...prev, use_case_1: e.target.value }))}
                    placeholder="Ej: Planeación semanal de producción basada en forecast ajustado por ventas reales"
                    rows={3}
                    className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Caso de uso secundario (opcional)</label>
                  <textarea
                    value={formData.use_case_2}
                    onChange={(e) => setFormData(prev => ({ ...prev, use_case_2: e.target.value }))}
                    placeholder="Ej: Análisis mensual de desviaciones para reuniones ejecutivas"
                    rows={2}
                    className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Casos especiales o edge cases</label>
                  <textarea
                    value={formData.edge_cases}
                    onChange={(e) => setFormData(prev => ({ ...prev, edge_cases: e.target.value }))}
                    placeholder="Ej: SKUs con alta estacionalidad, Productos nuevos sin historial, Promociones extraordinarias"
                    rows={2}
                    className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">🔟 Información Adicional</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">¿Qué define el éxito de este proyecto?</label>
                  <textarea
                    value={formData.success_criteria}
                    onChange={(e) => setFormData(prev => ({ ...prev, success_criteria: e.target.value }))}
                    placeholder="Ej: MAPE <15%, Reducción de stockouts en 50%, Decisiones más rápidas"
                    rows={2}
                    className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Stakeholders clave (separados por coma)</label>
                  <input
                    type="text"
                    value={formData.stakeholders?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('stakeholders', e.target.value)}
                    placeholder="Ej: CEO, CFO, Operations Manager, Planning Team Lead"
                    className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Comentarios adicionales</label>
                  <textarea
                    value={formData.additional_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                    placeholder="Cualquier otra información relevante que debamos saber..."
                    rows={4}
                    className="w-full px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500"
                  />
                </div>
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
              {loading ? 'Enviando...' : 'Enviar Levantamiento'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

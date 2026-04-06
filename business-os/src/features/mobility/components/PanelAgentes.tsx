'use client'

import { useState } from 'react'
import { MobilityBrand } from '../brand'

interface AgenteInfo {
  id: string
  nombre: string
  descripcion: string
  impacto: string
  icono: string
}

const AGENTES: AgenteInfo[] = [
  {
    id: 'retention',
    nombre: 'Retención y Renovación',
    descripcion: 'Monitorea pacientes próximos a vencer (≤5 sesiones) y ejecuta campañas de renovación automáticas',
    impacto: '+50% retención',
    icono: '💎',
  },
  {
    id: 'acquisition',
    nombre: 'Captación y Conversión',
    descripcion: 'Responde leads en <5min, clasifica por prioridad y ejecuta seguimiento de leads fríos',
    impacto: '+40% conversión',
    icono: '🎯',
  },
  {
    id: 'optimization',
    nombre: 'Optimización de Ocupación',
    descripcion: 'Identifica slots vacíos, propone reagendamientos y genera campañas para horarios valle',
    impacto: '+15% ocupación',
    icono: '📊',
  },
]

export function PanelAgentes() {
  const [ejecutando, setEjecutando] = useState<string | null>(null)
  const [resultados, setResultados] = useState<Record<string, any>>({})

  async function ejecutarAgente(agenteId: string) {
    setEjecutando(agenteId)
    setResultados({})

    try {
      console.log(`🚀 Ejecutando agente: ${agenteId}`)

      // Crear AbortController para timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout

      const response = await fetch('/api/mobility/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: agenteId }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 Respuesta del agente:', data)

      if (data.success) {
        setResultados(data.resultados)
        console.log('✅ Agente ejecutado exitosamente')
      } else {
        console.error('❌ Error ejecutando agente:', data.error)
        alert(`Error: ${data.error || data.details || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('❌ Error completo:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          alert('⏱️ Timeout: El agente tardó más de 30 segundos. Verifica los logs del servidor.')
        } else {
          alert(`Error: ${error.message}`)
        }
      } else {
        alert('Error de conexión. Ver consola para detalles.')
      }
    } finally {
      setEjecutando(null)
    }
  }

  async function ejecutarTodos() {
    setEjecutando('all')
    setResultados({})

    try {
      console.log('🚀 Ejecutando TODOS los agentes...')

      // Crear AbortController para timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos para todos

      const response = await fetch('/api/mobility/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'all' }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 Respuesta completa:', data)

      if (data.success) {
        setResultados(data.resultados)
        console.log('✅ Todos los agentes ejecutados exitosamente')
        console.log('📈 Resultados:', data.resultados)
      } else {
        console.error('❌ Error:', data.error)
        alert(`Error: ${data.error || data.details || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('❌ Error completo:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          alert('⏱️ Timeout: Los agentes tardaron más de 60 segundos. Verifica los logs del servidor.')
        } else {
          alert(`Error: ${error.message}`)
        }
      } else {
        alert('Error de conexión. Ver consola para detalles.')
      }
    } finally {
      setEjecutando(null)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🤖 Agentes Inteligentes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Automatización para alcanzar 80% de ocupación
          </p>
        </div>

        <button
          onClick={ejecutarTodos}
          disabled={ejecutando !== null}
          className="px-6 py-2.5 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: ejecutando === 'all' ? '#6B7280' : MobilityBrand.gradients.primary,
          }}
        >
          {ejecutando === 'all' ? '⚙️ Ejecutando...' : '▶️ Ejecutar Todos'}
        </button>
      </div>

      {/* Grid de Agentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {AGENTES.map((agente) => (
          <div
            key={agente.id}
            className="border-2 rounded-lg p-5 hover:shadow-lg transition"
            style={{
              borderColor: ejecutando === agente.id ? MobilityBrand.colors.primary : '#E5E7EB',
            }}
          >
            {/* Header del Card */}
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">{agente.icono}</div>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: MobilityBrand.colors.primary }}
              >
                {agente.impacto}
              </div>
            </div>

            {/* Nombre y Descripción */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {agente.nombre}
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {agente.descripcion}
            </p>

            {/* Botón de Ejecución */}
            <button
              onClick={() => ejecutarAgente(agente.id)}
              disabled={ejecutando !== null}
              className="w-full py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  ejecutando === agente.id
                    ? '#6B7280'
                    : MobilityBrand.colors.primary,
                color: 'white',
              }}
            >
              {ejecutando === agente.id ? '⚙️ Ejecutando...' : '▶️ Ejecutar'}
            </button>

            {/* Resultados */}
            {resultados[agente.id] && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xs font-semibold text-green-800 mb-2">
                  ✅ Completado
                </div>
                {agente.id === 'retention' && (
                  <div className="text-xs text-green-700 space-y-1">
                    <div>
                      📋 {resultados[agente.id].pacientes_proximo_vencimiento} pacientes próximos a vencer
                    </div>
                    <div>
                      📤 {resultados[agente.id].mensajes_enviados} mensajes enviados
                    </div>
                  </div>
                )}
                {agente.id === 'acquisition' && (
                  <div className="text-xs text-green-700 space-y-1">
                    <div>
                      🆕 {resultados[agente.id].leads_nuevos} leads nuevos
                    </div>
                    <div>
                      📤 {resultados[agente.id].mensajes_enviados} mensajes enviados
                    </div>
                    <div>
                      🎯 {resultados[agente.id].tasa_conversion_estimada}% conversión estimada
                    </div>
                  </div>
                )}
                {agente.id === 'optimization' && (
                  <div className="text-xs text-green-700 space-y-1">
                    <div>
                      📊 {resultados[agente.id].ocupacion_actual}% ocupación actual
                    </div>
                    <div>
                      🕳️ {resultados[agente.id].slots_disponibles} slots vacíos
                    </div>
                    <div>
                      🎯 {resultados[agente.id].campanas_sugeridas.length} campañas generadas
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resultados Detallados */}
      {Object.keys(resultados).length > 0 && (
        <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-bold text-blue-900 mb-3">
            📊 Resumen de Ejecución
          </h3>

          <div className="space-y-4">
            {resultados.retention && (
              <div>
                <div className="text-sm font-semibold text-blue-900 mb-2">
                  💎 Retención y Renovación
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>
                    • {resultados.retention.pacientes_analizados} pacientes analizados
                  </div>
                  <div>
                    • {resultados.retention.pacientes_proximo_vencimiento} próximos a vencer
                  </div>
                  <div>
                    • {resultados.retention.pacientes_en_riesgo} en riesgo de abandono
                  </div>
                  {resultados.retention.recomendaciones.length > 0 && (
                    <div className="mt-2 pl-3 border-l-2 border-blue-300">
                      {resultados.retention.recomendaciones.map((rec: string, i: number) => (
                        <div key={i}>→ {rec}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {resultados.acquisition && (
              <div>
                <div className="text-sm font-semibold text-blue-900 mb-2">
                  🎯 Captación y Conversión
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>
                    • {resultados.acquisition.leads_analizados} leads analizados
                  </div>
                  <div>
                    • {resultados.acquisition.leads_nuevos} leads nuevos (&lt;5 min)
                  </div>
                  <div>
                    • {resultados.acquisition.leads_sin_contactar} sin contactar
                  </div>
                  <div>
                    • {resultados.acquisition.leads_frios} leads fríos reactivados
                  </div>
                  {resultados.acquisition.recomendaciones.length > 0 && (
                    <div className="mt-2 pl-3 border-l-2 border-blue-300">
                      {resultados.acquisition.recomendaciones.map((rec: string, i: number) => (
                        <div key={i}>→ {rec}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {resultados.optimization && (
              <div>
                <div className="text-sm font-semibold text-blue-900 mb-2">
                  📊 Optimización de Ocupación
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>
                    • Ocupación actual: {resultados.optimization.ocupacion_actual}%
                  </div>
                  <div>
                    • Gap hacia meta: {resultados.optimization.gap_ocupacion}%
                  </div>
                  <div>
                    • {resultados.optimization.slots_disponibles} slots disponibles
                  </div>
                  <div>
                    • {resultados.optimization.campanas_sugeridas.length} campañas promocionales generadas
                  </div>
                  {resultados.optimization.campanas_sugeridas.length > 0 && (
                    <div className="mt-2 pl-3 border-l-2 border-blue-300">
                      {resultados.optimization.campanas_sugeridas.map((c: any, i: number) => (
                        <div key={i}>
                          → {c.tipo}: {c.descuento}% en {c.horario} ({c.pacientes_objetivo} pacientes)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info sobre Automatización */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚙️</div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Automatización Recomendada
            </h4>
            <p className="text-xs text-gray-600">
              Para máxima eficiencia, configura estos agentes para ejecutarse automáticamente:
            </p>
            <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li><strong>Captación:</strong> Cada 5 minutos (respuesta rápida a leads)</li>
              <li><strong>Retención:</strong> Diariamente a las 9 AM</li>
              <li><strong>Optimización:</strong> Lunes a las 8 AM (planificación semanal)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

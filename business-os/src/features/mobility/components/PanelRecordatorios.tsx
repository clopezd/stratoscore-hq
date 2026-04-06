'use client'

import { useState } from 'react'
import { procesarRecordatorios, RECORDATORIOS_DEFAULT } from '../services/recordatoriosService'
import { MobilityBrand } from '../brand'

export function PanelRecordatorios() {
  const [procesando, setProcesando] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)

  async function handleProcesarRecordatorios(horasAntes: number) {
    setProcesando(true)
    setResultado(null)

    try {
      const cantidad = await procesarRecordatorios(horasAntes)
      setResultado(`✅ Se procesaron ${cantidad} recordatorios de ${horasAntes}h antes`)
    } catch (error) {
      console.error('Error:', error)
      setResultado('❌ Error al procesar recordatorios')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-3xl">🔔</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recordatorios Automáticos</h2>
          <p className="text-sm text-gray-600">
            Sistema de notificaciones para pacientes
          </p>
        </div>
      </div>

      {/* Configuraciones Actuales */}
      <div className="mb-6 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Configuración Actual</h3>
        {RECORDATORIOS_DEFAULT.map((config, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {config.tipo === 'whatsapp' ? '📱 WhatsApp' : config.tipo === 'sms' ? '💬 SMS' : '📧 Email'}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    background: MobilityBrand.colors.lightGray,
                    color: MobilityBrand.colors.primary,
                  }}
                >
                  {config.horas_antes}h antes
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {config.mensaje_template.substring(0, 100)}...
              </p>
            </div>

            <button
              onClick={() => handleProcesarRecordatorios(config.horas_antes)}
              disabled={procesando}
              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {procesando ? 'Procesando...' : 'Enviar Ahora'}
            </button>
          </div>
        ))}
      </div>

      {/* Resultado */}
      {resultado && (
        <div
          className={`p-4 rounded-lg text-sm font-medium ${
            resultado.startsWith('✅')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {resultado}
        </div>
      )}

      {/* Nota sobre integración */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Estado de Integración
            </h4>
            <p className="text-xs text-blue-700">
              Los recordatorios están en <strong>modo simulado</strong>. Para activar envíos reales:
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Configurar Twilio WhatsApp Business API</li>
              <li>Configurar Twilio SMS API</li>
              <li>Configurar servicio de email (Resend/SendGrid)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

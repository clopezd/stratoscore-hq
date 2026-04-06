import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ejecutarAgenteRetencion } from '@/features/mobility/agents/retention-agent'
import { ejecutarAgenteAdquisicion } from '@/features/mobility/agents/acquisition-agent'
import { ejecutarAgenteOptimizacion } from '@/features/mobility/agents/optimization-agent'

/**
 * POST /api/mobility/agents
 * Ejecuta uno o todos los agentes de Mobility
 *
 * Body:
 * {
 *   "agent": "retention" | "acquisition" | "optimization" | "all"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener parámetros
    const body = await request.json()
    const { agent = 'all' } = body

    const resultados: Record<string, any> = {}
    const inicio = Date.now()

    // Ejecutar agentes según parámetro
    if (agent === 'retention' || agent === 'all') {
      console.log('🤖 Ejecutando agente de retención...')
      resultados.retention = await ejecutarAgenteRetencion()
    }

    if (agent === 'acquisition' || agent === 'all') {
      console.log('🤖 Ejecutando agente de captación...')
      resultados.acquisition = await ejecutarAgenteAdquisicion()
    }

    if (agent === 'optimization' || agent === 'all') {
      console.log('🤖 Ejecutando agente de optimización...')
      resultados.optimization = await ejecutarAgenteOptimizacion()
    }

    const duracion = Date.now() - inicio

    return NextResponse.json({
      success: true,
      agent,
      duracion_ms: duracion,
      resultados,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error ejecutando agentes:', error)
    return NextResponse.json(
      {
        error: 'Error ejecutando agentes',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/mobility/agents
 * Obtiene información de los agentes disponibles
 */
export async function GET() {
  return NextResponse.json({
    agents: [
      {
        id: 'retention',
        nombre: 'Retención y Renovación',
        descripcion: 'Monitorea pacientes próximos a vencer y ejecuta campañas de renovación',
        impacto: '+50% retención',
        icono: '💎',
      },
      {
        id: 'acquisition',
        nombre: 'Captación y Conversión',
        descripcion: 'Responde leads en <5min y ejecuta seguimiento automático',
        impacto: '+40% conversión',
        icono: '🎯',
      },
      {
        id: 'optimization',
        nombre: 'Optimización de Ocupación',
        descripcion: 'Identifica slots vacíos y genera campañas para horarios valle',
        impacto: '+15% ocupación',
        icono: '📊',
      },
    ],
  })
}

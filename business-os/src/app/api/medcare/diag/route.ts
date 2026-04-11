import { NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'

/**
 * GET /api/medcare/diag
 * Diagnóstico temporal — verificar conectividad con Huli desde Vercel
 * TODO: eliminar después de confirmar que funciona
 */
export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      HULI_API_KEY: process.env.HULI_API_KEY ? `${process.env.HULI_API_KEY.substring(0, 8)}...` : 'MISSING',
      HULI_ORGANIZATION_ID: process.env.HULI_ORGANIZATION_ID || 'MISSING',
      HULI_API_URL: process.env.HULI_API_URL || 'MISSING',
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} chars, ends=[${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-3)}]`
        : 'MISSING',
    },
  }

  try {
    const huli = HuliConnector.getInstance()
    const today = new Date().toISOString().split('T')[0]

    // Test resonancia 1.5T
    const data = await huli.listDoctorAppointments(
      '79739',
      `${today}T00:00:00Z`,
      `${today}T23:59:59Z`,
      { limit: 5 }
    )

    checks.huli = {
      status: 'OK',
      total: data.total,
      appointmentsReturned: data.appointments?.length || 0,
      sample: data.appointments?.[0]
        ? {
            id: data.appointments[0].idEvent,
            date: data.appointments[0].startDate,
            status: data.appointments[0].statusAppointment,
            notes: data.appointments[0].notes?.substring(0, 50),
          }
        : null,
    }
  } catch (error) {
    checks.huli = {
      status: 'ERROR',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined,
    }
  }

  return NextResponse.json(checks)
}

import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = await fetch('http://localhost:3099/tasks/validate', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer tumision_2026',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Agent-server no disponible' },
      { status: 502 }
    )
  }
}

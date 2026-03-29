import { NextRequest, NextResponse } from 'next/server'
import { runDailyPipeline, runWeeklyPipeline } from '@/features/agents/services/scheduler'

function authorize(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const token = process.env.OPENCLAW_GATEWAY_TOKEN ?? 'tumision_2026'
  return auth === `Bearer ${token}`
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const type = (body.type as string) ?? 'daily'

  const start = Date.now()

  let results
  if (type === 'weekly') {
    results = await runWeeklyPipeline()
  } else {
    results = await runDailyPipeline()
  }

  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  return NextResponse.json({
    type,
    total: results.length,
    succeeded,
    failed,
    duration_ms: Date.now() - start,
    results,
  })
}

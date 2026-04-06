/**
 * POST /api/bidhunter/kpis/snapshot
 *
 * Triggers a weekly KPI snapshot. Called by cron or manual trigger.
 */
import { NextResponse } from 'next/server'
import { snapshotCurrentWeek } from '@/features/bidhunter/services/kpiService'

export const runtime = 'nodejs'

export async function POST() {
  try {
    await snapshotCurrentWeek()
    return NextResponse.json({ ok: true, message: 'Weekly snapshot saved' })
  } catch (err) {
    console.error('Snapshot error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

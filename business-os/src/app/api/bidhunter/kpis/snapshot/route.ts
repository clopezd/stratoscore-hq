/**
 * POST /api/bidhunter/kpis/snapshot
 *
 * Triggers a weekly KPI snapshot. Called by cron or manual trigger.
 */
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { snapshotCurrentWeek } from '@/features/bidhunter/services/kpiService'

export const runtime = 'nodejs'

export async function POST() {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    await snapshotCurrentWeek()
    return NextResponse.json({ ok: true, message: 'Weekly snapshot saved' })
  } catch (err) {
    console.error('Snapshot error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

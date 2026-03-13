import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  // Auth
  const expectedToken = process.env.OPENCLAW_GATEWAY_TOKEN
  if (!expectedToken) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // Tasks by status
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status')

    const taskCounts: Record<string, number> = { backlog: 0, todo: 0, in_progress: 0, done: 0 }
    for (const t of tasks ?? []) {
      const s = t.status as string
      if (s in taskCounts) taskCounts[s]++
      else taskCounts[s] = (taskCounts[s] ?? 0) + 1
    }

    // Agents
    const { data: agents } = await supabase
      .from('agents')
      .select('name, status')
      .order('created_at', { ascending: true })

    // Recent activities (last 10)
    const { data: activities } = await supabase
      .from('activities')
      .select('message, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      tasks: taskCounts,
      agents: (agents ?? []).map((a) => ({ name: a.name, status: a.status })),
      recent_activities: (activities ?? []).map((a) => ({
        message: a.message,
        created_at: a.created_at,
      })),
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[openclaw/report] error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

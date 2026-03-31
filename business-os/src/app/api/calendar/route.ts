import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Validate date string format (YYYY-MM-DD)
function isValidDate(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str)
}

// GET — fetch calendar events for date range
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') || new Date().toISOString().split('T')[0]
  const to = searchParams.get('to') || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  if (!isValidDate(from) || !isValidDate(to)) {
    return NextResponse.json({ events: [] })
  }

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_time', `${from}T00:00:00`)
    .lte('end_time', `${to}T23:59:59`)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Calendar fetch error:', error)
    return NextResponse.json({ events: [] })
  }

  // Map DB columns to frontend CalendarEvent interface
  const events = (data || []).map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    start: e.start_time,
    end: e.end_time,
    allDay: e.all_day,
    account: e.account,
    color: e.color,
    location: e.location,
    taskId: e.task_id,
  }))

  return NextResponse.json({ events })
}

// POST — create a new event
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, start, end, allDay, account, color, location } = body

  if (!title || !start || !end) {
    return NextResponse.json({ error: 'title, start, end required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      start_time: start,
      end_time: end,
      all_day: allDay ?? false,
      account: account || 'personal',
      color: color || null,
      location: location || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    event: {
      id: data.id,
      title: data.title,
      description: data.description,
      start: data.start_time,
      end: data.end_time,
      allDay: data.all_day,
      account: data.account,
      color: data.color,
      location: data.location,
    },
  })
}

// PATCH — update an event
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  // Map frontend field names to DB columns
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.start !== undefined) dbUpdates.start_time = updates.start
  if (updates.end !== undefined) dbUpdates.end_time = updates.end
  if (updates.allDay !== undefined) dbUpdates.all_day = updates.allDay
  if (updates.account !== undefined) dbUpdates.account = updates.account
  if (updates.color !== undefined) dbUpdates.color = updates.color
  if (updates.location !== undefined) dbUpdates.location = updates.location

  const { data, error } = await supabase
    .from('calendar_events')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    event: {
      id: data.id,
      title: data.title,
      description: data.description,
      start: data.start_time,
      end: data.end_time,
      allDay: data.all_day,
      account: data.account,
      color: data.color,
      location: data.location,
    },
  })
}

// DELETE — remove an event
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id } = body

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

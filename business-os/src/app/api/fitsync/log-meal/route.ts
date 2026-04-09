import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, meal_type, calories, protein_g, carbs_g, fat_g, fiber_g, image_url, ai_analysis, ai_confidence } = body

    if (!name || !calories) {
      return NextResponse.json({ error: 'Name and calories required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('fs_meals')
      .insert({
        user_id: user.id,
        name,
        meal_type,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        fiber_g,
        image_url,
        ai_analysis,
        ai_confidence,
      })
      .select()
      .single()

    if (error) {
      console.error('[FitSync] Log meal error:', error)
      return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[FitSync] Log meal error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`

    const { data } = await supabase
      .from('fs_meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', startOfDay)
      .lte('logged_at', endOfDay)
      .order('logged_at', { ascending: false })

    return NextResponse.json(data ?? [])
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

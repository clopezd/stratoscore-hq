/**
 * GET/PUT /api/bidhunter/profile
 *
 * Gestión del perfil de Tico Restoration.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function GET() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('bh_tico_profile')
      .select('*')
      .limit(1)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = getAdminClient()

    const { data: existing } = await supabase
      .from('bh_tico_profile')
      .select('id')
      .limit(1)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('bh_tico_profile')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

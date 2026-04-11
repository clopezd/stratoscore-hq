/**
 * GET /api/bidhunter/documents/[id] — Get single document details
 * DELETE /api/bidhunter/documents/[id] — Delete document + storage + extracted data
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { deleteDocument } from '@/features/bidhunter/services/pdfService'

export const runtime = 'nodejs'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  const { id } = await params
  const supabase = getAdmin()

  const { data: doc, error } = await supabase
    .from('bh_opportunity_documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Also get extracted data if available
  const { data: extracted } = await supabase
    .from('bh_extracted_data')
    .select('*')
    .eq('document_id', id)
    .single()

  return NextResponse.json({ ...doc, extracted_data: extracted || null })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  const { id } = await params
  try {
    await deleteDocument(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

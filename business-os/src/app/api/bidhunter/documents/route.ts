/**
 * GET /api/bidhunter/documents?opportunity_id=xxx
 * POST /api/bidhunter/documents
 *   - FormData mode: file ≤50MB → uploads to Supabase Storage
 *   - JSON mode: file >50MB → text extracted in browser, only metadata + text saved
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  uploadDocumentStream,
  createTextOnlyDocument,
  getDocuments,
} from '@/features/bidhunter/services/pdfService'

export const runtime = 'nodejs'
export const maxDuration = 300
export const maxSize = '300mb'

export async function GET(req: NextRequest) {
  const opportunityId = req.nextUrl.searchParams.get('opportunity_id')
  if (!opportunityId) {
    return NextResponse.json({ error: 'opportunity_id required' }, { status: 400 })
  }

  try {
    const docs = await getDocuments(opportunityId)
    return NextResponse.json(docs)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    // JSON mode: large PDF — text already extracted in browser
    if (contentType.includes('application/json')) {
      const body = await req.json()
      const { opportunity_id, document_type, filename, file_size, raw_text, page_count } = body

      if (!opportunity_id || !filename || !raw_text) {
        return NextResponse.json(
          { error: 'opportunity_id, filename, and raw_text required' },
          { status: 400 },
        )
      }

      const doc = await createTextOnlyDocument(
        opportunity_id,
        filename,
        file_size || 0,
        document_type || 'other',
        raw_text,
        page_count || null,
      )
      return NextResponse.json(doc)
    }

    // FormData mode: normal PDF ≤50MB — upload to Storage
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const opportunityId = formData.get('opportunity_id') as string | null
    const documentType = (formData.get('document_type') as string) || 'other'

    if (!file || !opportunityId) {
      return NextResponse.json(
        { error: `file and opportunity_id required (file: ${!!file}, opp: ${!!opportunityId})` },
        { status: 400 },
      )
    }

    const doc = await uploadDocumentStream(opportunityId, file, documentType)
    return NextResponse.json(doc)
  } catch (err) {
    console.error('[BH Documents POST] Error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

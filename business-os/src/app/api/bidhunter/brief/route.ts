/**
 * GET /api/bidhunter/brief?opportunity_id=xxx
 *
 * Returns full intelligence brief for an opportunity:
 * - Opportunity details + score + justification
 * - All documents with extraction data + source info
 * - Pricing breakdown
 * - Deep scan data (files analyzed, scope matches)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAggregatedExtraction } from '@/features/bidhunter/services/pdfService'
import { buildBidFormData, generateBidForm } from '@/features/bidhunter/services/bidFormService'
import type { Opportunity, BidEstimate } from '@/features/bidhunter/types'

export const runtime = 'nodejs'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET(req: NextRequest) {
  const opportunityId = req.nextUrl.searchParams.get('opportunity_id')
  if (!opportunityId) {
    return NextResponse.json({ error: 'opportunity_id required' }, { status: 400 })
  }

  try {
    const supabase = getAdmin()

    // Get opportunity with score
    const { data: opp, error } = await supabase
      .from('bh_opportunities')
      .select('*, bh_opportunity_scores(score, justification, matching_services, sdvosb_bonus, bid_estimate, scored_at)')
      .eq('id', opportunityId)
      .single()

    if (error || !opp) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Get all documents with extracted data
    const { data: documents } = await supabase
      .from('bh_opportunity_documents')
      .select('id, filename, document_type, file_size, extraction_status, extraction_method, ocr_processed, ocr_confidence, extracted_at, uploaded_at')
      .eq('opportunity_id', opportunityId)
      .order('uploaded_at', { ascending: false })

    // Get extracted data per document
    const { data: extractions } = await supabase
      .from('bh_extracted_data')
      .select('*')
      .eq('opportunity_id', opportunityId)

    // Get aggregated extraction
    const aggregated = await getAggregatedExtraction(opportunityId)

    // Get pricing
    const bidEstimate = opp.bh_opportunity_scores?.bid_estimate as BidEstimate | null
    let pricing = null
    try {
      const formData = buildBidFormData(opp as unknown as Opportunity, aggregated, bidEstimate)
      const result = generateBidForm(formData)
      pricing = result.pricing
    } catch { /* pricing optional */ }

    // Get pipeline log for this opportunity
    const { data: logs } = await supabase
      .from('bh_pipeline_log')
      .select('action, details, created_at')
      .contains('details', { opportunity_id: opportunityId })
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      opportunity: opp,
      score: opp.bh_opportunity_scores || null,
      documents: documents || [],
      extractions: extractions || [],
      aggregated,
      pricing,
      logs: logs || [],
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

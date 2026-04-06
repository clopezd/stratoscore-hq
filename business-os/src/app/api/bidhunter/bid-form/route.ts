/**
 * GET /api/bidhunter/bid-form?opportunity_id=xxx
 *
 * Generates and downloads a filled bid form Excel for an opportunity.
 * Uses extracted PDF data (finish schedule sqft) when available,
 * falls back to geometric estimation from building sqft + height.
 *
 * Returns: .xlsx file download
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
      .select('*, bh_opportunity_scores(bid_estimate)')
      .eq('id', opportunityId)
      .single()

    if (error || !opp) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    const opportunity = opp as Opportunity & { bh_opportunity_scores?: { bid_estimate: BidEstimate } }
    const bidEstimate = opportunity.bh_opportunity_scores?.bid_estimate ?? null

    // Get aggregated extraction data (from all PDFs)
    const extraction = await getAggregatedExtraction(opportunityId)

    // Build form data (PDF extraction > AI bid_estimate > geometric fallback)
    const formData = buildBidFormData(opportunity, extraction, bidEstimate)

    // Generate Excel
    const result = generateBidForm(formData)

    // Log
    await supabase.from('bh_pipeline_log').insert({
      action: 'bid_form_generated',
      details: {
        opportunity_id: opportunityId,
        title: opportunity.title,
        pricing: result.pricing,
      },
    })

    // Return as file download
    return new NextResponse(result.buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'X-Bid-Total': result.pricing.total.toString(),
        'X-Commission': result.pricing.commission5pct.toString(),
      },
    })
  } catch (err) {
    console.error('Bid form generation error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

/**
 * POST /api/bidhunter/bid-form
 *
 * Returns pricing preview without generating the file.
 * Used by the UI to show pricing before download.
 */
export async function POST(req: NextRequest) {
  try {
    const { opportunity_id } = await req.json()
    if (!opportunity_id) {
      return NextResponse.json({ error: 'opportunity_id required' }, { status: 400 })
    }

    const supabase = getAdmin()

    const { data: opp, error } = await supabase
      .from('bh_opportunities')
      .select('*, bh_opportunity_scores(bid_estimate)')
      .eq('id', opportunity_id)
      .single()

    if (error || !opp) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    const opportunity = opp as Opportunity & { bh_opportunity_scores?: { bid_estimate: BidEstimate } }
    const bidEstimate = opportunity.bh_opportunity_scores?.bid_estimate ?? null
    const extraction = await getAggregatedExtraction(opportunity_id)
    const formData = buildBidFormData(opportunity, extraction, bidEstimate)
    const result = generateBidForm(formData)

    return NextResponse.json({
      pricing: result.pricing,
      formData: {
        projectName: formData.projectName,
        jobLocation: formData.jobLocation,
        bidNumber: formData.bidNumber,
        exteriorSqft: formData.exteriorSqft,
        interiorSqft: formData.interiorSqft,
        stuccoSqft: formData.stuccoSqft,
        highRise: (formData.buildingFloors || 0) > 4,
        scopeDescription: formData.scopeDescription,
        dataSource: extraction ? 'pdf_extraction' : 'geometric_estimate',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

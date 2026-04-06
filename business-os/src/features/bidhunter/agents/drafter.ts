/**
 * Agente Redactor — BidHunter
 *
 * Genera propuestas de oferta profesionales:
 * - Cover letter dirigida al GC
 * - Scope of work detallado
 * - Pricing breakdown con tarifas de Tico
 * - Total amount
 *
 * LLM: Claude Sonnet via OpenRouter
 */

import type { Opportunity, OpportunityScore, TicoProfile, PricingLineItem } from '../types'
import { callWithFallback, parseJSON } from '../services/llmService'

interface DraftResult {
  cover_letter: string
  scope_of_work: string
  pricing_breakdown: PricingLineItem[]
  total_amount: number
}

function buildDraftPrompt(
  opportunity: Opportunity,
  score: OpportunityScore,
  profile: TicoProfile,
  options: { tone: string; language: string },
): string {
  const servicesText = profile.services
    .map(s => `- ${s.name}: ${s.keywords.join(', ')}`)
    .join('\n')

  const p = profile.pricing || {
    exterior_painting_sqft: 2.10,
    interior_painting_sqft: 2.35,
    stucco_repairs_sqft: 15.00,
    high_rise_surcharge_pct: 20,
    high_rise_floor_threshold: 4,
  }
  const est = score.bid_estimate
  const lang = options.language === 'es' ? 'Spanish' : 'English'

  const toneGuide = {
    professional: 'Professional and confident. Formal but approachable.',
    aggressive: 'Bold and competitive. Emphasize speed, value, and track record. Push for the win.',
    conservative: 'Conservative and careful. Emphasize quality, reliability, and risk mitigation.',
  }[options.tone] || 'Professional and confident.'

  return `You are a bid proposal writer for ${profile.company_name}, a construction subcontractor specializing in exterior painting, interior painting, and stucco repairs.

## Company Profile
- **Company:** ${profile.company_name}
- **SDVOSB Certified:** Yes (Service-Disabled Veteran-Owned Small Business)${profile.sdvosb_cert_number ? `\n- **Cert #:** ${profile.sdvosb_cert_number}` : ''}
- **Services:**
${servicesText}
- **Regions:** ${profile.preferred_regions?.join(', ') || 'Florida'}

## Pricing Rates (MUST use these exact rates):
- Exterior painting: $${p.exterior_painting_sqft}/sqft (includes materials)
- Interior painting: $${p.interior_painting_sqft}/sqft (includes materials)
- Stucco repairs: $${p.stucco_repairs_sqft}/sqft
- High-rise surcharge (>${p.high_rise_floor_threshold} floors): +${p.high_rise_surcharge_pct}%

## Opportunity Details:
- **Project:** ${opportunity.title}
- **General Contractor:** ${opportunity.gc_name || 'Unknown'}
- **GC Contact:** ${opportunity.gc_contact || 'N/A'}
- **Location:** ${opportunity.location || 'Unknown'}${opportunity.state_code ? `, ${opportunity.state_code}` : ''}
- **Estimated Value:** ${opportunity.estimated_value ? `$${opportunity.estimated_value.toLocaleString()}` : 'Unknown'}
- **Deadline:** ${opportunity.deadline || 'TBD'}
- **Trades Required:** ${opportunity.trades_required?.join(', ') || 'Not specified'}
- **Building Sqft:** ${opportunity.building_sqft ? `${opportunity.building_sqft.toLocaleString()} sqft` : 'Unknown'}
- **Floors:** ${opportunity.building_height_floors || 'Unknown'}
- **Scope Notes:** ${opportunity.scope_notes || 'N/A'}
- **Description:** ${opportunity.description || 'N/A'}
- **SDVOSB Eligible:** ${opportunity.is_sdvosb_eligible ? 'Yes' : 'No'}

## AI Score & Estimate:
- **Match Score:** ${score.score}/100
- **Matching Services:** ${score.matching_services?.join(', ') || 'N/A'}
- **Justification:** ${score.justification}
${est ? `- **Estimated Exterior Sqft:** ${est.exterior_sqft || 'N/A'}
- **Estimated Interior Sqft:** ${est.interior_sqft || 'N/A'}
- **Estimated Stucco Sqft:** ${est.stucco_sqft || 'N/A'}
- **Previous Total Estimate:** $${est.total_estimate?.toLocaleString() || 'N/A'}` : '- No previous estimate available'}

## Instructions:

Write the bid proposal in **${lang}**.

**Tone:** ${toneGuide}

Generate a JSON response with these fields:

1. **cover_letter**: A professional cover letter (3-5 paragraphs) addressed to the GC (use their name if available). Include:
   - Brief intro of ${profile.company_name}
   - Why we're a great fit for this project (reference matching services)
   ${opportunity.is_sdvosb_eligible ? '- Highlight SDVOSB certification advantage for this project' : ''}
   - Timeline commitment and next steps
   - Professional closing

2. **scope_of_work**: Detailed scope of work (numbered list) covering each trade/service we'd provide. Be specific about what's included and excluded.

3. **pricing_breakdown**: Array of line items, each with:
   - description: what the line item covers
   - quantity: number (sqft, units, etc.)
   - unit: "sqft", "ls" (lump sum), "each", etc.
   - unit_price: rate per unit (USE TICO'S EXACT RATES)
   - total: quantity × unit_price
   Include mobilization, cleanup, and any surcharges as separate line items.

4. **total_amount**: Sum of all line item totals.

Respond ONLY with valid JSON, no markdown wrapping:
{
  "cover_letter": "<string>",
  "scope_of_work": "<string>",
  "pricing_breakdown": [{"description": "", "quantity": 0, "unit": "", "unit_price": 0, "total": 0}],
  "total_amount": <number>
}`
}

export async function generateBidDraft(
  opportunity: Opportunity,
  score: OpportunityScore,
  profile: TicoProfile,
  options: { tone?: string; language?: string } = {},
): Promise<DraftResult> {
  const tone = options.tone || 'professional'
  const language = options.language || 'en'
  const prompt = buildDraftPrompt(opportunity, score, profile, { tone, language })

  const { content } = await callWithFallback({
    prompt,
    maxTokens: 3000,
    temperature: 0.4,
    label: 'Drafter',
  })

  const result: DraftResult = parseJSON(content)

  // Validate pricing totals
  if (result.pricing_breakdown && Array.isArray(result.pricing_breakdown)) {
    let sum = 0
    for (const item of result.pricing_breakdown) {
      item.total = Math.round(item.quantity * item.unit_price * 100) / 100
      sum += item.total
    }
    result.total_amount = Math.round(sum * 100) / 100
  }

  return result
}

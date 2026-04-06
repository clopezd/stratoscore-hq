/**
 * Agente Evaluador — BidHunter
 *
 * Recibe una oportunidad (enriquecida) + perfil Tico Restoration y genera:
 * - Score 0-100 con justificación
 * - Servicios que hacen match
 * - Si aplica bonus SDVOSB (+15 pts)
 * - Bid estimate basado en pricing de Tico ($2.10/sqft ext, $2.35/sqft int, $15/sqft stucco)
 *
 * LLM: Claude Sonnet via OpenRouter
 *
 * v2 (2026-04-04): Detección contextual de SDVOSB desde keywords federales/militares.
 * v3 (2026-04-05): Alineado a los 3 servicios reales de Tico (Steps to Bid):
 *   Exterior Painting, Interior Painting, Stucco Repairs.
 */

import type { Opportunity, TicoProfile, BidEstimate, AggregatedExtraction } from '../types'
import { enrichOpportunity } from '../services/enrichmentService'
import { callWithFallback, parseJSON } from '../services/llmService'

interface ScoringResult {
  score: number
  justification: string
  matching_services: string[]
  sdvosb_bonus: boolean
  bid_estimate: BidEstimate | null
}

function buildPdfContext(pdfData: AggregatedExtraction): string {
  const sections: string[] = []

  sections.push(`\n## EXTRACTED DATA FROM PROJECT DOCUMENTS (${pdfData.documents_count} PDF(s) analyzed)\n`)
  sections.push(`**⚠️ IMPORTANT: This data was extracted directly from bid documents and is MORE RELIABLE than the web listing description. Use these numbers for your estimate.**\n`)

  if (pdfData.scope_summary) {
    sections.push(`### Scope Summary (from specs):\n${pdfData.scope_summary}`)
  }

  if (pdfData.trades_in_scope.length > 0) {
    sections.push(`### Trades in Scope (from documents):\n${pdfData.trades_in_scope.join(', ')}`)
  }

  if (pdfData.exclusions.length > 0) {
    sections.push(`### Exclusions:\n${pdfData.exclusions.join(', ')}`)
  }

  // Finish schedule — the gold
  if (pdfData.finish_schedule.length > 0) {
    const items = pdfData.finish_schedule.map(f =>
      `- ${f.area}: ${f.finish_type} — **${f.sqft} sqft**${f.notes ? ` (${f.notes})` : ''}`
    ).join('\n')
    sections.push(`### Finish Schedule (EXACT sqft from documents):\n${items}`)
  }

  // Sqft totals
  const sqftLines: string[] = []
  if (pdfData.exterior_painting_sqft) sqftLines.push(`- Exterior painting: **${pdfData.exterior_painting_sqft.toLocaleString()} sqft**`)
  if (pdfData.interior_painting_sqft) sqftLines.push(`- Interior painting: **${pdfData.interior_painting_sqft.toLocaleString()} sqft**`)
  if (pdfData.stucco_sqft) sqftLines.push(`- Stucco: **${pdfData.stucco_sqft.toLocaleString()} sqft**`)
  if (pdfData.total_painting_sqft) sqftLines.push(`- **TOTAL painting: ${pdfData.total_painting_sqft.toLocaleString()} sqft**`)
  if (sqftLines.length > 0) {
    sections.push(`### Painting Square Footage (from documents — USE THESE for estimate):\n${sqftLines.join('\n')}`)
  }

  // Materials
  if (pdfData.materials.length > 0) {
    const mats = pdfData.materials.map(m => `- ${m.brand} ${m.product}${m.spec_section ? ` (${m.spec_section})` : ''}`).join('\n')
    sections.push(`### Materials Specified:\n${mats}`)
  }

  // Contract requirements
  const reqs: string[] = []
  if (pdfData.bonding_required != null) reqs.push(`- Bonding: ${pdfData.bonding_required ? `Required${pdfData.bonding_amount ? ` ($${pdfData.bonding_amount.toLocaleString()})` : ''}` : 'Not required'}`)
  if (pdfData.insurance_minimum != null) reqs.push(`- Insurance minimum: $${pdfData.insurance_minimum.toLocaleString()}`)
  if (pdfData.prevailing_wage != null) reqs.push(`- Prevailing wage: ${pdfData.prevailing_wage ? 'Yes (Davis-Bacon)' : 'No'}`)
  if (pdfData.sdvosb_requirement) reqs.push(`- SDVOSB: **${pdfData.sdvosb_requirement}** (from documents)`)
  if (pdfData.liquidated_damages != null) reqs.push(`- Liquidated damages: $${pdfData.liquidated_damages}/day`)
  if (reqs.length > 0) {
    sections.push(`### Contract Requirements (from documents):\n${reqs.join('\n')}`)
  }

  // Deadlines from documents
  const deadlines: string[] = []
  if (pdfData.pre_bid_meeting) deadlines.push(`- Pre-bid meeting: ${pdfData.pre_bid_meeting}`)
  if (pdfData.bid_due_date) deadlines.push(`- Bid due: ${pdfData.bid_due_date}`)
  if (pdfData.project_start_date) deadlines.push(`- Project start: ${pdfData.project_start_date}`)
  if (pdfData.project_completion_date) deadlines.push(`- Completion: ${pdfData.project_completion_date}`)
  if (deadlines.length > 0) {
    sections.push(`### Deadlines (from documents):\n${deadlines.join('\n')}`)
  }

  if (pdfData.avg_confidence != null) {
    sections.push(`\n_PDF extraction confidence: ${(pdfData.avg_confidence * 100).toFixed(0)}%_`)
  }

  return sections.join('\n\n')
}

function buildPrompt(opportunity: Opportunity, profile: TicoProfile, pdfData?: AggregatedExtraction | null): string {
  const servicesText = profile.services
    .map(s => `- ${s.name}: ${s.keywords.join(', ')}`)
    .join('\n')

  const regionsText = profile.preferred_regions?.join(', ') || 'Any'
  const statesText = profile.preferred_states?.join(', ') || 'Any'
  const minVal = profile.min_project_value || 0
  const maxVal = profile.max_project_value ? `$${profile.max_project_value.toLocaleString()}` : 'No limit'
  const p = profile.pricing || {
    exterior_painting_sqft: 2.10,
    interior_painting_sqft: 2.35,
    stucco_repairs_sqft: 15.00,
    high_rise_surcharge_pct: 20,
    high_rise_floor_threshold: 4,
  }

  // Enrich opportunity data from text analysis
  const enrichment = enrichOpportunity(opportunity)
  const effectiveLocation = enrichment.location || opportunity.location || 'Unknown'
  const effectiveState = enrichment.state_code || opportunity.state_code || ''
  const effectiveSDVOSB = enrichment.is_sdvosb_eligible || opportunity.is_sdvosb_eligible
  const effectiveTrades = (opportunity.trades_required?.length ? opportunity.trades_required : enrichment.trades_detected) || []

  // Build SDVOSB context for the LLM
  let sdvosbContext = ''
  if (enrichment.sdvosb_signals.length > 0) {
    sdvosbContext = `\n\n### SDVOSB / Federal Signals Detected:\n${enrichment.sdvosb_signals.map(s => `- ${s}`).join('\n')}\n**This project has federal/military indicators. Tico has SDVOSB certification which provides a structural competitive advantage on these projects.**`
  }

  return `You are a construction bid evaluator and estimator for ${profile.company_name}. Your job is to:
1. Score how well a construction opportunity matches the company's capabilities
2. Generate a bid estimate based on the company's pricing formulas

## Company Profile: ${profile.company_name}

### Services Offered (these are Tico's ONLY 3 services):
${servicesText}

**CRITICAL: Tico ONLY does these 3 services: Exterior Painting, Interior Painting, and Stucco Repairs. If a project does not involve any of these 3 trades, it is NOT a match. Do NOT score projects that only need waterproofing, drywall, carpentry, etc.**

### Preferences:
- Preferred Regions (Florida): ${regionsText}
- Preferred States: ${statesText}
- Project Value Range: $${minVal.toLocaleString()} - ${maxVal}
- SDVOSB Certified: Yes (Service-Disabled Veteran-Owned Small Business)
- SDVOSB Priority Boost: +${profile.sdvosb_priority_boost} points for eligible federal/diversity projects
- The company actively bids on projects across Florida, and occasionally out of state for high-value or federal opportunities

### Pricing Formulas:
- Exterior painting: $${p.exterior_painting_sqft}/sqft (includes materials)
- Interior painting: $${p.interior_painting_sqft}/sqft (includes materials)
- Stucco repairs: $${p.stucco_repairs_sqft}/sqft
- Buildings over ${p.high_rise_floor_threshold} floors: +${p.high_rise_surcharge_pct}% surcharge for equipment
- These are Tico's actual rates — use them for estimation

## Opportunity to Evaluate:

- **Title:** ${opportunity.title}
- **Description:** ${opportunity.description || 'N/A'}
- **General Contractor:** ${opportunity.gc_name || 'Unknown'}
- **Location:** ${effectiveLocation}${effectiveState ? `, ${effectiveState}` : ''}
- **Estimated Value:** ${opportunity.estimated_value ? `$${opportunity.estimated_value.toLocaleString()}` : 'Unknown'}
- **Deadline:** ${opportunity.deadline || 'Unknown'}
- **Trades Required:** ${effectiveTrades.length > 0 ? effectiveTrades.join(', ') : 'Not specified'}
- **SDVOSB Eligible:** ${effectiveSDVOSB ? 'Yes' : 'No / Unknown'}
- **Building Sqft:** ${opportunity.building_sqft ? `${opportunity.building_sqft.toLocaleString()} sqft` : 'Unknown'}
- **Building Height:** ${opportunity.building_height_floors ? `${opportunity.building_height_floors} floors` : 'Unknown'}
- **Scope Notes:** ${opportunity.scope_notes || 'N/A'}
${sdvosbContext}
${pdfData && pdfData.documents_count > 0 ? buildPdfContext(pdfData) : ''}
## Scoring Criteria (weight each accordingly):

1. **Trade Match (40%):** Does the project need exterior painting, interior painting, or stucco repairs?
   - Match with ANY of Tico's 3 services = strong signal.
   - Multiple trade matches (e.g. exterior + interior + stucco) = higher score.
   - A single match should score this category at least 60%.
   - If the project ONLY needs trades Tico doesn't do (waterproofing, drywall, carpentry, etc.) → score 0-10% for this category.

2. **Location Match (15%):** Is the project in a preferred region/state?
   - Florida preferred regions (${regionsText}): 100%
   - Other Florida locations: 70%
   - Out of state but nearby (GA, AL): 40%
   - Far out of state: 20%
   - Unknown location but mentions FL city in text: treat as Florida

3. **Value Fit (10%):** Does the estimated value fall within the company's preferred range?
   - **MINIMUM PROJECT VALUE: $${minVal.toLocaleString()}.** If your bid estimate total is below this threshold, set score to maximum 50 and note "Below minimum project value" in justification.
   - If value is unknown, score this at 50% (neutral, don't penalize missing data).

4. **SDVOSB Advantage (30%):** The company has SDVOSB certification. This is a MAJOR competitive advantage.
   - Detect SDVOSB eligibility from CONTEXT, not just the boolean field. Look for:
     * VA Medical Center, VA Healthcare, Veterans Affairs → SDVOSB-eligible (federal)
     * NAS (Naval Air Station), Navy, Air Force Base, Army, Coast Guard → SDVOSB-eligible (military)
     * Davis-Bacon wages, Buy American Act, prevailing wage → federal project indicators
     * "federal", "government", GSA, USACE → federal
     * 8(a), HUBZone, set-aside, veteran preference → explicit SDVOSB
   - Apply tiered bonus:
     * Federal set-aside / 8(a) / explicit SDVOSB requirement → +${profile.sdvosb_priority_boost + 5} points
     * Federal/military project (VA, NAS, etc.) → +${profile.sdvosb_priority_boost} points
     * Davis-Bacon / prevailing wage → +${Math.max(profile.sdvosb_priority_boost - 5, 5)} points
     * No federal/SDVOSB signals → 0 points
   - IMPORTANT: A VA Medical Center project IS a federal project even if "is_sdvosb_eligible" is marked false.

5. **Timeline Feasibility (5%):** Is the deadline reasonable?

## Bid Estimate Instructions:

${pdfData && pdfData.total_painting_sqft ? `**PDF DATA AVAILABLE — USE EXACT SQFT FROM DOCUMENTS:**
- Use the exact sqft numbers from the "Extracted Data from Project Documents" section above
- Do NOT estimate or guess — the document provides real measurements
- Apply Tico's rates to the EXACT sqft provided` : `Based on the project description, trades required, and any available square footage data, estimate the bid:
- If you cannot determine sqft, estimate based on the project description and typical building sizes`}
- If the description mentions exterior painting, calculate at $${p.exterior_painting_sqft}/sqft
- If the description mentions interior painting, calculate at $${p.interior_painting_sqft}/sqft
- If stucco repairs are mentioned, calculate at $${p.stucco_repairs_sqft}/sqft
- If building is over ${p.high_rise_floor_threshold} floors, add ${p.high_rise_surcharge_pct}% surcharge
- If the project does NOT involve any of Tico's 3 services, set all estimate fields to null and explain in estimate_notes

## Instructions:

Score 0-100. Apply SDVOSB bonus where detected (cap at 100).

**Scoring floor guidance:**
- If at least ONE of the 3 services matches → minimum score 50
- If service match + Florida location → minimum score 65
- If service match + Florida preferred region → minimum score 70
- If service match + SDVOSB/federal → minimum score 75
- If NO service matches at all → maximum score 25 (poor fit)

Respond ONLY with valid JSON, no markdown:
{
  "score": <number 0-100>,
  "justification": "<2-3 sentence explanation of the score>",
  "matching_services": ["<service names that match>"],
  "sdvosb_bonus": <true if SDVOSB bonus was applied>,
  "bid_estimate": {
    "exterior_sqft": <number or null>,
    "exterior_total": <number or null>,
    "interior_sqft": <number or null>,
    "interior_total": <number or null>,
    "stucco_sqft": <number or null>,
    "stucco_total": <number or null>,
    "high_rise_surcharge": <number or null if building <= ${p.high_rise_floor_threshold} floors>,
    "total_estimate": <number — sum of all line items + surcharge>,
    "estimate_notes": "<brief explanation of how you estimated the sqft and any assumptions>"
  }
}`
}

export async function evaluateOpportunity(
  opportunity: Opportunity,
  profile: TicoProfile,
  pdfData?: AggregatedExtraction | null,
): Promise<ScoringResult> {
  const prompt = buildPrompt(opportunity, profile, pdfData)

  const { content } = await callWithFallback({
    prompt,
    maxTokens: pdfData ? 1200 : 800,
    temperature: 0.3,
    label: 'Evaluator',
  })

  const result: ScoringResult = parseJSON(content)

  // Clamp score
  result.score = Math.max(0, Math.min(100, Math.round(result.score)))

  // Enforce minimum project value — cap score at 50 if bid estimate is below threshold
  const minProjectValue = profile.min_project_value || 0
  if (minProjectValue > 0 && result.bid_estimate?.total_estimate) {
    if (result.bid_estimate.total_estimate < minProjectValue) {
      result.score = Math.min(result.score, 50)
      result.justification = `[Below $${minProjectValue.toLocaleString()} minimum] ${result.justification}`
    }
  }

  return result
}

// ── Batch scoring: up to 5 opportunities per LLM call ──

export const BATCH_SIZE = 5

interface BatchItem {
  opportunity: Opportunity
  pdfData?: AggregatedExtraction | null
}

function buildBatchPrompt(items: BatchItem[], profile: TicoProfile): string {
  const servicesText = profile.services
    .map(s => `- ${s.name}: ${s.keywords.join(', ')}`)
    .join('\n')

  const regionsText = profile.preferred_regions?.join(', ') || 'Any'
  const statesText = profile.preferred_states?.join(', ') || 'Any'
  const minVal = profile.min_project_value || 0
  const maxVal = profile.max_project_value ? `$${profile.max_project_value.toLocaleString()}` : 'No limit'
  const p = profile.pricing || {
    exterior_painting_sqft: 2.10,
    interior_painting_sqft: 2.35,
    stucco_repairs_sqft: 15.00,
    high_rise_surcharge_pct: 20,
    high_rise_floor_threshold: 4,
  }

  const opportunitiesText = items.map((item, idx) => {
    const opp = item.opportunity
    const enrichment = enrichOpportunity(opp)
    const loc = enrichment.location || opp.location || 'Unknown'
    const state = enrichment.state_code || opp.state_code || ''
    const sdvosb = enrichment.is_sdvosb_eligible || opp.is_sdvosb_eligible
    const trades = (opp.trades_required?.length ? opp.trades_required : enrichment.trades_detected) || []

    let section = `### OPPORTUNITY ${idx + 1} (id: "${opp.id}")
- Title: ${opp.title}
- Description: ${(opp.description || 'N/A').slice(0, 500)}
- GC: ${opp.gc_name || 'Unknown'}
- Location: ${loc}${state ? `, ${state}` : ''}
- Value: ${opp.estimated_value ? `$${opp.estimated_value.toLocaleString()}` : 'Unknown'}
- Deadline: ${opp.deadline || 'Unknown'}
- Trades: ${trades.length > 0 ? trades.join(', ') : 'Not specified'}
- SDVOSB: ${sdvosb ? 'Yes' : 'No'}
- Sqft: ${opp.building_sqft ? opp.building_sqft.toLocaleString() : 'Unknown'}
- Floors: ${opp.building_height_floors || 'Unknown'}`

    if (enrichment.sdvosb_signals.length > 0) {
      section += `\n- SDVOSB Signals: ${enrichment.sdvosb_signals.join('; ')}`
    }
    if (item.pdfData && item.pdfData.documents_count > 0) {
      section += `\n` + buildPdfContext(item.pdfData)
    }
    return section
  }).join('\n\n')

  return `You are a bid evaluator for ${profile.company_name}. Score EACH opportunity below.

## Company Profile
Services: ${servicesText}
CRITICAL: Tico ONLY does Exterior Painting, Interior Painting, Stucco Repairs.
Regions: ${regionsText} | States: ${statesText}
Value Range: $${minVal.toLocaleString()} - ${maxVal}
SDVOSB Certified: Yes (+${profile.sdvosb_priority_boost} bonus)
Pricing: Ext $${p.exterior_painting_sqft}/sqft, Int $${p.interior_painting_sqft}/sqft, Stucco $${p.stucco_repairs_sqft}/sqft
High-rise (>${p.high_rise_floor_threshold} floors): +${p.high_rise_surcharge_pct}%

## Scoring Rules
- Trade Match (40%): Must involve painting/stucco. No match → max 25.
- Location (15%): FL preferred regions 100%, other FL 70%, out of state 20-40%.
- Value (10%): Below $${minVal.toLocaleString()} minimum → max 50.
- SDVOSB (30%): Federal/VA/military → bonus. Detect from context.
- Timeline (5%): Reasonable deadline.
- Service match + FL → min 65. Service + SDVOSB → min 75. No match → max 25.

## ${items.length} OPPORTUNITIES TO EVALUATE

${opportunitiesText}

## RESPOND with a JSON ARRAY of ${items.length} objects (one per opportunity, same order). No markdown:
[
  {
    "id": "<opportunity id>",
    "score": <0-100>,
    "justification": "<2-3 sentences>",
    "matching_services": ["<service>"],
    "sdvosb_bonus": <boolean>,
    "bid_estimate": {
      "exterior_sqft": <number|null>, "exterior_total": <number|null>,
      "interior_sqft": <number|null>, "interior_total": <number|null>,
      "stucco_sqft": <number|null>, "stucco_total": <number|null>,
      "high_rise_surcharge": <number|null>,
      "total_estimate": <number>,
      "estimate_notes": "<brief>"
    }
  }
]`
}

export async function evaluateBatch(
  items: BatchItem[],
  profile: TicoProfile,
): Promise<Map<string, ScoringResult>> {
  const prompt = buildBatchPrompt(items, profile)

  const { content } = await callWithFallback({
    prompt,
    maxTokens: items.length * 500,
    temperature: 0.3,
    label: `Evaluator Batch(${items.length})`,
  })

  const results: Array<ScoringResult & { id: string }> = parseJSON(content)
  const map = new Map<string, ScoringResult>()

  const minProjectValue = profile.min_project_value || 0

  for (const r of results) {
    r.score = Math.max(0, Math.min(100, Math.round(r.score)))

    if (minProjectValue > 0 && r.bid_estimate?.total_estimate) {
      if (r.bid_estimate.total_estimate < minProjectValue) {
        r.score = Math.min(r.score, 50)
        r.justification = `[Below $${minProjectValue.toLocaleString()} minimum] ${r.justification}`
      }
    }

    map.set(r.id, {
      score: r.score,
      justification: r.justification,
      matching_services: r.matching_services,
      sdvosb_bonus: r.sdvosb_bonus,
      bid_estimate: r.bid_estimate,
    })
  }

  return map
}

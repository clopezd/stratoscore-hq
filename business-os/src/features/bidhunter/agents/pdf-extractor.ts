/**
 * Agente PDF Extractor — BidHunter
 *
 * Recibe texto crudo de un PDF de licitación y extrae datos estructurados:
 * - Scope of work real (trades, exclusiones)
 * - Finish schedule con sqft exactos por tipo de acabado
 * - Requisitos contractuales (bonding, insurance, SDVOSB, prevailing wage)
 * - Deadlines (pre-bid, due date, start, completion)
 * - Materiales especificados
 *
 * LLM: Claude Sonnet via OpenRouter
 */

import type { ExtractedData, DocumentType } from '../types'
import { callWithFallback, parseJSON } from '../services/llmService'

type ExtractionResult = Omit<ExtractedData, 'id' | 'opportunity_id' | 'document_id' | 'extracted_at'>

export interface KeywordAudit {
  total_lines: number
  total_chars: number
  primary_hits: number
  secondary_hits: number
  lines_selected: number
  keywords: { keyword: string; type: 'primary' | 'secondary'; count: number; pages: number[] }[]
  drawing_samples: { line: number; text: string }[]
}

/**
 * PAINTING-FOCUSED text filter.
 * Priority keywords (high weight): painting, drawings, finish
 * Secondary keywords: coatings, stucco, sqft, bonding, deadlines, SDVOSB
 *
 * For a 275MB spec PDF, this filters down to only the sections Tico cares about.
 */

// High-priority: these are the sections that make or break a painting bid
const PRIMARY_KEYWORDS = [
  'painting', 'paint', 'painter',
  'finish', 'finishes', 'finish schedule', 'finished',
  'drawing', 'drawings',
  'coating', 'coatings',
  'stucco', 'plaster', 'skim coat',
  'primer', 'priming',
  'color', 'color schedule',
  'sherwin', 'benjamin moore', 'ppg', 'behr', 'dunn-edwards',
  'division 09', 'section 09',
  '09 91', '09 90', '09 97', '09 96', '09 72', '09 67', // CSI painting/finish sections
]

// Secondary: contract terms a sub needs to know
const SECONDARY_KEYWORDS = [
  'sqft', 'sq ft', 'square feet', 'square foot', 'sf',
  'exterior', 'interior', 'facade', 'trim', 'ceiling', 'wall',
  'bond', 'bonding', 'insurance', 'sdvosb', 'veteran', 'set-aside', '8(a)', 'hubzone',
  'prevailing wage', 'davis-bacon', 'liquidated damages',
  'pre-bid', 'bid due', 'completion date', 'start date', 'deadline', 'response date',
  'scope of work', 'specification',
  'waterproof', 'sealant', 'caulk', 'restoration',
  'subcontract', 'sub-contract',
  'drywall', 'gypsum', 'wallcovering', 'wallpaper',
  'epoxy', 'urethane', 'latex', 'acrylic', 'alkyd', 'enamel',
  'mil', 'dft', 'dry film thickness', 'wet film',
  'preparation', 'prep', 'sanding', 'scraping', 'pressure wash', 'power wash',
]

function prepareText(rawText: string, _documentType: DocumentType): { text: string; audit: KeywordAudit } {
  const MAX_CHARS = 80_000 // ~20k tokens

  if (rawText.length <= MAX_CHARS) {
    // Even for short docs, compute keyword audit
    const audit = computeKeywordAudit(rawText)
    return { text: rawText, audit }
  }

  const lines = rawText.split('\n')

  // Score each line: primary keywords = 3 pts, secondary = 1 pt
  const scored = lines.map((line, idx) => {
    const lower = line.toLowerCase()
    let score = 0
    for (const kw of PRIMARY_KEYWORDS) {
      if (lower.includes(kw)) score += 3
    }
    for (const kw of SECONDARY_KEYWORDS) {
      if (lower.includes(kw)) score += 1
    }
    return { line, idx, score }
  })

  // Always keep first 150 lines (TOC, project summary) and last 30 (signatures, addenda)
  const header = lines.slice(0, 150).join('\n')
  const footer = lines.slice(-30).join('\n')

  // Collect relevant sections with 10 lines context (painting specs need surrounding context)
  const relevantIndices = new Set<number>()
  for (const s of scored) {
    if (s.score >= 1) {
      const context = s.score >= 3 ? 15 : 8 // More context for primary hits
      for (let i = Math.max(0, s.idx - context); i <= Math.min(lines.length - 1, s.idx + context); i++) {
        relevantIndices.add(i)
      }
    }
  }

  const middleLines = Array.from(relevantIndices).sort((a, b) => a - b)
    .filter(i => i >= 150 && i < lines.length - 30)
    .map(i => lines[i])
    .join('\n')

  // Stats
  const primaryHits = scored.filter(s => s.score >= 3).length
  const secondaryHits = scored.filter(s => s.score >= 1 && s.score < 3).length

  // Build audit
  const audit = buildKeywordAuditFromScored(scored, lines.length, rawText.length, relevantIndices.size)

  let result = [
    `[DOCUMENT HEADER — First 150 lines]`,
    header,
    '',
    `[PAINTING-RELEVANT SECTIONS — ${primaryHits} primary hits, ${secondaryHits} secondary hits from ${lines.length} total lines]`,
    middleLines,
    '',
    `[DOCUMENT FOOTER — Last 30 lines]`,
    footer,
  ].join('\n')

  if (result.length > MAX_CHARS) {
    result = result.slice(0, MAX_CHARS) + '\n\n[... TRUNCATED ...]'
  }

  console.log(`[prepareText] ${lines.length} lines → ${result.length} chars (${primaryHits} primary, ${secondaryHits} secondary keyword hits)`)
  return { text: result, audit }
}

/** Compute keyword audit for short docs that skip the filter */
function computeKeywordAudit(rawText: string): KeywordAudit {
  const lines = rawText.split('\n')
  const scored = lines.map((line, idx) => {
    const lower = line.toLowerCase()
    let score = 0
    for (const kw of PRIMARY_KEYWORDS) { if (lower.includes(kw)) score += 3 }
    for (const kw of SECONDARY_KEYWORDS) { if (lower.includes(kw)) score += 1 }
    return { line, idx, score }
  })
  return buildKeywordAuditFromScored(scored, lines.length, rawText.length, lines.length)
}

function buildKeywordAuditFromScored(
  scored: { line: string; idx: number; score: number }[],
  totalLines: number,
  totalChars: number,
  linesSelected: number,
): KeywordAudit {
  const primaryHits = scored.filter(s => s.score >= 3).length
  const secondaryHits = scored.filter(s => s.score >= 1 && s.score < 3).length

  // Build a line→page mapping from "--- PAGE N ---" markers
  const lineToPage = new Map<number, number>()
  let currentPage = 1
  for (const s of scored) {
    const pageMatch = s.line.match(/^---\s*PAGE\s+(\d+)\s*---$/)
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10)
    }
    lineToPage.set(s.idx, currentPage)
  }

  const kwCounts = new Map<string, { type: 'primary' | 'secondary'; count: number; pages: Set<number> }>()
  for (const s of scored) {
    if (s.score < 1) continue
    const lower = s.line.toLowerCase()
    const page = lineToPage.get(s.idx) || 1
    for (const kw of PRIMARY_KEYWORDS) {
      if (lower.includes(kw)) {
        const existing = kwCounts.get(kw)
        if (existing) {
          existing.count++
          existing.pages.add(page)
        } else {
          kwCounts.set(kw, { type: 'primary', count: 1, pages: new Set([page]) })
        }
      }
    }
    for (const kw of SECONDARY_KEYWORDS) {
      if (lower.includes(kw)) {
        const existing = kwCounts.get(kw)
        if (existing) {
          existing.count++
          existing.pages.add(page)
        } else {
          kwCounts.set(kw, { type: 'secondary', count: 1, pages: new Set([page]) })
        }
      }
    }
  }

  const keywords = Array.from(kwCounts.entries())
    .map(([keyword, { type, count, pages }]) => ({
      keyword, type, count,
      pages: Array.from(pages).sort((a, b) => a - b),
    }))
    .sort((a, b) => b.count - a.count)

  const drawingLines = scored.filter(s => s.line.toLowerCase().includes('drawing'))
  const drawing_samples = drawingLines.slice(0, 5).map(dl => ({
    line: dl.idx + 1,
    text: dl.line.substring(0, 150).trim(),
  }))

  return {
    total_lines: totalLines,
    total_chars: totalChars,
    primary_hits: primaryHits,
    secondary_hits: secondaryHits,
    lines_selected: linesSelected,
    keywords,
    drawing_samples,
  }
}

function buildExtractionPrompt(text: string, documentType: DocumentType): string {
  return `You are a painting estimator's AI assistant. You work for Tico Restoration, a subcontractor in Florida specializing in Exterior Painting, Interior Painting, and Stucco Repairs.

You are NOT a general contractor. You ONLY care about PAINTING and STUCCO.

Your job: extract painting-specific data from this ${documentType === 'other' ? 'construction bid document' : documentType}.

## WHAT TO EXTRACT (in priority order):

### 1. PAINTING & FINISH SCHEDULE (THE GOLD — most important)
Search for these sections: "Finish Schedule", "Room Finish Schedule", "Interior Finishes", "Exterior Finishes", "Color Schedule", "Division 09", "Section 09 91 00"
Extract EVERY line item that involves painting, coating, or finishing:
- Area/room name
- Finish type (latex paint, epoxy, urethane, enamel, primer, stain, etc.)
- Square footage (sqft / SF) for each area
- Number of coats if specified
- Any notes (e.g., "match existing", "2 coats min")

### 2. SQUARE FOOTAGE BREAKDOWN
- Total painting sqft (all surfaces combined)
- Exterior painting sqft (facades, exterior walls, trim, doors, railings)
- Interior painting sqft (walls, ceilings, doors, frames, trim, casework)
- Stucco sqft (new stucco, stucco repair, re-stucco)
IMPORTANT: Only use numbers EXPLICITLY stated. Building gross sqft ≠ paintable sqft. A 16,000 SF building might have 45,000 SF of paintable surface.

### 3. PAINT SPECIFICATIONS & MATERIALS
Look for: Sherwin-Williams, Benjamin Moore, PPG, Dunn-Edwards, or any brand/product names.
Also look for: MPI (Master Painters Institute) numbers, spec section numbers (09 91 XX), VOC limits, sheen levels (flat, eggshell, semi-gloss, high-gloss).

### 4. SURFACE PREPARATION REQUIREMENTS
- Pressure washing, scraping, sanding, priming requirements
- Lead paint abatement or testing
- Moisture testing requirements
- Surface prep standards (SSPC, NACE)

### 5. SCOPE — PAINTING ONLY
- Is painting a separate trade/bid package, or part of a GC scope?
- What specific painting work is included?
- What is EXCLUDED from painting scope?
- "trades_in_scope" should ONLY list Tico's 3 services: "Exterior Painting", "Interior Painting", "Stucco Repairs" — NOT general construction trades

### 6. CONTRACT REQUIREMENTS
- Bonding required? Amount?
- Insurance minimums
- SDVOSB / veteran set-aside or preference
- Prevailing wage / Davis-Bacon
- Liquidated damages ($/day)

### 7. DEADLINES
- Pre-bid meeting date
- Bid due date
- Project start date
- Project completion date

## RULES:
- Extract ONLY what the document explicitly states. NEVER estimate or assume.
- If painting is not explicitly mentioned or clearly in scope, say so in scope_summary and give LOW confidence.
- For trades_in_scope: ONLY list painting-related trades. Do NOT list "General Construction", "Architectural", "Interior Finishes" — be SPECIFIC: "Interior Wall Painting", "Ceiling Painting", "Exterior Stucco Repair", etc.
- Confidence score meaning:
  - 0.9-1.0: Found finish schedule with sqft, clear painting scope, materials specified
  - 0.7-0.8: Found painting scope but missing sqft details or finish schedule
  - 0.4-0.6: Painting mentioned but no specifics (sqft, materials, schedule)
  - 0.1-0.3: Painting barely mentioned or unclear if in scope
  - 0.0: No painting content found

## DOCUMENT TEXT:

${text}

## RESPOND WITH VALID JSON ONLY (no markdown, no code blocks):

{
  "scope_summary": "<2-3 sentences focused ONLY on the painting/coating/finish scope. Is painting clearly in scope? What type of painting work?>",
  "trades_in_scope": ["<painting-specific trade>"],
  "exclusions": ["<what is excluded from painting scope>"],
  "finish_schedule": [
    {"area": "<room/area name>", "finish_type": "<paint/coating type + sheen>", "sqft": <number or null>, "notes": "<coats, brand, prep, etc>"}
  ],
  "total_painting_sqft": <number or null>,
  "exterior_painting_sqft": <number or null>,
  "interior_painting_sqft": <number or null>,
  "stucco_sqft": <number or null>,
  "materials_specified": [
    {"brand": "<brand>", "product": "<product + sheen>", "spec_section": "<CSI section or MPI number or null>"}
  ],
  "bonding_required": <boolean or null>,
  "bonding_amount": <number or null>,
  "insurance_minimum": <number or null>,
  "prevailing_wage": <boolean or null>,
  "sdvosb_requirement": "<'set-aside' | 'preference' | 'mentioned' | null>",
  "liquidated_damages": <number per day or null>,
  "pre_bid_meeting": "<ISO date string or null>",
  "bid_due_date": "<ISO date string or null>",
  "project_start_date": "<ISO date string or null>",
  "project_completion_date": "<ISO date string or null>",
  "confidence_score": <0.0-1.0>
}`
}

function parseExtractionResponse(content: string): ExtractionResult {
  const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
  const extracted = JSON.parse(jsonStr)

  return {
    scope_summary: extracted.scope_summary || null,
    trades_in_scope: extracted.trades_in_scope || null,
    exclusions: extracted.exclusions || null,
    finish_schedule: extracted.finish_schedule || null,
    total_painting_sqft: extracted.total_painting_sqft ?? null,
    exterior_painting_sqft: extracted.exterior_painting_sqft ?? null,
    interior_painting_sqft: extracted.interior_painting_sqft ?? null,
    stucco_sqft: extracted.stucco_sqft ?? null,
    materials_specified: extracted.materials_specified || null,
    bonding_required: extracted.bonding_required ?? null,
    bonding_amount: extracted.bonding_amount ?? null,
    insurance_minimum: extracted.insurance_minimum ?? null,
    prevailing_wage: extracted.prevailing_wage ?? null,
    sdvosb_requirement: extracted.sdvosb_requirement || null,
    liquidated_damages: extracted.liquidated_damages ?? null,
    pre_bid_meeting: extracted.pre_bid_meeting || null,
    bid_due_date: extracted.bid_due_date || null,
    project_start_date: extracted.project_start_date || null,
    project_completion_date: extracted.project_completion_date || null,
    confidence_score: extracted.confidence_score ?? null,
    raw_extraction: extracted,
  }
}

/** Extract from text-based PDF */
export async function extractFromPdf(
  rawText: string,
  documentType: DocumentType,
): Promise<ExtractionResult> {
  const { text: preparedText, audit } = prepareText(rawText, documentType)
  const prompt = buildExtractionPrompt(preparedText, documentType)

  const { content, model } = await callWithFallback({
    prompt,
    maxTokens: 4000,
    temperature: 0.1,
    label: 'PDF Extractor',
    forceExpensive: true, // PDFs need strong model for accurate sqft/schedule extraction
  })

  const result = parseExtractionResponse(content)
  result.raw_extraction = { ...result.raw_extraction, keyword_audit: audit, model }
  return result
}

// ── Chunked extraction for large PDFs ──

const CHUNK_SIZE = 70_000 // ~17k tokens per chunk, leaving room for prompt

export interface ChunkProgress {
  current: number
  total: number
  chars: number
}

/**
 * Split text into chunks by page breaks or character limit.
 * Tries to split at page boundaries first, falls back to line boundaries.
 */
function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text]

  const chunks: string[] = []
  const pageBreaks = text.split(/\n-{3}\s*PAGE\s*BREAK\s*-{3}\n/i)

  if (pageBreaks.length > 1) {
    // PDF has page break markers — group pages into chunks
    let current = ''
    for (const page of pageBreaks) {
      if (current.length + page.length > CHUNK_SIZE && current.length > 0) {
        chunks.push(current)
        current = page
      } else {
        current += (current ? '\n\n--- PAGE BREAK ---\n\n' : '') + page
      }
    }
    if (current) chunks.push(current)
  } else {
    // No page breaks — split by lines at CHUNK_SIZE boundaries
    const lines = text.split('\n')
    let current = ''
    for (const line of lines) {
      if (current.length + line.length + 1 > CHUNK_SIZE && current.length > 0) {
        chunks.push(current)
        current = line
      } else {
        current += (current ? '\n' : '') + line
      }
    }
    if (current) chunks.push(current)
  }

  return chunks
}

/**
 * Merge multiple extraction results into one.
 * Arrays get concatenated, numbers get summed, singular fields take first non-null.
 */
function mergeExtractions(results: ExtractionResult[]): ExtractionResult {
  if (results.length === 1) return results[0]

  const allTrades = new Set<string>()
  const allExclusions = new Set<string>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allFinish: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allMaterials: any[] = []
  let totalPainting = 0, extPainting = 0, intPainting = 0, stuccoTotal = 0
  let confidenceSum = 0, confidenceCount = 0

  let scopeSummary: string | null = null
  let bondingRequired: boolean | null = null
  let bondingAmount: number | null = null
  let insuranceMin: number | null = null
  let prevailingWage: boolean | null = null
  let sdvosbReq: string | null = null
  let liquidatedDmg: number | null = null
  let preBid: string | null = null
  let bidDue: string | null = null
  let projStart: string | null = null
  let projEnd: string | null = null

  for (const r of results) {
    if (r.trades_in_scope) r.trades_in_scope.forEach(t => allTrades.add(t))
    if (r.exclusions) r.exclusions.forEach(e => allExclusions.add(e))
    if (r.finish_schedule) allFinish.push(...r.finish_schedule)
    if (r.materials_specified) allMaterials.push(...r.materials_specified)
    if (r.total_painting_sqft) totalPainting += r.total_painting_sqft
    if (r.exterior_painting_sqft) extPainting += r.exterior_painting_sqft
    if (r.interior_painting_sqft) intPainting += r.interior_painting_sqft
    if (r.stucco_sqft) stuccoTotal += r.stucco_sqft
    if (r.confidence_score != null) { confidenceSum += r.confidence_score; confidenceCount++ }

    if (!scopeSummary && r.scope_summary) scopeSummary = r.scope_summary
    if (bondingRequired == null && r.bonding_required != null) bondingRequired = r.bonding_required
    if (bondingAmount == null && r.bonding_amount != null) bondingAmount = r.bonding_amount
    if (insuranceMin == null && r.insurance_minimum != null) insuranceMin = r.insurance_minimum
    if (prevailingWage == null && r.prevailing_wage != null) prevailingWage = r.prevailing_wage
    if (!sdvosbReq && r.sdvosb_requirement) sdvosbReq = r.sdvosb_requirement
    if (liquidatedDmg == null && r.liquidated_damages != null) liquidatedDmg = r.liquidated_damages
    if (!preBid && r.pre_bid_meeting) preBid = r.pre_bid_meeting
    if (!bidDue && r.bid_due_date) bidDue = r.bid_due_date
    if (!projStart && r.project_start_date) projStart = r.project_start_date
    if (!projEnd && r.project_completion_date) projEnd = r.project_completion_date
  }

  return {
    scope_summary: scopeSummary,
    trades_in_scope: allTrades.size > 0 ? Array.from(allTrades) : null,
    exclusions: allExclusions.size > 0 ? Array.from(allExclusions) : null,
    finish_schedule: allFinish.length > 0 ? allFinish : null,
    total_painting_sqft: totalPainting || null,
    exterior_painting_sqft: extPainting || null,
    interior_painting_sqft: intPainting || null,
    stucco_sqft: stuccoTotal || null,
    materials_specified: allMaterials.length > 0 ? allMaterials : null,
    bonding_required: bondingRequired,
    bonding_amount: bondingAmount,
    insurance_minimum: insuranceMin,
    prevailing_wage: prevailingWage,
    sdvosb_requirement: sdvosbReq,
    liquidated_damages: liquidatedDmg,
    pre_bid_meeting: preBid,
    bid_due_date: bidDue,
    project_start_date: projStart,
    project_completion_date: projEnd,
    confidence_score: confidenceCount > 0 ? confidenceSum / confidenceCount : null,
    raw_extraction: { mode: 'chunked', chunks: results.length },
  }
}

/**
 * Extract from a large PDF text by splitting into chunks,
 * running each through the LLM, and merging results.
 *
 * @param onProgress - optional callback for progress tracking
 */
export async function extractFromPdfChunked(
  rawText: string,
  documentType: DocumentType,
  onProgress?: (progress: ChunkProgress) => void,
): Promise<ExtractionResult> {
  const chunks = splitIntoChunks(rawText)

  if (chunks.length === 1) {
    return extractFromPdf(rawText, documentType)
  }

  console.log(`[PDF Chunked] Splitting ${rawText.length} chars into ${chunks.length} chunks`)
  const results: ExtractionResult[] = []

  for (let i = 0; i < chunks.length; i++) {
    console.log(`[PDF Chunked] Processing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`)
    onProgress?.({ current: i + 1, total: chunks.length, chars: chunks[i].length })

    const result = await extractFromPdf(chunks[i], documentType)
    results.push(result)
  }

  const merged = mergeExtractions(results)
  merged.raw_extraction = {
    ...merged.raw_extraction,
    mode: 'chunked',
    chunks_count: chunks.length,
    chunk_sizes: chunks.map(c => c.length),
  }

  console.log(`[PDF Chunked] Merged ${results.length} chunks → confidence ${merged.confidence_score?.toFixed(2)}`)
  return merged
}

/** Extract from scanned/image PDF by sending base64 to Gemini (supports PDF natively) */
export async function extractFromPdfBuffer(
  pdfBuffer: Buffer,
  documentType: DocumentType,
): Promise<ExtractionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  // Limit: ~20MB for base64. If PDF is too large, truncate isn't possible — fail gracefully
  if (pdfBuffer.length > 15 * 1024 * 1024) {
    throw new Error('PDF too large for vision processing (max ~15MB)')
  }

  const base64 = pdfBuffer.toString('base64')
  const promptText = buildExtractionPrompt('(Analyze the attached PDF document below)', documentType)

  // Use Gemini 2.0 Flash via OpenRouter — natively supports PDF as image_url with data URI
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://stratoscore.app',
      'X-Title': 'BidHunter PDF Extractor (Vision)',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64}`,
              },
            },
            {
              type: 'text',
              text: promptText,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 3000,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenRouter vision error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  const result = parseExtractionResponse(content)
  // Vision mode: no text-based keyword audit available
  result.raw_extraction = { ...result.raw_extraction, keyword_audit: null, mode: 'vision' }
  return result
}

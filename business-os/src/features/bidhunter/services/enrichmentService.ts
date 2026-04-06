/**
 * Enrichment Service — BidHunter
 *
 * Analiza el texto de una oportunidad (title, description, scope_notes)
 * y extrae/infiere campos faltantes:
 *   - location & state_code (de menciones en el texto)
 *   - is_sdvosb_eligible (de keywords federales/militares)
 *   - trades_required (del formato "Trade: X" de BuildingConnected)
 *
 * Se ejecuta:
 *   1. Al importar desde Chrome Extension (pre-insert)
 *   2. Antes de scoring (para enriquecer datos incompletos)
 */

import type { Opportunity } from '../types'

// ── Florida cities → region mapping ──

const FL_CITIES: Record<string, string> = {
  // Miami-Dade
  'miami': 'Miami-Dade', 'miami beach': 'Miami-Dade', 'hialeah': 'Miami-Dade',
  'homestead': 'Miami-Dade', 'doral': 'Miami-Dade', 'coral gables': 'Miami-Dade',
  'kendall': 'Miami-Dade', 'aventura': 'Miami-Dade', 'miami gardens': 'Miami-Dade',
  'north miami': 'Miami-Dade', 'miami lakes': 'Miami-Dade', 'cutler bay': 'Miami-Dade',
  'key biscayne': 'Miami-Dade', 'sweetwater': 'Miami-Dade', 'medley': 'Miami-Dade',
  // Broward
  'fort lauderdale': 'Broward', 'ft lauderdale': 'Broward', 'hollywood': 'Broward',
  'pembroke pines': 'Broward', 'miramar': 'Broward', 'coral springs': 'Broward',
  'davie': 'Broward', 'plantation': 'Broward', 'sunrise': 'Broward',
  'pompano beach': 'Broward', 'deerfield beach': 'Broward', 'weston': 'Broward',
  'coconut creek': 'Broward', 'margate': 'Broward', 'tamarac': 'Broward',
  'lauderhill': 'Broward', 'lauderdale lakes': 'Broward',
  // Palm Beach
  'west palm beach': 'Palm Beach', 'palm beach': 'Palm Beach', 'boca raton': 'Palm Beach',
  'boynton beach': 'Palm Beach', 'delray beach': 'Palm Beach', 'jupiter': 'Palm Beach',
  'lake worth': 'Palm Beach', 'wellington': 'Palm Beach', 'royal palm beach': 'Palm Beach',
  'palm beach gardens': 'Palm Beach', 'riviera beach': 'Palm Beach',
  // Orlando area
  'orlando': 'Orlando', 'kissimmee': 'Orlando', 'sanford': 'Orlando',
  'winter park': 'Orlando', 'altamonte springs': 'Orlando', 'lake nona': 'Orlando',
  'clermont': 'Orlando', 'ocoee': 'Orlando', 'apopka': 'Orlando',
  'winter garden': 'Orlando', 'st cloud': 'Orlando', 'st. cloud': 'Orlando',
  // Tampa area
  'tampa': 'Tampa', 'st petersburg': 'Tampa', 'st. petersburg': 'Tampa',
  'clearwater': 'Tampa', 'brandon': 'Tampa', 'lakeland': 'Tampa',
  'riverview': 'Tampa', 'wesley chapel': 'Tampa', 'plant city': 'Tampa',
  // Other FL cities
  'sarasota': 'Sarasota', 'bradenton': 'Bradenton', 'palmetto': 'Palmetto',
  'port st lucie': 'Port St Lucie', 'port st. lucie': 'Port St Lucie',
  'fort myers': 'Fort Myers', 'ft myers': 'Fort Myers', 'naples': 'Naples',
  'cape coral': 'Cape Coral', 'jacksonville': 'Jacksonville', 'tallahassee': 'Tallahassee',
  'gainesville': 'Gainesville', 'ocala': 'Ocala', 'daytona beach': 'Daytona Beach',
  'pensacola': 'Pensacola', 'panama city': 'Panama City', 'leesburg': 'Leesburg',
  'key west': 'Key West', 'vero beach': 'Vero Beach', 'stuart': 'Stuart',
  'melbourne': 'Melbourne', 'titusville': 'Titusville', 'cocoa': 'Cocoa',
  'cocoa beach': 'Cocoa Beach', 'merritt island': 'Merritt Island',
}

// US state codes
const US_STATES: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY',
}

// State code → name (reverse lookup)
const STATE_CODE_SET = new Set(Object.values(US_STATES))

// ── SDVOSB / Federal detection keywords ──

const SDVOSB_STRONG_KEYWORDS = [
  'sdvosb', 'sdvo', 'service-disabled veteran', 'service disabled veteran',
  'vosb', 'veteran-owned', 'veteran owned',
  '8(a)', '8a set-aside', '8a set aside',
  'hubzone',
]

const FEDERAL_KEYWORDS = [
  'va medical', 'va healthcare', 'veterans affairs', 'veterans administration',
  'department of veterans', 'va hospital',
  'naval air station', 'nas ', 'navy ', 'naval ',
  'air force base', 'afb ',
  'army ', 'fort ', 'joint base',
  'coast guard', 'uscg',
  'federal ', 'gsa ', 'general services administration',
  'usace', 'corps of engineers',
  'davis-bacon', 'davis bacon', 'prevailing wage',
  'buy american act', 'buy american',
  'sam.gov', 'federal acquisition',
  'government ', 'govt ',
]

// ── Trades parsing from BC format ──

const TICO_TRADE_ALIASES: Record<string, string[]> = {
  'Exterior Painting': [
    'exterior painting', 'commercial painting', 'industrial painting',
    'painting', 'paint',
  ],
  'Interior Painting': [
    'interior painting',
  ],
  'Stucco Repairs': [
    'stucco', 'stucco repair', 'stucco repairs', 'eifs',
  ],
}

// ── Main enrichment function ──

export interface EnrichmentResult {
  location: string | null
  state_code: string | null
  is_sdvosb_eligible: boolean
  sdvosb_signals: string[]
  trades_detected: string[]
  enrichment_applied: boolean
}

/**
 * Enriquece una oportunidad extrayendo datos del texto.
 * NO muta el objeto original — retorna los campos extraídos.
 */
export function enrichOpportunity(opp: Partial<Opportunity>): EnrichmentResult {
  const text = [
    opp.title || '',
    opp.description || '',
    opp.scope_notes || '',
  ].join(' ')

  const textLower = text.toLowerCase()

  // 1. Extract location & state
  const { location, stateCode } = extractLocation(textLower, opp.title || '')

  // 2. Detect SDVOSB eligibility
  const { eligible, signals } = detectSDVOSB(textLower)

  // 3. Extract trades
  const trades = extractTrades(textLower)

  const enrichment_applied = !!(
    (!opp.location && location) ||
    (!opp.state_code && stateCode) ||
    (!opp.is_sdvosb_eligible && eligible) ||
    ((!opp.trades_required || opp.trades_required.length === 0) && trades.length > 0)
  )

  return {
    location: opp.location || location,
    state_code: opp.state_code || stateCode,
    is_sdvosb_eligible: opp.is_sdvosb_eligible || eligible,
    sdvosb_signals: signals,
    trades_detected: trades,
    enrichment_applied,
  }
}

/**
 * Aplica el enrichment a un objeto de oportunidad (muta in-place).
 * Retorna los signals detectados para logging.
 */
export function applyEnrichment(
  opp: Record<string, unknown>,
): { signals: string[]; trades: string[]; changed: boolean } {
  const result = enrichOpportunity(opp as Partial<Opportunity>)

  if (!result.enrichment_applied) {
    return { signals: result.sdvosb_signals, trades: result.trades_detected, changed: false }
  }

  if (!opp.location && result.location) opp.location = result.location
  if (!opp.state_code && result.state_code) opp.state_code = result.state_code
  if (!opp.is_sdvosb_eligible && result.is_sdvosb_eligible) opp.is_sdvosb_eligible = true
  if ((!opp.trades_required || (opp.trades_required as string[]).length === 0) && result.trades_detected.length > 0) {
    opp.trades_required = result.trades_detected
  }

  return { signals: result.sdvosb_signals, trades: result.trades_detected, changed: true }
}

// ── Internal helpers ──

function extractLocation(textLower: string, title: string): { location: string | null; stateCode: string | null } {
  let location: string | null = null
  let stateCode: string | null = null

  // Try FL cities first (sorted by length desc to match "port st lucie" before "st")
  const sortedCities = Object.entries(FL_CITIES).sort((a, b) => b[0].length - a[0].length)
  for (const [city, region] of sortedCities) {
    if (textLower.includes(city)) {
      // Capitalize properly
      location = `${region}, FL`
      stateCode = 'FL'
      break
    }
  }

  // If no FL city found, try to detect state from patterns like "City, FL" or "City, Florida"
  if (!stateCode) {
    // Match ", XX" where XX is a state code (2 uppercase letters after comma)
    const stateCodeMatch = (title + ' ' + textLower).match(/,\s*([A-Z]{2})\b/)
    if (stateCodeMatch && STATE_CODE_SET.has(stateCodeMatch[1])) {
      stateCode = stateCodeMatch[1]
    }

    // Match state names
    if (!stateCode) {
      for (const [stateName, code] of Object.entries(US_STATES)) {
        // Use word boundary to avoid false matches
        const regex = new RegExp(`\\b${stateName}\\b`, 'i')
        if (regex.test(textLower)) {
          stateCode = code
          break
        }
      }
    }

    // Try to extract city from title pattern "Project Name - City, ST"
    if (stateCode && !location) {
      const cityMatch = title.match(/[-–]\s*([^,]+),\s*[A-Z]{2}/)
      if (cityMatch) {
        location = `${cityMatch[1].trim()}, ${stateCode}`
      }
    }
  }

  return { location, stateCode }
}

function detectSDVOSB(textLower: string): { eligible: boolean; signals: string[] } {
  const signals: string[] = []

  // Check strong SDVOSB keywords
  for (const kw of SDVOSB_STRONG_KEYWORDS) {
    if (textLower.includes(kw)) {
      signals.push(`sdvosb_keyword: "${kw}"`)
    }
  }

  // Check federal/military keywords
  for (const kw of FEDERAL_KEYWORDS) {
    if (textLower.includes(kw)) {
      signals.push(`federal_signal: "${kw.trim()}"`)
    }
  }

  return {
    eligible: signals.length > 0,
    signals,
  }
}

function extractTrades(textLower: string): string[] {
  const detected = new Set<string>()

  // Method 1: Parse BC format "Trade: X Keywords: Y"
  const tradeMatch = textLower.match(/trade:\s*([^K]+?)(?:keywords:|$)/i)
  if (tradeMatch) {
    const tradeText = tradeMatch[1].trim()
    // Match against Tico's trade aliases
    for (const [tradeName, aliases] of Object.entries(TICO_TRADE_ALIASES)) {
      for (const alias of aliases) {
        if (tradeText.includes(alias)) {
          detected.add(tradeName)
          break
        }
      }
    }
  }

  // Method 2: Scan full text for trade keywords
  for (const [tradeName, aliases] of Object.entries(TICO_TRADE_ALIASES)) {
    if (detected.has(tradeName)) continue
    for (const alias of aliases) {
      if (textLower.includes(alias)) {
        detected.add(tradeName)
        break
      }
    }
  }

  return Array.from(detected)
}

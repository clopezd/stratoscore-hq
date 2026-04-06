/**
 * BidHunter Scraper — BuildingConnected
 *
 * Strategy: API Response Interception
 * Instead of parsing BC's React DOM (fragile, ~30% accuracy),
 * we intercept the XHR/fetch responses that BC's frontend makes
 * to its own backend API. These return clean, structured JSON.
 *
 * Flow:
 * 1. Login to BC (email/password or Autodesk SSO)
 * 2. Set up response interception to capture all API JSON
 * 3. Navigate to Bid Board → captured API responses contain bid list
 * 4. Navigate to each project → captured API responses contain details
 * 5. Download "Drawing" / painting-relevant PDFs and extract text
 * 6. Return structured data from JSON + PDF analysis, not from DOM parsing
 */

import puppeteer, { type Browser, type Page, type HTTPResponse } from 'puppeteer'

export interface ScrapedOpportunity {
  title: string
  description: string | null
  gc_name: string | null
  gc_contact: string | null
  location: string | null
  state_code: string | null
  deadline: string | null
  estimated_value: number | null
  trades_required: string[] | null
  is_sdvosb_eligible: boolean
  source_platform: 'buildingconnected'
  source_id: string | null
  raw_data: Record<string, unknown>
  scope_notes: string | null
  building_sqft: number | null
  building_height_floors: number | null
}

interface ScraperConfig {
  email: string
  password: string
  maxPages?: number
  headless?: boolean
  onProgress?: (msg: string) => void
}

/* ── Intercepted API data structures ──────────────────────────────── */

interface CapturedBid {
  id: string
  title: string
  gc_name: string | null
  gc_email: string | null
  gc_phone: string | null
  location: string | null
  state_code: string | null
  deadline: string | null
  estimated_value: number | null
  trades: string[]
  description: string | null
  project_url: string | null
  raw: Record<string, unknown>
}

interface CapturedDetail {
  id: string
  description: string | null
  scope: string | null
  trades: string[]
  files: string[]
  contacts: { name: string; email: string | null; phone: string | null }[]
  sqft: number | null
  floors: number | null
  raw: Record<string, unknown>
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

/* ── State codes ──────────────────────────────────────────────────── */

const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
])

function extractStateCode(location: string): string | null {
  const match = location.match(/\b([A-Z]{2})\b/)
  if (match && US_STATES.has(match[1])) return match[1]
  // Try from "City, State" pattern
  const csMatch = location.match(/,\s*([A-Z]{2})\b/)
  if (csMatch && US_STATES.has(csMatch[1])) return csMatch[1]
  return null
}

/* ── Painting detection ───────────────────────────────────────────── */

const PAINTING_KEYWORDS = [
  'painting', 'paint', 'painter', 'repaint', 'repainting',
  'finish schedule', 'finish sched',
  'exterior coating', 'interior coating',
  'primer', 'priming',
  'stucco', 'elastomeric',
  'wall finish', 'wall coating',
  'touch up', 'touch-up',
]

const PAINTING_TRADES = [
  'painting', 'paint', 'exterior painting', 'interior painting',
  'stucco', 'stucco repair',
]

function detectPainting(text: string, trades: string[]): { hasPainting: boolean; paintingNotes: string[] } {
  const lower = text.toLowerCase()
  const notes: string[] = []

  for (const trade of trades) {
    if (PAINTING_TRADES.some(pt => trade.toLowerCase().includes(pt))) {
      notes.push(`Trade: ${trade}`)
    }
  }

  for (const kw of PAINTING_KEYWORDS) {
    if (lower.includes(kw)) {
      const idx = lower.indexOf(kw)
      const start = Math.max(0, idx - 80)
      const end = Math.min(text.length, idx + kw.length + 80)
      const context = text.substring(start, end).replace(/\s+/g, ' ').trim()
      notes.push(`"...${context}..."`)
      break
    }
  }

  if (lower.includes('finish schedule') || lower.includes('finish sched')) {
    notes.push('Finish Schedule mencionado en el alcance')
  }

  return { hasPainting: notes.length > 0, paintingNotes: notes }
}

/* ── Building metrics extraction ──────────────────────────────────── */

function extractBuildingMetrics(text: string): {
  sqft: number | null
  floors: number | null
  height_ft: number | null
} {
  let sqft: number | null = null
  let floors: number | null = null
  let height_ft: number | null = null

  const sqftPatterns = [
    /(\d[\d,]+)\s*(?:sf|sq\.?\s*ft|square\s*feet|sqft)/i,
    /(?:building|project|facility|total)\s*(?:area|size|is)?\s*:?\s*(\d[\d,]+)\s*(?:sf|sq)/i,
    /(\d[\d,]+)\s*(?:gsf|gross\s*square)/i,
  ]
  for (const pat of sqftPatterns) {
    const m = text.match(pat)
    if (m) {
      sqft = parseInt((m[1] || m[2]).replace(/,/g, ''))
      break
    }
  }

  const floorPatterns = [
    /(\d+)\s*(?:stor(?:y|ies)|floor(?:s)?|level(?:s)?|pisos?)/i,
    /(\d+)\s*-\s*stor(?:y|ies)/i,
    /(?:height|floors?|stories)\s*:?\s*(\d+)/i,
  ]
  for (const pat of floorPatterns) {
    const m = text.match(pat)
    if (m) {
      const n = parseInt(m[1] || m[2])
      if (n > 0 && n < 200) floors = n
      break
    }
  }

  const heightPatterns = [
    /(\d+)\s*(?:feet|ft|')\s*(?:tall|high|height)/i,
    /(?:height|tall|high)\s*:?\s*(\d+)\s*(?:feet|ft|')/i,
  ]
  for (const pat of heightPatterns) {
    const m = text.match(pat)
    if (m) {
      const h = parseInt(m[1] || m[2])
      if (h > 5 && h < 2000) height_ft = h
      break
    }
  }

  if (!height_ft && floors) {
    height_ft = floors * 12
  }

  return { sqft, floors, height_ft }
}

/* ── Paintable area calculator ────────────────────────────────────── */

export function calculatePaintableArea(sqft: number | null, floors: number | null, height_ft: number | null): {
  exterior_sqft: number | null
  interior_sqft: number | null
  method: string
} {
  if (!sqft) return { exterior_sqft: null, interior_sqft: null, method: 'no data' }

  const floorCount = floors || 1
  const buildingHeight = height_ft || (floorCount * 12)
  const footprint = sqft / floorCount
  const w = Math.sqrt(footprint / 2)
  const perimeter = 6 * w
  const exteriorSqft = Math.round(perimeter * buildingHeight)
  const interiorSqft = Math.round(sqft * 3.5)
  const method = `Footprint ${Math.round(footprint)} sqft, perimeter ~${Math.round(perimeter)} ft, height ${buildingHeight} ft (${floorCount} floors)`

  return { exterior_sqft: exteriorSqft, interior_sqft: interiorSqft, method }
}

/* ── API Response Parser ──────────────────────────────────────────── */

/**
 * Deeply search a JSON object for arrays that look like bid/project lists.
 * BC's API structure can vary, so we search recursively for arrays of objects
 * that have project-like fields (title/name, deadline/dueDate, etc.)
 */
function findBidArrays(obj: unknown, depth = 0): Record<string, unknown>[][] {
  if (depth > 5 || !obj) return []
  const results: Record<string, unknown>[][] = []

  if (Array.isArray(obj)) {
    // Check if this array contains bid-like objects
    const bidLike = obj.filter(item => {
      if (!item || typeof item !== 'object') return false
      const keys = Object.keys(item as Record<string, unknown>)
      const hasTitleish = keys.some(k =>
        /^(title|name|project_?name|projectTitle|subject)$/i.test(k)
      )
      const hasIdish = keys.some(k =>
        /^(id|_id|projectId|bidId|invitationId)$/i.test(k)
      )
      return hasTitleish || (hasIdish && keys.length > 3)
    })
    if (bidLike.length > 0) {
      results.push(bidLike as Record<string, unknown>[])
    }
  }

  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    for (const val of Object.values(obj as Record<string, unknown>)) {
      results.push(...findBidArrays(val, depth + 1))
    }
  }

  return results
}

/**
 * Extract a bid from a captured JSON object.
 * Handles multiple possible field naming conventions from BC's API.
 */
function parseBidFromJSON(item: Record<string, unknown>): CapturedBid | null {
  // Title — try multiple field names
  const title = pickString(item, [
    'title', 'name', 'projectName', 'project_name', 'projectTitle',
    'subject', 'bidName',
  ])
  if (!title) return null

  // ID
  const id = pickString(item, [
    'id', '_id', 'projectId', 'project_id', 'bidId', 'bid_id',
    'invitationId', 'invitation_id',
  ]) || ''

  // GC / Company
  const gcObj = pickObject(item, ['company', 'gc', 'generalContractor', 'owner', 'creator', 'sender', 'from'])
  const gc_name = gcObj
    ? pickString(gcObj, ['name', 'companyName', 'company_name', 'displayName']) || null
    : pickString(item, ['companyName', 'company_name', 'gcName', 'gc_name', 'senderName']) || null

  const gc_email = gcObj
    ? pickString(gcObj, ['email', 'contactEmail']) || null
    : pickString(item, ['contactEmail', 'gc_email', 'senderEmail']) || null

  const gc_phone = gcObj
    ? pickString(gcObj, ['phone', 'phoneNumber']) || null
    : null

  // Location
  const locObj = pickObject(item, ['location', 'address', 'projectLocation', 'site'])
  let location: string | null = null
  let state_code: string | null = null

  if (locObj) {
    const city = pickString(locObj, ['city', 'locality']) || ''
    const state = pickString(locObj, ['state', 'region', 'stateCode', 'state_code', 'administrativeArea']) || ''
    const formatted = pickString(locObj, ['formatted', 'formattedAddress', 'displayAddress', 'fullAddress']) || ''
    location = formatted || [city, state].filter(Boolean).join(', ') || null
    state_code = state && state.length === 2 ? state.toUpperCase() : null
  }
  if (!location) {
    location = pickString(item, ['location', 'city', 'address']) || null
  }
  if (location && !state_code) {
    state_code = extractStateCode(location)
  }

  // Deadline
  const deadlineRaw = pickString(item, [
    'dueDate', 'due_date', 'bidDueDate', 'bid_due_date',
    'deadline', 'submissionDeadline', 'responseDeadline',
    'bidDate', 'bid_date', 'expiresAt', 'expires_at',
  ])
  let deadline: string | null = null
  if (deadlineRaw) {
    try {
      const d = new Date(deadlineRaw)
      if (!isNaN(d.getTime())) deadline = d.toISOString()
    } catch { /* ignore */ }
  }

  // Value
  const estimated_value = pickNumber(item, [
    'estimatedValue', 'estimated_value', 'projectValue', 'project_value',
    'value', 'amount', 'budget', 'cost', 'totalBudget',
  ])

  // Trades
  const tradesRaw = pickArray(item, [
    'trades', 'scopes', 'tradeNames', 'trade_names', 'scopeOfWork',
    'categories', 'disciplines', 'bidScopes', 'bid_scopes',
  ])
  const trades: string[] = []
  if (tradesRaw) {
    for (const t of tradesRaw) {
      if (typeof t === 'string') {
        trades.push(t)
      } else if (t && typeof t === 'object') {
        const name = pickString(t as Record<string, unknown>, ['name', 'title', 'tradeName', 'label'])
        if (name) trades.push(name)
      }
    }
  }

  // Description
  const description = pickString(item, [
    'description', 'projectDescription', 'project_description',
    'notes', 'summary', 'details', 'scope', 'scopeDescription',
  ]) || null

  // Project URL
  const projectUrl = pickString(item, [
    'url', 'projectUrl', 'project_url', 'link', 'href',
    'detailUrl', 'viewUrl',
  ]) || null

  return {
    id,
    title,
    gc_name,
    gc_email,
    gc_phone,
    location,
    state_code,
    deadline,
    estimated_value,
    trades,
    description,
    project_url: projectUrl,
    raw: item,
  }
}

/**
 * Parse detail data from a project detail API response
 */
function parseDetailFromJSON(item: Record<string, unknown>): CapturedDetail {
  const id = pickString(item, ['id', '_id', 'projectId', 'project_id']) || ''

  const description = pickString(item, [
    'description', 'projectDescription', 'scope', 'scopeDescription',
    'details', 'notes', 'summary',
  ]) || null

  const scope = pickString(item, [
    'scope', 'scopeOfWork', 'scope_of_work', 'scopeDescription',
    'workDescription', 'projectScope',
  ]) || null

  // Trades
  const tradesRaw = pickArray(item, [
    'trades', 'scopes', 'tradeNames', 'categories', 'disciplines',
    'bidScopes', 'scopeItems',
  ])
  const trades: string[] = []
  if (tradesRaw) {
    for (const t of tradesRaw) {
      if (typeof t === 'string') trades.push(t)
      else if (t && typeof t === 'object') {
        const name = pickString(t as Record<string, unknown>, ['name', 'title', 'tradeName', 'label'])
        if (name) trades.push(name)
      }
    }
  }

  // Files/documents
  const filesRaw = pickArray(item, [
    'files', 'documents', 'attachments', 'plans', 'drawings', 'docs',
  ])
  const files: string[] = []
  if (filesRaw) {
    for (const f of filesRaw) {
      if (typeof f === 'string') files.push(f)
      else if (f && typeof f === 'object') {
        const name = pickString(f as Record<string, unknown>, [
          'name', 'fileName', 'file_name', 'title', 'originalName', 'displayName',
        ])
        if (name) files.push(name)
      }
    }
  }

  // Contacts
  const contactsRaw = pickArray(item, ['contacts', 'team', 'members', 'invitedBy'])
  const contacts: { name: string; email: string | null; phone: string | null }[] = []
  if (contactsRaw) {
    for (const c of contactsRaw) {
      if (c && typeof c === 'object') {
        const co = c as Record<string, unknown>
        const name = pickString(co, ['name', 'displayName', 'fullName']) || ''
        if (name) {
          contacts.push({
            name,
            email: pickString(co, ['email', 'contactEmail']) || null,
            phone: pickString(co, ['phone', 'phoneNumber']) || null,
          })
        }
      }
    }
  }

  // Building size from structured fields
  const sqft = pickNumber(item, [
    'squareFootage', 'square_footage', 'sqft', 'totalSqft', 'buildingSize',
    'grossArea', 'projectSize', 'buildingArea',
  ])
  const floors = pickNumber(item, [
    'floors', 'stories', 'numFloors', 'numberOfFloors', 'levels',
    'floorCount', 'storiesCount',
  ])

  return { id, description, scope, trades, files, contacts, sqft, floors, raw: item }
}

/* ── JSON field helpers ───────────────────────────────────────────── */

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    // Direct key
    if (typeof obj[key] === 'string' && obj[key]) return obj[key] as string
    // Nested: try "project.title" style
    if (key.includes('.')) {
      const parts = key.split('.')
      let current: unknown = obj
      for (const p of parts) {
        if (current && typeof current === 'object') {
          current = (current as Record<string, unknown>)[p]
        } else {
          current = undefined
          break
        }
      }
      if (typeof current === 'string' && current) return current
    }
  }
  // Deep search in nested objects for common patterns
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      for (const key of keys) {
        const nested = v as Record<string, unknown>
        if (typeof nested[key] === 'string' && nested[key]) return nested[key] as string
      }
    }
  }
  return null
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const val = obj[key]
    if (typeof val === 'number' && !isNaN(val)) return val
    if (typeof val === 'string') {
      const n = parseFloat(val.replace(/[,$]/g, ''))
      if (!isNaN(n)) return n
    }
  }
  return null
}

function pickArray(obj: Record<string, unknown>, keys: string[]): unknown[] | null {
  for (const key of keys) {
    if (Array.isArray(obj[key])) return obj[key] as unknown[]
  }
  return null
}

function pickObject(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> | null {
  for (const key of keys) {
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      return obj[key] as Record<string, unknown>
    }
  }
  return null
}

/* ── Response Interceptor ─────────────────────────────────────────── */

interface InterceptorState {
  bidListResponses: Record<string, unknown>[]
  detailResponses: Map<string, Record<string, unknown>>
  allApiEndpoints: string[]
  log: (msg: string) => void
}

function setupResponseInterceptor(page: Page, state: InterceptorState) {
  page.on('response', async (response: HTTPResponse) => {
    const url = response.url()
    const status = response.status()

    // Only care about successful JSON responses
    if (status < 200 || status >= 300) return
    const contentType = response.headers()['content-type'] || ''
    if (!contentType.includes('json')) return

    // Track all API endpoints for debugging
    const urlPath = new URL(url).pathname
    if (!state.allApiEndpoints.includes(urlPath)) {
      state.allApiEndpoints.push(urlPath)
    }

    // Patterns that indicate bid board / project data
    const isBidBoardUrl = /\/(bid-?board|bids|invitations|bid-?packages|opportunities)/i.test(url)
    const isProjectUrl = /\/(projects?|bid-?detail|invitation-?detail)/i.test(url)
    const isSearchUrl = /\/(search|query|filter)/i.test(url)
    const isApiUrl = /\/api\//i.test(url) || /\/graphql/i.test(url)

    if (!isBidBoardUrl && !isProjectUrl && !isSearchUrl && !isApiUrl) return

    try {
      const text = await response.text()
      if (!text || text.length < 20) return

      let json: unknown
      try {
        json = JSON.parse(text)
      } catch {
        return
      }

      if (!json || typeof json !== 'object') return
      const jsonObj = json as Record<string, unknown>

      // Look for bid list arrays
      if (isBidBoardUrl || isSearchUrl || isApiUrl) {
        const bidArrays = findBidArrays(json)
        for (const arr of bidArrays) {
          if (arr.length >= 1) {
            state.log(`  [API] Captured ${arr.length} items from ${urlPath}`)
            state.bidListResponses.push(...arr)
          }
        }

        // Also check if the root response itself is an array
        if (Array.isArray(json) && json.length > 0) {
          state.log(`  [API] Captured root array with ${json.length} items from ${urlPath}`)
          state.bidListResponses.push(...(json as Record<string, unknown>[]))
        }
      }

      // Look for project detail data
      if (isProjectUrl) {
        const idMatch = url.match(/\/(?:projects?|bids?|invitations?)\/([a-f0-9]{10,})/i)
        if (idMatch) {
          state.detailResponses.set(idMatch[1], jsonObj)
          state.log(`  [API] Captured detail for ${idMatch[1].substring(0, 8)}...`)
        }
      }

      // GraphQL — check for data field
      if (url.includes('graphql') && jsonObj.data) {
        const gqlData = jsonObj.data as Record<string, unknown>
        const bidArrays = findBidArrays(gqlData)
        for (const arr of bidArrays) {
          if (arr.length >= 1) {
            state.log(`  [API/GQL] Captured ${arr.length} items from GraphQL`)
            state.bidListResponses.push(...arr)
          }
        }
      }

    } catch {
      // Silently ignore response read failures (e.g. body already consumed)
    }
  })
}

/* ── DOM Fallback Parser ──────────────────────────────────────────── */

/**
 * Fallback: parse the bid board DOM when API interception yields nothing.
 * This is the old approach but improved with more resilient selectors.
 */
async function fallbackDOMScrape(page: Page, log: (msg: string) => void): Promise<CapturedBid[]> {
  log('Falling back to DOM parsing (API interception found no data)...')

  const bids = await page.evaluate(() => {
    const results: {
      title: string; gc: string; location: string; deadline: string;
      value: string; link: string; text: string; trades: string[]
    }[] = []

    // Strategy 1: Find all links that point to projects/bids/invitations
    const projectLinks = Array.from(document.querySelectorAll(
      'a[href*="/projects/"], a[href*="/bids/"], a[href*="/invitations/"], a[href*="/bid-board/"]'
    ))

    const processedTitles = new Set<string>()

    projectLinks.forEach(linkEl => {
      const anchor = linkEl as HTMLAnchorElement
      // Walk up to find the row container
      const row = anchor.closest('tr, [role="row"], [data-testid]') ||
                  anchor.parentElement?.parentElement?.parentElement ||
                  anchor.parentElement?.parentElement

      if (!row) return
      const fullText = row.textContent || ''
      if (fullText.length < 5 || fullText.length > 5000) return

      // Title = link text or first prominent text
      let title = anchor.textContent?.trim() || ''
      if (title.length < 3) {
        // Try finding a heading-like element
        const heading = row.querySelector('h1, h2, h3, h4, h5, strong, b, [class*="title" i], [class*="name" i]')
        title = heading?.textContent?.trim() || ''
      }
      if (!title || title.length < 3 || processedTitles.has(title.toLowerCase())) return
      processedTitles.add(title.toLowerCase())

      // Extract structured data from the row
      const allText = fullText
      let gc = ''
      let location = ''
      let deadline = ''
      let value = ''

      // Date pattern
      const dateMatch = allText.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})|([A-Z][a-z]{2}\s+\d{1,2},?\s*\d{0,4})|(20\d{2}-\d{2}-\d{2})/)
      if (dateMatch) deadline = dateMatch[0]

      // Value pattern
      const valueMatch = allText.match(/\$[\d,.]+(?:\s*[KMB])?/i)
      if (valueMatch) value = valueMatch[0]

      // State pattern
      const stateMatch = allText.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*[A-Z]{2})\b/)
      if (stateMatch) location = stateMatch[0]

      // Trade tags
      const tradeTags = Array.from(row.querySelectorAll(
        '[class*="trade" i], [class*="tag" i], [class*="chip" i], [class*="scope" i], [class*="badge" i]'
      ))
      const trades: string[] = []
      tradeTags.forEach(t => {
        const tagText = t.textContent?.trim()
        if (tagText && tagText.length > 2 && tagText.length < 60) trades.push(tagText)
      })

      // GC — find company name (non-title, non-date, non-value text)
      const textElements = Array.from(row.querySelectorAll('span, p, div, td'))
      for (let ei = 0; ei < textElements.length; ei++) {
        const el = textElements[ei]
        const elText = el.textContent?.trim() || ''
        if (elText === title || elText.length < 3 || elText.length > 80) continue
        if (elText.match(/^\d/) || elText.match(/^\$/) || elText === deadline) continue
        if (elText === location) continue
        if (trades.includes(elText)) continue
        // Likely a company name
        const parentTag = el.parentElement?.tagName?.toLowerCase()
        if (parentTag !== 'button') {
          gc = elText
          break
        }
      }

      results.push({
        title,
        gc: gc || '',
        location: location || '',
        deadline: deadline || '',
        value: value || '',
        link: anchor.href,
        text: allText.substring(0, 500),
        trades,
      })
    })

    // Strategy 2: If no project links, try table rows
    if (results.length === 0) {
      const rows = document.querySelectorAll('tr, [role="row"]')
      rows.forEach(row => {
        const text = row.textContent?.trim() || ''
        if (text.length < 20 || text.length > 3000) return

        const link = row.querySelector('a') as HTMLAnchorElement
        const title = link?.textContent?.trim() ||
                      row.querySelector('td:first-child, [class*="title" i]')?.textContent?.trim() || ''

        if (!title || title.length < 3 || processedTitles.has(title.toLowerCase())) return
        processedTitles.add(title.toLowerCase())

        const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/)
        const valueMatch = text.match(/\$[\d,.]+(?:\s*[KMB])?/i)

        results.push({
          title,
          gc: '',
          location: '',
          deadline: dateMatch?.[0] || '',
          value: valueMatch?.[0] || '',
          link: link?.href || '',
          text: text.substring(0, 500),
          trades: [],
        })
      })
    }

    return results
  })

  return bids.map(b => {
    const stateCode = b.location ? extractStateCodeBrowser(b.location) : null
    let estValue: number | null = null
    if (b.value) {
      const cleaned = b.value.replace(/[$,\s]/g, '')
      let num = parseFloat(cleaned)
      if (!isNaN(num)) {
        if (cleaned.toUpperCase().endsWith('K')) num *= 1000
        if (cleaned.toUpperCase().endsWith('M')) num *= 1000000
        estValue = num
      }
    }

    let deadline: string | null = null
    if (b.deadline) {
      try {
        const d = new Date(b.deadline)
        if (!isNaN(d.getTime())) deadline = d.toISOString()
      } catch { /* ignore */ }
    }

    let sourceId: string | null = null
    if (b.link) {
      const match = b.link.match(/\/(?:projects?|bids?|invitations?)\/([a-f0-9]{10,})/i)
      if (match) sourceId = match[1]
    }

    return {
      id: sourceId || '',
      title: b.title,
      gc_name: b.gc || null,
      gc_email: null,
      gc_phone: null,
      location: b.location || null,
      state_code: stateCode,
      deadline,
      estimated_value: estValue,
      trades: b.trades,
      description: null,
      project_url: b.link || null,
      raw: { source: 'dom_fallback', text: b.text } as Record<string, unknown>,
    }
  })
}

// Inline version for page.evaluate context (can't use closures)
function extractStateCodeBrowser(location: string): string | null {
  const states = new Set([
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
    'VA','WA','WV','WI','WY','DC',
  ])
  const match = location.match(/\b([A-Z]{2})\b/)
  if (match && states.has(match[1])) return match[1]
  return null
}

/* ── DOM Detail Fallback ──────────────────────────────────────────── */

async function fallbackDOMDetail(page: Page, url: string, log: (msg: string) => void): Promise<CapturedDetail> {
  const result: CapturedDetail = {
    id: '', description: null, scope: null, trades: [], files: [],
    contacts: [], sqft: null, floors: null, raw: {},
  }

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 })
    await wait(2500)

    const pageData = await page.evaluate(() => {
      const bodyText = document.body.innerText || ''

      // Extract section texts
      const sections: string[] = []
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, [class*="heading" i], [class*="title" i]')
      headings.forEach(h => {
        const text = h.textContent?.trim().toLowerCase() || ''
        if (text.includes('scope') || text.includes('description') || text.includes('detail') ||
            text.includes('overview') || text.includes('summary') || text.includes('about')) {
          const parent = h.closest('section, div, article, [class*="content" i], [class*="body" i]')
          if (parent) sections.push(parent.textContent?.trim().substring(0, 3000) || '')
        }
      })

      // Trades
      const tradeTags = document.querySelectorAll(
        '[class*="trade" i], [class*="tag" i], [class*="chip" i], [class*="scope" i], [class*="badge" i], [class*="category" i]'
      )
      const trades: string[] = []
      tradeTags.forEach(t => {
        const tagText = t.textContent?.trim()
        if (tagText && tagText.length > 2 && tagText.length < 60) trades.push(tagText)
      })

      // Files
      const fileElements = document.querySelectorAll(
        '[class*="file" i], [class*="document" i], [class*="attachment" i], a[href*=".pdf"], a[href*=".dwg"]'
      )
      const files: string[] = []
      fileElements.forEach(f => {
        const name = f.textContent?.trim() || f.getAttribute('title') || ''
        if (name.length > 2 && name.length < 200) files.push(name)
      })

      // Contact info
      const emailMatches = bodyText.match(/[\w.-]+@[\w.-]+\.\w{2,}/gi) || []
      const phoneMatches = bodyText.match(/(?:\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) || []

      return {
        bodyText: bodyText.substring(0, 10000),
        sections: sections.slice(0, 5),
        trades: Array.from(new Set(trades)),
        files: Array.from(new Set(files)),
        emails: Array.from(new Set(emailMatches)).slice(0, 5),
        phones: Array.from(new Set(phoneMatches)).slice(0, 5),
      }
    })

    result.description = pageData.sections[0]?.substring(0, 1000) || null
    result.scope = pageData.sections.join('\n').substring(0, 3000) || null
    result.trades = pageData.trades
    result.files = pageData.files
    result.contacts = pageData.emails.map((email, i) => ({
      name: '',
      email,
      phone: pageData.phones[i] || null,
    }))

    // Extract building metrics from all text
    const allText = [pageData.bodyText, ...pageData.sections].join('\n')
    const metrics = extractBuildingMetrics(allText)
    result.sqft = metrics.sqft
    result.floors = metrics.floors
    result.raw = { source: 'dom_fallback', textLength: pageData.bodyText.length }

  } catch (err) {
    log(`  DOM detail error: ${(err as Error).message}`)
  }

  return result
}

/* ── PDF Download & Text Extraction ───────────────────────────────── */

/** Keywords in PDF filenames that indicate painting-relevant documents */
const PDF_PRIORITY_KEYWORDS = [
  'drawing', 'drawings', 'dwg',
  'finish', 'finishes', 'finish schedule',
  'paint', 'painting', 'coatings',
  'spec', 'specification', 'specifications',
  'scope', 'scope of work',
  'schedule', 'room finish',
  'division 09', 'section 09',
  'addend', 'addendum',
  'plan', 'plans',
]

/** Check if a filename is relevant for painting scope extraction */
function isPaintingRelevantPdf(filename: string): { relevant: boolean; matchedKeywords: string[] } {
  const lower = filename.toLowerCase()
  if (!lower.endsWith('.pdf') && !lower.includes('.pdf')) {
    return { relevant: false, matchedKeywords: [] }
  }
  const matched = PDF_PRIORITY_KEYWORDS.filter(kw => lower.includes(kw))
  return { relevant: matched.length > 0, matchedKeywords: matched }
}

interface PdfDownloadInfo {
  name: string
  url: string
  size?: number
}

/**
 * Find PDF download links from the current project page.
 * Searches both DOM and captured API responses for file URLs.
 */
async function findPdfLinks(page: Page, interceptorState: InterceptorState): Promise<PdfDownloadInfo[]> {
  const pdfs: PdfDownloadInfo[] = []
  const seenUrls = new Set<string>()

  // 1. From intercepted API responses — look for file/document arrays
  const detailEntries = Array.from(interceptorState.detailResponses.values())
  for (const detail of detailEntries) {
    const filesArrays = [
      pickArray(detail, ['files', 'documents', 'attachments', 'plans', 'drawings']),
    ]
    for (const files of filesArrays) {
      if (!files) continue
      for (const f of files) {
        if (!f || typeof f !== 'object') continue
        const fo = f as Record<string, unknown>
        const name = pickString(fo, ['name', 'fileName', 'file_name', 'title', 'originalName', 'displayName']) || ''
        const url = pickString(fo, ['url', 'downloadUrl', 'download_url', 'signedUrl', 'signed_url', 'href', 'link', 'path']) || ''
        if (name && url && !seenUrls.has(url)) {
          seenUrls.add(url)
          const size = pickNumber(fo, ['size', 'fileSize', 'file_size', 'bytes']) || undefined
          pdfs.push({ name, url, size })
        }
      }
    }
  }

  // 2. From DOM — find PDF links
  const domPdfs = await page.evaluate(() => {
    const results: { name: string; url: string }[] = []
    const links = Array.from(document.querySelectorAll('a[href*=".pdf"], a[download], [class*="file" i] a, [class*="document" i] a, [class*="attachment" i] a'))
    for (const link of links) {
      const anchor = link as HTMLAnchorElement
      const href = anchor.href || ''
      const name = anchor.textContent?.trim() || anchor.getAttribute('download') || anchor.getAttribute('title') || ''
      if (href && name && (href.includes('.pdf') || name.toLowerCase().includes('.pdf'))) {
        results.push({ name, url: href })
      }
    }
    // Also look for download buttons near file names
    const fileItems = Array.from(document.querySelectorAll('[class*="file" i], [class*="document" i], [class*="attachment" i]'))
    for (const item of fileItems) {
      const nameEl = item.querySelector('[class*="name" i], [class*="title" i], span, p')
      const linkEl = item.querySelector('a') as HTMLAnchorElement
      if (nameEl && linkEl) {
        const name = nameEl.textContent?.trim() || ''
        const url = linkEl.href || ''
        if (name && url) results.push({ name, url })
      }
    }
    return results
  })

  for (const dp of domPdfs) {
    if (!seenUrls.has(dp.url)) {
      seenUrls.add(dp.url)
      pdfs.push(dp)
    }
  }

  return pdfs
}

/**
 * Download a PDF using Puppeteer's authenticated session.
 * Returns the raw buffer or null if download fails.
 */
async function downloadPdfViaPage(page: Page, url: string, log: (msg: string) => void): Promise<Buffer | null> {
  try {
    // Get cookies from the authenticated page session
    const cookies = await page.cookies()
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')

    const response = await fetch(url, {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      log(`    PDF download failed: HTTP ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      // Might be a redirect page or auth challenge
      log(`    PDF download returned non-PDF content: ${contentType}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Sanity check: PDFs start with %PDF
    if (buffer.length < 100 || !buffer.subarray(0, 5).toString().startsWith('%PDF')) {
      log(`    Downloaded file is not a valid PDF`)
      return null
    }

    return buffer
  } catch (err) {
    log(`    PDF download error: ${(err as Error).message}`)
    return null
  }
}

/**
 * Extract text from PDF buffer using pdf-parse.
 * Returns extracted text or null if extraction fails.
 */
async function extractPdfText(buffer: Buffer, log: (msg: string) => void): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const result = await pdfParse(buffer)
    const text = result.text || ''
    log(`    PDF text extracted: ${text.length} chars, ${result.numpages} pages`)
    return text.length > 10 ? text : null
  } catch (err) {
    log(`    PDF parse error: ${(err as Error).message}`)
    return null
  }
}

/** Max PDF size to download during scraping (15MB) */
const MAX_PDF_SIZE = 15 * 1024 * 1024

/**
 * Download and extract text from painting-relevant PDFs on a project page.
 * Returns concatenated text from all relevant PDFs.
 */
async function extractPdfContent(
  page: Page,
  interceptorState: InterceptorState,
  log: (msg: string) => void,
  maxPdfs: number = 3,
): Promise<{ text: string; filesProcessed: string[] }> {
  const pdfLinks = await findPdfLinks(page, interceptorState)
  log(`  Found ${pdfLinks.length} PDF links on project page`)

  if (pdfLinks.length === 0) return { text: '', filesProcessed: [] }

  // ── Detailed PDF audit log ──
  log(`  ┌─── PDF AUDIT (${pdfLinks.length} files found) ───`)
  for (const p of pdfLinks) {
    const check = isPaintingRelevantPdf(p.name)
    const sizeStr = p.size ? `${(p.size / 1024 / 1024).toFixed(1)}MB` : 'size unknown'
    if (check.relevant) {
      log(`  │ ✅ "${p.name}" (${sizeStr}) → keywords: [${check.matchedKeywords.join(', ')}]`)
    } else {
      log(`  │ ❌ "${p.name}" (${sizeStr}) → no painting keywords matched`)
    }
  }

  // Prioritize painting-relevant PDFs, then take others if few exist
  const relevant = pdfLinks.filter(p => isPaintingRelevantPdf(p.name).relevant)
  const others = pdfLinks.filter(p => !isPaintingRelevantPdf(p.name).relevant)

  // If no specifically relevant PDFs, take first few of any type
  const toProcess = relevant.length > 0
    ? relevant.slice(0, maxPdfs)
    : others.slice(0, Math.min(2, maxPdfs))

  log(`  │ RESULT: ${relevant.length} relevant / ${others.length} skipped / ${toProcess.length} will process`)
  log(`  └──────────────────────────────`)

  const allTexts: string[] = []
  const filesProcessed: string[] = []

  for (const pdf of toProcess) {
    // Skip if known to be too large
    if (pdf.size && pdf.size > MAX_PDF_SIZE) {
      log(`  Skipping ${pdf.name} — too large (${Math.round(pdf.size / 1024 / 1024)}MB)`)
      continue
    }

    log(`  Downloading: ${pdf.name}...`)
    const buffer = await downloadPdfViaPage(page, pdf.url, log)
    if (!buffer) continue

    if (buffer.length > MAX_PDF_SIZE) {
      log(`  Skipping ${pdf.name} — downloaded file too large (${Math.round(buffer.length / 1024 / 1024)}MB)`)
      continue
    }

    const text = await extractPdfText(buffer, log)
    if (text) {
      allTexts.push(`\n=== PDF: ${pdf.name} ===\n${text}`)
      filesProcessed.push(pdf.name)
    }
  }

  return {
    text: allTexts.join('\n'),
    filesProcessed,
  }
}

/* ── Login Flow ───────────────────────────────────────────────────── */

async function loginToBC(page: Page, email: string, password: string, log: (msg: string) => void): Promise<void> {
  log('Navigating to BuildingConnected...')
  await page.goto('https://app.buildingconnected.com/login', { waitUntil: 'networkidle2', timeout: 30000 })
  await wait(2000)

  log('Entering email...')
  await page.waitForSelector('#emailField', { timeout: 10000 })
  await page.evaluate(() => {
    const el = document.querySelector('#emailField') as HTMLInputElement
    el.focus()
    el.value = ''
  })
  await page.type('#emailField', email, { delay: 30 })

  log('Clicking NEXT...')
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement
    if (btn) btn.click()
  })

  log('Waiting for login flow...')
  let loginPath: 'password' | 'sso' | 'unknown' = 'unknown'

  for (let attempt = 0; attempt < 20; attempt++) {
    await wait(500)

    const state = await page.evaluate(() => {
      const url = window.location.href
      const pass = document.querySelector('#passwordField') as HTMLInputElement
      let passVisible = false
      if (pass) {
        passVisible = pass.offsetParent !== null
        if (!passVisible && pass.parentElement?.parentElement) {
          passVisible = getComputedStyle(pass.parentElement.parentElement).display !== 'none'
        }
      }
      const error = document.querySelector('[class*="error" i], [class*="alert" i], [role="alert"]')?.textContent?.trim()
      return {
        url,
        passVisible,
        error: error || null,
        redirected: !url.includes('buildingconnected.com/login'),
      }
    })

    if (state.redirected) {
      loginPath = state.url.includes('autodesk.com') ? 'sso' : 'password'
      if (loginPath === 'sso') log('Redirected to Autodesk SSO...')
      break
    }
    if (state.passVisible) { loginPath = 'password'; log('Password field appeared'); break }
    if (state.error) throw new Error(`BC says: ${state.error}`)
  }

  if (loginPath === 'password') {
    log('Entering password...')
    await wait(500)
    await page.evaluate(() => {
      const el = document.querySelector('#passwordField') as HTMLInputElement
      if (el) { el.focus(); el.value = '' }
    })
    await page.type('#passwordField', password, { delay: 30 })
    await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement
      if (btn) btn.click()
    })
    await page.waitForFunction(
      () => !window.location.href.includes('/login'),
      { timeout: 20000 }
    ).catch(() => {})
    await wait(3000)

  } else if (loginPath === 'sso') {
    log('Handling Autodesk SSO...')
    await wait(2000)

    const ssoEmailField = await page.$('input[type="email"], input[name="userName"], input[name="email"], #userName')
    if (ssoEmailField) {
      const currentVal = await page.evaluate((sel) => {
        const el = document.querySelector(sel) as HTMLInputElement
        return el?.value || ''
      }, 'input[type="email"], input[name="userName"], #userName')

      if (!currentVal) await ssoEmailField.type(email, { delay: 30 })

      await page.evaluate(() => {
        const btn = document.querySelector('button[type="submit"], #btn_next, .btn-primary') as HTMLButtonElement
        if (btn) btn.click()
      })
      await wait(3000)
    }

    const ssoPassField = await page.$('input[type="password"], input[name="password"], #password')
    if (ssoPassField) {
      log('Entering SSO password...')
      await ssoPassField.type(password, { delay: 30 })
      await page.evaluate(() => {
        const btn = document.querySelector('button[type="submit"], #btn_submit, .btn-primary') as HTMLButtonElement
        if (btn) btn.click()
      })
      await page.waitForFunction(
        () => !window.location.href.includes('autodesk.com'),
        { timeout: 20000 }
      ).catch(() => {})
      await wait(3000)
    }

  } else {
    const debugInfo = await page.evaluate(() => ({
      url: window.location.href,
      visibleText: document.body.innerText.substring(0, 300),
    }))
    throw new Error(`Email not recognized by BuildingConnected. (URL: ${debugInfo.url})`)
  }

  // Verify login succeeded
  const postLoginUrl = page.url()
  if (postLoginUrl.includes('/login') || postLoginUrl.includes('autodesk.com/authentication')) {
    const errorMsg = await page.evaluate(() => {
      const err = document.querySelector('[class*="error" i], [class*="alert" i], [role="alert"], .error')
      return err?.textContent?.trim() || null
    })
    throw new Error(errorMsg || 'Login failed — check email/password.')
  }
  log(`Login successful! → ${postLoginUrl.split('?')[0]}`)
}

/* ── Scroll to load all items ─────────────────────────────────────── */

async function scrollToLoadAll(page: Page, log: (msg: string) => void, maxScrolls: number = 30): Promise<void> {
  let prevHeight = 0
  let sameCount = 0

  for (let i = 0; i < maxScrolls; i++) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight)

    if (currentHeight === prevHeight) {
      sameCount++
      if (sameCount >= 3) {
        log(`  Scroll complete — no more content to load`)
        break
      }
    } else {
      sameCount = 0
    }

    prevHeight = currentHeight
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await wait(1500)

    // Also try clicking "Load More" / "Show More" buttons
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'))
      for (let bi = 0; bi < buttons.length; bi++) {
        const btn = buttons[bi]
        const text = btn.textContent?.trim().toLowerCase() || ''
        if (text.includes('load more') || text.includes('show more') || text.includes('view more')) {
          ;(btn as HTMLElement).click()
          break
        }
      }
    })
  }
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN SCRAPER
   ══════════════════════════════════════════════════════════════════════ */

export async function scrapeBuildingConnected(config: ScraperConfig): Promise<ScrapedOpportunity[]> {
  const { email, password, maxPages = 10, headless = true, onProgress } = config
  const log = onProgress || console.log

  let browser: Browser | null = null

  try {
    log('Launching browser...')
    browser = await puppeteer.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })

    const page: Page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 900 })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36')

    // ── Setup API response interceptor BEFORE any navigation ──
    const interceptorState: InterceptorState = {
      bidListResponses: [],
      detailResponses: new Map(),
      allApiEndpoints: [],
      log,
    }
    setupResponseInterceptor(page, interceptorState)

    // ── Step 1: Login ──
    await loginToBC(page, email, password, log)

    // ── Step 2: Navigate to Bid Board ──
    log('Navigating to Bid Board...')
    interceptorState.bidListResponses = [] // Clear any pre-login responses
    await page.goto('https://app.buildingconnected.com/bid-board', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })
    await wait(3000)
    log('On Bid Board: ' + page.url().split('?')[0])

    // ── Step 3: Click Undecided tab ──
    log('Selecting Undecided filter...')
    const clickedUndecided = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, div[role="tab"], span, li, [class*="tab" i], [class*="filter" i]'))
      for (let ei = 0; ei < elements.length; ei++) {
        const el = elements[ei]
        const text = el.textContent?.trim().toLowerCase() || ''
        if (text === 'undecided' || text.includes('undecided')) {
          ;(el as HTMLElement).click()
          return true
        }
      }
      return false
    })

    if (clickedUndecided) {
      log('Clicked Undecided — waiting for data...')
      await wait(3000) // Wait for API response after tab change
    } else {
      log('Undecided tab not found, scraping current view...')
    }

    // ── Step 4: Load all pages (scroll + pagination) ──
    log('Loading all items (scroll + pagination)...')
    await scrollToLoadAll(page, log, maxPages * 3)

    // Navigate pagination if present (BC shows page 1, 2, 3... buttons)
    for (let pageNum = 2; pageNum <= maxPages; pageNum++) {
      const hasNextPage = await page.evaluate((targetPage) => {
        // Look for pagination controls: numbered buttons, "Next" button, or arrow buttons
        const allClickable = Array.from(document.querySelectorAll(
          'button, a, [role="button"], nav li, [class*="pagination" i] *, [class*="pager" i] *'
        ))

        // Try clicking the exact page number
        for (const el of allClickable) {
          const text = el.textContent?.trim() || ''
          if (text === String(targetPage)) {
            ;(el as HTMLElement).click()
            return true
          }
        }

        // Try "Next" / ">" / "→" button
        for (const el of allClickable) {
          const text = el.textContent?.trim().toLowerCase() || ''
          const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || ''
          if (text === 'next' || text === '›' || text === '>' || text === '→' ||
              text === '>>' || ariaLabel.includes('next')) {
            const isDisabled = (el as HTMLButtonElement).disabled ||
              el.classList.contains('disabled') ||
              el.getAttribute('aria-disabled') === 'true'
            if (!isDisabled) {
              ;(el as HTMLElement).click()
              return true
            }
          }
        }

        return false
      }, pageNum)

      if (!hasNextPage) {
        log(`  No page ${pageNum} found — pagination complete`)
        break
      }

      log(`  Navigating to page ${pageNum}...`)
      await wait(3000) // Wait for API response after page change
      await scrollToLoadAll(page, log, 10) // Scroll within the new page
    }

    // ── Step 5: Parse captured API data OR fall back to DOM ──
    let capturedBids: CapturedBid[] = []

    if (interceptorState.bidListResponses.length > 0) {
      log(`API interception: ${interceptorState.bidListResponses.length} raw items captured`)

      // Deduplicate by parsing each item
      const seenIds = new Set<string>()
      const seenTitles = new Set<string>()

      for (const item of interceptorState.bidListResponses) {
        const bid = parseBidFromJSON(item)
        if (!bid || !bid.title) continue

        const key = bid.id || bid.title.toLowerCase()
        if (seenIds.has(key) || seenTitles.has(bid.title.toLowerCase())) continue
        seenIds.add(key)
        seenTitles.add(bid.title.toLowerCase())

        capturedBids.push(bid)
      }

      log(`Parsed ${capturedBids.length} unique bids from API responses`)
    }

    // Fallback: DOM parsing if API gave nothing
    if (capturedBids.length === 0) {
      capturedBids = await fallbackDOMScrape(page, log)
      log(`DOM fallback: found ${capturedBids.length} bids`)
    }

    if (capturedBids.length === 0) {
      log('No opportunities found in either API or DOM')
      log(`API endpoints observed: ${interceptorState.allApiEndpoints.join(', ')}`)
      return []
    }

    // ── Step 6: Get project details ──
    log(`${capturedBids.length} bids found. Fetching details for each...`)
    const opportunities: ScrapedOpportunity[] = []

    for (let i = 0; i < capturedBids.length; i++) {
      const bid = capturedBids[i]
      log(`[${i + 1}/${capturedBids.length}] ${bid.title.substring(0, 60)}...`)

      let detail: CapturedDetail | null = null

      // Check if we already captured detail via API interception
      if (bid.id && interceptorState.detailResponses.has(bid.id)) {
        detail = parseDetailFromJSON(interceptorState.detailResponses.get(bid.id)!)
        log(`  → Detail from API cache`)
      }

      // Navigate to project page to get details (and capture API responses)
      if (!detail || (!detail.description && !detail.scope)) {
        const projectUrl = bid.project_url ||
          (bid.id ? `https://app.buildingconnected.com/projects/${bid.id}` : null)

        if (projectUrl) {
          // Clear detail responses for this navigation
          const prevDetailCount = interceptorState.detailResponses.size

          await page.goto(projectUrl, { waitUntil: 'networkidle2', timeout: 25000 }).catch(() => {})
          await wait(2500)

          // Check if new detail API response was captured
          if (interceptorState.detailResponses.size > prevDetailCount) {
            // Get the most recently added detail
            const entries = Array.from(interceptorState.detailResponses.entries())
            const latest = entries[entries.length - 1]
            if (latest) {
              detail = parseDetailFromJSON(latest[1])
              log(`  → Detail from API interception`)
            }
          }

          // Still no detail? Fall back to DOM
          if (!detail || (!detail.description && !detail.scope && detail.trades.length === 0)) {
            detail = await fallbackDOMDetail(page, projectUrl, log)
            log(`  → Detail from DOM fallback`)
          }
        }
      }

      // ── Step 6b: Download & extract painting-relevant PDFs ──
      let pdfText = ''
      let pdfFilesProcessed: string[] = []

      // Only try PDF extraction if we navigated to the project page
      const projectUrl = bid.project_url ||
        (bid.id ? `https://app.buildingconnected.com/projects/${bid.id}` : null)

      if (projectUrl) {
        try {
          const pdfResult = await extractPdfContent(page, interceptorState, log, 3)
          pdfText = pdfResult.text
          pdfFilesProcessed = pdfResult.filesProcessed
          if (pdfFilesProcessed.length > 0) {
            log(`  → PDF text from ${pdfFilesProcessed.length} files (${pdfText.length} chars)`)
          }
        } catch (err) {
          log(`  → PDF extraction error: ${(err as Error).message}`)
        }
      }

      // ── Build final opportunity ──
      const allTrades = Array.from(new Set([...bid.trades, ...(detail?.trades || [])]))

      // Combine ALL text sources: page data + PDF content
      const allText = [
        bid.title, bid.description || '', detail?.description || '',
        detail?.scope || '', allTrades.join(' '), pdfText,
      ].join(' ')

      const paintResult = detectPainting(allText, allTrades)
      const metrics = extractBuildingMetrics(allText)
      const sqft = detail?.sqft || metrics.sqft
      const floors = detail?.floors || metrics.floors

      // SDVOSB detection
      const textLower = allText.toLowerCase()
      const isSdvosb = textLower.includes('sdvosb') || textLower.includes('veteran') ||
                       textLower.includes('set-aside') || textLower.includes('8(a)') ||
                       textLower.includes('hubzone') ||
                       (textLower.includes('federal') && textLower.includes('small business'))

      // Build scope notes
      const scopeParts: string[] = []

      // PDF analysis results first (highest quality source)
      if (pdfFilesProcessed.length > 0) {
        scopeParts.push(`PDFs analizados: ${pdfFilesProcessed.join(', ')}`)
        // Log keyword matches per PDF file
        for (const fname of pdfFilesProcessed) {
          const check = isPaintingRelevantPdf(fname)
          if (check.relevant) {
            scopeParts.push(`  → "${fname}" keywords: [${check.matchedKeywords.join(', ')}]`)
          }
        }
      }

      if (paintResult.hasPainting) {
        scopeParts.push('PINTURA DETECTADA')
        paintResult.paintingNotes.forEach(n => scopeParts.push(`  ${n}`))
      } else {
        scopeParts.push('No se detectó pintura en el alcance visible')
      }
      if (sqft) scopeParts.push(`Edificio: ${sqft.toLocaleString()} sqft`)
      if (floors) scopeParts.push(`Pisos: ${floors}`)
      if (metrics.height_ft) scopeParts.push(`Altura estimada: ${metrics.height_ft} ft`)

      if (sqft && paintResult.hasPainting) {
        const paintable = calculatePaintableArea(sqft, floors, metrics.height_ft)
        if (paintable.exterior_sqft) scopeParts.push(`Exterior pintable: ~${paintable.exterior_sqft.toLocaleString()} sqft`)
        if (paintable.interior_sqft) scopeParts.push(`Interior pintable: ~${paintable.interior_sqft.toLocaleString()} sqft`)
        scopeParts.push(`Método: ${paintable.method}`)
      }

      if (detail?.files && detail.files.length > 0) {
        const relevant = detail.files.filter(f => {
          const l = f.toLowerCase()
          return l.includes('finish') || l.includes('paint') || l.includes('spec') ||
                 l.includes('schedule') || l.includes('scope') || l.includes('plan') ||
                 l.includes('drawing')
        })
        const skipped = detail.files.filter(f => !relevant.includes(f))
        if (relevant.length > 0) {
          scopeParts.push(`Archivos relevantes: ${relevant.slice(0, 5).join(', ')}`)
        }
        if (skipped.length > 0) {
          scopeParts.push(`Archivos ignorados: ${skipped.slice(0, 5).join(', ')}`)
        }
        scopeParts.push(`Total archivos en proyecto: ${detail.files.length}`)
      }

      // GC contact
      const gcContact = bid.gc_email || bid.gc_phone ||
        (detail?.contacts?.[0]?.email) || (detail?.contacts?.[0]?.phone) || null

      // Source
      const dataSource = (bid.raw as Record<string, unknown>).source === 'dom_fallback' ? 'dom' : 'api'

      opportunities.push({
        title: bid.title,
        description: detail?.description || bid.description || null,
        gc_name: bid.gc_name,
        gc_contact: gcContact,
        location: bid.location,
        state_code: bid.state_code,
        deadline: bid.deadline,
        estimated_value: bid.estimated_value,
        trades_required: allTrades.length > 0 ? allTrades : null,
        is_sdvosb_eligible: isSdvosb,
        source_platform: 'buildingconnected',
        source_id: bid.id || null,
        raw_data: {
          data_source: dataSource,
          detail_extracted: !!detail,
          has_painting: paintResult.hasPainting,
          pdfs_analyzed: pdfFilesProcessed,
          files: detail?.files || [],
          api_endpoints: interceptorState.allApiEndpoints.slice(0, 10),
        } as unknown as Record<string, unknown>,
        scope_notes: scopeParts.length > 0 ? scopeParts.join('\n') : null,
        building_sqft: sqft || null,
        building_height_floors: floors || null,
      })
    }

    log(`Done! ${opportunities.length} opportunities extracted (method: ${
      interceptorState.bidListResponses.length > 0 ? 'API interception' : 'DOM fallback'
    })`)
    log(`API endpoints observed: ${interceptorState.allApiEndpoints.length}`)

    return opportunities

  } finally {
    if (browser) await browser.close()
  }
}

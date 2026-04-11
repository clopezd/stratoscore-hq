/**
 * POST /api/bidhunter/import-extension
 *
 * Receives scraped opportunities from the Chrome Extension.
 * Supports two modes:
 * - Quick scan: import all opportunities (existing behavior)
 * - Deep scan: only import relevant opportunities (file/scope keyword match)
 *
 * Deduplicates by source_id or title, filters expired deadlines,
 * marks urgent opportunities, then inserts new ones.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applyEnrichment } from '@/features/bidhunter/services/enrichmentService'

export const runtime = 'nodejs'

const EXTENSION_API_KEY = process.env.BIDHUNTER_EXTENSION_KEY || ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Extension-Key',
}

function corsJson(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, { ...init, headers: CORS_HEADERS })
}

export async function OPTIONS() {
  return corsJson(null)
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const URGENT_DAYS = 3
// Minimum relevance score to import during deep scan
const MIN_RELEVANCE_SCORE = 25

interface DeepScanData {
  scanned: boolean
  file_names: string[]
  relevant_files: { name: string; keyword: string }[]
  total_files: number
  matched_file_keywords: string[]
  scope_matches: { keyword: string; context: string }[]
  description: string | null
  has_scope_match: boolean
  has_file_match: boolean
  relevance_score: number
}

interface ExtensionOpportunity {
  title: string
  description?: string | null
  gc_name?: string | null
  gc_contact?: string | null
  location?: string | null
  state_code?: string | null
  deadline?: string | null
  estimated_value?: number | null
  building_sqft?: number | null
  building_height_floors?: number | null
  trades_required?: string[] | null
  is_sdvosb_eligible?: boolean
  source_id?: string | null
  scope_notes?: string | null
  has_painting?: boolean
  bc_status?: string
  bid_amount?: number
  bid_submitted_at?: string
  deep_scan?: DeepScanData
}

export async function POST(req: NextRequest) {
  if (!EXTENSION_API_KEY) {
    return corsJson({ error: 'Extension auth not configured' }, { status: 500 })
  }
  const key = req.headers.get('x-extension-key')
  if (key !== EXTENSION_API_KEY) {
    return corsJson({ error: 'Invalid extension key' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const opportunities: ExtensionOpportunity[] = body.opportunities
    const isDeepScan: boolean = body.deep_scan === true

    if (!opportunities || !Array.isArray(opportunities) || opportunities.length === 0) {
      return corsJson({ error: 'No opportunities provided' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const now = new Date()

    // Get existing to deduplicate
    const { data: existing } = await supabase
      .from('bh_opportunities')
      .select('id, source_id, title, status')

    const existingBySourceId = new Map((existing ?? []).filter(e => e.source_id).map(e => [e.source_id, e]))
    const existingByTitle = new Map((existing ?? []).map(e => [e.title.toLowerCase(), e]))

    let expired = 0
    let urgent = 0
    let linked = 0
    let notRelevant = 0
    let relevant = 0

    // Update source_id and bc_status for existing opportunities
    let bcSynced = 0
    for (const o of opportunities) {
      const match = (o.source_id && existingBySourceId.get(o.source_id)) || existingByTitle.get(o.title.toLowerCase())
      if (!match) continue

      const updates: Record<string, unknown> = {}
      if (o.source_id && !match.source_id) { updates.source_id = o.source_id; linked++ }
      if (o.bc_status) updates.bc_status = o.bc_status.toLowerCase()
      if (o.bid_amount) updates.bid_amount = o.bid_amount
      if (o.bid_submitted_at) updates.bid_submitted_at = o.bid_submitted_at
      // Enrich existing opportunities with data from deep scan BC API
      if (o.deadline) updates.deadline = o.deadline
      if (o.location) updates.location = o.location
      if (o.state_code) updates.state_code = o.state_code
      if (o.gc_name) updates.gc_name = o.gc_name
      if (o.gc_contact) updates.gc_contact = o.gc_contact
      if (o.estimated_value) updates.estimated_value = o.estimated_value
      if (o.building_sqft) updates.building_sqft = o.building_sqft
      if (o.building_height_floors) updates.building_height_floors = o.building_height_floors
      if (o.description) updates.description = o.description

      // Auto-sync internal status from BC status
      if (o.bc_status === 'submitted' && match.status !== 'bid_sent' && match.status !== 'won') {
        updates.status = 'bid_sent'
      } else if (o.bc_status === 'awarded') {
        updates.status = 'won'
      } else if (o.bc_status === 'not_awarded') {
        updates.status = 'lost'
      }

      // If deep scan, update scope_notes with file analysis
      if (isDeepScan && o.deep_scan?.scanned) {
        const deepNotes = buildDeepScanNotes(o.deep_scan)
        if (deepNotes) updates.scope_notes = deepNotes
      }

      if (Object.keys(updates).length > 0) {
        await supabase.from('bh_opportunities').update(updates).eq('id', match.id)
        if (o.bc_status) bcSynced++
      }
    }

    // Filter new opportunities
    const newOpps = opportunities.filter((o) => {
      // Deduplicate
      if (o.source_id && existingBySourceId.has(o.source_id)) return false
      if (existingByTitle.has(o.title.toLowerCase())) return false

      // Filter expired
      if (o.deadline) {
        const deadlineDate = new Date(o.deadline)
        if (!isNaN(deadlineDate.getTime()) && deadlineDate < now) {
          expired++
          return false
        }
      }

      // Deep scan: only import relevant opportunities
      if (isDeepScan && o.deep_scan) {
        if (o.deep_scan.relevance_score < MIN_RELEVANCE_SCORE) {
          notRelevant++
          return false
        }
        relevant++
      }

      return true
    })

    if (newOpps.length === 0) {
      return corsJson({
        message: buildSummaryMessage({ expired, linked, bcSynced, notRelevant, relevant }),
        imported: 0,
        duplicates: opportunities.length - expired - notRelevant,
        expired,
        linked,
        bc_synced: bcSynced,
        relevant,
        not_relevant: notRelevant,
      })
    }

    // Build insert payload
    const toInsert = newOpps.map((o) => {
      let scopeNotes = (o.scope_notes as string) || ''

      // Add deep scan analysis to scope notes
      if (isDeepScan && o.deep_scan?.scanned) {
        const deepNotes = buildDeepScanNotes(o.deep_scan)
        if (deepNotes) scopeNotes = deepNotes + (scopeNotes ? '\n---\n' + scopeNotes : '')
      }

      // Tag urgency
      if (o.deadline) {
        const deadlineDate = new Date(o.deadline)
        if (!isNaN(deadlineDate.getTime())) {
          const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (daysLeft <= URGENT_DAYS) {
            scopeNotes = `URGENTE — Vence en ${daysLeft} dias\n${scopeNotes}`
            urgent++
          } else if (daysLeft <= 7) {
            scopeNotes = `Proximo a vencer (${daysLeft} dias)\n${scopeNotes}`
          }
        }
      }

      // Use deep scan description if available
      const description = o.deep_scan?.description || o.description || null

      // Map BC pipeline status to internal status
      const bcStatus = o.bc_status?.toLowerCase() || 'unknown'
      const internalStatus = bcStatus === 'submitted' ? 'bid_sent'
        : bcStatus === 'awarded' ? 'won'
        : bcStatus === 'not_awarded' ? 'lost'
        : 'new'

      const record = {
        title: o.title,
        description,
        gc_name: o.gc_name || null,
        gc_contact: o.gc_contact || null,
        location: o.location || null,
        state_code: o.state_code || null,
        deadline: o.deadline || null,
        estimated_value: o.estimated_value || null,
        building_sqft: o.building_sqft || null,
        building_height_floors: o.building_height_floors || null,
        trades_required: o.trades_required || null,
        is_sdvosb_eligible: o.is_sdvosb_eligible || false,
        source_platform: 'buildingconnected',
        source_id: o.source_id || null,
        scope_notes: scopeNotes || null,
        status: internalStatus,
        bc_status: bcStatus,
        bid_amount: o.bid_amount || null,
        bid_submitted_at: o.bid_submitted_at || null,
      }

      // Enrich: extract location, state, SDVOSB, trades from text
      applyEnrichment(record as Record<string, unknown>)

      return record
    })

    const { data: inserted, error } = await supabase
      .from('bh_opportunities')
      .insert(toInsert)
      .select('id, title')

    if (error) throw error

    await supabase.from('bh_pipeline_log').insert({
      action: isDeepScan ? 'deep_scan_import' : 'extension_import',
      details: {
        count: inserted?.length ?? 0,
        source: 'chrome_extension',
        mode: isDeepScan ? 'deep_scan' : 'quick_scan',
        expired,
        urgent,
        relevant,
        not_relevant: notRelevant,
      },
    })

    // Auto-score imported opportunities in background
    if (inserted && inserted.length > 0) {
      const ids = inserted.map(o => o.id)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/bidhunter/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      }).catch(err => console.error('Auto-score after extension import failed:', err))
    }

    return corsJson({
      message: `Imported ${inserted?.length ?? 0} opportunities${isDeepScan ? ' (deep scan)' : ''}`,
      imported: inserted?.length ?? 0,
      duplicates: opportunities.length - newOpps.length - expired - notRelevant,
      expired,
      urgent,
      relevant,
      not_relevant: notRelevant,
      bc_synced: bcSynced,
    })
  } catch (err) {
    console.error('Extension import error:', err)
    return corsJson({ error: (err as Error).message }, { status: 500 })
  }
}

/**
 * Build human-readable scope notes from deep scan data.
 */
function buildDeepScanNotes(ds: DeepScanData): string {
  const parts: string[] = []

  parts.push(`=== DEEP SCAN (relevance: ${ds.relevance_score}/100) ===`)

  if (ds.has_file_match) {
    parts.push(`FILES RELEVANTES (${ds.relevant_files.length}/${ds.total_files}):`)
    for (const f of ds.relevant_files.slice(0, 10)) {
      parts.push(`  + "${f.name}" [${f.keyword}]`)
    }
    if (ds.relevant_files.length > 10) {
      parts.push(`  ... y ${ds.relevant_files.length - 10} mas`)
    }
  } else if (ds.total_files > 0) {
    parts.push(`${ds.total_files} archivos encontrados, ninguno matchea keywords de pintura`)
  } else {
    parts.push('No se encontraron archivos en el proyecto')
  }

  if (ds.has_scope_match) {
    parts.push(`SCOPE MATCHES:`)
    for (const m of ds.scope_matches.slice(0, 5)) {
      parts.push(`  + "${m.keyword}" — ...${m.context}...`)
    }
  }

  if (ds.matched_file_keywords.length > 0) {
    parts.push(`Keywords encontradas: ${ds.matched_file_keywords.join(', ')}`)
  }

  return parts.join('\n')
}

function buildSummaryMessage(stats: {
  expired: number
  linked: number
  bcSynced: number
  notRelevant: number
  relevant: number
}): string {
  const parts = ['All opportunities already exist or were filtered']
  if (stats.expired > 0) parts.push(`${stats.expired} expired`)
  if (stats.linked > 0) parts.push(`${stats.linked} linked to BC`)
  if (stats.bcSynced > 0) parts.push(`${stats.bcSynced} BC statuses synced`)
  if (stats.notRelevant > 0) parts.push(`${stats.notRelevant} not relevant (no painting keywords)`)
  if (stats.relevant > 0) parts.push(`${stats.relevant} relevant`)
  return parts.join('. ')
}

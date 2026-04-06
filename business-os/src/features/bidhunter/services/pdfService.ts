/**
 * BidHunter PDF Service
 * Upload PDFs to Supabase Storage, extract text with pdf-parse
 */
import { createClient } from '@supabase/supabase-js'
import type { OpportunityDocument, ExtractedData, AggregatedExtraction } from '../types'

const BUCKET = 'bidhunter-docs'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

/** Upload PDF buffer to Supabase Storage and create document record */
export async function uploadDocument(
  opportunityId: string,
  filename: string,
  buffer: Buffer,
  documentType: string = 'other',
): Promise<OpportunityDocument> {
  const supabase = getAdmin()
  const path = `${opportunityId}/${Date.now()}_${filename}`

  // Upload to storage
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`)

  // Create document record
  const { data, error } = await supabase
    .from('bh_opportunity_documents')
    .insert({
      opportunity_id: opportunityId,
      filename,
      file_path: path,
      file_size: buffer.length,
      mime_type: 'application/pdf',
      document_type: documentType,
      extraction_status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data as OpportunityDocument
}

/**
 * Upload a File (Web API) directly to Supabase Storage using streaming.
 * Avoids loading the entire file into a Node.js Buffer — critical for 200MB+ PDFs.
 */
export async function uploadDocumentStream(
  opportunityId: string,
  file: File,
  documentType: string = 'other',
): Promise<OpportunityDocument> {
  const supabase = getAdmin()
  const path = `${opportunityId}/${Date.now()}_${file.name}`

  // Supabase JS client accepts Blob/File directly (uses fetch under the hood)
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: 'application/pdf',
      upsert: false,
      duplex: 'half',
    })

  if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`)

  // Create document record
  const { data, error } = await supabase
    .from('bh_opportunity_documents')
    .insert({
      opportunity_id: opportunityId,
      filename: file.name,
      file_path: path,
      file_size: file.size,
      mime_type: 'application/pdf',
      document_type: documentType,
      extraction_status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data as OpportunityDocument
}

/**
 * Create a document record with pre-extracted text (no file in Storage).
 * Used for large PDFs (>50MB) where text is extracted in the browser.
 */
export async function createTextOnlyDocument(
  opportunityId: string,
  filename: string,
  fileSize: number,
  documentType: string,
  rawText: string,
  pageCount: number | null,
): Promise<OpportunityDocument> {
  const supabase = getAdmin()

  const { data, error } = await supabase
    .from('bh_opportunity_documents')
    .insert({
      opportunity_id: opportunityId,
      filename,
      file_path: `text-only/${opportunityId}/${Date.now()}_${filename}`,
      file_size: fileSize,
      mime_type: 'application/pdf',
      document_type: documentType,
      extraction_status: 'pending',
      raw_text: rawText,
      page_count: pageCount,
    })
    .select()
    .single()

  if (error) throw error
  return data as OpportunityDocument
}

/** Extract raw text from a PDF buffer using pdf-parse v1, with page markers */
export async function extractText(buffer: Buffer): Promise<{ text: string; pages: number }> {
  // Import pdf-parse/lib/pdf-parse directly to skip the debug wrapper in index.js
  // (index.js has a bug: when !module.parent it tries to read a test file that doesn't exist in bundles)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse/lib/pdf-parse')

  // Collect text per-page via custom pagerender to inject page markers
  let pageNum = 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPage = async (pageData: any) => {
    pageNum++
    const textContent = await pageData.getTextContent()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastY: number | undefined, text = ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of textContent.items as any[]) {
      if (lastY === item.transform[5] || lastY === undefined) {
        text += item.str
      } else {
        text += '\n' + item.str
      }
      lastY = item.transform[5]
    }
    return `--- PAGE ${pageNum} ---\n${text}`
  }

  const result = await pdfParse(buffer, { pagerender: renderPage })

  return { text: result.text, pages: result.numpages }
}

/** Download PDF from Supabase Storage */
export async function downloadDocument(filePath: string): Promise<Buffer> {
  const supabase = getAdmin()
  const { data, error } = await supabase.storage.from(BUCKET).download(filePath)
  if (error || !data) throw new Error(`Download failed: ${error?.message}`)
  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/** Get all documents for an opportunity */
export async function getDocuments(opportunityId: string): Promise<OpportunityDocument[]> {
  const supabase = getAdmin()
  const { data, error } = await supabase
    .from('bh_opportunity_documents')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return (data || []) as OpportunityDocument[]
}

/** Delete a document (storage + record) */
export async function deleteDocument(documentId: string): Promise<void> {
  const supabase = getAdmin()

  // Get file path first
  const { data: doc } = await supabase
    .from('bh_opportunity_documents')
    .select('file_path')
    .eq('id', documentId)
    .single()

  if (doc?.file_path) {
    await supabase.storage.from(BUCKET).remove([doc.file_path])
  }

  // Delete extracted data
  await supabase.from('bh_extracted_data').delete().eq('document_id', documentId)

  // Delete document record
  await supabase.from('bh_opportunity_documents').delete().eq('id', documentId)
}

/** Update document extraction status */
export async function updateExtractionStatus(
  documentId: string,
  status: string,
  error?: string,
  rawText?: string,
  pageCount?: number,
) {
  const supabase = getAdmin()
  const update: Record<string, unknown> = { extraction_status: status }
  if (error) update.extraction_error = error
  if (rawText !== undefined) update.raw_text = rawText
  if (pageCount !== undefined) update.page_count = pageCount
  if (status === 'completed') update.extracted_at = new Date().toISOString()

  await supabase.from('bh_opportunity_documents').update(update).eq('id', documentId)
}

/** Save extracted data from LLM */
export async function saveExtractedData(
  data: Omit<ExtractedData, 'id' | 'extracted_at'>,
): Promise<ExtractedData> {
  const supabase = getAdmin()
  const { data: result, error } = await supabase
    .from('bh_extracted_data')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result as ExtractedData
}

/** Get all extracted data for an opportunity (aggregated from all documents) */
export async function getAggregatedExtraction(opportunityId: string): Promise<AggregatedExtraction | null> {
  const supabase = getAdmin()
  const { data, error } = await supabase
    .from('bh_extracted_data')
    .select('*')
    .eq('opportunity_id', opportunityId)

  if (error) throw error
  if (!data || data.length === 0) return null

  const extractions = data as ExtractedData[]

  // Merge all extractions into one aggregated view
  const allTrades = new Set<string>()
  const allExclusions = new Set<string>()
  const allFinishItems: AggregatedExtraction['finish_schedule'] = []
  const allMaterials: AggregatedExtraction['materials'] = []
  let totalPainting = 0, extPainting = 0, intPainting = 0, stuccoTotal = 0
  let confidenceSum = 0, confidenceCount = 0

  // Pick the best (non-null) value for singular fields
  let scopeSummary: string | null = null
  let bondingRequired: boolean | null = null
  let bondingAmount: number | null = null
  let insuranceMin: number | null = null
  let prevailingWage: boolean | null = null
  let sdvosbReq: AggregatedExtraction['sdvosb_requirement'] = null
  let liquidatedDmg: number | null = null
  let preBid: string | null = null
  let bidDue: string | null = null
  let projStart: string | null = null
  let projEnd: string | null = null

  for (const ext of extractions) {
    if (ext.trades_in_scope) ext.trades_in_scope.forEach(t => allTrades.add(t))
    if (ext.exclusions) ext.exclusions.forEach(e => allExclusions.add(e))
    if (ext.finish_schedule) allFinishItems.push(...ext.finish_schedule)
    if (ext.materials_specified) allMaterials.push(...ext.materials_specified)

    if (ext.total_painting_sqft) totalPainting += ext.total_painting_sqft
    if (ext.exterior_painting_sqft) extPainting += ext.exterior_painting_sqft
    if (ext.interior_painting_sqft) intPainting += ext.interior_painting_sqft
    if (ext.stucco_sqft) stuccoTotal += ext.stucco_sqft

    if (ext.confidence_score != null) { confidenceSum += ext.confidence_score; confidenceCount++ }

    // Take first non-null for singular fields
    if (!scopeSummary && ext.scope_summary) scopeSummary = ext.scope_summary
    if (bondingRequired == null && ext.bonding_required != null) bondingRequired = ext.bonding_required
    if (bondingAmount == null && ext.bonding_amount != null) bondingAmount = ext.bonding_amount
    if (insuranceMin == null && ext.insurance_minimum != null) insuranceMin = ext.insurance_minimum
    if (prevailingWage == null && ext.prevailing_wage != null) prevailingWage = ext.prevailing_wage
    if (!sdvosbReq && ext.sdvosb_requirement) sdvosbReq = ext.sdvosb_requirement
    if (liquidatedDmg == null && ext.liquidated_damages != null) liquidatedDmg = ext.liquidated_damages
    if (!preBid && ext.pre_bid_meeting) preBid = ext.pre_bid_meeting
    if (!bidDue && ext.bid_due_date) bidDue = ext.bid_due_date
    if (!projStart && ext.project_start_date) projStart = ext.project_start_date
    if (!projEnd && ext.project_completion_date) projEnd = ext.project_completion_date
  }

  return {
    documents_count: extractions.length,
    scope_summary: scopeSummary,
    trades_in_scope: Array.from(allTrades),
    exclusions: Array.from(allExclusions),
    finish_schedule: allFinishItems,
    total_painting_sqft: totalPainting || null,
    exterior_painting_sqft: extPainting || null,
    interior_painting_sqft: intPainting || null,
    stucco_sqft: stuccoTotal || null,
    materials: allMaterials,
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
    avg_confidence: confidenceCount > 0 ? confidenceSum / confidenceCount : null,
  }
}

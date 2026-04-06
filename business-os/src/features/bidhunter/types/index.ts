// BidHunter — Tipos TypeScript

export type OpportunityStatus = 'new' | 'scored' | 'interested' | 'discarded' | 'bid_sent' | 'won' | 'lost'
export type BCStatus = 'unknown' | 'new' | 'in_progress' | 'submitted' | 'awarded' | 'not_awarded'

export interface Opportunity {
  id: string
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
  source_platform: string
  source_id: string | null
  raw_data: Record<string, unknown> | null
  building_sqft: number | null
  building_height_floors: number | null
  scope_notes: string | null
  status: OpportunityStatus
  imported_at: string
  created_at: string
  // Outcome tracking
  actual_value: number | null
  commission_pct: number | null
  commission_earned: number | null
  won_at: string | null
  lost_at: string | null
  loss_reason: string | null
  // BuildingConnected sync
  bc_status: BCStatus
  bid_amount: number | null
  bid_submitted_at: string | null
}

export interface BidEstimate {
  exterior_sqft: number | null
  exterior_total: number | null
  interior_sqft: number | null
  interior_total: number | null
  stucco_sqft: number | null
  stucco_total: number | null
  high_rise_surcharge: number | null
  total_estimate: number | null
  estimate_notes: string | null
}

export interface OpportunityScore {
  id: string
  opportunity_id: string
  score: number
  justification: string
  matching_services: string[] | null
  sdvosb_bonus: boolean
  bid_estimate: BidEstimate | null
  scored_at: string
}

export interface OpportunityWithScore extends Opportunity {
  bh_opportunity_scores: OpportunityScore | null
}

export interface TicoService {
  name: string
  keywords: string[]
}

export interface TicoPricing {
  exterior_painting_sqft: number
  interior_painting_sqft: number
  stucco_repairs_sqft: number
  high_rise_surcharge_pct: number
  high_rise_floor_threshold: number
}

export interface TicoProfile {
  id: string
  company_name: string
  services: TicoService[]
  preferred_regions: string[] | null
  preferred_states: string[] | null
  min_project_value: number
  max_project_value: number | null
  sdvosb_priority_boost: number
  pricing: TicoPricing
  updated_at: string
  // SDVOSB enhancements
  sdvosb_auto_filter: boolean
  sdvosb_cert_number: string | null
  sdvosb_cert_expiry: string | null
}

export interface PipelineLog {
  id: string
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

// Filtros del panel
export interface OpportunityFilters {
  minScore: number | null
  status: OpportunityStatus | 'all'
  bcStatus: BCStatus | 'all'
  stateCode: string | null
  trade: string | null
  search: string
  sdvosbOnly: boolean
  hideSubmitted: boolean
}

// CSV Import
export interface CSVRow {
  title?: string
  description?: string
  gc_name?: string
  gc_contact?: string
  location?: string
  state_code?: string
  deadline?: string
  estimated_value?: string | number
  trades_required?: string
  is_sdvosb_eligible?: string | boolean
  source_platform?: string
  source_id?: string
  [key: string]: unknown
}

// ── Bid Draft Generator ──

export interface PricingLineItem {
  description: string
  quantity: number
  unit: string
  unit_price: number
  total: number
}

export interface BidDraft {
  id?: string
  opportunity_id: string
  version: number
  cover_letter: string
  scope_of_work: string
  pricing_breakdown: PricingLineItem[]
  total_amount: number
  tone: string
  language: string
  generated_at?: string
  edited_at?: string
  is_final: boolean
}

// ── KPIs ──

export interface BidHunterKPIs {
  total: number
  new: number
  scored: number
  interested: number
  bid_sent: number
  won: number
  lost: number
  discarded: number
  win_rate: number
  response_rate: number
  pipeline_value: number
  commission_earned: number
  avg_score: number
  sdvosb_count: number
}

export interface FunnelStage {
  stage: string
  count: number
  pct: number
}

export interface WeeklySnapshot {
  week_start: string
  win_rate: number
  pipeline_value: number
  bids_sent: number
  won: number
  commission_total: number
}

// ── PDF Intelligence ──

export type DocumentType = 'specs' | 'finish_schedule' | 'plans' | 'addendum' | 'bid_form' | 'other'
export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type ExtractionMethod = 'text' | 'ocr' | 'vision' | 'ocr+text'

export interface OpportunityDocument {
  id: string
  opportunity_id: string
  filename: string
  file_path: string
  file_size: number | null
  mime_type: string
  document_type: DocumentType
  page_count: number | null
  raw_text: string | null
  uploaded_at: string
  extracted_at: string | null
  extraction_status: ExtractionStatus
  extraction_error: string | null
  ocr_processed: boolean
  ocr_confidence: number | null
  ocr_language: string
  extraction_method: ExtractionMethod
}

// ── OCR ──

export interface OCRPageResult {
  page: number
  text: string
  confidence: number
}

export interface OCRResult {
  text: string
  pages: OCRPageResult[]
  avg_confidence: number
  language: string
  total_pages: number
}

export interface FinishScheduleItem {
  area: string
  finish_type: string
  sqft: number
  notes: string | null
}

export interface MaterialSpec {
  brand: string
  product: string
  spec_section: string | null
}

export type SDVOSBRequirement = 'set-aside' | 'preference' | 'mentioned'

export interface ExtractedData {
  id: string
  opportunity_id: string
  document_id: string
  // Scope
  scope_summary: string | null
  trades_in_scope: string[] | null
  exclusions: string[] | null
  // Finish schedule
  finish_schedule: FinishScheduleItem[] | null
  total_painting_sqft: number | null
  exterior_painting_sqft: number | null
  interior_painting_sqft: number | null
  stucco_sqft: number | null
  materials_specified: MaterialSpec[] | null
  // Requisitos contractuales
  bonding_required: boolean | null
  bonding_amount: number | null
  insurance_minimum: number | null
  prevailing_wage: boolean | null
  sdvosb_requirement: SDVOSBRequirement | null
  liquidated_damages: number | null
  // Deadlines
  pre_bid_meeting: string | null
  bid_due_date: string | null
  project_start_date: string | null
  project_completion_date: string | null
  // Meta
  confidence_score: number | null
  raw_extraction: Record<string, unknown> | null
  extracted_at: string
}

// Aggregated extracted data for an opportunity (merged from all its documents)
export interface AggregatedExtraction {
  documents_count: number
  scope_summary: string | null
  trades_in_scope: string[]
  exclusions: string[]
  finish_schedule: FinishScheduleItem[]
  total_painting_sqft: number | null
  exterior_painting_sqft: number | null
  interior_painting_sqft: number | null
  stucco_sqft: number | null
  materials: MaterialSpec[]
  bonding_required: boolean | null
  bonding_amount: number | null
  insurance_minimum: number | null
  prevailing_wage: boolean | null
  sdvosb_requirement: SDVOSBRequirement | null
  liquidated_damages: number | null
  pre_bid_meeting: string | null
  bid_due_date: string | null
  project_start_date: string | null
  project_completion_date: string | null
  avg_confidence: number | null
}

// ─── Videndum — Domain Types ──────────────────────────────────────────────────
// Tenant: Videndum | Fuente: Historico Vent Mod.xlsx

// catalog_type es nullable: Order Intake no desagrega por tipo de empaque.
export type CatalogType = 'INV' | 'PKG' | null

export type MetricType =
  | 'revenue'             // pestaña Revenue — facturación real (INV/PKG)
  | 'order_intake'        // pestaña Order intake — órdenes confirmadas (sin catalog_type)
  | 'order_book'          // pestaña Order book — órdenes en proceso (INV/PKG)
  | 'opportunities'       // pestaña Opportunities — pipeline ponderado decimal (INV/PKG)
  | 'opportunities_unfact'// pestaña Opportunities Unfactored — pipeline bruto (INV/PKG)
  | 'opp_history'         // pestaña Opportunities history — histórico ganadas/perdidas (INV/PKG)

// ─── Entidad principal ────────────────────────────────────────────────────────
// Formato largo: una fila por (part_number, catalog_type, metric_type, year, month)

export interface VidendumRecord {
  id: string
  tenant_id: string
  part_number: string
  catalog_type: CatalogType   // NULL para order_intake
  metric_type: MetricType
  year: number
  month: number | null        // 1–12 para datos mensuales; null = total anual consolidado
  quantity: number            // integer para la mayoría; decimal para opportunities
  source_sheet: string | null
  imported_at: string
  created_at: string
  updated_at: string
}

export type VidendumRecordInput = Omit<
  VidendumRecord,
  'id' | 'imported_at' | 'created_at' | 'updated_at'
>

// ─── Filtros y paginación ──────────────────────────────────────────────────────

export interface VidendumFilters {
  metric_type?: MetricType
  catalog_type?: CatalogType
  part_number?: string
  year?: number
  month?: number
  search?: string
}

export interface VidendumPagination {
  page: number
  pageSize: number
  total: number
}

export interface VidendumListResponse {
  data: VidendumRecord[]
  pagination: VidendumPagination
}

// ─── Vista cruzada Revenue vs Order Intake ────────────────────────────────────

export interface RevVsIntakeRow {
  part_number: string
  catalog_type: CatalogType
  year: number
  month: number | null
  revenue_qty: number
  order_intake_qty: number | null
  delta: number | null
}

// ─── Videndum — Service Layer ─────────────────────────────────────────────────
// Capa de acceso a datos para el tenant Videndum.
// Reemplaza los placeholders con las tablas reales de Supabase.

import type {
  VidendumRecord,
  VidendumRecordInput,
  VidendumFilters,
  VidendumListResponse,
} from '../types'

const TENANT_ID = 'videndum'
const TABLE = 'videndum_records' // TODO: ajustar al nombre real de la tabla

// Helper: lazy-load del cliente Supabase para evitar dependencias circulares
async function getClient() {
  const { createClient } = await import('@/lib/supabase/client')
  return createClient()
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getRecords(
  filters: VidendumFilters = {},
  page = 1,
  pageSize = 20
): Promise<VidendumListResponse> {
  const supabase = await getClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .eq('tenant_id', TENANT_ID)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.search) query = query.ilike('title', `%${filters.search}%`)
  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
  if (filters.dateTo) query = query.lte('created_at', filters.dateTo)

  const { data, error, count } = await query
  if (error) throw error

  return {
    data: data ?? [],
    pagination: { page, pageSize, total: count ?? 0 },
  }
}

export async function getRecordById(id: string): Promise<VidendumRecord> {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .eq('tenant_id', TENANT_ID)
    .single()

  if (error) throw error
  return data
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createRecord(input: VidendumRecordInput): Promise<VidendumRecord> {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...input, tenant_id: TENANT_ID })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateRecord(
  id: string,
  patch: Partial<VidendumRecordInput>
): Promise<VidendumRecord> {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', TENANT_ID)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteRecord(id: string): Promise<void> {
  const supabase = await getClient()
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .eq('tenant_id', TENANT_ID)

  if (error) throw error
}

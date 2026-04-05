import type { DashboardKPIs, CategoriaSummary, TendenciaMensual, Movimiento, ImportResult } from '../types'

export async function fetchMovimientos(empresaId: string): Promise<Movimiento[]> {
  const res = await fetch(`/api/contacr/movimientos?empresa_id=${empresaId}`)
  if (!res.ok) throw new Error('Error al cargar movimientos')
  return res.json()
}

export async function fetchDashboard(empresaId: string): Promise<{
  kpis: DashboardKPIs
  categorias: { ingresos: CategoriaSummary[]; gastos: CategoriaSummary[] }
  tendencia: TendenciaMensual[]
}> {
  const res = await fetch(`/api/contacr/dashboard?empresa_id=${empresaId}`)
  if (!res.ok) throw new Error('Error al cargar dashboard')
  return res.json()
}

export async function importCsv(empresaId: string, file: File): Promise<ImportResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('empresa_id', empresaId)

  const res = await fetch('/api/contacr/import', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error al importar')
  }
  return res.json()
}

export function formatCRC(amount: number): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

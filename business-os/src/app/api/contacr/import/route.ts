import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const empresaId = formData.get('empresa_id') as string | null

    if (!file || !empresaId) {
      return NextResponse.json({ error: 'file y empresa_id son requeridos' }, { status: 400 })
    }

    // Verificar que la empresa pertenece al usuario
    const { data: empresa } = await supabase
      .from('contacr_empresas')
      .select('id')
      .eq('id', empresaId)
      .eq('tenant_id', user.id)
      .single()

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    const text = await file.text()
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

    if (lines.length < 2) {
      return NextResponse.json({ error: 'El archivo debe tener al menos un encabezado y una fila de datos' }, { status: 400 })
    }

    // Parsear headers (flexible)
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''))
    const colMap = resolveColumns(headers)

    if (colMap.fecha === -1 || colMap.monto === -1) {
      return NextResponse.json({
        error: `Columnas requeridas no encontradas. Se necesita al menos: fecha, monto. Headers encontrados: ${headers.join(', ')}`,
      }, { status: 400 })
    }

    const movimientos: Array<Record<string, unknown>> = []
    const errores: string[] = []
    let totalIngresos = 0
    let totalGastos = 0

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i])
      try {
        const fecha = cols[colMap.fecha]?.trim()
        const monto = parseFloat(cols[colMap.monto]?.replace(/[,$₡"']/g, '').trim())

        if (!fecha || isNaN(monto) || monto <= 0) {
          errores.push(`Fila ${i + 1}: fecha o monto inválido`)
          continue
        }

        // Validar formato fecha
        const fechaParsed = parseDate(fecha)
        if (!fechaParsed) {
          errores.push(`Fila ${i + 1}: formato de fecha no reconocido: "${fecha}"`)
          continue
        }

        const descripcion = colMap.descripcion >= 0 ? cols[colMap.descripcion]?.trim() || `Movimiento fila ${i + 1}` : `Movimiento fila ${i + 1}`
        const tipo = colMap.tipo >= 0 ? normalizeTipo(cols[colMap.tipo]?.trim()) : 'gasto'
        const categoria = colMap.categoria >= 0 ? cols[colMap.categoria]?.trim() || null : null
        const referencia = colMap.referencia >= 0 ? cols[colMap.referencia]?.trim() || null : null

        if (tipo === 'ingreso') totalIngresos += monto
        else totalGastos += monto

        movimientos.push({
          empresa_id: empresaId,
          tenant_id: user.id,
          fecha: fechaParsed,
          descripcion,
          tipo,
          categoria,
          monto,
          referencia,
          origen: 'csv',
        })
      } catch {
        errores.push(`Fila ${i + 1}: error al procesar`)
      }
    }

    // Insertar en batch
    if (movimientos.length > 0) {
      const { error: insertError } = await supabase
        .from('contacr_movimientos')
        .insert(movimientos)

      if (insertError) {
        return NextResponse.json({ error: `Error al insertar: ${insertError.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({
      importados: movimientos.length,
      errores: errores.length,
      detalleErrores: errores.slice(0, 20),
      totalIngresos,
      totalGastos,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

function resolveColumns(headers: string[]) {
  const find = (keywords: string[]) =>
    headers.findIndex((h) => keywords.some((k) => h.includes(k)))

  return {
    fecha: find(['fecha', 'date', 'dia']),
    descripcion: find(['descripcion', 'description', 'detalle', 'concepto']),
    tipo: find(['tipo', 'type', 'naturaleza']),
    categoria: find(['categoria', 'category', 'rubro']),
    monto: find(['monto', 'amount', 'valor', 'importe', 'total']),
    referencia: find(['referencia', 'reference', 'ref', 'factura', 'comprobante']),
  }
}

function normalizeTipo(raw: string): 'ingreso' | 'gasto' {
  const lower = (raw || '').toLowerCase()
  if (['ingreso', 'income', 'venta', 'entrada', 'credito', 'crédito'].some((k) => lower.includes(k))) {
    return 'ingreso'
  }
  return 'gasto'
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

function parseDate(raw: string): string | null {
  // Intenta YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  // Intenta DD/MM/YYYY
  const dmy = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  // Intenta MM/DD/YYYY
  const mdy = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`
  // Fallback: intentar Date.parse
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  return null
}

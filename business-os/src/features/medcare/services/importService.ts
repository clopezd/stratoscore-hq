import { createClient } from '@/lib/supabase/client'
import type {
  CSVPacienteRow,
  CSVValidationResult,
  PacienteFiltrado,
  LeadMedcareInsert,
} from '../types'

// ── Columnas requeridas del CSV ──────────────────────────────
const REQUIRED_COLUMNS = [
  'Nombre',
  'Telefono',
  'Fecha_Nacimiento',
  'Servicio_Realizado',
  'Fecha_Ultima_Cita',
] as const

// ── Parser CSV ───────────────────────────────────────────────
export function parseCSV(text: string): CSVPacienteRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  // Detectar separador (comma o semicolon)
  const headerLine = lines[0]
  const separator = headerLine.includes(';') ? ';' : ','

  const headers = headerLine.split(separator).map(h => h.trim().replace(/^["']|["']$/g, ''))

  return lines.slice(1)
    .filter(line => line.trim().length > 0)
    .map(line => {
      const values = parseLine(line, separator)
      const row: Record<string, string> = {}
      headers.forEach((h, i) => {
        row[h] = (values[i] || '').trim()
      })
      return row as unknown as CSVPacienteRow
    })
}

// Parsear línea respetando comillas
function parseLine(line: string, sep: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === sep && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

// ── Validación ───────────────────────────────────────────────
export function validateCSV(rows: CSVPacienteRow[], headers: string[]): CSVValidationResult {
  const errors: string[] = []

  // Verificar columnas requeridas
  const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col))
  if (missing.length > 0) {
    errors.push(`Columnas faltantes: ${missing.join(', ')}`)
    return { valid: false, errors, totalRows: rows.length, validRows: 0 }
  }

  let validRows = 0
  rows.forEach((row, i) => {
    const lineNum = i + 2 // +1 for header, +1 for 1-based
    if (!row.Nombre?.trim()) {
      errors.push(`Fila ${lineNum}: Nombre vacío`)
    } else if (!row.Telefono?.trim()) {
      errors.push(`Fila ${lineNum}: Teléfono vacío`)
    } else {
      validRows++
    }
  })

  // Limitar errores mostrados
  if (errors.length > 10) {
    const total = errors.length
    errors.splice(10)
    errors.push(`... y ${total - 10} errores más`)
  }

  return {
    valid: errors.length === 0,
    errors,
    totalRows: rows.length,
    validRows,
  }
}

// Extraer headers del texto CSV
export function extractHeaders(text: string): string[] {
  const firstLine = text.trim().split('\n')[0] || ''
  const separator = firstLine.includes(';') ? ';' : ','
  return firstLine.split(separator).map(h => h.trim().replace(/^["']|["']$/g, ''))
}

// ── Calcular edad ────────────────────────────────────────────
function calcularEdad(fechaNacimiento: string): number {
  const nacimiento = new Date(fechaNacimiento)
  if (isNaN(nacimiento.getTime())) return 0
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mesActual = hoy.getMonth()
  const mesNac = nacimiento.getMonth()
  if (mesActual < mesNac || (mesActual === mesNac && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

// ── Calcular meses desde última cita ─────────────────────────
function mesesDesde(fecha: string): number {
  const d = new Date(fecha)
  if (isNaN(d.getTime())) return 0
  const hoy = new Date()
  return (hoy.getFullYear() - d.getFullYear()) * 12 + (hoy.getMonth() - d.getMonth())
}

// ── Motor de filtrado (Inteligencia de Datos) ────────────────
export function filtrarPacientesReactivacion(rows: CSVPacienteRow[]): PacienteFiltrado[] {
  return rows
    .map(row => {
      const edad = calcularEdad(row.Fecha_Nacimiento)
      const mesesSinCita = mesesDesde(row.Fecha_Ultima_Cita)
      const genero = (row.Genero || '').trim()
      const servicio = (row.Servicio_Realizado || '').trim()

      return {
        nombre: row.Nombre.trim(),
        telefono: row.Telefono.trim(),
        email: row.Email?.trim(),
        fecha_nacimiento: row.Fecha_Nacimiento,
        edad,
        genero,
        servicio_previo: servicio,
        fecha_ultima_cita: row.Fecha_Ultima_Cita,
        meses_sin_cita: mesesSinCita,
        razon_reactivacion: '', // se asigna abajo
      }
    })
    .filter(p => {
      // Regla 1: Solo mujeres
      if (p.genero.toLowerCase() !== 'femenino' && p.genero.toLowerCase() !== 'f') return false

      // Regla 2: Edad >= 40
      if (p.edad < 40) return false

      // Regla 3: Servicio previo de ultrasonido Y última cita > 12 meses
      const esUltrasonido = p.servicio_previo.toLowerCase().includes('ultrasonido')
      if (!esUltrasonido) return false
      if (p.meses_sin_cita <= 12) return false

      return true
    })
    .map(p => ({
      ...p,
      genero: 'Femenino',
      razon_reactivacion:
        `Mujer ${p.edad} años, último ultrasonido hace ${p.meses_sin_cita} meses — candidata a mamografía`,
    }))
    .sort((a, b) => b.meses_sin_cita - a.meses_sin_cita) // priorizar las que llevan más tiempo sin cita
}

// ── Importar pacientes filtrados a medcare_leads ─────────────
export async function importarLeadsReactivacion(
  pacientes: PacienteFiltrado[]
): Promise<{ insertados: number; duplicados: number; errores: string[] }> {
  const supabase = createClient()
  const errores: string[] = []
  let insertados = 0
  let duplicados = 0

  // Obtener teléfonos existentes para evitar duplicados
  const { data: existentes } = await supabase
    .from('medcare_leads')
    .select('telefono')
    .eq('origen_importacion', true)

  const telefonosExistentes = new Set(
    (existentes || []).map(e => e.telefono.replace(/\D/g, ''))
  )

  // Insertar en lotes de 50
  const lote: LeadMedcareInsert[] = []

  for (const p of pacientes) {
    const telNormalizado = p.telefono.replace(/\D/g, '')
    if (telefonosExistentes.has(telNormalizado)) {
      duplicados++
      continue
    }
    telefonosExistentes.add(telNormalizado)

    lote.push({
      nombre: p.nombre,
      telefono: p.telefono,
      email: p.email,
      tipo_estudio: 'mamografia',
      fuente: 'importacion',
      notas: p.razon_reactivacion,
      fecha_nacimiento: p.fecha_nacimiento,
      genero: 'Femenino',
      servicio_previo: p.servicio_previo,
      fecha_ultima_cita: p.fecha_ultima_cita,
      origen_importacion: true,
      edad_calculada: p.edad,
    })

    // Insertar en lotes de 50
    if (lote.length >= 50) {
      const { error } = await supabase
        .from('medcare_leads')
        .insert(lote.map(l => ({ ...l, estado: 'nuevo' })))
      if (error) {
        errores.push(`Error en lote: ${error.message}`)
      } else {
        insertados += lote.length
      }
      lote.length = 0
    }
  }

  // Insertar resto
  if (lote.length > 0) {
    const { error } = await supabase
      .from('medcare_leads')
      .insert(lote.map(l => ({ ...l, estado: 'nuevo' })))
    if (error) {
      errores.push(`Error en lote final: ${error.message}`)
    } else {
      insertados += lote.length
    }
  }

  return { insertados, duplicados, errores }
}

'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { createPaciente } from '../services/pacientesService'
import type { PacienteInsert } from '../types/database'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ResultadoImportacion {
  exitosos: number
  errores: { fila: number; nombre: string; error: string }[]
}

export function ImportarPacientesModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)

  function descargarTemplate() {
    // Crear template de Excel
    const template = [
      {
        nombre: 'Juan Pérez',
        telefono: '+506 8888 7777',
        email: 'juan@example.com',
        fecha_nacimiento: '1980-05-15',
        diagnostico: 'Lesión medular L4',
        medico_referente: 'Dr. Carlos Rodríguez',
        hospital_origen: 'Hospital México',
        plan_sesiones: 20,
        notas_medicas: 'Sin contraindicaciones',
      },
      {
        nombre: 'María González',
        telefono: '+506 7777 6666',
        email: 'maria@example.com',
        fecha_nacimiento: '1975-08-22',
        diagnostico: 'ACV isquémico',
        medico_referente: 'Dra. Ana López',
        hospital_origen: 'Clínica Bíblica',
        plan_sesiones: 30,
        notas_medicas: '',
      },
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes')

    // Descargar archivo
    XLSX.writeFile(wb, 'template_pacientes_mobility.xlsx')
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setArchivo(file)
      setResultado(null)
    }
  }

  async function procesarArchivo() {
    if (!archivo) return

    setLoading(true)
    setResultado(null)

    try {
      // Leer archivo
      const data = await archivo.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json<any>(sheet)

      let exitosos = 0
      const errores: { fila: number; nombre: string; error: string }[] = []

      // Procesar cada fila
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const fila = i + 2 // +2 porque Excel empieza en 1 y tiene header

        try {
          // Validar campos requeridos
          if (!row.nombre || !row.telefono) {
            errores.push({
              fila,
              nombre: row.nombre || 'Sin nombre',
              error: 'Nombre y teléfono son obligatorios',
            })
            continue
          }

          // Crear paciente
          const paciente: PacienteInsert = {
            nombre: String(row.nombre).trim(),
            telefono: String(row.telefono).trim(),
            email: row.email ? String(row.email).trim() : undefined,
            fecha_nacimiento: row.fecha_nacimiento
              ? formatearFecha(row.fecha_nacimiento)
              : undefined,
            diagnostico: row.diagnostico ? String(row.diagnostico).trim() : undefined,
            medico_referente: row.medico_referente
              ? String(row.medico_referente).trim()
              : undefined,
            hospital_origen: row.hospital_origen
              ? String(row.hospital_origen).trim()
              : undefined,
            plan_sesiones: row.plan_sesiones ? Number(row.plan_sesiones) : 20,
            notas_medicas: row.notas_medicas ? String(row.notas_medicas).trim() : undefined,
          }

          await createPaciente(paciente)
          exitosos++
        } catch (error: any) {
          errores.push({
            fila,
            nombre: row.nombre || 'Sin nombre',
            error: error.message || 'Error desconocido',
          })
        }
      }

      setResultado({ exitosos, errores })

      if (exitosos > 0) {
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error procesando archivo:', error)
      setResultado({
        exitosos: 0,
        errores: [{ fila: 0, nombre: 'General', error: 'Error al leer el archivo' }],
      })
    } finally {
      setLoading(false)
    }
  }

  function formatearFecha(valor: any): string | undefined {
    if (!valor) return undefined

    // Si es un número serial de Excel
    if (typeof valor === 'number') {
      const fecha = XLSX.SSF.parse_date_code(valor)
      return `${fecha.y}-${String(fecha.m).padStart(2, '0')}-${String(fecha.d).padStart(2, '0')}`
    }

    // Si es string, intentar parsear
    if (typeof valor === 'string') {
      // Si ya está en formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return valor
      }

      // Intentar parsear otros formatos
      const date = new Date(valor)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    }

    return undefined
  }

  function handleClose() {
    setArchivo(null)
    setResultado(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Importar Pacientes</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Instrucciones</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Descarga el template de Excel con el formato correcto</li>
              <li>Llena los datos de tus pacientes (nombre y teléfono son obligatorios)</li>
              <li>Sube el archivo y haz clic en "Importar"</li>
            </ol>
          </div>

          {/* Botón descargar template */}
          <div>
            <button
              onClick={descargarTemplate}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <span>📥</span>
              Descargar Template Excel
            </button>
          </div>

          {/* Subir archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo Excel (.xlsx, .xls)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {archivo && (
              <p className="text-sm text-gray-600 mt-1">
                Archivo seleccionado: {archivo.name}
              </p>
            )}
          </div>

          {/* Resultados */}
          {resultado && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-600 text-sm font-medium">Exitosos</div>
                  <div className="text-2xl font-bold text-green-900">{resultado.exitosos}</div>
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-600 text-sm font-medium">Errores</div>
                  <div className="text-2xl font-bold text-red-900">{resultado.errores.length}</div>
                </div>
              </div>

              {/* Lista de errores */}
              {resultado.errores.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="font-semibold text-red-900 mb-2">Errores encontrados:</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {resultado.errores.map((err, idx) => (
                      <li key={idx}>
                        Fila {err.fila} ({err.nombre}): {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              {resultado ? 'Cerrar' : 'Cancelar'}
            </button>
            {!resultado && (
              <button
                onClick={procesarArchivo}
                disabled={!archivo || loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Importando...' : 'Importar Pacientes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import {
  parseCSV,
  validateCSV,
  extractHeaders,
  filtrarPacientesReactivacion,
  importarLeadsReactivacion,
} from '../services/importService'
import type { PacienteFiltrado, CSVValidationResult } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
}

type Step = 'upload' | 'preview' | 'importing' | 'done'

export function ImportarPacientesModal({ open, onClose, onImportComplete }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [validation, setValidation] = useState<CSVValidationResult | null>(null)
  const [totalCSV, setTotalCSV] = useState(0)
  const [filtrados, setFiltrados] = useState<PacienteFiltrado[]>([])
  const [resultado, setResultado] = useState<{ insertados: number; duplicados: number; errores: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setStep('upload')
    setValidation(null)
    setTotalCSV(0)
    setFiltrados([])
    setResultado(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Solo CSV
    if (!file.name.endsWith('.csv')) {
      setError('Solo se aceptan archivos .csv — si tienes Excel, guárdalo como CSV primero.')
      return
    }

    try {
      const text = await file.text()
      const headers = extractHeaders(text)
      const rows = parseCSV(text)
      const val = validateCSV(rows, headers)

      setValidation(val)
      setTotalCSV(rows.length)

      if (!val.valid && val.errors.some(e => e.startsWith('Columnas faltantes'))) {
        setError(`El CSV no tiene las columnas requeridas.\n\nColumnas encontradas: ${headers.join(', ')}\n\nColumnas necesarias: Nombre, Telefono, Fecha_Nacimiento, Servicio_Realizado, Fecha_Ultima_Cita`)
        return
      }

      // Verificar que exista columna Genero
      if (!headers.includes('Genero')) {
        setError('El CSV necesita una columna "Genero" para filtrar pacientes femeninas. Agrega la columna y vuelve a cargar.')
        return
      }

      // Aplicar motor de filtrado
      const candidatas = filtrarPacientesReactivacion(rows)
      setFiltrados(candidatas)
      setStep('preview')
    } catch (err) {
      setError(`Error leyendo el archivo: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  async function handleImport() {
    if (filtrados.length === 0) return
    setStep('importing')

    try {
      const res = await importarLeadsReactivacion(filtrados)
      setResultado(res)
      setStep('done')
      if (res.insertados > 0) onImportComplete()
    } catch (err) {
      setError(`Error importando: ${err instanceof Error ? err.message : 'Error desconocido'}`)
      setStep('preview')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Importar Base de Pacientes
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Carga CSV → Filtra candidatas a mamografía → Genera lista de reactivación
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Formato esperado */}
              <div className="bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-200 mb-2">
                  Formato del CSV requerido
                </h3>
                <p className="text-xs text-cyan-700 dark:text-cyan-300 mb-3">
                  El archivo debe tener estas columnas (la primera fila son los encabezados):
                </p>
                <div className="overflow-x-auto">
                  <table className="text-xs border-collapse">
                    <thead>
                      <tr className="text-cyan-800 dark:text-cyan-200">
                        <th className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">Nombre</th>
                        <th className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">Telefono</th>
                        <th className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">Fecha_Nacimiento</th>
                        <th className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">Servicio_Realizado</th>
                        <th className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">Fecha_Ultima_Cita</th>
                        <th className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">Genero</th>
                        <th className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">Email</th>
                      </tr>
                    </thead>
                    <tbody className="text-cyan-600 dark:text-cyan-400">
                      <tr>
                        <td className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">María López</td>
                        <td className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">8888-7777</td>
                        <td className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">1980-05-15</td>
                        <td className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">Ultrasonido</td>
                        <td className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">2024-11-20</td>
                        <td className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">Femenino</td>
                        <td className="border border-cyan-300 dark:border-cyan-700 px-3 py-1">maria@email.com</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2">
                  Columnas opcionales: Genero (requerida para filtrado), Email
                </p>
              </div>

              {/* Reglas de filtrado */}
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Reglas de filtrado automático
                </h3>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    Solo pacientes con Genero = <strong>Femenino</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    Edad <strong>≥ 40 años</strong> (calculada desde Fecha_Nacimiento)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    Servicio previo = <strong>Ultrasonido</strong> y última cita hace <strong>&gt; 12 meses</strong>
                  </li>
                </ul>
              </div>

              {/* Drop zone */}
              <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-600 transition group">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFile}
                  className="hidden"
                />
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Haz clic para seleccionar archivo CSV
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Solo archivos .csv — si tienes Excel, guárdalo como CSV UTF-8
                </p>
              </label>

              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Resumen de filtrado */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCSV}</p>
                  <p className="text-xs text-gray-500">Total en CSV</p>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-950 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{filtrados.length}</p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400">Candidatas mamografía</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-400">{totalCSV - filtrados.length}</p>
                  <p className="text-xs text-gray-500">Descartadas por filtro</p>
                </div>
              </div>

              {validation && !validation.valid && validation.errors.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">
                    Advertencias ({validation.errors.length}):
                  </p>
                  <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5">
                    {validation.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}

              {filtrados.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-gray-500 text-sm">Ningún paciente cumple los criterios de filtrado.</p>
                  <p className="text-gray-400 text-xs mt-1">Verifica que el CSV tenga mujeres de 40+ años con ultrasonido hace más de 12 meses.</p>
                  <button onClick={reset} className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 transition">
                    Cargar otro archivo
                  </button>
                </div>
              ) : (
                <>
                  {/* Tabla preview */}
                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 dark:text-gray-400">
                          <th className="px-4 py-3 font-medium">#</th>
                          <th className="px-4 py-3 font-medium">Nombre</th>
                          <th className="px-4 py-3 font-medium">Teléfono</th>
                          <th className="px-4 py-3 font-medium">Edad</th>
                          <th className="px-4 py-3 font-medium">Servicio Previo</th>
                          <th className="px-4 py-3 font-medium">Última Cita</th>
                          <th className="px-4 py-3 font-medium">Meses sin cita</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filtrados.slice(0, 50).map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-2 text-gray-400 text-xs">{i + 1}</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white font-medium">{p.nombre}</td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{p.telefono}</td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{p.edad} años</td>
                            <td className="px-4 py-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                {p.servicio_previo}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-500 text-xs">
                              {new Date(p.fecha_ultima_cita + 'T12:00:00').toLocaleDateString('es-CR')}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`text-xs font-semibold ${
                                p.meses_sin_cita > 24 ? 'text-red-600' : p.meses_sin_cita > 18 ? 'text-amber-600' : 'text-yellow-600'
                              }`}>
                                {p.meses_sin_cita} meses
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filtrados.length > 50 && (
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 text-center">
                        Mostrando 50 de {filtrados.length} pacientes
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Importando {filtrados.length} pacientes a la lista de reactivación...
              </p>
              <p className="text-xs text-gray-400 mt-1">Esto puede tomar unos segundos</p>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && resultado && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Importación completada</h3>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="bg-green-50 dark:bg-green-950 rounded-xl p-3">
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">{resultado.insertados}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Insertados</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950 rounded-xl p-3">
                  <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{resultado.duplicados}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Duplicados</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-xl font-bold text-gray-700 dark:text-gray-300">{resultado.errores.length}</p>
                  <p className="text-xs text-gray-500">Errores</p>
                </div>
              </div>
              {resultado.errores.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 text-left max-w-md mx-auto">
                  {resultado.errores.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Los pacientes importados aparecen en la pestaña &quot;Reactivación&quot; del panel de leads.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button onClick={handleClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 transition">
            {step === 'done' ? 'Cerrar' : 'Cancelar'}
          </button>
          <div className="flex gap-2">
            {step === 'preview' && (
              <>
                <button onClick={reset} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition">
                  Cargar otro
                </button>
                {filtrados.length > 0 && (
                  <button
                    onClick={handleImport}
                    className="px-5 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition"
                  >
                    Importar {filtrados.length} pacientes
                  </button>
                )}
              </>
            )}
            {step === 'done' && (
              <button
                onClick={handleClose}
                className="px-5 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition"
              >
                Ver lista de reactivación
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

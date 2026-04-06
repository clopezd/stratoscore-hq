'use client'

/**
 * ConFIRMA - Formulario de Nueva Solicitud
 * Equivalente a ScrSolicitud de Power App
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { confirmaBrand, getPrioridadColor } from '@/features/_archived/confirma/brand'
import {
  plantillasService,
  solicitudesService,
  adjuntosService,
  type Plantilla,
  type Prioridad
} from '@/features/_archived/confirma/services'

interface Aprobador {
  nivel: number
  usuario_email: string
  usuario_nombre: string
  orden: number
}

export default function FormularioSolicitud() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Datos del formulario
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<string>('')
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('Media')
  const [aprobadores, setAprobadores] = useState<Aprobador[]>([])
  const [archivos, setArchivos] = useState<File[]>([])

  // Formulario de agregar aprobador
  const [nivelSeleccionado, setNivelSeleccionado] = useState(1)
  const [emailAprobador, setEmailAprobador] = useState('')
  const [nombreAprobador, setNombreAprobador] = useState('')

  // Cargar plantillas y usuario
  useEffect(() => {
    async function cargarDatos() {
      try {
        const plantillasData = await plantillasService.listar({ estado: 'Activa' })
        setPlantillas(plantillasData)

        // Obtener usuario actual (simulado por ahora)
        setUsuario('Usuario Actual') // TODO: Obtener de Supabase Auth
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }
    cargarDatos()
  }, [])

  // Cargar datos de plantilla seleccionada
  useEffect(() => {
    if (!plantillaSeleccionada) return

    const plantilla = plantillas.find(p => p.id === plantillaSeleccionada)
    if (plantilla) {
      setAsunto(plantilla.asunto_predefinido || '')
      setDescripcion(plantilla.descripcion_predefinida || '')
      setPrioridad(plantilla.prioridad_defecto || 'Media')

      // Cargar aprobadores de la plantilla
      if (plantilla.aprobadores && plantilla.aprobadores.length > 0) {
        setAprobadores(plantilla.aprobadores.map(a => ({
          nivel: a.nivel,
          usuario_email: a.usuario_email,
          usuario_nombre: a.usuario_nombre || '',
          orden: a.orden
        })))
      }
    }
  }, [plantillaSeleccionada, plantillas])

  // Validar si se puede agregar un aprobador
  const puedeAgregarAprobador = () => {
    if (!emailAprobador || aprobadores.length >= 12) return false

    // No duplicar aprobador
    if (aprobadores.some(a => a.usuario_email === emailAprobador)) return false

    // Máximo 3 por nivel
    const aprobadoresEnNivel = aprobadores.filter(a => a.nivel === nivelSeleccionado)
    if (aprobadoresEnNivel.length >= 3) return false

    // Niveles consecutivos
    const maxNivel = Math.max(0, ...aprobadores.map(a => a.nivel))
    if (nivelSeleccionado > maxNivel + 1) return false

    return true
  }

  const agregarAprobador = () => {
    if (!puedeAgregarAprobador()) return

    const ordenEnNivel = aprobadores.filter(a => a.nivel === nivelSeleccionado).length + 1

    setAprobadores([
      ...aprobadores,
      {
        nivel: nivelSeleccionado,
        usuario_email: emailAprobador,
        usuario_nombre: nombreAprobador || emailAprobador,
        orden: ordenEnNivel
      }
    ])

    setEmailAprobador('')
    setNombreAprobador('')
  }

  const eliminarAprobador = (email: string) => {
    setAprobadores(aprobadores.filter(a => a.usuario_email !== email))
  }

  const handleArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files))
    }
  }

  const guardarBorrador = async () => {
    if (!asunto) {
      alert('El asunto es requerido')
      return
    }

    setLoading(true)
    try {
      const solicitud = await solicitudesService.crear({
        asunto,
        descripcion,
        prioridad,
        plantilla_id: plantillaSeleccionada || undefined,
        aprobadores
      })

      // Subir adjuntos
      for (const archivo of archivos) {
        await adjuntosService.subir(solicitud.id, archivo)
      }

      alert('Borrador guardado correctamente')
      router.push('/confirma/solicitudes')
    } catch (error) {
      console.error('Error guardando borrador:', error)
      alert('Error guardando borrador')
    } finally {
      setLoading(false)
    }
  }

  const enviarSolicitud = async () => {
    if (!asunto) {
      alert('El asunto es requerido')
      return
    }

    if (aprobadores.length === 0) {
      alert('Debe agregar al menos un aprobador')
      return
    }

    setLoading(true)
    try {
      const solicitud = await solicitudesService.crear({
        asunto,
        descripcion,
        prioridad,
        plantilla_id: plantillaSeleccionada || undefined,
        aprobadores
      })

      // Subir adjuntos
      for (const archivo of archivos) {
        await adjuntosService.subir(solicitud.id, archivo)
      }

      // Enviar
      await solicitudesService.enviar(solicitud.id)

      alert('Solicitud enviada correctamente')
      router.push('/confirma/solicitudes')
    } catch (error) {
      console.error('Error enviando solicitud:', error)
      alert('Error enviando solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div
        className="p-6 rounded-t-xl flex items-center gap-4"
        style={{
          background: confirmaBrand.gradients.header,
          borderRadius: `${confirmaBrand.borderRadius.lg} ${confirmaBrand.borderRadius.lg} 0 0`
        }}
      >
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-white text-2xl font-bold">SOLICITUD DE APROBACIONES</h1>
      </div>

      {/* Formulario */}
      <div
        className="p-8 rounded-b-xl"
        style={{
          backgroundColor: confirmaBrand.colors.borderLight,
          border: `1px solid ${confirmaBrand.colors.border}`
        }}
      >
        {/* Solicitante */}
        <div className="mb-6 flex items-center gap-4">
          <label className="font-bold text-right w-40" style={{ color: confirmaBrand.colors.text }}>
            SOLICITANTE:
          </label>
          <p className="text-xl" style={{ color: confirmaBrand.colors.textSecondary }}>
            {usuario}
          </p>
        </div>

        {/* Plantilla */}
        <div className="mb-6 flex items-center gap-4">
          <label className="font-bold text-right w-40" style={{ color: confirmaBrand.colors.text }}>
            PLANTILLA:
          </label>
          <select
            value={plantillaSeleccionada}
            onChange={(e) => setPlantillaSeleccionada(e.target.value)}
            className="flex-1 p-3 rounded-lg border-2"
            style={{
              borderColor: confirmaBrand.colors.accent,
              backgroundColor: confirmaBrand.colors.surface
            }}
          >
            <option value="">-- Seleccionar plantilla (opcional) --</option>
            {plantillas.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.area} - {p.proceso})
              </option>
            ))}
          </select>
        </div>

        {/* Asunto */}
        <div className="mb-6 flex items-start gap-4">
          <label className="font-bold text-right w-40 pt-3" style={{ color: confirmaBrand.colors.text }}>
            ASUNTO:
          </label>
          <input
            type="text"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            className="flex-1 p-3 rounded-lg border-2"
            style={{
              borderColor: confirmaBrand.colors.accent,
              backgroundColor: confirmaBrand.colors.surface,
              borderStyle: 'dotted'
            }}
            placeholder="Título de la solicitud"
          />
        </div>

        {/* Descripción */}
        <div className="mb-6 flex items-start gap-4">
          <label className="font-bold text-right w-40 pt-3" style={{ color: confirmaBrand.colors.text }}>
            DESCRIPCIÓN:
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={8}
            className="flex-1 p-3 rounded-lg border-2"
            style={{
              borderColor: confirmaBrand.colors.accent,
              backgroundColor: confirmaBrand.colors.surface,
              borderStyle: 'dotted'
            }}
            placeholder="Descripción detallada de la solicitud"
          />
        </div>

        {/* Prioridad */}
        <div className="mb-6 flex items-center gap-4">
          <label className="font-bold text-right w-40" style={{ color: confirmaBrand.colors.text }}>
            PRIORIDAD:
          </label>
          <div className="flex gap-4">
            {(['Alta', 'Media', 'Baja'] as Prioridad[]).map(p => (
              <button
                key={p}
                onClick={() => setPrioridad(p)}
                className="px-6 py-2 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: prioridad === p ? getPrioridadColor(p) : confirmaBrand.colors.surface,
                  color: prioridad === p ? '#fff' : confirmaBrand.colors.text,
                  border: `2px solid ${getPrioridadColor(p)}`
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Adjuntos */}
        <div className="mb-8 flex items-start gap-4">
          <label className="font-bold text-right w-40 pt-3" style={{ color: confirmaBrand.colors.text }}>
            DATOS ADJUNTOS:
          </label>
          <div className="flex-1">
            <input
              type="file"
              multiple
              onChange={handleArchivos}
              className="w-full p-3 rounded-lg border-2 border-dashed"
              style={{
                borderColor: confirmaBrand.colors.accent,
                backgroundColor: confirmaBrand.colors.surface
              }}
            />
            {archivos.length > 0 && (
              <div className="mt-2 space-y-1">
                {archivos.map((f, i) => (
                  <div key={i} className="text-sm" style={{ color: confirmaBrand.colors.textSecondary }}>
                    📎 {f.name} ({(f.size / 1024).toFixed(1)} KB)
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Aprobadores */}
        <div className="mb-8 border-t-2 pt-6" style={{ borderColor: confirmaBrand.colors.border }}>
          <h2 className="font-bold text-xl mb-4" style={{ color: confirmaBrand.colors.text }}>
            APROBADORES
          </h2>

          {/* Agregar Aprobador */}
          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: confirmaBrand.colors.surface }}>
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Nivel</label>
                <select
                  value={nivelSeleccionado}
                  onChange={(e) => setNivelSeleccionado(Number(e.target.value))}
                  className="w-full p-2 rounded border"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>Nivel {n}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={emailAprobador}
                  onChange={(e) => setEmailAprobador(e.target.value)}
                  className="w-full p-2 rounded border"
                  placeholder="aprobador@empresa.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre (opcional)</label>
                <input
                  type="text"
                  value={nombreAprobador}
                  onChange={(e) => setNombreAprobador(e.target.value)}
                  className="w-full p-2 rounded border"
                  placeholder="Nombre"
                />
              </div>
            </div>
            <button
              onClick={agregarAprobador}
              disabled={!puedeAgregarAprobador()}
              className="px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: puedeAgregarAprobador() ? confirmaBrand.colors.primary : '#ccc',
                color: '#fff'
              }}
            >
              + Agregar Aprobador
            </button>
            <p className="text-xs mt-2" style={{ color: confirmaBrand.colors.textSecondary }}>
              Máximo 3 por nivel · 12 en total · Niveles consecutivos
            </p>
          </div>

          {/* Lista de Aprobadores */}
          {aprobadores.length > 0 && (
            <div className="space-y-2">
              {Array.from(new Set(aprobadores.map(a => a.nivel))).sort().map(nivel => (
                <div key={nivel} className="p-3 rounded-lg" style={{ backgroundColor: confirmaBrand.colors.surface }}>
                  <h3 className="font-bold mb-2">Nivel {nivel}</h3>
                  <div className="space-y-1">
                    {aprobadores.filter(a => a.nivel === nivel).map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-white/50">
                        <span>{a.usuario_nombre || a.usuario_email}</span>
                        <button
                          onClick={() => eliminarAprobador(a.usuario_email)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: confirmaBrand.colors.border,
              color: confirmaBrand.colors.text
            }}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            onClick={guardarBorrador}
            className="px-6 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: confirmaBrand.colors.borrador,
              color: '#fff'
            }}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Borrador'}
          </button>

          <button
            onClick={enviarSolicitud}
            className="px-6 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: confirmaBrand.colors.enviada,
              color: '#fff'
            }}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </div>
    </div>
  )
}

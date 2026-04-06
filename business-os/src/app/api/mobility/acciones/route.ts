import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mobility/acciones
 * Panel de acciones diarias: slots vacíos, renovaciones, leads, inactivos
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const ahora = new Date()
    const hoyInicio = new Date(ahora)
    hoyInicio.setHours(0, 0, 0, 0)
    const hoyFin = new Date(ahora)
    hoyFin.setHours(23, 59, 59, 999)

    // Inicio de semana (lunes)
    const semanaInicio = new Date(ahora)
    semanaInicio.setDate(ahora.getDate() - ((ahora.getDay() + 6) % 7))
    semanaInicio.setHours(0, 0, 0, 0)
    const semanaFin = new Date(semanaInicio)
    semanaFin.setDate(semanaInicio.getDate() + 5) // L-S
    semanaFin.setHours(23, 59, 59, 999)

    const hace14Dias = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

    // Queries en paralelo
    const [
      citasHoyRes,
      citasSemanaRes,
      equiposRes,
      renovacionesRes,
      leadsRes,
      inactivosRes,
      slotsRes,
    ] = await Promise.all([
      // Citas de hoy (no canceladas)
      supabase
        .from('citas')
        .select('id, equipo_id, estado')
        .gte('fecha_hora', hoyInicio.toISOString())
        .lte('fecha_hora', hoyFin.toISOString())
        .neq('estado', 'cancelada'),

      // Citas de la semana (no canceladas)
      supabase
        .from('citas')
        .select('id')
        .gte('fecha_hora', semanaInicio.toISOString())
        .lte('fecha_hora', semanaFin.toISOString())
        .neq('estado', 'cancelada'),

      // Equipos activos
      supabase
        .from('equipos')
        .select('id, nombre')
        .eq('activo', true),

      // Pacientes próximos a vencer
      supabase
        .from('pacientes_proximo_vencimiento')
        .select('*')
        .order('sesiones_restantes', { ascending: true }),

      // Leads pendientes
      supabase
        .from('leads_mobility')
        .select('*')
        .in('estado', ['nuevo', 'contactado'])
        .order('created_at', { ascending: false }),

      // Pacientes inactivos (+14 días)
      supabase
        .from('pacientes')
        .select('id, nombre, telefono, fecha_ultima_sesion, sesiones_restantes, estado')
        .eq('estado', 'activo')
        .lt('fecha_ultima_sesion', hace14Dias)
        .order('fecha_ultima_sesion', { ascending: true }),

      // Slots libres hoy (horarios del centro)
      supabase
        .from('horarios_centro')
        .select('*')
        .eq('dia_semana', ahora.getDay())
        .eq('activo', true)
        .single(),
    ])

    const citasHoy = citasHoyRes.data || []
    const citasSemana = citasSemanaRes.data || []
    const equipos = equiposRes.data || []
    const renovaciones = renovacionesRes.data || []
    const leads = leadsRes.data || []
    const inactivos = inactivosRes.data || []
    const horario = slotsRes.data

    // Calcular métricas
    const totalEquipos = equipos.length
    const slotsXDia = totalEquipos * 10
    const slotsXSemana = totalEquipos * 10 * 6

    const ocupacionHoy = slotsXDia > 0
      ? Math.round((citasHoy.length / slotsXDia) * 100)
      : 0
    const ocupacionSemana = slotsXSemana > 0
      ? Math.round((citasSemana.length / slotsXSemana) * 100)
      : 0

    // Calcular slots vacíos de hoy
    const slotsVacios: Array<{ equipo_id: string; equipo_nombre: string; hora: string; fecha_hora: string }> = []

    if (horario) {
      const [hi] = horario.hora_inicio.split(':').map(Number)
      const [hf] = horario.hora_fin.split(':').map(Number)

      // Set de slots ocupados: "equipo_id-hora"
      const ocupados = new Set<string>()
      for (const cita of citasHoy) {
        // Obtener la hora de la cita
        const citaCompleta = await supabase
          .from('citas')
          .select('fecha_hora, equipo_id')
          .eq('id', cita.id)
          .single()
        if (citaCompleta.data) {
          const h = new Date(citaCompleta.data.fecha_hora).getHours()
          ocupados.add(`${citaCompleta.data.equipo_id}-${h}`)
        }
      }

      for (const equipo of equipos) {
        for (let h = hi; h < hf; h++) {
          if (!ocupados.has(`${equipo.id}-${h}`)) {
            const fechaHora = new Date(ahora)
            fechaHora.setHours(h, 0, 0, 0)
            // Solo slots futuros
            if (fechaHora > ahora) {
              slotsVacios.push({
                equipo_id: equipo.id,
                equipo_nombre: equipo.nombre,
                hora: `${String(h).padStart(2, '0')}:00`,
                fecha_hora: fechaHora.toISOString(),
              })
            }
          }
        }
      }
    }

    // Generar mensajes
    const formatNombre = (n: string) => n.split(' ')[0]

    const accionesRenovacion = renovaciones.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      telefono: p.telefono,
      sesiones_restantes: p.sesiones_restantes,
      fecha_ultima_sesion: p.fecha_ultima_sesion,
      prioridad: p.prioridad_renovacion,
      mensaje: p.sesiones_restantes <= 1
        ? `Hola ${formatNombre(p.nombre)}, esta es su última sesión del plan actual. Para no interrumpir su progreso, ¿le gustaría renovar su plan de tratamiento?`
        : `Hola ${formatNombre(p.nombre)}, le quedan ${p.sesiones_restantes} sesiones de su plan. ¿Desea renovar para continuar con su recuperación?`,
    }))

    const accionesLeads = leads.map((l: any) => {
      const extra = l.diagnostico_preliminar
        ? ` Vimos que su consulta es sobre ${l.diagnostico_preliminar.toLowerCase()}.`
        : ''
      return {
        id: l.id,
        nombre: l.nombre,
        telefono: l.telefono,
        diagnostico: l.diagnostico_preliminar,
        fuente: l.fuente,
        estado: l.estado,
        created_at: l.created_at,
        mensaje: `Hola ${formatNombre(l.nombre)}, recibimos su solicitud de evaluación.${extra} ¿Cuándo le gustaría agendar una valoración inicial?`,
      }
    })

    const accionesInactivos = inactivos.map((p: any) => {
      const dias = Math.floor((Date.now() - new Date(p.fecha_ultima_sesion).getTime()) / (1000 * 60 * 60 * 24))
      return {
        id: p.id,
        nombre: p.nombre,
        telefono: p.telefono,
        dias_sin_sesion: dias,
        sesiones_restantes: p.sesiones_restantes,
        fecha_ultima_sesion: p.fecha_ultima_sesion,
        mensaje: `Hola ${formatNombre(p.nombre)}, hace ${dias} días que no le vemos en el centro. La continuidad es clave para su recuperación. ¿Agendamos su próxima sesión?`,
      }
    })

    return NextResponse.json({
      metricas: {
        ocupacion_hoy_pct: ocupacionHoy,
        ocupacion_semana_pct: ocupacionSemana,
        meta_pct: 90,
        slots_vacios_hoy: slotsVacios.length,
        total_acciones: accionesRenovacion.length + accionesLeads.length + accionesInactivos.length,
      },
      slots_vacios: slotsVacios,
      renovaciones: accionesRenovacion,
      leads_nuevos: accionesLeads,
      pacientes_inactivos: accionesInactivos,
    })
  } catch (err) {
    console.error('Error in GET /api/mobility/acciones:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/**
 * POST /api/mobility/acciones
 * Marcar una acción como realizada (contactado)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { tipo, id } = await request.json()

    if (!tipo || !id) {
      return NextResponse.json({ error: 'tipo e id requeridos' }, { status: 400 })
    }

    if (tipo === 'lead') {
      await supabase
        .from('leads_mobility')
        .update({ estado: 'contactado', contactado_en: new Date().toISOString() })
        .eq('id', id)
    }

    if (tipo === 'renovacion' || tipo === 'inactivo') {
      const { data } = await supabase
        .from('pacientes')
        .select('notas_medicas')
        .eq('id', id)
        .single()

      const nota = `[${new Date().toLocaleDateString('es-CR')}] Contactado para ${tipo === 'renovacion' ? 'renovación' : 'reactivación'}`
      const notas = data?.notas_medicas ? `${nota}\n${data.notas_medicas}` : nota

      await supabase
        .from('pacientes')
        .update({ notas_medicas: notas })
        .eq('id', id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in POST /api/mobility/acciones:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

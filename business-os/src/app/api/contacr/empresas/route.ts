import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data, error } = await supabase
      .from('contacr_empresas')
      .select('*')
      .eq('tenant_id', user.id)
      .eq('activa', true)
      .order('nombre')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { nombre, cedula_juridica, tipo_persona, actividad_economica, moneda } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Crear empresa
    const { data: empresa, error: empError } = await supabase
      .from('contacr_empresas')
      .insert({
        tenant_id: user.id,
        nombre,
        cedula_juridica: cedula_juridica || null,
        tipo_persona: tipo_persona || 'juridica',
        actividad_economica: actividad_economica || null,
        moneda: moneda || 'CRC',
      })
      .select()
      .single()

    if (empError) return NextResponse.json({ error: empError.message }, { status: 500 })

    // Copiar template de cuentas a la nueva empresa
    const { data: template } = await supabase
      .from('contacr_cuentas_template')
      .select('codigo, nombre, tipo, naturaleza, nivel, padre_codigo, acepta_movimientos')
      .order('codigo')

    if (template && template.length > 0) {
      // Primera pasada: insertar todas las cuentas sin padre_id
      const cuentasInsert = template.map((t) => ({
        empresa_id: empresa.id,
        tenant_id: user.id,
        codigo: t.codigo,
        nombre: t.nombre,
        tipo: t.tipo,
        naturaleza: t.naturaleza,
        nivel: t.nivel,
        padre_id: null,
        acepta_movimientos: t.acepta_movimientos,
      }))

      const { data: cuentasCreadas, error: cuentasError } = await supabase
        .from('contacr_cuentas')
        .insert(cuentasInsert)
        .select('id, codigo')

      if (cuentasError) {
        console.error('Error al copiar plan de cuentas:', cuentasError)
      } else if (cuentasCreadas) {
        // Segunda pasada: actualizar padre_id basado en padre_codigo
        const codigoToId = new Map(cuentasCreadas.map((c) => [c.codigo, c.id]))

        for (const t of template) {
          if (t.padre_codigo) {
            const padreId = codigoToId.get(t.padre_codigo)
            const cuentaId = codigoToId.get(t.codigo)
            if (padreId && cuentaId) {
              await supabase
                .from('contacr_cuentas')
                .update({ padre_id: padreId })
                .eq('id', cuentaId)
            }
          }
        }
      }
    }

    return NextResponse.json(empresa, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

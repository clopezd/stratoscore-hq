import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { WorkoutPlanSchema } from '@/features/fitsync/types/training'
import { EXERCISES } from '@/features/fitsync/data/exercises'

const SYSTEM_PROMPT = `Eres un entrenador personal certificado y experto en programación de entrenamiento.

Genera un plan de entrenamiento semanal personalizado basado en el perfil del usuario.

Reglas:
- Usa SOLO ejercicios de la biblioteca proporcionada (respeta los IDs exactos)
- Compuestos primero, aislamiento después en cada sesión
- Progressive overload: 3-4 sets de 6-12 reps para hipertrofia, 4-6 reps para fuerza
- Descansa 60-90s para aislamiento, 90-180s para compuestos pesados
- Equilibra push/pull para evitar desbalances
- Incluye calentamiento implícito (sets ligeros marcados en notas)
- Ajusta volumen según nivel: principiante 12-16 sets/semana por músculo, intermedio 16-20, avanzado 20-25
- Duración estimada realista por sesión (45-75 min)
- Nombres de días en español
- Si el usuario tiene equipo limitado, adapta con lo disponible`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { goal, level, equipment, days_per_week, preferred_split } = body

    if (!goal || !level || !equipment || !days_per_week) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Filter exercises by available equipment
    const available = EXERCISES.filter(e => equipment.includes(e.equipment))
    const exerciseList = available
      .map(e => `- ${e.id}: ${e.name_es} (${e.muscle_group}, ${e.equipment}, ${e.exercise_type})`)
      .join('\n')

    const { object } = await generateObject({
      model: openrouter(MODELS.balanced),
      schema: WorkoutPlanSchema,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Genera un plan de entrenamiento con estos parámetros:

**Objetivo:** ${goal}
**Nivel:** ${level}
**Días por semana:** ${days_per_week}
**Split preferido:** ${preferred_split || 'el que mejor se adapte'}
**Equipo disponible:** ${equipment.join(', ')}

**Biblioteca de ejercicios disponibles:**
${exerciseList}

Genera el plan completo para ${days_per_week} días de entrenamiento.`,
        },
      ],
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error('[FitSync] Workout generation error:', error)
    return NextResponse.json(
      { error: 'Workout generation failed' },
      { status: 500 },
    )
  }
}

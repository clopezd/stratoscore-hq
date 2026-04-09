import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { SyncAdjustmentsSchema } from '@/features/fitsync/types/sync'
import type { SyncContext } from '@/features/fitsync/types/sync'

const SYSTEM_PROMPT = `Eres un nutricionista deportivo experto que sincroniza nutrición con entrenamiento de forma bidireccional.

Tu trabajo: dado el contexto de los últimos 3 días de nutrición y entrenamiento de un usuario, ajusta sus macros y volumen de entrenamiento para hoy.

## Reglas de Sincronización

### Entrenamiento → Nutrición
- Día PESADO (pierna, espalda completa): +15-20% carbohidratos, +15g proteína
- Día MODERADO (push, pull, brazos): +10% carbohidratos, +10g proteína
- Día LIGERO (cardio, movilidad): +5% carbohidratos
- Día de DESCANSO: -15% carbohidratos, +10g grasa (para saciedad)

### Nutrición → Entrenamiento
- 3 días consecutivos en déficit >15%: reducir volumen 15%, sugerir deload
- 3 días bajo en proteína (<1.5g/kg): alerta de recuperación comprometida
- 3 días en superávit >10%: aumentar volumen 10% para capitalizar
- Proteína consistentemente alta + superávit: condiciones ideales, mantener o subir levemente

### Alertas
- Genera alertas claras y accionables en español
- Tipo "warning" para déficits peligrosos o falta de proteína
- Tipo "info" para recomendaciones generales
- Tipo "success" para felicitar buena adherencia

### Importante
- Los ajustes deben ser graduales, no extremos
- Prioriza proteína siempre (la proteína es lo último que se reduce)
- Si no hay datos suficientes, mantén targets base y explica por qué
- Las calorías ajustadas nunca deben bajar de BMR (metabolismo basal)`

export async function POST(req: NextRequest) {
  try {
    const context: SyncContext = await req.json()

    if (!context.user_profile || !context.last_3_days_nutrition) {
      return NextResponse.json({ error: 'Missing context data' }, { status: 400 })
    }

    const { object } = await generateObject({
      model: openrouter(MODELS.fast),
      schema: SyncAdjustmentsSchema,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analiza el contexto y genera los ajustes de sincronización para hoy:

**Perfil del usuario:**
- Objetivo: ${context.user_profile.goal}
- TDEE base: ${context.user_profile.tdee} kcal
- Peso: ${context.user_profile.weight_kg} kg
- Targets base: ${context.user_profile.current_targets.calories} kcal, ${context.user_profile.current_targets.protein_g}g P, ${context.user_profile.current_targets.carbs_g}g C, ${context.user_profile.current_targets.fat_g}g F

**Últimos 3 días de nutrición:**
${context.last_3_days_nutrition.map(d =>
  `- ${d.date}: ${d.calories_consumed}/${d.target_calories} kcal (${d.deficit_or_surplus > 0 ? '+' : ''}${d.deficit_or_surplus}), P:${d.protein_g}g, C:${d.carbs_g}g, F:${d.fat_g}g`
).join('\n')}

**Últimos 3 días de entrenamiento:**
${context.last_3_days_training.length > 0
  ? context.last_3_days_training.map(d =>
      `- ${d.date}: ${d.day_name} (${d.focus}), ${d.total_sets} sets, RPE: ${d.avg_rpe ?? 'N/A'}, ${d.duration_min} min`
    ).join('\n')
  : '- Sin entrenamientos registrados en los últimos 3 días'}

**Entrenamiento planificado para hoy:**
${context.today_training_planned
  ? `${context.today_training_planned.day_name} (${context.today_training_planned.focus}), intensidad estimada: ${context.today_training_planned.estimated_intensity}`
  : 'Día de descanso / no planificado'}

Genera los ajustes de macros para hoy y las recomendaciones de volumen de entrenamiento.`,
        },
      ],
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error('[FitSync] Sync engine error:', error)
    return NextResponse.json(
      { error: 'Sync engine failed' },
      { status: 500 },
    )
  }
}

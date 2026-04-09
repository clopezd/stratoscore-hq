import { z } from 'zod'

// ─── Sync Engine Input ──────────────────────────────────────────

export interface SyncContext {
  user_profile: {
    goal: string
    tdee: number
    current_targets: {
      calories: number
      protein_g: number
      carbs_g: number
      fat_g: number
    }
    weight_kg: number
  }
  last_3_days_nutrition: Array<{
    date: string
    calories_consumed: number
    protein_g: number
    carbs_g: number
    fat_g: number
    target_calories: number
    deficit_or_surplus: number // negative = deficit
  }>
  last_3_days_training: Array<{
    date: string
    day_name: string
    focus: string
    total_sets: number
    avg_rpe: number | null
    duration_min: number
  }>
  today_training_planned: {
    day_name: string
    focus: string
    estimated_intensity: 'rest' | 'light' | 'moderate' | 'heavy'
  } | null
}

// ─── Sync Engine Output ─────────────────────────────────────────

export const SyncAdjustmentsSchema = z.object({
  nutrition_adjustments: z.object({
    calorie_target: z.number().describe('Nuevo target de calorías ajustado para hoy'),
    protein_target_g: z.number().describe('Nuevo target de proteína en gramos'),
    carbs_target_g: z.number().describe('Nuevo target de carbohidratos en gramos'),
    fat_target_g: z.number().describe('Nuevo target de grasa en gramos'),
    reasoning_es: z.string().describe('Explicación en español de por qué se ajustaron los macros'),
  }),
  training_adjustments: z.object({
    volume_modifier: z.number().min(0.5).max(1.5).describe('Multiplicador de volumen (1.0 = sin cambio, 0.85 = reducir 15%)'),
    deload_recommended: z.boolean().describe('¿Se recomienda un deload esta semana?'),
    reasoning_es: z.string().describe('Explicación en español de los ajustes de entrenamiento'),
  }),
  alerts: z.array(z.object({
    type: z.enum(['warning', 'info', 'success']).describe('Tipo de alerta'),
    message: z.string().describe('Mensaje de alerta en español'),
  })).describe('Alertas y recomendaciones para el usuario'),
  training_intensity: z.enum(['rest', 'light', 'moderate', 'heavy']).describe('Intensidad clasificada del día de hoy'),
})

export type SyncAdjustments = z.infer<typeof SyncAdjustmentsSchema>

// ─── Stored Daily Target ────────────────────────────────────────

export interface DailyTarget {
  date: string
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fat_g: number
  training_intensity: string
  adjustment_reason: string
  alerts: Array<{ type: string; message: string }>
}

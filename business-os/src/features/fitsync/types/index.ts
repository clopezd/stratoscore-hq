import { z } from 'zod'

// ─── Food Analysis (Vision AI response) ─────────────────────────

export const FoodItemSchema = z.object({
  name: z.string().describe('Nombre del alimento'),
  estimated_quantity_g: z.number().describe('Cantidad estimada en gramos'),
  calories: z.number().describe('Calorías del item'),
  protein_g: z.number().describe('Proteína en gramos'),
  carbs_g: z.number().describe('Carbohidratos en gramos'),
  fat_g: z.number().describe('Grasa en gramos'),
})

export const FoodAnalysisSchema = z.object({
  meal_name: z.string().describe('Nombre general del plato o comida'),
  items: z.array(FoodItemSchema).describe('Ingredientes/componentes identificados'),
  total_calories: z.number().describe('Calorías totales del plato'),
  total_protein_g: z.number().describe('Proteína total en gramos'),
  total_carbs_g: z.number().describe('Carbohidratos totales en gramos'),
  total_fat_g: z.number().describe('Grasa total en gramos'),
  total_fiber_g: z.number().describe('Fibra total en gramos'),
  confidence: z.number().min(0).max(1).describe('Nivel de confianza del análisis (0-1)'),
  suggestions: z.string().optional().describe('Sugerencias nutricionales breves'),
})

export type FoodAnalysis = z.infer<typeof FoodAnalysisSchema>
export type FoodItem = z.infer<typeof FoodItemSchema>

// ─── Meal Types ─────────────────────────────────────────────────

export const MealType = z.enum([
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'pre_workout',
  'post_workout',
])
export type MealType = z.infer<typeof MealType>

// ─── User Profile ───────────────────────────────────────────────

export const GoalType = z.enum(['muscle_gain', 'fat_loss', 'maintain', 'recomp'])
export type GoalType = z.infer<typeof GoalType>

export const ActivityLevel = z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
export type ActivityLevel = z.infer<typeof ActivityLevel>

export const DietaryPreference = z.enum(['omnivore', 'vegetarian', 'vegan', 'keto', 'gluten_free', 'lactose_free'])
export type DietaryPreference = z.infer<typeof DietaryPreference>

export const SexType = z.enum(['male', 'female'])
export type SexType = z.infer<typeof SexType>

export interface FSUserProfile {
  id: string
  user_id: string
  birth_date: string | null
  sex: SexType | null
  height_cm: number | null
  current_weight_kg: number | null
  goal: GoalType | null
  activity_level: ActivityLevel | null
  target_weight_kg: number | null
  tdee_kcal: number | null
  target_calories: number | null
  target_protein_g: number | null
  target_carbs_g: number | null
  target_fat_g: number | null
  dietary_preference: DietaryPreference
  allergies: string[]
  created_at: string
  updated_at: string
}

export interface FSMeal {
  id: string
  user_id: string
  meal_type: MealType
  logged_at: string
  name: string
  description: string | null
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number | null
  image_url: string | null
  ai_analysis: FoodAnalysis | null
  ai_confidence: number | null
  user_adjusted: boolean
  created_at: string
}

// ─── Daily Summary ──────────────────────────────────────────────

export interface DailyMacros {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface DailySummary {
  date: string
  consumed: DailyMacros
  targets: DailyMacros
  meals: FSMeal[]
  remaining: DailyMacros
}

// ─── TDEE Calculation ───────────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

/** Mifflin-St Jeor equation */
export function calculateTDEE(
  sex: SexType,
  weightKg: number,
  heightCm: number,
  ageYears: number,
  activityLevel: ActivityLevel,
): number {
  const bmr = sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

/** Calculate macro targets based on goal and TDEE */
export function calculateMacroTargets(
  tdee: number,
  goal: GoalType,
  weightKg: number,
): DailyMacros {
  let calories: number
  let proteinPerKg: number

  switch (goal) {
    case 'muscle_gain':
      calories = Math.round(tdee * 1.1) // +10% surplus
      proteinPerKg = 2.0
      break
    case 'fat_loss':
      calories = Math.round(tdee * 0.8) // -20% deficit
      proteinPerKg = 2.2 // higher protein to preserve muscle
      break
    case 'recomp':
      calories = tdee // maintenance
      proteinPerKg = 2.0
      break
    default: // maintain
      calories = tdee
      proteinPerKg = 1.8
      break
  }

  const protein_g = Math.round(weightKg * proteinPerKg)
  const fat_g = Math.round((calories * 0.25) / 9) // 25% from fat
  const carbs_g = Math.round((calories - protein_g * 4 - fat_g * 9) / 4) // remaining from carbs

  return { calories, protein_g, carbs_g, fat_g }
}

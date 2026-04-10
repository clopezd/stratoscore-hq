// ─── Types (client-safe, no zod) ────────────────────────────────

export type GoalType = 'muscle_gain' | 'fat_loss' | 'maintain' | 'recomp'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type SexType = 'male' | 'female'
export type DietaryPreference = 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'gluten_free' | 'lactose_free'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout'
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'band' | 'kettlebell'

export interface DailyMacros {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
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
      calories = Math.round(tdee * 1.1)
      proteinPerKg = 2.0
      break
    case 'fat_loss':
      calories = Math.round(tdee * 0.8)
      proteinPerKg = 2.2
      break
    case 'recomp':
      calories = tdee
      proteinPerKg = 2.0
      break
    default:
      calories = tdee
      proteinPerKg = 1.8
      break
  }

  const protein_g = Math.round(weightKg * proteinPerKg)
  const fat_g = Math.round((calories * 0.25) / 9)
  const carbs_g = Math.round((calories - protein_g * 4 - fat_g * 9) / 4)

  return { calories, protein_g, carbs_g, fat_g }
}

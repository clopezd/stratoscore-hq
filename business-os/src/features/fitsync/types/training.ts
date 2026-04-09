import { z } from 'zod'

// ─── Exercise Database ──────────────────────────────────────────

export const MuscleGroup = z.enum([
  'chest', 'back', 'shoulders', 'quadriceps', 'hamstrings',
  'glutes', 'biceps', 'triceps', 'core', 'calves', 'forearms', 'full_body',
])
export type MuscleGroup = z.infer<typeof MuscleGroup>

export const Equipment = z.enum([
  'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band', 'kettlebell',
])
export type Equipment = z.infer<typeof Equipment>

export const ExerciseType = z.enum(['compound', 'isolation', 'cardio', 'flexibility'])
export type ExerciseType = z.infer<typeof ExerciseType>

export const SplitType = z.enum([
  'push_pull_legs', 'upper_lower', 'full_body', 'bro_split', 'functional',
])
export type SplitType = z.infer<typeof SplitType>

export interface Exercise {
  id: string
  name: string
  name_es: string
  muscle_group: MuscleGroup
  secondary_muscles: MuscleGroup[]
  equipment: Equipment
  exercise_type: ExerciseType
  instructions_es: string
}

// ─── Workout Plan (AI generated) ────────────────────────────────

export const WorkoutExerciseSchema = z.object({
  exercise_id: z.string().describe('ID del ejercicio de la biblioteca'),
  exercise_name: z.string().describe('Nombre del ejercicio'),
  sets: z.number().describe('Número de series'),
  reps_min: z.number().describe('Repeticiones mínimas'),
  reps_max: z.number().describe('Repeticiones máximas'),
  rest_seconds: z.number().describe('Descanso entre series en segundos'),
  notes: z.string().optional().describe('Notas adicionales del ejercicio'),
  sort_order: z.number().describe('Orden del ejercicio en la sesión'),
})

export const WorkoutDaySchema = z.object({
  day_number: z.number().describe('Número del día (1-7)'),
  name: z.string().describe('Nombre del día (ej: Push Day, Piernas)'),
  focus: z.string().describe('Grupo muscular principal'),
  estimated_duration_min: z.number().describe('Duración estimada en minutos'),
  exercises: z.array(WorkoutExerciseSchema).describe('Lista de ejercicios del día'),
})

export const WorkoutPlanSchema = z.object({
  name: z.string().describe('Nombre del plan de entrenamiento'),
  description: z.string().describe('Descripción breve del plan'),
  split_type: SplitType.describe('Tipo de split del plan'),
  days: z.array(WorkoutDaySchema).describe('Días de entrenamiento de la semana'),
  notes: z.string().optional().describe('Notas generales del plan'),
})

export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>
export type WorkoutDay = z.infer<typeof WorkoutDaySchema>
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>

// ─── Workout Log (user tracking) ────────────────────────────────

export interface LoggedSet {
  id: string
  exercise_id: string
  set_number: number
  reps: number
  weight_kg: number
  is_warmup: boolean
  rpe: number | null
}

export interface WorkoutLog {
  id: string
  day_name: string
  started_at: string
  finished_at: string | null
  duration_min: number | null
  perceived_effort: number | null
  sets: LoggedSet[]
}

// ─── Generation Request ─────────────────────────────────────────

export interface GenerateWorkoutRequest {
  goal: string
  level: 'beginner' | 'intermediate' | 'advanced'
  equipment: Equipment[]
  days_per_week: number
  preferred_split?: SplitType
}

export type Locale = 'es' | 'en'

export const translations = {
  // ─── General ──────────────────────────────────────────────────
  app_name: { es: 'FitSync AI', en: 'FitSync AI' },
  loading: { es: 'Cargando...', en: 'Loading...' },
  save: { es: 'Guardar', en: 'Save' },
  saved: { es: '¡Guardado!', en: 'Saved!' },
  cancel: { es: 'Cancelar', en: 'Cancel' },
  next: { es: 'Siguiente', en: 'Next' },
  back: { es: 'Atrás', en: 'Back' },
  finish: { es: 'Finalizar', en: 'Finish' },
  start: { es: 'Iniciar', en: 'Start' },
  delete: { es: 'Eliminar', en: 'Delete' },
  today: { es: 'Hoy', en: 'Today' },
  kcal_remaining: { es: 'kcal restantes', en: 'kcal remaining' },

  // ─── Tabs ─────────────────────────────────────────────────────
  tab_nutrition: { es: 'Nutrición', en: 'Nutrition' },
  tab_training: { es: 'Training', en: 'Training' },
  tab_progress: { es: 'Progreso', en: 'Progress' },
  tab_profile: { es: 'Perfil', en: 'Profile' },

  // ─── Nutrition ────────────────────────────────────────────────
  take_photo: { es: 'Toma una foto de tu comida', en: 'Take a photo of your meal' },
  upload_image: { es: 'o sube una imagen de tu galería', en: 'or upload from your gallery' },
  analyzing: { es: 'Analizando nutrición...', en: 'Analyzing nutrition...' },
  confidence: { es: 'Confianza', en: 'Confidence' },
  see_breakdown: { es: 'Ver desglose', en: 'See breakdown' },
  items: { es: 'items', en: 'items' },
  no_meals: { es: 'No has registrado comidas hoy', en: 'No meals logged today' },
  tap_plus: { es: 'Toca + para analizar tu primera comida', en: 'Tap + to analyze your first meal' },
  meals_today: { es: 'Comidas de hoy', en: "Today's meals" },
  protein: { es: 'Proteína', en: 'Protein' },
  carbs: { es: 'Carbohidratos', en: 'Carbs' },
  fat: { es: 'Grasa', en: 'Fat' },
  fiber: { es: 'Fibra', en: 'Fiber' },

  // ─── Meal types ───────────────────────────────────────────────
  meal_breakfast: { es: 'Desayuno', en: 'Breakfast' },
  meal_lunch: { es: 'Almuerzo', en: 'Lunch' },
  meal_dinner: { es: 'Cena', en: 'Dinner' },
  meal_snack: { es: 'Snack', en: 'Snack' },
  meal_pre_workout: { es: 'Pre-workout', en: 'Pre-workout' },
  meal_post_workout: { es: 'Post-workout', en: 'Post-workout' },

  // ─── Training ─────────────────────────────────────────────────
  generate_plan: { es: 'Generar plan de entrenamiento', en: 'Generate workout plan' },
  generating_plan: { es: 'Generando plan...', en: 'Generating plan...' },
  generate_with_ai: { es: 'Genera tu plan con IA', en: 'Generate your plan with AI' },
  new_plan: { es: 'Nuevo plan', en: 'New plan' },
  see_plan: { es: 'Ver plan', en: 'See plan' },
  start_workout: { es: 'Iniciar entrenamiento', en: 'Start workout' },
  finish_workout: { es: 'Terminar', en: 'Finish' },
  rest: { es: 'Descanso', en: 'Rest' },
  sets: { es: 'sets', en: 'sets' },
  reps: { es: 'reps', en: 'reps' },
  weight_kg: { es: 'Peso (kg)', en: 'Weight (kg)' },
  delete_plan: { es: 'Eliminar plan y generar uno nuevo', en: 'Delete plan and generate new one' },

  // ─── Goals ────────────────────────────────────────────────────
  goal_muscle_gain: { es: 'Ganar músculo', en: 'Build muscle' },
  goal_fat_loss: { es: 'Perder grasa', en: 'Lose fat' },
  goal_maintain: { es: 'Mantener', en: 'Maintain' },
  goal_recomp: { es: 'Recomposición', en: 'Recomposition' },
  goal_strength: { es: 'Fuerza', en: 'Strength' },
  goal_general: { es: 'Fitness general', en: 'General fitness' },

  // ─── Levels ───────────────────────────────────────────────────
  level_beginner: { es: 'Principiante', en: 'Beginner' },
  level_intermediate: { es: 'Intermedio', en: 'Intermediate' },
  level_advanced: { es: 'Avanzado', en: 'Advanced' },

  // ─── Activity ─────────────────────────────────────────────────
  activity_sedentary: { es: 'Sedentario', en: 'Sedentary' },
  activity_light: { es: 'Ligero (1-3 días/sem)', en: 'Light (1-3 days/wk)' },
  activity_moderate: { es: 'Moderado (3-5 días/sem)', en: 'Moderate (3-5 days/wk)' },
  activity_active: { es: 'Activo (6-7 días/sem)', en: 'Active (6-7 days/wk)' },
  activity_very_active: { es: 'Muy activo (2x/día)', en: 'Very active (2x/day)' },

  // ─── Equipment ────────────────────────────────────────────────
  eq_barbell: { es: 'Barra', en: 'Barbell' },
  eq_dumbbell: { es: 'Mancuernas', en: 'Dumbbells' },
  eq_machine: { es: 'Máquinas', en: 'Machines' },
  eq_cable: { es: 'Cables', en: 'Cables' },
  eq_bodyweight: { es: 'Peso corporal', en: 'Bodyweight' },
  eq_kettlebell: { es: 'Kettlebell', en: 'Kettlebell' },
  eq_band: { es: 'Bandas', en: 'Bands' },

  // ─── Splits ───────────────────────────────────────────────────
  split_ppl: { es: 'Push/Pull/Legs', en: 'Push/Pull/Legs' },
  split_ul: { es: 'Upper/Lower', en: 'Upper/Lower' },
  split_fb: { es: 'Full Body', en: 'Full Body' },
  split_bro: { es: 'Bro Split', en: 'Bro Split' },
  split_func: { es: 'Funcional', en: 'Functional' },

  // ─── Profile ──────────────────────────────────────────────────
  your_profile: { es: 'Tu Perfil', en: 'Your Profile' },
  configure_data: { es: 'Configura tus datos para calcular macros', en: 'Set up your data to calculate macros' },
  sex: { es: 'Sexo', en: 'Sex' },
  male: { es: 'Masculino', en: 'Male' },
  female: { es: 'Femenino', en: 'Female' },
  age: { es: 'Edad', en: 'Age' },
  weight: { es: 'Peso (kg)', en: 'Weight (kg)' },
  height: { es: 'Altura (cm)', en: 'Height (cm)' },
  goal: { es: 'Objetivo', en: 'Goal' },
  activity_level: { es: 'Nivel de actividad', en: 'Activity level' },
  calculated_targets: { es: 'Targets calculados', en: 'Calculated targets' },
  save_profile: { es: 'Guardar perfil', en: 'Save profile' },

  // ─── Progress ─────────────────────────────────────────────────
  progress: { es: 'Progreso', en: 'Progress' },
  register_today: { es: 'Registrar medidas de hoy', en: "Log today's measurements" },
  body_fat: { es: 'Grasa (%)', en: 'Body fat (%)' },
  waist: { es: 'Cintura (cm)', en: 'Waist (cm)' },
  no_weight_data: { es: 'No hay datos de peso registrados', en: 'No weight data logged' },
  no_nutrition_data: { es: 'No hay historial de nutrición', en: 'No nutrition history' },
  no_training_data: { es: 'No hay entrenamientos registrados', en: 'No workouts logged' },
  current_weight: { es: 'Peso actual (kg)', en: 'Current weight (kg)' },
  change: { es: 'Cambio (kg)', en: 'Change (kg)' },
  records: { es: 'Registros', en: 'Records' },
  avg_cal_day: { es: 'Promedio kcal/día', en: 'Avg kcal/day' },
  avg_protein_day: { es: 'Promedio proteína/día', en: 'Avg protein/day' },
  daily_calories: { es: 'Calorías diarias', en: 'Daily calories' },
  macronutrients: { es: 'Macronutrientes (g)', en: 'Macronutrients (g)' },
  recent_history: { es: 'Historial reciente', en: 'Recent history' },
  workouts: { es: 'Workouts', en: 'Workouts' },
  avg_session: { es: 'Prom/sesión', en: 'Avg/session' },
  total_volume: { es: 'Vol. total', en: 'Total vol.' },

  // ─── Sync Engine ──────────────────────────────────────────────
  sync_engine: { es: 'Sync Engine', en: 'Sync Engine' },
  sync: { es: 'Sincronizar', en: 'Sync' },
  adjusted_targets: { es: 'Targets ajustados para hoy', en: "Today's adjusted targets" },
  intensity_rest: { es: 'Descanso', en: 'Rest' },
  intensity_light: { es: 'Ligero', en: 'Light' },
  intensity_moderate: { es: 'Moderado', en: 'Moderate' },
  intensity_heavy: { es: 'Pesado', en: 'Heavy' },
  volume: { es: 'Volumen', en: 'Volume' },
  deload_recommended: { es: 'Deload recomendado', en: 'Deload recommended' },

  // ─── Onboarding ───────────────────────────────────────────────
  onboarding_welcome: { es: '¡Bienvenido a FitSync AI!', en: 'Welcome to FitSync AI!' },
  onboarding_subtitle: { es: 'Tu nutrición y tu entrenamiento, sincronizados por IA.', en: 'Your nutrition and training, synced by AI.' },
  onboarding_step1_title: { es: 'Datos físicos', en: 'Physical data' },
  onboarding_step1_desc: { es: 'Necesitamos tu información básica para calcular tus macros.', en: 'We need your basic info to calculate your macros.' },
  onboarding_step2_title: { es: 'Tu objetivo', en: 'Your goal' },
  onboarding_step2_desc: { es: '¿Qué quieres lograr?', en: 'What do you want to achieve?' },
  onboarding_step3_title: { es: 'Tu equipo', en: 'Your equipment' },
  onboarding_step3_desc: { es: '¿Qué equipo tienes disponible para entrenar?', en: 'What equipment do you have available?' },
  onboarding_step4_title: { es: '¡Listo!', en: 'All set!' },
  onboarding_step4_desc: { es: 'Estos son tus targets personalizados.', en: 'Here are your personalized targets.' },
  lets_go: { es: '¡Vamos!', en: "Let's go!" },

  // ─── Gamification ─────────────────────────────────────────────
  streak: { es: 'Racha', en: 'Streak' },
  days: { es: 'días', en: 'days' },
  share_week: { es: 'Compartir resumen semanal', en: 'Share weekly summary' },
  badge_first_meal: { es: 'Primera comida', en: 'First meal' },
  badge_first_workout: { es: 'Primer entrenamiento', en: 'First workout' },
  badge_week_complete: { es: 'Semana completa', en: 'Week complete' },
  badge_synced: { es: 'Sincronizado', en: 'Synced' },
  badge_100_meals: { es: '100 comidas', en: '100 meals' },
} as const

export type TranslationKey = keyof typeof translations

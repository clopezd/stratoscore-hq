-- ============================================================
-- FitSync AI — Complete Schema
-- Nutrition + Training + Sync Engine + Progress
-- ============================================================

-- ===== USER PROFILES =====
CREATE TABLE IF NOT EXISTS fs_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Physical data
  birth_date DATE,
  sex TEXT CHECK (sex IN ('male', 'female')),
  height_cm NUMERIC(5,1),
  current_weight_kg NUMERIC(5,1),
  -- Goals
  goal TEXT CHECK (goal IN ('muscle_gain', 'fat_loss', 'maintain', 'recomp')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  target_weight_kg NUMERIC(5,1),
  -- Calculated
  tdee_kcal INTEGER,
  target_calories INTEGER,
  target_protein_g INTEGER,
  target_carbs_g INTEGER,
  target_fat_g INTEGER,
  -- Preferences
  dietary_preference TEXT DEFAULT 'omnivore',
  allergies TEXT[] DEFAULT '{}',
  available_equipment TEXT[] DEFAULT '{}',
  training_days_per_week INTEGER DEFAULT 4,
  -- Meta
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ===== MEALS =====
CREATE TABLE IF NOT EXISTS fs_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  logged_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  calories INTEGER NOT NULL,
  protein_g NUMERIC(5,1),
  carbs_g NUMERIC(5,1),
  fat_g NUMERIC(5,1),
  fiber_g NUMERIC(5,1),
  image_url TEXT,
  ai_analysis JSONB,
  ai_confidence NUMERIC(3,2),
  user_adjusted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== MEAL ITEMS =====
CREATE TABLE IF NOT EXISTS fs_meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES fs_meals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity_g NUMERIC(6,1),
  calories INTEGER,
  protein_g NUMERIC(5,1),
  carbs_g NUMERIC(5,1),
  fat_g NUMERIC(5,1)
);

-- ===== EXERCISES (shared library) =====
CREATE TABLE IF NOT EXISTS fs_exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_es TEXT,
  muscle_group TEXT NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}',
  equipment TEXT CHECK (equipment IN ('barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band', 'kettlebell')),
  exercise_type TEXT CHECK (exercise_type IN ('compound', 'isolation', 'cardio', 'flexibility')),
  instructions_es TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== WORKOUT PLANS =====
CREATE TABLE IF NOT EXISTS fs_workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  split_type TEXT,
  days_per_week INTEGER,
  goal TEXT,
  plan_data JSONB NOT NULL, -- Full plan structure (days + exercises)
  generated_by_ai BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== WORKOUT LOGS =====
CREATE TABLE IF NOT EXISTS fs_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES fs_workout_plans(id) ON DELETE SET NULL,
  day_name TEXT NOT NULL,
  focus TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_min INTEGER,
  perceived_effort INTEGER CHECK (perceived_effort BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== WORKOUT LOG SETS =====
CREATE TABLE IF NOT EXISTS fs_workout_log_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID REFERENCES fs_workout_logs(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg NUMERIC(5,1),
  is_warmup BOOLEAN DEFAULT false,
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  notes TEXT
);

-- ===== DAILY TARGETS (Sync Engine) =====
CREATE TABLE IF NOT EXISTS fs_daily_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  target_calories INTEGER,
  target_protein_g INTEGER,
  target_carbs_g INTEGER,
  target_fat_g INTEGER,
  training_intensity TEXT,
  adjustment_reason TEXT,
  sync_adjustments JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ===== SYNC LOG =====
CREATE TABLE IF NOT EXISTS fs_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  triggered_by TEXT CHECK (triggered_by IN ('meal_logged', 'workout_logged', 'daily_recalc', 'manual')),
  trigger_id UUID,
  adjustments JSONB NOT NULL,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== BODY METRICS (Progress) =====
CREATE TABLE IF NOT EXISTS fs_body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight_kg NUMERIC(5,1),
  body_fat_pct NUMERIC(4,1),
  waist_cm NUMERIC(5,1),
  chest_cm NUMERIC(5,1),
  arm_cm NUMERIC(5,1),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_fs_meals_user_date ON fs_meals(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_fs_workout_logs_user_date ON fs_workout_logs(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_fs_daily_targets_user_date ON fs_daily_targets(user_id, date);
CREATE INDEX IF NOT EXISTS idx_fs_body_metrics_user_date ON fs_body_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_fs_workout_log_sets_log ON fs_workout_log_sets(workout_log_id);
CREATE INDEX IF NOT EXISTS idx_fs_meal_items_meal ON fs_meal_items(meal_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE fs_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fs_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fs_meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fs_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE fs_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fs_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fs_workout_log_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fs_daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fs_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fs_body_metrics ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "fs_user_profiles_own" ON fs_user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "fs_meals_own" ON fs_meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "fs_meal_items_own" ON fs_meal_items FOR ALL
  USING (meal_id IN (SELECT id FROM fs_meals WHERE user_id = auth.uid()));
CREATE POLICY "fs_workout_plans_own" ON fs_workout_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "fs_workout_logs_own" ON fs_workout_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "fs_workout_log_sets_own" ON fs_workout_log_sets FOR ALL
  USING (workout_log_id IN (SELECT id FROM fs_workout_logs WHERE user_id = auth.uid()));
CREATE POLICY "fs_daily_targets_own" ON fs_daily_targets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "fs_sync_log_own" ON fs_sync_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "fs_body_metrics_own" ON fs_body_metrics FOR ALL USING (auth.uid() = user_id);

-- Exercises library: readable by all authenticated, writable by service role only
CREATE POLICY "fs_exercises_read" ON fs_exercises FOR SELECT TO authenticated USING (true);

-- ============================================================
-- FitSync AI — Payments (Polar)
-- ============================================================

-- Subscriptions table
CREATE TABLE IF NOT EXISTS fs_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'pending')),
  polar_subscription_id TEXT UNIQUE,
  polar_customer_id TEXT,
  polar_product_id TEXT,
  price_cents INTEGER,
  billing_interval TEXT CHECK (billing_interval IN ('month', 'year')),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_fs_subscriptions_user ON fs_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_fs_subscriptions_polar ON fs_subscriptions(polar_subscription_id);

-- RLS
ALTER TABLE fs_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fs_subscriptions_own" ON fs_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Add tier column to user profiles for quick access
ALTER TABLE fs_user_profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite'));

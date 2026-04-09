'use server'

import { createClient } from '@/lib/supabase/server'
import { polar, FITSYNC_PRODUCTS, type FitSyncTier } from '@/lib/polar'

export async function getUserTier(): Promise<FitSyncTier> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data } = await supabase
    .from('fs_subscriptions')
    .select('tier, status, current_period_end')
    .eq('user_id', user.id)
    .single()

  if (!data || data.status !== 'active') return 'free'

  // Check if subscription has expired
  if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
    return 'free'
  }

  return data.tier as FitSyncTier
}

export async function createCheckout(productKey: keyof typeof FITSYNC_PRODUCTS) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const productId = FITSYNC_PRODUCTS[productKey]
  if (!productId) return { error: 'Invalid product' }

  try {
    const checkout = await polar.checkouts.custom.create({
      productId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/fitsync/checkout/success`,
      customerEmail: user.email!,
      metadata: {
        user_id: user.id,
        product_key: productKey,
      },
    })

    return { url: checkout.url }
  } catch (error) {
    console.error('[FitSync Billing] Checkout error:', error)
    return { error: 'Failed to create checkout' }
  }
}

export async function getSubscriptionDetails() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('fs_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

// ─── Feature gates ──────────────────────────────────────────────

const TIER_LIMITS = {
  free: {
    food_photos_per_day: 3,
    workout_plans: 1,
    sync_engine: false,
    history_days: 7,
    premium_vision: false,
    ai_coach: false,
    progress_photos: false,
  },
  pro: {
    food_photos_per_day: Infinity,
    workout_plans: Infinity,
    sync_engine: true,
    history_days: Infinity,
    premium_vision: true,
    ai_coach: false,
    progress_photos: true,
  },
  elite: {
    food_photos_per_day: Infinity,
    workout_plans: Infinity,
    sync_engine: true,
    history_days: Infinity,
    premium_vision: true,
    ai_coach: true,
    progress_photos: true,
  },
} as const

export type TierLimits = typeof TIER_LIMITS[FitSyncTier]

export function getTierLimits(tier: FitSyncTier): TierLimits {
  return TIER_LIMITS[tier]
}

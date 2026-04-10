import { Polar } from '@polar-sh/sdk'

const isSandbox = process.env.POLAR_ENVIRONMENT !== 'production'

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN?.trim(),
  server: isSandbox ? 'sandbox' : 'production',
})

export const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET?.trim() ?? ''

// FitSync product IDs (set in .env.local after creating products in Polar dashboard)
export const FITSYNC_PRODUCTS = {
  pro_monthly: process.env.FITSYNC_PRO_MONTHLY_ID ?? '',
  pro_yearly: process.env.FITSYNC_PRO_YEARLY_ID ?? '',
  elite_monthly: process.env.FITSYNC_ELITE_MONTHLY_ID ?? '',
  elite_yearly: process.env.FITSYNC_ELITE_YEARLY_ID ?? '',
} as const

import type { FitSyncTier } from '@/features/fitsync/types/billing'
export type { FitSyncTier }

export function getTierFromProductId(productId: string): FitSyncTier {
  if (productId === FITSYNC_PRODUCTS.pro_monthly || productId === FITSYNC_PRODUCTS.pro_yearly) return 'pro'
  if (productId === FITSYNC_PRODUCTS.elite_monthly || productId === FITSYNC_PRODUCTS.elite_yearly) return 'elite'
  return 'free'
}

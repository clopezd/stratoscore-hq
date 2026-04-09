import { Metadata } from 'next'
import { FitSyncLanding } from '@/features/fitsync/components/landing/FitSyncLanding'

export const metadata: Metadata = {
  title: 'FitSync AI — Your Nutrition & Training, Synced by AI',
  description: 'The first app that bidirectionally syncs your nutrition and training. AI-powered food analysis, personalized workout plans, and smart macro adjustments.',
  openGraph: {
    title: 'FitSync AI — Nutrition + Training, Synced',
    description: 'Take a photo of your meal. Get instant macros. Your workout plan adjusts automatically.',
    type: 'website',
  },
}

export default function FitSyncLandingPage() {
  return <FitSyncLanding />
}

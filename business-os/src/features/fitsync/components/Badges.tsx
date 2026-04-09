'use client'

import { useState, useEffect } from 'react'
import { Award } from 'lucide-react'
import { useLocale } from '../i18n/useLocale'
import type { TranslationKey } from '../i18n/translations'

interface Badge {
  id: string
  icon: string
  labelKey: TranslationKey
  condition: () => boolean
}

const BADGES: Badge[] = [
  {
    id: 'first_meal',
    icon: '🍽️',
    labelKey: 'badge_first_meal',
    condition: () => {
      const meals = localStorage.getItem('fitsync_meal_history')
      return meals ? JSON.parse(meals).length > 0 : false
    },
  },
  {
    id: 'first_workout',
    icon: '💪',
    labelKey: 'badge_first_workout',
    condition: () => {
      const history = localStorage.getItem('fitsync_workout_history')
      return history ? JSON.parse(history).length > 0 : false
    },
  },
  {
    id: 'week_complete',
    icon: '📅',
    labelKey: 'badge_week_complete',
    condition: () => {
      const streak = localStorage.getItem('fitsync_streak')
      return streak ? JSON.parse(streak).current >= 7 : false
    },
  },
  {
    id: 'synced',
    icon: '⚡',
    labelKey: 'badge_synced',
    condition: () => {
      return !!localStorage.getItem('fitsync_sync_adjustments')
    },
  },
  {
    id: '100_meals',
    icon: '🏆',
    labelKey: 'badge_100_meals',
    condition: () => {
      const meals = localStorage.getItem('fitsync_meal_history')
      return meals ? JSON.parse(meals).length >= 100 : false
    },
  },
]

export function Badges() {
  const { t } = useLocale()
  const [earned, setEarned] = useState<string[]>([])

  useEffect(() => {
    const unlocked = BADGES.filter(b => b.condition()).map(b => b.id)
    setEarned(unlocked)
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Award size={14} />
        <span>Badges ({earned.length}/{BADGES.length})</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {BADGES.map(badge => {
          const isEarned = earned.includes(badge.id)
          return (
            <div
              key={badge.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                isEarned
                  ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                  : 'bg-gray-100 text-gray-400 grayscale'
              }`}
            >
              <span className={isEarned ? '' : 'opacity-30'}>{badge.icon}</span>
              <span>{t(badge.labelKey)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

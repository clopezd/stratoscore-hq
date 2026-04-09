'use client'

import { useState, useEffect } from 'react'
import { Flame, Trophy } from 'lucide-react'
import { useLocale } from '../i18n/useLocale'

interface StreakData {
  current: number
  best: number
  lastDate: string
}

function getStreak(): StreakData {
  const raw = localStorage.getItem('fitsync_streak')
  if (!raw) return { current: 0, best: 0, lastDate: '' }
  return JSON.parse(raw)
}

export function updateStreak(): void {
  const today = new Date().toISOString().split('T')[0]
  const streak = getStreak()

  if (streak.lastDate === today) return // Already counted today

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newCurrent = streak.lastDate === yesterdayStr ? streak.current + 1 : 1
  const newBest = Math.max(newCurrent, streak.best)

  localStorage.setItem('fitsync_streak', JSON.stringify({
    current: newCurrent,
    best: newBest,
    lastDate: today,
  }))
}

export function StreakBadge() {
  const { t } = useLocale()
  const [streak, setStreak] = useState<StreakData>({ current: 0, best: 0, lastDate: '' })

  useEffect(() => {
    setStreak(getStreak())
  }, [])

  if (streak.current === 0) return null

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Flame size={18} className="text-orange-400" />
        <span className="text-lg font-bold text-orange-400">{streak.current}</span>
        <span className="text-xs text-zinc-500">{t('days')}</span>
      </div>
      {streak.best > streak.current && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Trophy size={12} />
          <span>Best: {streak.best}</span>
        </div>
      )}
      {streak.current >= 7 && (
        <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full ml-auto">
          🔥 {streak.current >= 30 ? 'Legend' : streak.current >= 14 ? 'On Fire' : 'Hot'}
        </span>
      )}
    </div>
  )
}

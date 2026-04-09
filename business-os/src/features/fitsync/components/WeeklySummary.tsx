'use client'

import { useState, useRef, useCallback } from 'react'
import { Share2, Download, Loader2 } from 'lucide-react'
import { useLocale } from '../i18n/useLocale'

interface WeeklySummaryProps {
  avgCalories: number
  avgProtein: number
  workouts: number
  streak: number
  weightChange: number | null
}

export function WeeklySummary({ avgCalories, avgProtein, workouts, streak, weightChange }: WeeklySummaryProps) {
  const { t } = useLocale()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)

  const generateImage = useCallback(async () => {
    setGenerating(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Instagram Story size
    canvas.width = 1080
    canvas.height = 1920

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920)
    gradient.addColorStop(0, '#0a0a0f')
    gradient.addColorStop(0.5, '#0f1f15')
    gradient.addColorStop(1, '#0a0a0f')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1920)

    // Title
    ctx.fillStyle = '#10b981'
    ctx.font = 'bold 72px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('FitSync AI', 540, 300)

    ctx.fillStyle = '#a1a1aa'
    ctx.font = '36px system-ui'
    ctx.fillText(t('share_week'), 540, 370)

    // Stats
    const stats = [
      { label: 'Avg kcal/day', value: `${avgCalories}`, color: '#10b981' },
      { label: 'Avg protein/day', value: `${avgProtein}g`, color: '#60a5fa' },
      { label: 'Workouts', value: `${workouts}`, color: '#fbbf24' },
      { label: 'Streak', value: `${streak} days`, color: '#f97316' },
    ]

    if (weightChange !== null) {
      stats.push({
        label: 'Weight change',
        value: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`,
        color: weightChange <= 0 ? '#10b981' : '#f87171',
      })
    }

    let y = 550
    for (const stat of stats) {
      // Card background
      ctx.fillStyle = '#18181b'
      ctx.beginPath()
      ctx.roundRect(140, y, 800, 140, 24)
      ctx.fill()

      // Value
      ctx.fillStyle = stat.color
      ctx.font = 'bold 64px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(stat.value, 540, y + 75)

      // Label
      ctx.fillStyle = '#71717a'
      ctx.font = '30px system-ui'
      ctx.fillText(stat.label, 540, y + 115)

      y += 170
    }

    // Footer
    ctx.fillStyle = '#3f3f46'
    ctx.font = '28px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('fitsync.ai', 540, 1820)

    // Download or share
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/png')
    )

    if (blob) {
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], 'fitsync-week.png')] })) {
        await navigator.share({
          files: [new File([blob], 'fitsync-week.png', { type: 'image/png' })],
          title: 'FitSync AI — Weekly Summary',
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'fitsync-weekly-summary.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    }
    setGenerating(false)
  }, [avgCalories, avgProtein, workouts, streak, weightChange, t])

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={generateImage}
        disabled={generating}
        className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        {generating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Share2 size={16} />
        )}
        {t('share_week')}
      </button>
    </>
  )
}

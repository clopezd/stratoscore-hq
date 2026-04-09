'use client'

import { useState, useEffect, useCallback } from 'react'
import { Timer, Play, Pause, RotateCcw } from 'lucide-react'

interface RestTimerProps {
  defaultSeconds?: number
}

export function RestTimer({ defaultSeconds = 90 }: RestTimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds)
  const [running, setRunning] = useState(false)
  const [initial, setInitial] = useState(defaultSeconds)

  useEffect(() => {
    if (!running || seconds <= 0) {
      if (seconds <= 0 && running) {
        setRunning(false)
        // Vibrate if available
        if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      }
      return
    }
    const interval = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(interval)
  }, [running, seconds])

  const toggle = useCallback(() => setRunning(r => !r), [])
  const reset = useCallback(() => {
    setSeconds(initial)
    setRunning(false)
  }, [initial])

  const presets = [60, 90, 120, 180]

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const pct = initial > 0 ? (seconds / initial) * 100 : 0

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Timer size={14} />
        <span>Descanso</span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={toggle} className="p-2 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
          {running ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <div className="text-center">
          <p className={`text-3xl font-mono font-bold ${seconds <= 5 && running ? 'text-red-400 animate-pulse' : 'text-zinc-100'}`}>
            {mins}:{secs.toString().padStart(2, '0')}
          </p>
          <div className="w-32 h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <button onClick={reset} className="p-2 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="flex gap-2 justify-center">
        {presets.map(p => (
          <button
            key={p}
            onClick={() => { setInitial(p); setSeconds(p); setRunning(false) }}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              initial === p ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {p}s
          </button>
        ))}
      </div>
    </div>
  )
}

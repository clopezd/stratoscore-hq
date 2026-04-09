'use client'

interface MacroBarProps {
  label: string
  current: number
  target: number
  unit?: string
  color: string
}

export function MacroBar({ label, current, target, unit = 'g', color }: MacroBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const over = current > target

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">{label}</span>
        <span className={over ? 'text-red-500 font-medium' : 'text-gray-700'}>
          {Math.round(current)}/{target}{unit}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? '#ef4444' : color,
          }}
        />
      </div>
    </div>
  )
}

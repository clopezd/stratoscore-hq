'use client'

import { AlertTriangle, Info, CheckCircle, Zap, Loader2, RefreshCw } from 'lucide-react'
interface SyncAdjustments {
  nutrition_adjustments: { calorie_target: number; protein_target_g: number; carbs_target_g: number; fat_target_g: number; reasoning_es: string }
  training_adjustments: { volume_modifier: number; deload_recommended: boolean; reasoning_es: string }
  alerts: Array<{ type: 'warning' | 'info' | 'success'; message: string }>
  training_intensity: string
}

interface SyncAlertsProps {
  adjustments: SyncAdjustments | null
  syncing: boolean
  lastSyncTime: string | null
  onSync: () => void
}

const ALERT_STYLES = {
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertTriangle },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Info },
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
}

const INTENSITY_LABELS: Record<string, { label: string; color: string }> = {
  rest: { label: 'Descanso', color: 'text-gray-500 bg-gray-100' },
  light: { label: 'Ligero', color: 'text-blue-600 bg-blue-50' },
  moderate: { label: 'Moderado', color: 'text-amber-600 bg-amber-50' },
  heavy: { label: 'Pesado', color: 'text-red-600 bg-red-50' },
}

export function SyncAlerts({ adjustments, syncing, lastSyncTime, onSync }: SyncAlertsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-emerald-500" />
          <span className="text-xs font-medium text-gray-500">Sync Engine</span>
          {adjustments && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${INTENSITY_LABELS[adjustments.training_intensity]?.color || 'text-gray-500 bg-gray-100'}`}>
              {INTENSITY_LABELS[adjustments.training_intensity]?.label || adjustments.training_intensity}
            </span>
          )}
        </div>
        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {lastSyncTime ? `Sync ${lastSyncTime}` : 'Sincronizar'}
        </button>
      </div>

      {adjustments && (
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm space-y-2">
          <p className="text-xs text-gray-400">Targets ajustados para hoy:</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div><p className="text-sm font-bold text-emerald-600">{adjustments.nutrition_adjustments.calorie_target}</p><p className="text-[9px] text-gray-400">kcal</p></div>
            <div><p className="text-sm font-bold text-blue-600">{adjustments.nutrition_adjustments.protein_target_g}g</p><p className="text-[9px] text-gray-400">Prot</p></div>
            <div><p className="text-sm font-bold text-amber-600">{adjustments.nutrition_adjustments.carbs_target_g}g</p><p className="text-[9px] text-gray-400">Carbs</p></div>
            <div><p className="text-sm font-bold text-rose-600">{adjustments.nutrition_adjustments.fat_target_g}g</p><p className="text-[9px] text-gray-400">Grasa</p></div>
          </div>
          <p className="text-xs text-gray-400 italic">{adjustments.nutrition_adjustments.reasoning_es}</p>
        </div>
      )}

      {adjustments?.alerts && adjustments.alerts.length > 0 && (
        <div className="space-y-2">
          {adjustments.alerts.map((alert, i) => {
            const style = ALERT_STYLES[alert.type]
            const Icon = style.icon
            return (
              <div key={i} className={`flex items-start gap-2 rounded-lg p-2.5 border ${style.bg} ${style.border}`}>
                <Icon size={14} className={`${style.text} mt-0.5 flex-shrink-0`} />
                <p className={`text-xs ${style.text}`}>{alert.message}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

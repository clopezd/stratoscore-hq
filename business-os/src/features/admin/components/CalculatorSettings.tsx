'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

interface CalculatorSettingsProps {
  defaults: Record<string, number>
  onSave: (defaults: Record<string, number>) => void
}

const FIELDS = [
  { key: 'tax_rate', label: 'Tasa de impuestos (%)', placeholder: '16' },
  { key: 'savings_goal', label: 'Meta de ahorro mensual', placeholder: '5000' },
  { key: 'emergency_months', label: 'Meses de emergencia', placeholder: '6' },
]

export function CalculatorSettings({ defaults, onSave }: CalculatorSettingsProps) {
  const [values, setValues] = useState<Record<string, number>>(defaults)
  const isDirty = JSON.stringify(values) !== JSON.stringify(defaults)

  const handleChange = (key: string, val: string) => {
    const num = parseFloat(val)
    if (!isNaN(num)) {
      setValues((prev) => ({ ...prev, [key]: num }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-white/70">
          Valores Predeterminados
        </h3>
        <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
          Configura los valores por defecto para la calculadora financiera
        </p>
      </div>

      <div className="space-y-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-600 dark:text-white/50 mb-1">
              {field.label}
            </label>
            <input
              type="number"
              value={values[field.key] ?? ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] text-gray-700 dark:text-white/70 placeholder:text-gray-400 dark:placeholder:text-white/30"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onSave(values)}
          disabled={!isDirty}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" /> Guardar
        </button>
      </div>
    </div>
  )
}

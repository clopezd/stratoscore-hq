'use client'

import type { CatalogType, YearRange, VidendumFilters } from '../types'

const YEAR_OPTIONS: { label: string; value: YearRange }[] = [
  { label: 'Todo', value: 'all' },
  { label: '5 años', value: '5y' },
  { label: '3 años', value: '3y' },
]

const CATALOG_OPTIONS: { label: string; value: CatalogType }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'INV', value: 'INV' },
  { label: 'PKG', value: 'PKG' },
]

interface Props {
  filters: VidendumFilters
  onYearRange: (v: YearRange) => void
  onCatalogType: (v: CatalogType) => void
}

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-vid-subtle uppercase tracking-wider">{label}</span>
      <div className="flex bg-vid-card border border-vid rounded-lg p-0.5 gap-0.5">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              value === opt.value
                ? 'bg-indigo-500/80 text-white font-medium shadow'
                : 'text-vid-muted hover:text-vid-fg hover:bg-vid-raised'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterBar({ filters, onYearRange, onCatalogType }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ToggleGroup
        label="Período"
        options={YEAR_OPTIONS}
        value={filters.yearRange}
        onChange={onYearRange}
      />
      <ToggleGroup
        label="Categoría"
        options={CATALOG_OPTIONS}
        value={filters.catalogType}
        onChange={onCatalogType}
      />
    </div>
  )
}

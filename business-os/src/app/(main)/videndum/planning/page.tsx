import { ProductionRunRateMatrix } from '@/features/videndum/components/ProductionRunRateMatrix'

export const metadata = {
  title: 'Plan de Producción — Videndum',
  description: 'Matriz semanal de run rate con recomendaciones por SKU y export a Excel',
}

export default function PlanningPage() {
  return <ProductionRunRateMatrix />
}

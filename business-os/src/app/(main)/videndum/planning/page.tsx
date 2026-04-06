import { WeeklyProductionPlan } from '@/features/videndum/components/WeeklyProductionPlan'

export const metadata = {
  title: 'Plan de Producción — Videndum',
  description: 'Plan de producción semanal con recomendaciones y export IFS',
}

export default function PlanningPage() {
  return <WeeklyProductionPlan />
}

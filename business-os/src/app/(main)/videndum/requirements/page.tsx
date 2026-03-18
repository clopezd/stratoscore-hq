import { ClientRequirementsForm } from '@/features/videndum/components/ClientRequirementsForm'

export const metadata = {
  title: 'Levantamiento de Requerimientos - Videndum | StratosCore',
  description: 'Cuestionario para diseñar el dashboard de análisis y forecast a la medida de tu negocio'
}

export default function RequirementsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ClientRequirementsForm />
    </div>
  )
}

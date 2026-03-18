import { ClientDiscoveryForm } from '@/features/videndum/components/ClientDiscoveryForm'

export const metadata = {
  title: 'Diseño de Plataforma - Videndum | StratosCore',
  description: 'Cuéntanos cómo trabajas HOY para diseñar la plataforma perfecta para ti'
}

export default function RedesignPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ClientDiscoveryForm />
    </div>
  )
}

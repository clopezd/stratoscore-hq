import { ClientDiscoveryForm } from '@/features/videndum/components/ClientDiscoveryForm'

export const metadata = {
  title: 'Diseño de Plataforma - Videndum | StratosCore',
  description: 'Cuéntanos cómo trabajas HOY para diseñar la plataforma perfecta para ti'
}

export default function RedesignPage() {
  return (
    <div className="mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-12">
      <ClientDiscoveryForm />
    </div>
  )
}

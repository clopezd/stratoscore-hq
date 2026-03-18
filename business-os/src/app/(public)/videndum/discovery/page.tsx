import { ClientDiscoveryForm } from '@/features/videndum/components/ClientDiscoveryForm'

export const metadata = {
  title: 'Diseño de Plataforma - Videndum | StratosCore',
  description: 'Cuéntanos cómo trabajas HOY para diseñar la plataforma perfecta para ti'
}

// Esta página es PÚBLICA - no requiere autenticación
// URL para compartir con clientes: /videndum/discovery
export default function VidendumDiscoveryPublicPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ClientDiscoveryForm />
    </div>
  )
}

import { Suspense } from 'react'
import { ClientDiscoveryForm } from '@/features/videndum/components/ClientDiscoveryForm'

export const metadata = {
  title: 'Diseño de Plataforma - Videndum | StratosCore',
  description: 'Cuéntanos cómo trabajas HOY para diseñar la plataforma perfecta para ti'
}

// Esta página es PÚBLICA - no requiere autenticación
// URL para compartir con clientes: /videndum/discovery
// Para continuar un formulario previo: /videndum/discovery?continuar=ID
export default function VidendumDiscoveryPublicPage() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <Suspense fallback={
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="w-10 h-10 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Cargando formulario...</p>
        </div>
      }>
        <ClientDiscoveryForm />
      </Suspense>
    </div>
  )
}

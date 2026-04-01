import Link from 'next/link'
import { Shirt, Clock, MapPin, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Lavandería</h1>
        <Link
          href="/login"
          className="text-sm text-blue-600 font-medium hover:underline"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <section className="px-4 py-12 text-center">
        <h2 className="text-3xl font-bold mb-3">
          Tu ropa limpia, sin salir de casa
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Recogemos, lavamos y entregamos. Así de simple.
        </p>
        <Link
          href="/nuevo-pedido"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          Pedir servicio
        </Link>
      </section>

      {/* Features */}
      <section className="px-4 py-8 grid grid-cols-2 gap-4 max-w-lg mx-auto">
        <FeatureCard
          icon={<Shirt className="w-8 h-8 text-blue-500" />}
          title="Lavado & Planchado"
          desc="Todos los servicios"
        />
        <FeatureCard
          icon={<MapPin className="w-8 h-8 text-blue-500" />}
          title="A domicilio"
          desc="Recogemos y entregamos"
        />
        <FeatureCard
          icon={<Clock className="w-8 h-8 text-blue-500" />}
          title="24-48 horas"
          desc="Entrega rápida"
        />
        <FeatureCard
          icon={<Star className="w-8 h-8 text-blue-500" />}
          title="Garantía"
          desc="Satisfacción total"
        />
      </section>

      {/* CTA */}
      <section className="px-4 py-8 text-center">
        <Link
          href="/mis-pedidos"
          className="text-blue-600 font-medium hover:underline"
        >
          Ver mis pedidos →
        </Link>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  )
}

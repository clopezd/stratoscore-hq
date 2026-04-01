import Link from 'next/link'
import { Package, Truck, Users, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#00F2FE]">
          Lavandería — Logística
        </h1>
        <Link
          href="/login"
          className="text-sm text-[#8B949E] hover:text-[#E0EDE0] transition-colors"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Stats Grid */}
      <section className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="Pedidos hoy"
          value="—"
        />
        <StatCard
          icon={<Truck className="w-6 h-6" />}
          label="En ruta"
          value="—"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Conductores activos"
          value="—"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Ingresos hoy"
          value="—"
        />
      </section>

      {/* Quick Actions */}
      <section className="px-6">
        <h2 className="text-lg font-semibold mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <NavCard href="/ordenes" label="Órdenes" desc="Gestionar pedidos" />
          <NavCard href="/rutas" label="Rutas" desc="Asignar entregas" />
          <NavCard href="/conductores" label="Conductores" desc="Equipo de reparto" />
          <NavCard href="/reportes" label="Reportes" desc="Métricas del negocio" />
        </div>
      </section>

      {/* Recent Orders Placeholder */}
      <section className="p-6">
        <h2 className="text-lg font-semibold mb-4">Pedidos recientes</h2>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-[#8B949E]">
          Conecta Supabase para ver los pedidos en tiempo real
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className="text-[#00F2FE] mb-2">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-[#8B949E]">{label}</p>
    </div>
  )
}

function NavCard({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="block bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-[#00F2FE]/50 transition-colors"
    >
      <h3 className="font-semibold">{label}</h3>
      <p className="text-xs text-[#8B949E]">{desc}</p>
    </Link>
  )
}

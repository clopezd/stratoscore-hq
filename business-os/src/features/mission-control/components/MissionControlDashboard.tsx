'use client'

import { useMissionControl } from '../hooks/useMissionControl'
import { ClientCard } from './ClientCard'
import { QuickActionCard } from './QuickActionCard'
import { ActivityFeed } from './ActivityFeed'
import { PersonalTasksCanvas } from './PersonalTasksCanvas'
import { RefreshCw } from 'lucide-react'

export function MissionControlDashboard() {
  const { data, loading, error } = useMissionControl()

  const greeting = getGreeting()

  return (
    <div className="min-h-screen text-white">
      {/* Main Content */}
      <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-full">

        {/* Quick Access Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionCard
            icon="🧠"
            label="Mi Canvas"
            count={data?.stats.totalTasks}
            href="#canvas"
          />
          <QuickActionCard
            icon="👥"
            label="Mis Clientes"
            count={data?.stats.activeClients}
            href="#clientes"
          />
          <QuickActionCard
            icon="📈"
            label="Analytics"
            href="/analytics"
          />
          <QuickActionCard
            icon="💰"
            label="Finanzas"
            href="/finanzas"
          />
        </div>
        {/* Hero Section */}
        <section>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            {greeting}, Carlos
          </h1>
          <p className="text-white/60 text-sm mb-6">
            {loading ? (
              'Cargando...'
            ) : error ? (
              `Error: ${error}`
            ) : data ? (
              <>
                {data.stats.totalTasks} tareas pendientes · {data.stats.totalAlerts} alertas · {data.stats.activeClients} clientes activos
              </>
            ) : null}
          </p>
        </section>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-white/60" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">Error al cargar datos: {error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && data && (
        <>
          {/* Personal Tasks Canvas - TU CEREBRO */}
          <section id="canvas">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">🧠 Mi Canvas Personal</h2>
              <div className="text-xs text-white/60">
                Actualización automática en tiempo real
              </div>
            </div>
            <PersonalTasksCanvas />
          </section>

          {/* Clients Grid */}
          <section id="clientes">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Mis Clientes</h2>
              <button className="text-xs md:text-sm text-white/60 hover:text-white transition-colors">
                + Nuevo Cliente
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {data.clients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>

            {data.clients.length === 0 && (
              <div className="text-center py-20 text-white/60">
                <p className="text-sm">No hay clientes registrados</p>
                <button className="mt-4 text-white/60 hover:text-white text-sm">
                  + Agregar primer cliente
                </button>
              </div>
            )}
          </section>

          {/* Activity Feed */}
          {data.activities.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
              <ActivityFeed activities={data.activities} />
            </section>
          )}
        </>
      )}
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return '👋 Buenos días'
  if (hour < 19) return '👋 Buenas tardes'
  return '👋 Buenas noches'
}

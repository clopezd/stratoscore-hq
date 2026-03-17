'use client'

import { useMissionControl } from '../hooks/useMissionControl'
import { ClientCard } from './ClientCard'
import { QuickActionCard } from './QuickActionCard'
import { ActivityFeed } from './ActivityFeed'
import { RefreshCw } from 'lucide-react'

export function MissionControlDashboard() {
  const { data, loading, error } = useMissionControl()

  const greeting = getGreeting()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 space-y-8">
      {/* Hero Section */}
      <section>
        <h1 className="text-4xl font-bold mb-2">
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

        {/* Quick Actions */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <QuickActionCard
              icon="📊"
              label="My Tasks"
              count={data?.stats.totalTasks}
              href="/dashboard"
            />
            <QuickActionCard
              icon="📋"
              label="Board"
              count={data?.stats.activeClients}
              href="/dashboard"
            />
            <QuickActionCard
              icon="💰"
              label="Finance OS"
              href="/finanzas"
            />
            <QuickActionCard
              icon="⚙️"
              label="Settings"
              href="/settings"
            />
          </div>
        )}
      </section>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-white/40" />
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
          {/* Clients Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Mis Clientes</h2>
              <button className="text-sm text-white/60 hover:text-white transition-colors">
                + Nuevo Cliente
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.clients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>

            {data.clients.length === 0 && (
              <div className="text-center py-20 text-white/30">
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
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return '👋 Buenos días'
  if (hour < 19) return '👋 Buenas tardes'
  return '👋 Buenas noches'
}

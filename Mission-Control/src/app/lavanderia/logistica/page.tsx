import { LogisticsList } from '@/features/lavanderia/logistica/components/LogisticsList'

export default function LogisticaPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900">Logística</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestión de estados de pedidos — C&amp;C Clean Express
        </p>

        <div className="mt-6 rounded-2xl border border-white/50 bg-white/70 backdrop-blur-sm p-6 shadow-sm">
          <LogisticsList />
        </div>
      </div>
    </div>
  )
}

import { HistorialPage } from '@/features/lavanderia/admin/components/HistorialPage'

export default function AdminHistorialPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Historial de Pedidos</h1>
          <p className="text-sm text-gray-400 mt-1">C&amp;C Clean Express — Reporte completo</p>
        </div>
        <HistorialPage />
      </div>
    </div>
  )
}

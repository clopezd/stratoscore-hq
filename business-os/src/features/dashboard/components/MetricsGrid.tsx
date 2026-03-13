'use client'

// Stub temporal para Finance OS
export function MetricsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
        <p className="text-xs text-white/50 mb-1">Total Ingresos</p>
        <p className="text-2xl font-bold text-emerald-400">$0</p>
      </div>
      <div className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
        <p className="text-xs text-white/50 mb-1">Total Gastos</p>
        <p className="text-2xl font-bold text-red-400">$0</p>
      </div>
      <div className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
        <p className="text-xs text-white/50 mb-1">Balance</p>
        <p className="text-2xl font-bold text-white">$0</p>
      </div>
      <div className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
        <p className="text-xs text-white/50 mb-1">Ahorro</p>
        <p className="text-2xl font-bold text-indigo-400">0%</p>
      </div>
    </div>
  )
}

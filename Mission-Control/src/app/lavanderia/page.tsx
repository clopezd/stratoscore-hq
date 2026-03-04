// Panel operativo de Lavandería Carlos
// Accesible en: lavanderia.stratoscore.app
// Internamente sirve desde: /lavanderia

const stats = [
  { label: 'Cargas completadas hoy',  value: '—', unit: 'cargas',  icon: '🫧' },
  { label: 'Ingresos del día',        value: '—', unit: 'COP',     icon: '💰' },
  { label: 'Tiempo promedio de ciclo',value: '—', unit: 'min',     icon: '⏱️' },
  { label: 'Máquinas activas',        value: '—', unit: '/ 4',     icon: '⚡' },
]

const quickActions = [
  { label: 'Registrar lavada',  href: '#', color: 'bg-amber-500 hover:bg-amber-400 text-black' },
  { label: 'Ver historial',     href: '#', color: 'bg-amber-900/60 hover:bg-amber-800/60 text-amber-200 border border-amber-500/30' },
  { label: 'Exportar reporte', href: '#', color: 'bg-amber-900/60 hover:bg-amber-800/60 text-amber-200 border border-amber-500/30' },
]

export default function LavanderiaPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8 md:py-12" style={{ fontFamily: 'var(--font-grotesk), system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <header className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl glow-amber-sm"
            style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)' }}
          >
            🫧
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Lavandería Carlos</h1>
            <p className="text-amber-500/70 text-xs">Panel Operativo</p>
          </div>
        </div>

        <span
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#F59E0B' }}
        >
          ● En línea
        </span>
      </header>

      {/* ── Stats grid ── */}
      <section className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex flex-col gap-2"
            style={{
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.12)',
            }}
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="text-white font-bold text-2xl leading-none">
                {s.value}
                <span className="text-amber-500/50 text-sm font-normal ml-1">{s.unit}</span>
              </div>
              <div className="text-amber-500/60 text-xs mt-1 leading-tight">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Quick actions ── */}
      <section className="max-w-4xl mx-auto mb-10">
        <h2 className="text-amber-500/60 text-xs font-semibold uppercase tracking-widest mb-3">
          Acciones rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${a.color}`}
            >
              {a.label}
            </a>
          ))}
        </div>
      </section>

      {/* ── Placeholder notice ── */}
      <section className="max-w-4xl mx-auto">
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'rgba(245, 158, 11, 0.04)',
            border: '1px dashed rgba(245, 158, 11, 0.2)',
          }}
        >
          <p className="text-amber-500/50 text-sm">
            Panel en construcción — conectar con la base de datos de la lavandería para ver datos en tiempo real.
          </p>
        </div>
      </section>

    </div>
  )
}

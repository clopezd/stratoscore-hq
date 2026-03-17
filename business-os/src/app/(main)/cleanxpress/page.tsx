export default function CleanXpressPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 mb-4">
            <span className="text-4xl">🧺</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            C&C Clean Xpress
          </h1>
          <p className="text-white/60 mb-6">
            Lavandería Industrial
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
          <p className="text-white/80 text-sm mb-4">
            Dashboard en construcción
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/40 text-xs mb-1">Ordenes Hoy</p>
              <p className="text-2xl font-bold text-cyan-400">24</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/40 text-xs mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-400">8</p>
            </div>
          </div>
        </div>

        <a
          href="/"
          className="inline-block px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
        >
          ← Volver a Mission Control
        </a>
      </div>
    </div>
  )
}

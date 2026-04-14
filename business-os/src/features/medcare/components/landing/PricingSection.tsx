export function PricingSection() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
          Nuestros estudios
        </h2>
        <p className="text-gray-500 text-center mb-10">
          Resultados el mismo día. Sin filas. Agenda desde tu celular.
        </p>

        <div className="space-y-3">
          {/* Promo destacada — sub-brand Mamografía (Pantone Rhodamine Red C + 806 C) */}
          <a
            href="#agendar"
            className="group block relative overflow-hidden border-2 border-[#E50995]/40 bg-gradient-to-br from-[#FEEBF5] via-white to-[#FCAFD9]/40 rounded-2xl p-6 hover:shadow-xl hover:shadow-[#E50995]/15 transition-all"
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-[#E50995] to-[#EC52B4] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl tracking-wider">
              PROMO ABRIL
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#E50995] uppercase tracking-wider mb-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  Paquete recomendado
                </div>
                <h3 className="text-lg font-bold text-[#0F1820]">Mamografía 3D + Ultrasonido de mama</h3>
                <p className="text-sm text-slate-600 mt-1">Detección temprana integral — tomosíntesis con IA</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400 line-through">₡84,000</p>
                <p className="text-3xl font-black bg-gradient-to-r from-[#E50995] to-[#B11C28] bg-clip-text text-transparent">₡65,000</p>
                <p className="text-[10px] text-[#E50995] font-bold uppercase tracking-wider">Ahorrás ₡19,000</p>
              </div>
            </div>
          </a>

          {/* Estudios individuales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="#agendar"
              className="group border-2 border-gray-200 rounded-2xl p-5 hover:border-red-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-red-700">Mamografía Digital 3D</h3>
                  <p className="text-xs text-gray-500 mt-1">Tomosíntesis con IA — 15 min</p>
                </div>
                <p className="text-xl font-bold text-gray-900 shrink-0 ml-3">₡35,000</p>
              </div>
            </a>

            <a
              href="#agendar"
              className="group border-2 border-gray-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-slate-700">Ultrasonido de mama</h3>
                  <p className="text-xs text-gray-500 mt-1">Complemento diagnóstico — 20 min</p>
                </div>
                <p className="text-xl font-bold text-gray-900 shrink-0 ml-3">₡49,000</p>
              </div>
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}

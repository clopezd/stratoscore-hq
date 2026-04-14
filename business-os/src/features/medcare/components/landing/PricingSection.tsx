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
          {/* Promo destacada */}
          <a
            href="#agendar"
            className="group block relative overflow-hidden border-2 border-red-400 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 hover:shadow-lg transition-all"
          >
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              PROMO ABRIL
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-red-800">Mamografía 3D + Ultrasonido de mama</h3>
                <p className="text-sm text-red-600 mt-1">Paquete completo — detección temprana integral</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm text-gray-400 line-through">₡84,000</p>
                <p className="text-2xl font-black text-red-700">₡65,000</p>
                <p className="text-xs text-red-600 font-medium">Ahorrás ₡19,000</p>
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

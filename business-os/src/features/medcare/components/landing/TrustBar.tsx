export function TrustBar() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🏥', label: '+7 años', sub: 'de experiencia' },
            { icon: '🔬', label: 'FUJIFILM 3D', sub: 'tomosíntesis + IA' },
            { icon: '🕐', label: 'L-V 8am-8pm', sub: 'horario extendido' },
            { icon: '📍', label: 'San José Centro', sub: 'fácil acceso GAM' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-2xl mb-1">{item.icon}</span>
              <p className="text-sm font-bold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

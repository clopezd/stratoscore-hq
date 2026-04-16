export function Testimonials() {
  const testimonials = [
    {
      name: 'María L.',
      text: 'Me hice mi mamografía en MedCare y fue súper rápida. El equipo es muy profesional y me entregaron los resultados el mismo día. Muy tranquila con la atención.',
      age: '45 años',
    },
    {
      name: 'Carolina R.',
      text: 'Mi ginecóloga me refirió a MedCare para un ultrasonido de mama. Cero filas, la cita fue puntual y las instalaciones son excelentes. 100% recomendado.',
      age: '52 años',
    },
    {
      name: 'Ana M.',
      text: 'Llevé a mi mamá que tenía miedo de hacerse la mamografía. El personal fue muy paciente con ella y todo salió perfecto. Ya agendamos la del próximo año.',
      age: '38 años',
    },
  ]

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Lo que dicen nuestras pacientes
        </h2>
        <p className="text-gray-500 text-center mb-10">Más de 10 años cuidando la salud de Costa Rica</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.age}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

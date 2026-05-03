export function HowItWorks() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
          Agenda en 3 simples pasos
        </h2>
        <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
          Sin complicaciones. Sin filas. Desde tu celular.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Escogé tu estudio',
              desc: 'Seleccioná mamografía, ultrasonido o el combo promo y elegí la fecha.',
              color: 'bg-gradient-to-br from-[#FCAFD9] to-[#EC52B4]',
            },
            {
              step: '2',
              title: 'Confirmá tu cita',
              desc: 'Seleccioná el horario que más te convenga y listo — tu cita queda confirmada al instante.',
              color: 'bg-gradient-to-br from-[#E50995] to-[#C70880]',
            },
            {
              step: '3',
              title: 'Hacete tu estudio',
              desc: 'Vení a MedCare, tu estudio toma solo 15-30 minutos.',
              color: 'bg-gradient-to-br from-[#FB7185] to-[#E50995]',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className={`w-14 h-14 ${item.color} text-white text-xl font-bold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="hidden md:flex justify-center mt-6">
          <div className="flex items-center gap-2 text-gray-300">
            <div className="w-24 h-0.5 bg-gray-200" />
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="w-24 h-0.5 bg-gray-200" />
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="w-24 h-0.5 bg-gray-200" />
          </div>
        </div>
      </div>
    </section>
  )
}

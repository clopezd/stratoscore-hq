import Image from 'next/image'

export function WhyMedcare() {
  return (
    <section className="relative bg-gradient-to-b from-white via-[#FEEBF5]/30 to-white py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-center mb-4">
          <Image
            src="/medcare/simbolo-target-pink.png"
            alt=""
            width={56}
            height={56}
            className="h-12 w-12 object-contain"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0F1820] text-center mb-3 tracking-tight">
          Por qué hacerte tu mamografía en MedCare
        </h2>
        <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
          El mismo centro que trajo la resonancia magnética con IA a Costa Rica, ahora con mamografía digital 3D.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Todo en un solo lugar',
              desc: 'Si tu mamografía detecta algo, la resonancia magnética, la biopsia y tu especialista están bajo el mismo techo.',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
            },
            {
              title: 'Sin filas, sin espera',
              desc: 'Agenda hoy, hacete el estudio esta semana. Horario amplio L-V 6am-10pm, sábados, domingos y feriados.',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              title: 'Calidad de imagen superior',
              desc: 'FUJIFILM Sophinity con tomosíntesis 3D, hologramas mamarios e IA diagnóstica. Precisión que otros centros no ofrecen.',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <div key={i} className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#E50995]/40 hover:shadow-xl hover:shadow-[#E50995]/10 hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FEEBF5] to-[#FCAFD9]/40 text-[#E50995] rounded-xl flex items-center justify-center mb-4 group-hover:from-[#E50995] group-hover:to-[#EC52B4] group-hover:text-white transition-all">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-[#0F1820] mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

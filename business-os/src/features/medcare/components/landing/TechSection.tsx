import Image from 'next/image'

export function TechSection() {
  return (
    <section className="bg-slate-900 text-white py-16 sm:py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-red-400 text-sm font-semibold uppercase tracking-wider mb-2">
            FUJIFILM AMULET Sophinity
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold mb-3">
            Mamógrafo de última generación
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            La mayoría de centros en Costa Rica usan mamógrafos 2D convencionales.
            En MedCare diagnosticamos en 3D con inteligencia artificial.
          </p>
        </div>

        {/* Imagen principal del equipo */}
        <div className="flex flex-col lg:flex-row items-center gap-10 mb-16">
          <div className="flex-1 flex justify-center">
            <Image
              src="/medcare/reales/sala-flamencos.jpg"
              alt="Mamógrafo FUJIFILM AMULET Sophinity instalado en el consultorio de MedCare"
              width={900}
              height={600}
              className="rounded-2xl max-h-[500px] object-cover shadow-xl"
            />
          </div>
          <div className="flex-1 space-y-6">
            {[
              {
                title: 'Tomosíntesis 3D',
                desc: 'Reconstrucción tridimensional capa por capa. Detecta lesiones que en 2D quedarían ocultas por el tejido mamario.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                title: 'Captura en 10 segundos',
                desc: 'Adquisición 3D ultrarrápida que minimiza la incomodidad y elimina artefactos por movimiento.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Menos dolor',
                desc: 'Sistema Comfort Comp: compresión inteligente que se adapta a cada paciente. Significativamente menos molestia que equipos convencionales.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
              },
              {
                title: 'Inteligencia Artificial',
                desc: 'IA que marca áreas sospechosas, genera hologramas mamarios 3D y asegura posicionamiento consistente entre estudios.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 bg-red-600/20 text-red-400 rounded-xl flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Galería de detalles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { src: '/medcare/mamografo-software-diagnostico.jpeg', alt: 'Software de diagnóstico con 4 vistas mamográficas', label: 'Diagnóstico IA' },
            { src: '/medcare/mamografo-monitor-comparacion.jpeg', alt: 'Monitor diagnóstico con comparación mamográfica', label: 'Comparación 3D' },
            { src: '/medcare/reales/detalle-control.jpg', alt: 'Detalle de control del mamógrafo en MedCare', label: 'Equipo real en MedCare' },
          ].map((img, i) => (
            <div key={i} className="relative group overflow-hidden rounded-xl">
              <Image
                src={img.src}
                alt={img.alt}
                width={300}
                height={300}
                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-xs font-semibold text-white">{img.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

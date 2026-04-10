'use client'

import { useState } from 'react'

const faqs = [
  {
    q: '¿Qué es la tomosíntesis 3D?',
    a: 'Es una tecnología avanzada que toma múltiples imágenes de la mama desde diferentes ángulos y las reconstruye en capas milímetro a milímetro. Esto permite detectar lesiones que en una mamografía 2D convencional quedarían ocultas por el tejido mamario superpuesto.',
  },
  {
    q: '¿La mamografía duele?',
    a: 'Nuestro mamógrafo FUJIFILM Sophinity tiene sistema Comfort Comp que adapta la compresión a cada paciente. La mayoría de pacientes la describen como una presión momentánea, significativamente menor que en equipos convencionales. La captura dura solo 10 segundos.',
  },
  {
    q: '¿Cuánto tiempo toma el estudio?',
    a: 'La mamografía toma aproximadamente 15-20 minutos. El ultrasonido entre 20-30 minutos. Los resultados se entregan el mismo día.',
  },
  {
    q: '¿Necesito referencia médica?',
    a: 'Para mamografía de screening (preventiva), no necesitas referencia. Si tu médico te ordenó una mamografía diagnóstica, traé la orden. Para ultrasonido, recomendamos traer la orden médica.',
  },
  {
    q: '¿Cada cuánto debo hacerme la mamografía?',
    a: 'La recomendación es una mamografía anual a partir de los 40 años. Si tenés antecedentes familiares de cáncer de mama, tu médico puede recomendar iniciar antes.',
  },
  {
    q: '¿Aceptan seguros médicos?',
    a: 'Sí, trabajamos con las principales aseguradoras del país. Contactanos por WhatsApp para verificar tu cobertura antes de la cita.',
  },
  {
    q: '¿Qué preparación necesito?',
    a: 'Para mamografía: no usar desodorante, talco ni cremas el día del estudio. Vestir ropa de dos piezas para mayor comodidad. Para ultrasonido abdominal: ayuno de 6-8 horas.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Preguntas frecuentes
        </h2>
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-900">{item.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

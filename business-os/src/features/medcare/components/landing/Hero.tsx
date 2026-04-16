import Image from 'next/image'
import { MedCareBrand } from '../../brand'
import { MamografiaWordmark } from './MamografiaWordmark'

const B = MedCareBrand

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#FEEBF5] via-[#FCAFD9]/30 to-[#FEEBF5]">
      {/* Ilustracion de mujeres + iconos decorativos del brand — full bleed a la derecha */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/medcare/reales/hero-mujeres-rosa.jpeg"
          alt="Mujeres diversas unidas contra el cancer de mama"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* Overlay blanco/rosa desde la izquierda para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
        <div className="max-w-2xl">
          {/* Eyebrow badge rosa */}
          <div className="inline-flex items-center gap-2 bg-white/80 border border-[#E50995]/30 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#E50995] animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-[#E50995] uppercase">
              Tecnología Fujifilm de última generación
            </span>
          </div>

          {/* Wordmark oficial Mamografia con tomosintesis 3D */}
          <div className="mb-6 flex justify-start">
            <MamografiaWordmark size="xl" inverted={false} color="#E50995" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight mb-6 text-[#0F1820]">
            Diagnóstico 3D con{' '}
            <span className="bg-gradient-to-r from-[#E50995] to-[#B11C28] bg-clip-text text-transparent">
              Inteligencia Artificial
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-700 leading-relaxed mb-4 max-w-xl">
            Crecimos y mejoramos por ustedes. Ahora en <strong className="text-[#E50995]">MEDCARE</strong> nos vestimos de rosa con nuestro nuevo equipo de mamografía con la más alta tecnología del país.
          </p>

          {/* Tag emotivo con liston decorativo */}
          <div className="inline-flex items-center gap-2 mb-8">
            <Image
              src="/medcare/reales/liston-rosa-acuarela.jpeg"
              alt="Liston rosa cancer de mama"
              width={32}
              height={40}
              className="w-7 h-9 object-contain mix-blend-multiply"
            />
            <p className="text-base sm:text-lg text-[#E50995] font-bold">
              Una mamografía a tiempo salva vidas.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <a
              href="#agendar"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#E50995] to-[#B11C28] hover:shadow-2xl hover:shadow-[#E50995]/40 text-white rounded-xl font-semibold text-lg transition-all hover:-translate-y-0.5"
            >
              Agendar Mi Estudio
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href={B.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 border-2 border-[#25D366] text-[#128C7E] rounded-xl font-medium text-lg transition shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Consultar por WhatsApp
            </a>
          </div>

          {/* Tech stats chips rosa */}
          <div className="flex flex-wrap gap-3">
            <TechChip icon="cube" label="Tomosíntesis 3D" sublabel="Capa a capa" />
            <TechChip icon="ai" label="IA integrada" sublabel="Detección asistida" />
            <TechChip icon="clock" label="10 segundos" sublabel="Captura 3D" />
            <TechChip icon="check" label="Mismo día" sublabel="Resultados" />
          </div>
        </div>
      </div>
    </section>
  )
}

function TechChip({
  icon,
  label,
  sublabel,
}: {
  icon: 'cube' | 'ai' | 'clock' | 'check'
  label: string
  sublabel: string
}) {
  const icons = {
    cube: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    ai: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    clock: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    check: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div className="group flex items-center gap-2.5 bg-white/90 hover:bg-white backdrop-blur-md border border-[#E50995]/20 px-4 py-2.5 rounded-xl transition shadow-sm">
      <div className="text-[#E50995]">{icons[icon]}</div>
      <div className="text-left">
        <div className="text-sm font-bold text-[#0F1820] leading-tight">{label}</div>
        <div className="text-[11px] text-slate-500 leading-tight">{sublabel}</div>
      </div>
    </div>
  )
}

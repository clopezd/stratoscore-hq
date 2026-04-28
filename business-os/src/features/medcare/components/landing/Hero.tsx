import Image from 'next/image'
import { MedCareBrand } from '../../brand'
import { MamografiaWordmark } from './MamografiaWordmark'

const B = MedCareBrand

export function Hero() {
  return (
    <>
      {/* Hero principal — fondo rosa sólido */}
      <section className="relative isolate overflow-hidden bg-[#F2A9CC]">
        {/* Fondo "seno" (simbolo oficial) — watermark sutil detrás de la ilustración */}
        <div className="absolute top-[8%] right-[8%] w-[460px] h-[460px] pointer-events-none -z-10 hidden md:block opacity-50 mix-blend-soft-light">
          <Image
            src="/medcare/simbolo-target-white.png"
            alt=""
            fill
            sizes="460px"
            className="object-contain"
            aria-hidden
          />
        </div>

        {/* Ilustración oficial de mujeres — derecha */}
        <div className="hidden md:block absolute right-0 bottom-0 w-[42%] lg:w-[40%] h-full pointer-events-none">
          <Image
            src="/medcare/ilustracion-mujeres.png"
            alt="Mujeres unidas con listones rosa contra el cáncer de mama"
            fill
            priority
            sizes="(max-width: 1280px) 42vw, 40vw"
            className="object-contain object-right-bottom"
            quality={95}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
          <div className="max-w-2xl">
            <p className="text-3xl sm:text-4xl font-light text-white mb-1 leading-none">
              Prevenir es...
            </p>
            <h1 className="text-7xl sm:text-8xl lg:text-[8rem] font-black text-white leading-[0.9] tracking-tight mb-8 mt-2">
              AMOR
              <br />
              PROPIO
            </h1>

            {/* Wordmark Mamografía — tamaño 2XL legible con "con tomosíntesis 3D" */}
            <div className="mb-7 inline-flex items-center justify-center bg-white/15 border-2 border-white rounded-2xl px-12 py-8 backdrop-blur-sm">
              <MamografiaWordmark size="2xl" inverted={true} />
            </div>

            <p className="text-base sm:text-lg text-white/95 leading-relaxed mb-4 max-w-lg">
              Crecimos y mejoramos por ustedes. Ahora en MEDCARE nos vestimos de rosa con nuestro nuevo equipo de mamografía con la más alta tecnología del país.
            </p>

            <div className="flex items-center gap-3 mb-8">
              <Image
                src="/medcare/liston-rosa.png"
                alt=""
                width={28}
                height={36}
                className="h-9 w-auto object-contain"
              />
              <p className="text-base sm:text-lg text-white">
                Una mamografía a tiempo <strong className="font-extrabold">salva vidas.</strong>
              </p>
            </div>

            {/* CTAs — botón rosa CON BORDE BLANCO + WhatsApp outlined */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#agendar"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E50995] hover:bg-[#C70880] border-2 border-white text-white rounded-xl font-semibold text-base transition-all shadow-xl shadow-[#E50995]/30 hover:-translate-y-0.5"
              >
                Agendar Mi Estudio
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href={B.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-xl font-semibold text-base transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Consulta por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Strip rosa: 4 features tech con divisores blancos */}
      <section className="relative isolate bg-[#EE9CC4] py-6 sm:py-7 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 divide-x-0 md:divide-x md:divide-white/40">
            <TechChip icon="cube" label="Tomosíntesis 3D" sublabel="Capa a capa" />
            <TechChip icon="ai" label="IA integrada" sublabel="Detección asistida" />
            <TechChip icon="clock" label="10 segundos" sublabel="Captura 3D" />
            <TechChip icon="check" label="Mismo día" sublabel="Resultados" />
          </div>
        </div>
      </section>
    </>
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
    <div className="flex items-center gap-3 px-4 first:pl-0 md:pl-6 first:md:pl-0">
      <div className="text-white shrink-0">{icons[icon]}</div>
      <div className="text-left">
        <div className="text-sm font-bold text-white leading-tight">{label}</div>
        <div className="text-[11px] text-white/85 leading-tight">{sublabel}</div>
      </div>
    </div>
  )
}

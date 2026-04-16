import Image from 'next/image'
import { MedCareBrand } from '../../brand'
import { BreastIcon } from './BreastIcon'
import { MamografiaWordmark } from './MamografiaWordmark'

const B = MedCareBrand

export function CTAFinal() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#E50995] via-[#EC52B4] to-[#B11C28] py-16 sm:py-20">
      {/* Glow decorativos */}
      <div className="absolute -top-40 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-[#FCAFD9]/30 blur-3xl -z-10" />

      {/* Liston rosa decorativo grande a la derecha (estilo PDF) */}
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-30 hidden md:block pointer-events-none">
        <Image
          src="/medcare/reales/liston-rosa-acuarela.jpeg"
          alt=""
          width={400}
          height={520}
          className="w-72 h-auto mix-blend-screen"
        />
      </div>

      {/* Iconos decorativos flotantes */}
      <div className="absolute top-12 left-[8%] opacity-25 hidden sm:block">
        <BreastIcon className="w-24 h-24" color="#FFFFFF" stroke={1.5} />
      </div>
      <div className="absolute bottom-12 left-[15%] opacity-20 hidden sm:block">
        <BreastIcon className="w-20 h-20" color="#FCAFD9" stroke={1.5} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 border border-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-white uppercase">
            Promo válida hasta mayo 2026
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
          Su tranquilidad empieza{' '}
          <span className="bg-gradient-to-r from-white to-[#FEEBF5] bg-clip-text text-transparent">
            con 15 minutos
          </span>
        </h2>

        {/* Wordmark oficial del sub-brand Mamografia */}
        <div className="flex justify-center mb-6">
          <MamografiaWordmark size="lg" inverted={true} showSubtitle={true} />
        </div>

        <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
          + Ultrasonido de mama por solo{' '}
          <strong className="text-white">₡65.000</strong> — resultados el mismo día.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#agendar"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-[#FEEBF5] text-[#E50995] rounded-xl font-bold text-lg transition-all hover:-translate-y-0.5 shadow-xl"
          >
            Agendar Ahora
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href={B.contact.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-md border-2 border-white/60 text-white rounded-xl font-medium text-lg transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Directo
          </a>
        </div>
      </div>
    </section>
  )
}

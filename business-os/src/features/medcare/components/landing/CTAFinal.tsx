import Image from 'next/image'
import { MedCareBrand } from '../../brand'
import { MamografiaWordmark } from './MamografiaWordmark'

const B = MedCareBrand

export function CTAFinal() {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20 bg-gradient-to-br from-[#FBCFE8] via-[#F9A8D4] to-[#EC4899]">
      {/* Decorativos orgánicos */}
      <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-white/20 blur-3xl -z-10" />
      <div className="absolute -bottom-32 right-1/4 w-[400px] h-[400px] rounded-full bg-[#E50995]/30 blur-3xl -z-10" />

      {/* Listón rosa oficial (símbolo lucha contra cáncer de mama) */}
      <div className="absolute top-0 right-0 h-full w-[35%] hidden md:block pointer-events-none">
        <Image
          src="/medcare/liston-rosa.png"
          alt=""
          fill
          sizes="35vw"
          className="object-contain object-right"
          aria-hidden
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/30 border-2 border-white/60 backdrop-blur-sm px-5 py-1.5 rounded-full mb-8">
          <span className="text-xs font-bold tracking-wider text-white uppercase">
            Promo válida solo en mayo
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-2 tracking-tight drop-shadow-md">
          Su tranquilidad empieza
        </h2>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-8 tracking-tight">
          <span className="text-[#E50995] bg-white/95 px-4 py-1 rounded-xl inline-block">
            con 15 minutos
          </span>
        </h2>

        {/* Wordmark Mamografía */}
        <div className="flex justify-center mb-6">
          <MamografiaWordmark size="lg" inverted={true} showSubtitle={true} />
        </div>

        <p className="text-lg sm:text-xl text-white mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
          + Ultrasonido de mama por solo{' '}
          <strong className="font-extrabold">₡65.000</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#agendar"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E50995] hover:bg-[#C70880] text-white rounded-xl font-bold text-lg transition-all shadow-2xl hover:-translate-y-0.5"
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
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#E50995] hover:bg-white/90 rounded-xl font-semibold text-lg transition shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Directo
          </a>
        </div>
      </div>
    </section>
  )
}

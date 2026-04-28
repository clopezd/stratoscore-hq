// Wordmark oficial "Mam[O]grafía con tomosíntesis 3D" — Libro de Marca Mamo
// Usa los assets PNG oficiales: logo-medcare-rosa.png y logo-medcare-blanco.png
// El parámetro `color` se mantiene por compatibilidad pero ya no se aplica
// (el color queda definido por la variante rosa/blanca de la imagen oficial).

import Image from 'next/image'

interface Props {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** @deprecated — color ya viene horneado en el asset oficial */
  color?: string
  /** @deprecated — el subtítulo ya viene horneado en el asset oficial */
  showSubtitle?: boolean
  /** Si true usa la versión blanca (para fondos oscuros/rosa fuerte) */
  inverted?: boolean
}

const sizes = {
  sm: { width: 140, height: 50 },
  md: { width: 200, height: 72 },
  lg: { width: 280, height: 100 },
  xl: { width: 420, height: 150 },
  '2xl': { width: 560, height: 200 },
}

export function MamografiaWordmark({
  className = '',
  size = 'md',
  inverted = false,
}: Props) {
  const s = sizes[size]
  const src = inverted ? '/medcare/logo-medcare-blanco.png' : '/medcare/logo-medcare-rosa.png'

  return (
    <div className={`inline-flex ${className}`}>
      <Image
        src={src}
        alt="Mamografía con tomosíntesis 3D"
        width={s.width}
        height={s.height}
        priority
        className="h-auto w-auto"
        style={{ maxWidth: s.width, maxHeight: s.height }}
      />
    </div>
  )
}

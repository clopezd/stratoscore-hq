/**
 * Logo — componente de imagen de marca unificado.
 *
 * Props:
 *   size     — ancho/alto en px (cuadrado, default 40)
 *   src      — URL externa del logo del tenant. Si no se pasa,
 *              usa el PNG estático local (Logo.png).
 *   className — clases Tailwind adicionales
 *   alt      — texto alternativo
 *
 * Comportamiento:
 *   • src no definido  → next/image optimizado con el PNG local
 *   • src string URL   → <img> estándar (dominios externos no preconfigurables)
 */

import Image from 'next/image'
import logoSrc from '@/shared/assets/images/Logo.png'

interface LogoProps {
  size?: number
  src?: string | null
  className?: string
  alt?: string
}

export function Logo({ size = 40, src, className = '', alt = 'Stratoscore' }: LogoProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'contain' }}
      />
    )
  }

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}

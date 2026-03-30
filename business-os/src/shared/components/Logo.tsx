/**
 * Logo — componente de imagen de marca unificado.
 *
 * Props:
 *   size     — ancho/alto en px (cuadrado, default 40)
 *   src      — URL externa del logo del tenant. Si no se pasa,
 *              usa el isotipo SVG de StratosCore.
 *   className — clases Tailwind adicionales
 *   alt      — texto alternativo
 *
 * Comportamiento:
 *   • src no definido  → StratoscoreLogo isotipo
 *   • src string URL   → <img> estándar (dominios externos no preconfigurables)
 */

import { StratoscoreLogo } from './StratoscoreLogo'

interface LogoProps {
  size?: number
  src?: string | null
  className?: string
  alt?: string
}

export function Logo({ size = 40, src, className = '', alt = 'StratosCore' }: LogoProps) {
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

  return <StratoscoreLogo variant="icon" width={size} className={className} />
}

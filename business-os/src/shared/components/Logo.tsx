/**
 * Logo — componente de imagen de marca unificado.
 *
 * Usa el cubo isométrico oficial del brandboard de StratosCore.
 * Cuando hay un logo de tenant (multi-tenant), lo muestra en su lugar.
 */

import Image from 'next/image'
import logoSrc from '@/shared/assets/images/Logo.png'

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

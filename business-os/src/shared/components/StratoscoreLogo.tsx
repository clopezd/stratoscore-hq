/**
 * StratoscoreLogo — Identidad oficial de StratosCore.
 * Cubo isométrico del brandboard + wordmark "STRATOS | CORE".
 *
 * Variantes:
 * - 'icon'     → Cubo solo
 * - 'wordmark' → Cubo + "STRATOS | CORE" horizontal
 * - 'stacked'  → Cubo arriba + texto abajo
 */

import Image from 'next/image'
import logoSrc from '@/shared/assets/images/Logo.png'

interface StratoscoreLogoProps {
  className?: string
  width?: number | string
  variant?: 'icon' | 'wordmark' | 'stacked'
}

export function StratoscoreLogo({
  className = '',
  width = 200,
  variant = 'wordmark',
}: StratoscoreLogoProps) {
  const numWidth = typeof width === 'number' ? width : 200
  const iconSize = variant === 'stacked' ? 48 : Math.max(24, Math.round(numWidth * 0.16))

  if (variant === 'icon') {
    return (
      <Image
        src={logoSrc}
        alt="StratosCore"
        width={typeof width === 'number' ? width : 40}
        height={typeof width === 'number' ? width : 40}
        className={className}
        priority
      />
    )
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <Image src={logoSrc} alt="StratosCore" width={iconSize} height={iconSize} priority />
        <div className="flex items-center gap-1.5">
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '0.15em', color: 'currentColor' }}>
            STRATOS
          </span>
          <span style={{ color: '#00F2FE', fontSize: 18, fontWeight: 300 }}>|</span>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '0.15em', color: 'currentColor' }}>
            CORE
          </span>
        </div>
      </div>
    )
  }

  // Default: wordmark horizontal
  const fontSize = Math.round(numWidth * 0.085)

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image src={logoSrc} alt="StratosCore" width={iconSize} height={iconSize} priority />
      <div className="flex items-center gap-1.5">
        <span style={{ fontWeight: 700, fontSize, letterSpacing: '0.15em', color: 'currentColor' }}>
          STRATOS
        </span>
        <span style={{ color: '#00F2FE', fontSize, fontWeight: 300 }}>|</span>
        <span style={{ fontWeight: 700, fontSize, letterSpacing: '0.15em', color: 'currentColor' }}>
          CORE
        </span>
      </div>
    </div>
  )
}

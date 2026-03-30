/**
 * StratoscoreLogo — Nueva identidad visual 2026.
 *
 * Variantes:
 * - 'icon'     → Isotipo solo (hexágono + S + anillos)
 * - 'wordmark' → Isotipo + "STRATOS | CORE" horizontal
 * - 'stacked'  → Isotipo arriba + texto abajo
 *
 * Usa `currentColor` para el texto → funciona con `className="text-white"`.
 */

interface StratoscoreLogoProps {
  className?: string
  width?: number | string
  variant?: 'icon' | 'wordmark' | 'stacked'
}

function StratoscoreIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring — stratosphere */}
      <circle cx="50" cy="50" r="46" stroke="url(#sc-g1)" strokeWidth="1" opacity="0.2"/>
      {/* Mid ring */}
      <circle cx="50" cy="50" r="38" stroke="url(#sc-g1)" strokeWidth="1" opacity="0.35"/>
      {/* Core hexagon */}
      <polygon
        points="50,18 78,34 78,66 50,82 22,66 22,34"
        stroke="url(#sc-g1)"
        strokeWidth="2"
        fill="url(#sc-g2)"
      />
      {/* S letterform */}
      <path
        d="M40,40 C40,34 44,30 50,30 C56,30 60,34 60,40 C60,46 56,50 50,50 C44,50 40,54 40,60 C40,66 44,70 50,70 C56,70 60,66 60,60"
        stroke="#00F2FE"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Top vertex glow */}
      <circle cx="50" cy="18" r="2.5" fill="#00F2FE" opacity="0.8"/>
      <defs>
        <linearGradient id="sc-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F2FE"/>
          <stop offset="100%" stopColor="#0891b2"/>
        </linearGradient>
        <linearGradient id="sc-g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,242,254,0.08)"/>
          <stop offset="100%" stopColor="rgba(8,145,178,0.02)"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export function StratoscoreLogo({
  className = '',
  width = 200,
  variant = 'wordmark',
}: StratoscoreLogoProps) {
  if (variant === 'icon') {
    return (
      <div className={className}>
        <StratoscoreIcon size={typeof width === 'number' ? width : 40} />
      </div>
    )
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <StratoscoreIcon size={56} />
        <div className="flex items-center gap-1.5">
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: '0.15em',
              color: 'currentColor',
            }}
          >
            STRATOS
          </span>
          <span style={{ color: '#00F2FE', fontSize: 18, fontWeight: 300 }}>|</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: '0.15em',
              color: 'currentColor',
            }}
          >
            CORE
          </span>
        </div>
      </div>
    )
  }

  // Default: wordmark horizontal
  const numWidth = typeof width === 'number' ? width : 200
  const iconSize = Math.round(numWidth * 0.18)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <StratoscoreIcon size={iconSize} />
      <div className="flex items-center gap-1.5">
        <span
          style={{
            fontWeight: 700,
            fontSize: Math.round(numWidth * 0.09),
            letterSpacing: '0.15em',
            color: 'currentColor',
          }}
        >
          STRATOS
        </span>
        <span
          style={{
            color: '#00F2FE',
            fontSize: Math.round(numWidth * 0.09),
            fontWeight: 300,
          }}
        >
          |
        </span>
        <span
          style={{
            fontWeight: 700,
            fontSize: Math.round(numWidth * 0.09),
            letterSpacing: '0.15em',
            color: 'currentColor',
          }}
        >
          CORE
        </span>
      </div>
    </div>
  )
}

/**
 * StratoscoreLogo — Wordmark "stratos|Core" puro, sin iconos gráficos.
 * Brand: Deep Carbon #001117, Electric Cyan #00F2FE
 */

interface StratoscoreLogoProps {
  className?: string
  width?: number | string
  variant?: 'wordmark' | 'stacked' | 'compact'
}

export function StratoscoreLogo({
  className = '',
  width = 200,
  variant = 'wordmark',
}: StratoscoreLogoProps) {
  const numWidth = typeof width === 'number' ? width : 200
  const fontSize = variant === 'compact' ? 14 : Math.max(12, Math.round(numWidth * 0.085))

  if (variant === 'compact') {
    return (
      <span
        className={className}
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 300,
          fontSize,
          letterSpacing: '0.08em',
          color: 'currentColor',
          whiteSpace: 'nowrap',
        }}
        aria-label="StratosCore"
      >
        stratos<span style={{ color: '#00F2FE', fontWeight: 300, margin: '0 1px' }}>|</span>Core
      </span>
    )
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 300,
            fontSize: Math.max(14, fontSize),
            letterSpacing: '0.12em',
            color: 'currentColor',
            whiteSpace: 'nowrap',
          }}
          aria-label="StratosCore"
        >
          stratos<span style={{ color: '#00F2FE', fontWeight: 300, margin: '0 2px' }}>|</span>Core
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center ${className}`}>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 300,
          fontSize,
          letterSpacing: '0.12em',
          color: 'currentColor',
          whiteSpace: 'nowrap',
        }}
        aria-label="StratosCore"
      >
        stratos<span style={{ color: '#00F2FE', fontWeight: 300, margin: '0 2px' }}>|</span>Core
      </span>
    </div>
  )
}

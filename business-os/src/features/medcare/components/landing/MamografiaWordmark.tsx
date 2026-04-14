// Wordmark "Mam[o]grafía con tomosíntesis 3D" del Libro de Marca Mamo
// La "o" se reemplaza con el icono circulo+punto en Pantone Rhodamine Red C
// Tipografía: Montserrat

interface Props {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  showSubtitle?: boolean
  /** Si true, usa color blanco (para fondos oscuros) */
  inverted?: boolean
}

const sizes = {
  sm: { text: 'text-2xl sm:text-3xl', sub: 'text-[10px] sm:text-xs', circle: 18, gap: 'tracking-tight' },
  md: { text: 'text-3xl sm:text-4xl', sub: 'text-xs sm:text-sm', circle: 24, gap: 'tracking-tight' },
  lg: { text: 'text-4xl sm:text-5xl', sub: 'text-sm sm:text-base', circle: 30, gap: 'tracking-tight' },
  xl: { text: 'text-5xl sm:text-6xl lg:text-7xl', sub: 'text-base sm:text-lg', circle: 40, gap: 'tracking-tight' },
}

export function MamografiaWordmark({
  className = '',
  size = 'md',
  color = '#E50995',
  showSubtitle = true,
  inverted = false,
}: Props) {
  const s = sizes[size]
  const mainColor = inverted ? '#FFFFFF' : color
  const subColor = inverted ? 'rgba(255,255,255,0.85)' : color

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div
        className={`inline-flex items-center ${s.text} ${s.gap} font-medium leading-none`}
        style={{
          fontFamily: 'var(--font-montserrat), system-ui, sans-serif',
          color: mainColor,
        }}
      >
        <span>Mam</span>
        <span className="inline-flex items-center justify-center" style={{ margin: '0 0.02em' }}>
          <BreastCircle size={s.circle} color={mainColor} />
        </span>
        <span>grafía</span>
      </div>
      {showSubtitle && (
        <div
          className={`${s.sub} font-normal mt-1 tracking-wide`}
          style={{
            fontFamily: 'var(--font-montserrat), system-ui, sans-serif',
            color: subColor,
          }}
        >
          con tomosíntesis 3D
        </div>
      )}
    </div>
  )
}

function BreastCircle({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(2, size * 0.12)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      style={{ display: 'inline-block', verticalAlign: 'baseline', transform: 'translateY(-8%)' }}
      aria-label="Mamografía"
    >
      <circle cx="24" cy="24" r={24 - stroke} stroke={color} strokeWidth={stroke} />
      <circle cx="24" cy="24" r="5" fill={color} />
    </svg>
  )
}

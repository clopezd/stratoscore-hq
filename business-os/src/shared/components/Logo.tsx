/**
 * Logo — componente de marca unificado.
 *
 * Default: wordmark "stratos|Core" compacto.
 * Cuando hay un logo de tenant (multi-tenant), muestra la imagen del tenant.
 */

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
    <span
      className={className}
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 300,
        fontSize: Math.max(11, size * 0.35),
        letterSpacing: '0.08em',
        color: 'currentColor',
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
      }}
      aria-label={alt}
    >
      stratos<span style={{ color: '#00F2FE', fontWeight: 300, margin: '0 1px' }}>|</span>Core
    </span>
  )
}

/**
 * VidendumLogo — SVG con colores dinámicos vía currentColor.
 * Réplica del logo oficial: corchetes de esquina + wordmark.
 * El color se hereda del `className` del elemento padre (text-*).
 */

interface VidendumLogoProps {
  className?: string
  /** Ancho en px o string CSS. La altura escala proporcionalmente (ratio 1.8:1). */
  width?: number | string
}

export function VidendumLogo({ className = '', width = 108 }: VidendumLogoProps) {
  // Viewbox: 180×100 — misma proporción que el PNG original (180×100px)
  return (
    <svg
      viewBox="0 0 180 100"
      width={width}
      style={{ height: 'auto' }}
      fill="none"
      aria-label="Videndum"
      className={className}
    >
      {/* ── Corchetes de esquina ─────────────────────────────────── */}
      {/* Top-left */}
      <polyline points="8,26 8,8 26,8"    stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Top-right */}
      <polyline points="154,8 172,8 172,26" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom-left */}
      <polyline points="8,74 8,92 26,92"  stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom-right */}
      <polyline points="154,92 172,92 172,74" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

      {/* ── Wordmark ─────────────────────────────────────────────── */}
      <text
        x="90"
        y="54"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
        fontWeight="600"
        fontSize="30"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        Videndum
      </text>
    </svg>
  )
}

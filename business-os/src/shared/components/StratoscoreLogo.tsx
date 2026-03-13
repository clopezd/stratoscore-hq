/**
 * StratoscoreLogo — Identidad de la plataforma (pantalla de login y páginas públicas).
 * Nunca aparece en el área autenticada — ahí va el logo del cliente.
 *
 * Wordmark + marca de acento cian. Usa `currentColor` para el texto
 * de modo que `className="text-white"` / `text-slate-900` funcionen
 * automáticamente en cualquier fondo.
 */

interface StratoscoreLogoProps {
  className?: string
  /** Ancho en px. La altura escala proporcionalmente (viewBox 220×56). */
  width?: number | string
}

export function StratoscoreLogo({ className = '', width = 140 }: StratoscoreLogoProps) {
  return (
    <svg
      viewBox="0 0 220 56"
      width={width}
      style={{ height: 'auto' }}
      fill="none"
      aria-label="Stratoscore"
      className={className}
    >
      {/* ── Marca de acento — dos chevrons cian superpuestos ──────────── */}
      {/* Chevron exterior */}
      <polyline
        points="4,10 18,28 4,46"
        stroke="#00F2FE"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      {/* Chevron interior */}
      <polyline
        points="13,18 22,28 13,38"
        stroke="#00F2FE"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Wordmark ───────────────────────────────────────────────────── */}
      <text
        x="34"
        y="29"
        dominantBaseline="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
        fontWeight="700"
        fontSize="22"
        letterSpacing="1.5"
        fill="currentColor"
      >
        STRATOSCORE
      </text>
    </svg>
  )
}

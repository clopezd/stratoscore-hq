// Wordmark "Ultrasonid[●] de mama" — Render HTML/CSS (resolución infinita).
// El isotipo target reemplaza la "o" final de "Ultrasonido".
// Pendiente: alinear al PDF oficial cuando el cliente lo entregue.

import Image from 'next/image'

interface Props {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showSubtitle?: boolean
  inverted?: boolean
}

const sizes = {
  sm:    { text: 'text-2xl',  sub: 'text-[10px]', icon: 22, gap: 'mt-0.5', iconNudge: '-mx-0.5' },
  md:    { text: 'text-3xl',  sub: 'text-xs',     icon: 28, gap: 'mt-1',   iconNudge: '-mx-0.5' },
  lg:    { text: 'text-5xl',  sub: 'text-sm',     icon: 44, gap: 'mt-1.5', iconNudge: '-mx-1' },
  xl:    { text: 'text-6xl',  sub: 'text-base',   icon: 56, gap: 'mt-2',   iconNudge: '-mx-1' },
  '2xl': { text: 'text-7xl',  sub: 'text-xl',     icon: 68, gap: 'mt-2',   iconNudge: '-mx-1.5' },
}

export function UltrasonidoWordmark({
  className = '',
  size = 'md',
  showSubtitle = false,
  inverted = false,
}: Props) {
  const s = sizes[size]
  const textColor = inverted ? 'text-white' : 'text-[#E50995]'
  const iconSrc = inverted ? '/medcare/simbolo-target-white.png' : '/medcare/simbolo-target-pink.png'

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div
        className={`flex items-center ${textColor} ${s.text} font-bold tracking-tight leading-none`}
      >
        <span>Ultrasonid</span>
        <Image
          src={iconSrc}
          alt=""
          width={s.icon}
          height={s.icon}
          className={`inline-block ${s.iconNudge}`}
          aria-hidden
          priority
        />
        <span className="ml-1">de mama</span>
      </div>
      {showSubtitle && (
        <span
          className={`${textColor} ${s.sub} font-medium tracking-[0.18em] ${s.gap} opacity-95`}
        >
          imagen complementaria
        </span>
      )}
    </div>
  )
}

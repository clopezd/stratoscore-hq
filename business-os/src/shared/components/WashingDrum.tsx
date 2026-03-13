interface Props {
  size?: number
  className?: string
}

export function WashingDrum({ size = 56, className = '' }: Props) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.42
  const porthole = size * 0.28
  const hole = size * 0.07
  const holeR = size * 0.19

  const holes = [0, 120, 240].map((deg) => {
    const rad = (deg * Math.PI) / 180
    return {
      x: cx + holeR * Math.cos(rad),
      y: cy + holeR * Math.sin(rad),
    }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx={cx} cy={cy} r={r}
        stroke="#0077B6"
        strokeWidth={size * 0.045}
        fill="none"
        opacity="0.35"
      />
      <g className="drum-rotating">
        <circle
          cx={cx} cy={cy} r={porthole}
          stroke="#0077B6"
          strokeWidth={size * 0.04}
          fill="rgba(0,180,216,0.08)"
        />
        {holes.map((h, i) => (
          <circle
            key={i}
            cx={h.x} cy={h.y} r={hole}
            fill="#00B4D8"
            opacity="0.55"
          />
        ))}
      </g>
      <ellipse
        cx={cx - size * 0.08}
        cy={cy - size * 0.12}
        rx={size * 0.07}
        ry={size * 0.04}
        fill="white"
        opacity="0.45"
        transform={`rotate(-30 ${cx - size * 0.08} ${cy - size * 0.12})`}
      />
    </svg>
  )
}

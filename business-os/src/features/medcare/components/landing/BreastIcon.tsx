// Icono del Libro de Marca Mamografia: circulo con punto central
// Se usa como elemento grafico distintivo del sub-brand fucsia
export function BreastIcon({
  className = 'w-8 h-8',
  stroke = 2,
  color = '#E50995',
}: {
  className?: string
  stroke?: number
  color?: string
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="4" fill={color} />
    </svg>
  )
}

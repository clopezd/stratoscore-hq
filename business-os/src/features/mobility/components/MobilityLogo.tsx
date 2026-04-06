import { MobilityBrand } from '../brand'

interface Props {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  className?: string
}

export function MobilityLogo({ size = 'medium', showText = true, className = '' }: Props) {
  const heights = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16',
  }

  const textSizes = {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-2xl',
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={MobilityBrand.logo.url}
        alt={MobilityBrand.logo.alt}
        className={`${heights[size]} w-auto`}
      />
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold`} style={{ color: MobilityBrand.colors.primary }}>
            {MobilityBrand.contact.name}
          </h1>
          {size !== 'small' && (
            <p className="text-xs" style={{ color: MobilityBrand.colors.gray }}>
              {MobilityBrand.contact.tagline}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

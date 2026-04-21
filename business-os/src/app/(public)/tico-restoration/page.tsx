import { Metadata } from 'next'
import { TicoPortfolio } from '@/features/tico-restoration/components/TicoPortfolio'

export const metadata: Metadata = {
  title: 'TICO RESTORATION - Restauración Profesional en Florida',
  description: 'Servicios profesionales de pintura, restauración y waterproofing en Sarasota, Florida. Más de 11 años transformando espacios comerciales.',
  keywords: 'restoration, pintura, waterproofing, Sarasota, Florida, comercial, renovación',
  openGraph: {
    title: 'TICO RESTORATION - Transformamos Espacios',
    description: 'Pintura, restauración y renovación comercial profesional en Florida',
    type: 'website',
    locale: 'es_US'
  }
}

export default function TicoRestorationPage() {
  return <TicoPortfolio />
}

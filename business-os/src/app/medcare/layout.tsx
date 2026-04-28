import type { Metadata } from 'next'
import { Montserrat, Encode_Sans } from 'next/font/google'

// Fuentes oficiales del Libro de Marca MedCare (Nov 2022)
// Montserrat: titulos — Encode Sans: cuerpo de texto
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800'],
})

const encodeSans = Encode_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-encode-sans',
  weight: ['400', '500', '600', '700'],
})

const SITE_URL = 'https://portal.medcare.cr'
const OG_IMAGE = `${SITE_URL}/medcare/og-image.jpg`
const TITLE = 'MedCare — Centro Médico Especializado'
const DESC = 'Mamografía Digital 3D + Ultrasonido de mama en San José, Costa Rica. Tomosíntesis con IA. Agendá tu cita en línea — Promo mayo ₡65.000.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  metadataBase: new URL(SITE_URL),
  applicationName: 'MedCare',
  authors: [{ name: 'MedCare Centro Médico Especializado' }],
  keywords: ['mamografía 3D', 'tomosíntesis', 'ultrasonido de mama', 'diagnóstico', 'Costa Rica', 'San José', 'MedCare'],
  icons: {
    icon: [
      { url: '/medcare/favicon-medcare.png', type: 'image/png', sizes: '512x512' },
      { url: '/medcare/isotipo-medcare.png', type: 'image/png' },
    ],
    apple: '/medcare/favicon-medcare.png',
    shortcut: '/medcare/favicon-medcare.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CR',
    url: `${SITE_URL}/medcare/agendar-estudio`,
    siteName: 'MedCare',
    title: TITLE,
    description: DESC,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'MedCare — Mamografía 3D + Ultrasonido de mama, promo ₡65.000',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: [OG_IMAGE],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MedCare',
  },
}

export default function MedcareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`medcare-root ${montserrat.variable} ${encodeSans.variable}`}
      style={{ fontFamily: 'var(--font-encode-sans), system-ui, sans-serif' }}
    >
      <style>{`
        .medcare-root h1,
        .medcare-root h2,
        .medcare-root h3,
        .medcare-root h4,
        .medcare-root h5,
        .medcare-root h6 {
          font-family: var(--font-montserrat), system-ui, sans-serif;
          letter-spacing: -0.01em;
        }
      `}</style>
      {children}
    </div>
  )
}

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

export const metadata: Metadata = {
  title: 'MedCare — Centro Médico Especializado',
  description: 'Mamografía Digital 3D + Ultrasonido de mama en San José, Costa Rica. Agendá tu cita en línea.',
  icons: {
    icon: [{ url: '/medcare/logo-medcare.jpg', type: 'image/jpeg' }],
    apple: '/medcare/logo-medcare.jpg',
    shortcut: '/medcare/logo-medcare.jpg',
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

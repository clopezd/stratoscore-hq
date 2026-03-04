import type { Metadata, Viewport } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { PWARegister } from '@/components/PWARegister'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'StratosCore — Automatización 24/7 para PYMEs y Clínicas',
  description: 'Automatizamos tu crecimiento con IA: agenda, CRM y marketing que no paran mientras tú atiendes. Colombia y Costa Rica.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StratosCore',
  },
}

export const viewport: Viewport = {
  themeColor: '#001117',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={spaceGrotesk.variable}>
      <body style={{ fontFamily: 'var(--font-grotesk), system-ui, sans-serif', backgroundColor: '#001117' }}>
        {children}
        <PWARegister />
      </body>
    </html>
  )
}

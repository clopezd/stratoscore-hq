import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { PWARegister } from '@/components/PWARegister'
import { ThemeProvider } from '@/shared/providers/ThemeProvider'

const spaceGrotesk = localFont({
  src: '../fonts/SpaceGrotesk-Regular.woff2',
  variable: '--font-grotesk',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'StratosCore — Mission Control',
  description: 'Business OS con 11 agentes de IA autónomos. Automatización agéntica 360 para PYMES y Clínicas.',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.svg',
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
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={spaceGrotesk.variable} suppressHydrationWarning>
      <body style={{ fontFamily: 'var(--font-grotesk), system-ui, sans-serif' }}>
        <ThemeProvider>
          {children}
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  )
}

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
  title: 'Videndum — Sales Intelligence Platform',
  description: 'Sales Operations · Forecast vs Revenue · Market Intelligence · Powered by Stratoscore',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Videndum',
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

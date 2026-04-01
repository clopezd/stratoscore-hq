import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lavandería - Mi Cuenta',
  description: 'Pide tu servicio de lavandería a domicilio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}

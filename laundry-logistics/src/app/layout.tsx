import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lavandería - Logística',
  description: 'Panel de operaciones y logística de lavandería',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#001117] text-[#E0EDE0]">
        {children}
      </body>
    </html>
  )
}

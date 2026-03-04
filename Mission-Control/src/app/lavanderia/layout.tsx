import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lavandería Carlos — Panel Operativo',
  description: 'Panel de operaciones de la lavandería',
}

export default function LavanderiaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      data-lavanderia
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #100800 0%, #1a1000 100%)' }}
    >
      {children}
    </div>
  )
}

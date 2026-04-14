import type { Metadata } from 'next'

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
  return <>{children}</>
}

// ============================================================
// Branding — MedCare Centro Médico Especializado
// Colores extraídos del logo oficial
// ============================================================

export const MedCareBrand = {
  colors: {
    primary: '#C41E2A',       // Rojo MedCare (MED)
    primaryDark: '#A3181F',
    primaryLight: '#E8343F',
    secondary: '#1A1A2E',     // Navy oscuro MedCare (CARE)
    secondaryDark: '#0F0F1A',
    secondaryLight: '#2D2D4A',
    accent: '#FEF2F2',        // Fondo suave rojo
    dark: '#1A1A2E',
    white: '#FFFFFF',
    gray: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #C41E2A 0%, #1A1A2E 100%)',
    hero: 'from-red-700 to-slate-900',
    heroHover: 'from-red-800 to-slate-950',
    bg: 'from-red-50 to-slate-50',
    card: 'from-red-50 to-white',
  },

  logo: {
    default: '/medcare/logo-medcare.jpg',
    white: '/medcare/logo-medcare-white.jpg',
  },

  contact: {
    name: 'MedCare',
    fullName: 'MedCare Centro Médico Especializado',
    tagline: 'Centro Médico Especializado',
    subtag: 'Mamografía Digital + Ultrasonido',
    phone: '4070-0330',
    whatsapp: '8368-2100',
    whatsappLink: 'https://wa.me/50683682100',
    address: 'De la esquina noreste del Edificio Centro Colón, 50 metros al norte, San José, Costa Rica',
    hours: 'L-V 5:30am-10pm | Sáb 5:30am-8pm | Dom y feriados 7am-4pm',
    hoursDetail: {
      weekdays: 'Lunes a Viernes: 5:30 a.m. – 10:00 p.m.',
      saturday: 'Sábados: 5:30 a.m. – 8:00 p.m.',
      sundayHolidays: 'Domingos y feriados: 7:00 a.m. – 4:00 p.m.',
    },
    instagram: '@medcare_cr',
    web: 'medcare.cr',
  },
}

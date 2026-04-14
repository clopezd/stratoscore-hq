// ============================================================
// Branding — MedCare Centro Médico Especializado
// Colores extraídos del logo oficial
// ============================================================

// Colores oficiales extraidos del Libro de Marca MedCare (Nov 2022)
// Pantone references: 7621 C (rojo), Black 6 C (navy), 538 C y 642 C (secundarios)
export const MedCareBrand = {
  colors: {
    primary: '#B11C28',       // Pantone 7621 C — Rojo MedCare (MED)
    primaryDark: '#8A1520',
    primaryLight: '#D23846',
    secondary: '#0F1820',     // Pantone Black 6 C — Navy profundo (CARE)
    secondaryDark: '#070C12',
    secondaryLight: '#1E2A36',
    // Secundarios oficiales del brand book
    blueGray: '#C4CFDA',      // Pantone 538 C
    paleBlue: '#D2DCE6',      // Pantone 642 C
    accent: '#FEF2F2',        // Fondo suave rojo (derivado)
    dark: '#0F1820',
    white: '#FFFFFF',
    gray: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #B11C28 0%, #0F1820 100%)',
    hero: 'from-[#B11C28] to-[#0F1820]',
    heroHover: 'from-[#8A1520] to-[#070C12]',
    bg: 'from-[#FEF2F2] to-[#D2DCE6]',
    card: 'from-[#FEF2F2] to-white',
  },

  logo: {
    // Horizontal con colores oficiales, fondo transparente — para fondos claros (navbar blanco, cards)
    default: '/medcare/logo-medcare.png',
    // Version blanca transparente — para fondos oscuros/rojos (footer, hero)
    white: '/medcare/logo-medcare-white.png',
    // Solo el isotipo (4 cuadrados) — para espacios compactos, avatars, favicon
    isotipo: '/medcare/isotipo-medcare.png',
    // Icono cuadrado 512x512 para favicon/PWA
    favicon: '/medcare/favicon-medcare.png',
    // Legacy JPG fallbacks (conservados por compatibilidad)
    defaultJpg: '/medcare/logo-medcare.jpg',
    whiteJpg: '/medcare/logo-medcare-white.jpg',
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
    hours: 'L-V 6am-10pm | Sáb 6am-8pm | Dom y feriados 7am-4pm',
    hoursDetail: {
      weekdays: 'Lunes a Viernes: 6:00 a.m. – 10:00 p.m.',
      saturday: 'Sábados: 6:00 a.m. – 8:00 p.m.',
      sundayHolidays: 'Domingos y feriados: 7:00 a.m. – 4:00 p.m.',
    },
    instagram: '@medcare_cr',
    web: 'medcare.cr',
  },
}

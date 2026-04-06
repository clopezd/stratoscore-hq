// ============================================================
// Branding Oficial - Mobility Group CR
// ============================================================
// Basado en: https://www.mobility.cr/ y https://mobilitygroup.co/

export const MobilityBrand = {
  // Colores oficiales Mobility - Azul corporativo vibrante
  colors: {
    // Azul corporativo principal (EXACTO del botón Contacto)
    primary: '#4472B8', // Azul vibrante corporativo
    primaryDark: '#2C4F7C', // Azul oscuro
    primaryLight: '#5B8CD6', // Azul claro

    // Azul secundario
    secondary: '#5988C7', // Azul medio vibrante
    secondaryDark: '#3A5F91',
    secondaryLight: '#78A7E3',

    // Azul medio (transición)
    accent: '#4472B8',

    // Neutrales
    dark: '#1B365D', // Azul oscuro corporativo
    gray: '#6B7280',
    lightGray: '#F3F4F6',
    white: '#FFFFFF',

    // Estados
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0072CE',
  },

  // Gradientes del branding Mobility
  gradients: {
    primary: 'linear-gradient(135deg, #4472B8 0%, #5988C7 100%)',
    primaryReverse: 'linear-gradient(135deg, #5988C7 0%, #4472B8 100%)',
    hero: 'linear-gradient(to right, #4472B8, #5B8CD6, #78A7E3)',
    overlay: 'linear-gradient(to bottom, rgba(68, 114, 184, 0.95), rgba(89, 136, 199, 0.85))',
    subtle: 'linear-gradient(135deg, #EDF3FA 0%, #F6F9FC 100%)',
  },

  // Logo
  logo: {
    url: 'https://mobilitygroup.co/wp-content/uploads/2022/11/LOGOS-MOBILITY-e1669820172138.png',
    alt: 'Mobility Group CR - Centro de Rehabilitación',
  },

  // Información de contacto
  contact: {
    name: 'Mobility Group CR',
    tagline: 'Centro de Rehabilitación Integral con Alta Tecnología',
    phone: '+506 2289-5050',
    email: 'info@mobility.cr',
    address: 'Escazú, San José, Costa Rica',
    website: 'https://www.mobility.cr',
    websiteCO: 'https://mobilitygroup.co',
  },

  // Redes sociales
  social: {
    facebook: 'https://www.facebook.com/mobilitygroupcr',
    instagram: 'https://www.instagram.com/mobilitygroupcr',
    linkedin: 'https://www.linkedin.com/company/mobility-group-cr',
  },

  // Valores clave
  values: [
    'Tecnología Lokomat de última generación',
    'Equipo médico especializado',
    'Rehabilitación neurológica y ortopédica',
    'Atención personalizada',
  ],

  // Servicios principales
  services: [
    {
      name: 'Lokomat',
      description: 'Terapia de marcha robótica asistida',
      icon: '🤖',
    },
    {
      name: 'Rehabilitación Neurológica',
      description: 'ACV, lesión medular, Parkinson, esclerosis múltiple',
      icon: '🧠',
    },
    {
      name: 'Rehabilitación Ortopédica',
      description: 'Post-operatorios, fracturas, lesiones deportivas',
      icon: '🦴',
    },
    {
      name: 'Fisioterapia',
      description: 'Tratamientos personalizados',
      icon: '💪',
    },
  ],
}

// Utilidades de estilo
export const getMobilityGradient = (type: 'primary' | 'hero' | 'overlay' = 'primary') => {
  return MobilityBrand.gradients[type]
}

export const getMobilityColor = (shade: 'primary' | 'secondary' | 'dark' = 'primary') => {
  return MobilityBrand.colors[shade]
}

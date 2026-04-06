/**
 * ConFIRMA - Brand & Design System
 * Basado en los colores y estilo de la Power App original
 */

export const confirmaBrand = {
  name: 'ConFIRMA',
  fullName: 'ConFIRMA - Plataforma Inteligente de Aprobaciones',
  empresa: 'COFASA',

  colors: {
    // Paleta principal (extraída de la Power App)
    primary: '#092162', // Azul oscuro del texto principal
    secondary: '#0D323D', // Verde azulado de los boradores
    accent: '#172634', // Negro azulado de bordes

    // Estados
    borrador: '#6C757D', // Gris
    enviada: '#0DCAF0', // Cyan
    pendiente: '#FFC107', // Amarillo
    aprobada: '#198754', // Verde
    rechazada: '#DC3545', // Rojo
    cancelada: '#6C757D', // Gris

    // Prioridades
    prioridadAlta: '#DC3545', // Rojo
    prioridadMedia: '#FFC107', // Amarillo
    prioridadBaja: '#0DCAF0', // Cyan

    // UI
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: '#D6DDE0',
    borderLight: 'rgba(214, 221, 224, 0.3)',
    text: '#353D3F', // Gris oscuro
    textSecondary: '#4F5A5E' // Gris medio
  },

  gradients: {
    header: 'linear-gradient(135deg, #092162 0%, #0D323D 100%)',
    card: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)'
  },

  typography: {
    fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
    sizes: {
      xs: '14px',
      sm: '16px',
      md: '18px',
      lg: '22px',
      xl: '25px',
      '2xl': '30px'
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px'
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '10px',
    xl: '16px'
  },

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    semilight: '0 2px 8px rgba(0, 0, 0, 0.08)' // Usado en la Power App
  }
} as const

// Mapeo de estados a colores
export const getEstadoColor = (estado: string) => {
  const map: Record<string, string> = {
    Borrador: confirmaBrand.colors.borrador,
    Enviada: confirmaBrand.colors.enviada,
    Pendiente: confirmaBrand.colors.pendiente,
    Aprobada: confirmaBrand.colors.aprobada,
    Rechazada: confirmaBrand.colors.rechazada,
    Cancelada: confirmaBrand.colors.cancelada
  }
  return map[estado] || confirmaBrand.colors.text
}

// Mapeo de prioridades a colores
export const getPrioridadColor = (prioridad: string) => {
  const map: Record<string, string> = {
    Alta: confirmaBrand.colors.prioridadAlta,
    Media: confirmaBrand.colors.prioridadMedia,
    Baja: confirmaBrand.colors.prioridadBaja
  }
  return map[prioridad] || confirmaBrand.colors.text
}

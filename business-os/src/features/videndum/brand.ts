/**
 * Videndum Corporate Identity
 * Basado en el logo oficial: negro #1A1A1A sobre blanco, corchetes de marca.
 * Paleta: minimalista, sobria, orientada a decisiones.
 */

export const VIDENDUM_BRAND = {
  /** Colores RGB para jsPDF [R, G, B] */
  colors: {
    black:       [26,  26,  26]  as [number, number, number], // #1A1A1A logo negro
    darkGray:    [60,  60,  60]  as [number, number, number], // #3C3C3C texto secundario
    midGray:     [160, 160, 160] as [number, number, number], // #A0A0A0 bordes y separadores
    lightGray:   [220, 220, 220] as [number, number, number], // #DCDCDC líneas suaves
    offWhite:    [248, 248, 248] as [number, number, number], // #F8F8F8 filas alternas
    white:       [255, 255, 255] as [number, number, number],
    danger:      [185,  28,  28] as [number, number, number], // #B91C1C rojo varianza negativa
    success:     [ 21, 128,  61] as [number, number, number], // #15803D verde varianza positiva
    accentBlue:  [ 30,  64, 175] as [number, number, number], // #1E40AF opcional accent
  },

  /** Colores hex para ExcelJS (formato ARGB) */
  hex: {
    black:     'FF1A1A1A',
    darkGray:  'FF3C3C3C',
    midGray:   'FFA0A0A0',
    lightGray: 'FFDCDCDC',
    offWhite:  'FFF8F8F8',
    white:     'FFFFFFFF',
    danger:    'FFB91C1C',
    success:   'FF15803D',
  },

  /** Rutas de assets */
  assets: {
    logo: '/assets/videndum-logo.png',
    /** Dimensiones del logo en PDF (mm) — ratio original 180:100 = 1.8:1 */
    logoW: 36,
    logoH: 20,
  },

  /** Tipografía PDF */
  font: {
    heading: 'helvetica',
    body:    'helvetica',
  },

  /** Texto institucional */
  company:  'VIDENDUM PLC',
  tagline:  'Precision Planning · Sales Operations',
  website:  'videndum.com',
} as const

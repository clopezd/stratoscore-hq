import type { Config } from 'tailwindcss'

/**
 * StratosCore Brand Colors — extraídos de public/stratoscore-brand.jpg
 *
 * Swatch 1 · Deep Carbon  · #001117  → bg-brandBg, text-brandBg
 * Swatch 2 · Platinum     · #E0EDE0  → bg-brandText, text-brandText
 * Swatch 3 · Electric Cyan· #00F2FE  → bg-brandCyan, text-brandCyan, shadow-brandCyan
 * Swatch 4 · Stellar Gray · #8B949E  → bg-brandMuted, text-brandMuted
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brandCyan:  '#00F2FE',  // Electric Cyan  — botones, glows, bordes activos
        brandBg:    '#001117',  // Deep Carbon    — fondo principal
        brandText:  '#E0EDE0',  // Platinum       — texto primario
        brandMuted: '#8B949E',  // Stellar Gray   — texto secundario
      },
      boxShadow: {
        'brandCyan-sm': '0 0 8px rgba(0,242,254,0.55)',
        'brandCyan':    '0 0 20px rgba(0,242,254,0.6), 0 0 60px rgba(0,242,254,0.2)',
        'brandCyan-lg': '0 0 36px rgba(0,242,254,0.7), 0 0 90px rgba(0,242,254,0.25)',
      },
    },
  },
  plugins: [],
}

export default config

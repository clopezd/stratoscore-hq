'use client'

import { useState, useCallback, useEffect } from 'react'
import { translations, type Locale, type TranslationKey } from './translations'

function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'es'
  const lang = navigator.language?.toLowerCase() || ''
  if (lang.startsWith('es')) return 'es'
  return 'en'
}

let globalLocale: Locale | null = null

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (globalLocale) return globalLocale
    if (typeof window === 'undefined') return 'es'
    const saved = localStorage.getItem('fitsync_locale') as Locale | null
    const detected = saved || detectLocale()
    globalLocale = detected
    return detected
  })

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    globalLocale = l
    localStorage.setItem('fitsync_locale', l)
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[key]?.[locale] || key
  }, [locale])

  return { locale, setLocale, t }
}

import React, { createContext, useContext, useState, useCallback } from 'react'
import translations, { Locale, TranslationKey } from './translations'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en')

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const raw = translations[locale][key] || translations.en[key] || key
      if (!vars) return raw
      return raw.replace(/\{(\w+)\}/g, (_, k: string) =>
        vars[k] !== undefined ? String(vars[k]) : `{${k}}`
      )
    },
    [locale]
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}

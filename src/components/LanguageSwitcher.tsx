import React, { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useLanguage } from '../LanguageContext'
import { Locale } from '../translations'

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fil', label: 'Filipino' },
  { code: 'ceb', label: 'Cebuano' },
]

const LanguageSwitcher: React.FC = () => {
  const [open, setOpen] = useState(false)
  const { locale, setLocale } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex flex-col gap-1 animate-in">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code)
                setOpen(false)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                locale === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-6 h-6" />
      </button>
    </div>
  )
}

export default LanguageSwitcher

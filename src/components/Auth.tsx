import React, { useState } from 'react'
import { getSupabase } from '../supabaseClient'
import { useLanguage } from '../LanguageContext'
import { Store, User, Mail, Lock, ArrowRight } from 'lucide-react'

const STRENGTH_KEYS = ['pw.weak', 'pw.fair', 'pw.good', 'pw.strong', 'pw.very_strong'] as const

function getPasswordStrength(pw: string): { score: number; key: typeof STRENGTH_KEYS[number]; color: string } {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, key: 'pw.weak', color: 'bg-red-500' }
  if (score <= 2) return { score, key: 'pw.fair', color: 'bg-orange-500' }
  if (score <= 3) return { score, key: 'pw.good', color: 'bg-yellow-500' }
  if (score <= 4) return { score, key: 'pw.strong', color: 'bg-green-500' }
  return { score, key: 'pw.very_strong', color: 'bg-green-600' }
}

const Auth: React.FC = () => {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [ownerName, setOwnerName] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = getSupabase()

    try {
      if (isSignUp) {
        const { data: { user: _user }, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              store_name: storeName.trim(),
              owner_name: ownerName.trim()
            }
          }
        })

        if (error) throw error


      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert(t('auth.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <Store className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">{t('auth.title')}</h1>
          <p className="text-blue-100">{t('auth.subtitle')}</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.store_name')}
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      maxLength={100}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('auth.ph_store')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.owner_name')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      maxLength={100}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('auth.ph_owner')}
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.ph_email')}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.ph_password')}
                />
              </div>
              {isSignUp && password.length > 0 && (() => {
                const s = getPasswordStrength(password)
                return (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i <= s.score ? s.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${s.score <= 1 ? 'text-red-600' : s.score <= 2 ? 'text-orange-600' : 'text-green-600'}`}>
                      {t(s.key)} — {t(password.length < 6 ? 'pw.hint_min' : 'pw.hint_more')}
                    </p>
                  </div>
                )
              })()}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? t('auth.loading') : (isSignUp ? t('auth.signup') : t('auth.login'))}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
          <div className="mt-6 text-center space-y-3">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp ? t('auth.have_account') : t('auth.no_account')}
            </button>
            {!isSignUp && (
              <div>
                <button
                  onClick={async () => {
                    if (!email.trim()) return
                    const supabase = getSupabase()
                    const { error } = await supabase.auth.resetPasswordForEmail(email)
                    if (error) {
                      console.error('Reset error:', error)
                      alert(t('auth.reset_failed'))
                    } else {
                      alert(t('auth.reset_sent'))
                    }
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {t('auth.forgot_password')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth

import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { LanguageProvider, useLanguage } from './LanguageContext'
import { isSupabaseConfigured } from './supabaseClient'
import ErrorBoundary from './components/ErrorBoundary'
import LanguageSwitcher from './components/LanguageSwitcher'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import CustomerProfile from './components/CustomerProfile'

const SetupGuide: React.FC = () => {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('setup.title')}</h1>
        <p className="text-gray-600 mb-4">
          {t('setup.msg1', { code: '' }).split('{code}')[0]}<code className="bg-gray-100 px-1 rounded">.env</code>{t('setup.msg1', { code: '' }).split('{code}')[1]}
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto mb-4">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
        <p className="text-gray-500 text-sm">
          {t('setup.msg2', { link: '' }).split('{link}')[0]}<a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline">Supabase Dashboard</a>{t('setup.msg2', { link: '' }).split('{link}')[1]}
        </p>
      </div>
      <LanguageSwitcher />
    </div>
  )
}

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <><Auth /><LanguageSwitcher /></>
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customer/:customerId" element={<CustomerProfile />} />
      </Routes>
      <LanguageSwitcher />
    </Router>
  )
}

const App: React.FC = () => {
  if (!isSupabaseConfigured) {
    return (
      <LanguageProvider>
        <SetupGuide />
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ErrorBoundary>
    </LanguageProvider>
  )
}

export default App

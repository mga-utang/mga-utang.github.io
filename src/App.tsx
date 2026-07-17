import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { isSupabaseConfigured } from './supabaseClient'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import CustomerProfile from './components/CustomerProfile'

const SetupGuide: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Required</h1>
      <p className="text-gray-600 mb-4">
        Supabase is not configured. Create a <code className="bg-gray-100 px-1 rounded">.env</code> file in the project root:
      </p>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto mb-4">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
      </pre>
      <p className="text-gray-500 text-sm">
        Get these from your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline">Supabase Dashboard</a> → Project Settings → API. Then restart the dev server.
      </p>
    </div>
  </div>
)

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
    return <Auth />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customer/:customerId" element={<CustomerProfile />} />
      </Routes>
    </Router>
  )
}

const App: React.FC = () => {
  if (!isSupabaseConfigured) {
    return <SetupGuide />
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

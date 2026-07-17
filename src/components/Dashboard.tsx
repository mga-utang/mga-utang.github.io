import React, { useState, useEffect } from 'react'
import { getSupabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import { useLanguage } from '../LanguageContext'
import { Customer } from '../types'
import { Search, Plus, User, LogOut, Store, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const { user, profile, signOut, isConfirmed } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerAddress, setNewCustomerAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching customers:', error)
    } else {
      setCustomers(data || [])
    }
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) {
      alert(t('dash.profile_not_found'))
      return
    }
    if (!isConfirmed) {
      alert(t('dash.confirm_first'))
      return
    }

    const name = newCustomerName.trim()
    if (!confirm(t('confirm.add_customer', { name }))) return

    setLoading(true)
    const supabase = getSupabase()
    const { error } = await supabase
      .from('customers')
      .insert({
        full_name: name,
        address_or_purok: newCustomerAddress.trim(),
        created_by_profile_id: profile.id,
      })

    if (error) {
      console.error('Error adding customer:', error)
      alert(t('dash.add_failed'))
    } else {
      setNewCustomerName('')
      setNewCustomerAddress('')
      setShowAddCustomer(false)
      fetchCustomers()
    }
    setLoading(false)
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.address_or_purok.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">{profile?.store_name}</h1>
                <p className="text-sm text-gray-500">{profile?.owner_name}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {!isConfirmed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">{t('dash.confirm_email_title')}</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {t('dash.confirm_email_msg')}
                </p>
                <button
                  onClick={async () => {
                    if (resendCooldown > 0) return
                    const supabase = getSupabase()
                    const { error } = await supabase.auth.resend({
                      type: 'signup',
                      email: user?.email || '',
                    })
                    if (error) {
                      console.error('Resend error:', error)
                      alert(t('dash.resend_failed'))
                    } else {
                      alert(t('dash.resend_success'))
                      setResendCooldown(60)
                      const timer = setInterval(() => {
                        setResendCooldown((prev) => {
                          if (prev <= 1) {
                            clearInterval(timer)
                            return 0
                          }
                          return prev - 1
                        })
                      }, 1000)
                    }
                  }}
                  disabled={resendCooldown > 0}
                  className="mt-3 w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? t('dash.resend_in', { n: resendCooldown }) : t('dash.resend_btn')}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('dash.search_ph')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        <button
          onClick={() => setShowAddCustomer(true)}
          disabled={!isConfirmed}
          className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg ${
            isConfirmed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-5 h-5" />
          {t('dash.add_customer_btn')}
        </button>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">{t('dash.customers_heading')}</h2>
          {filteredCustomers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => navigate(`/customer/${customer.id}`)}
              className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.full_name}</h3>
                  <p className="text-sm text-gray-500">{customer.address_or_purok}</p>
                </div>
              </div>
            </button>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('dash.no_customers')}</p>
            </div>
          )}
        </div>
      </main>

      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dash.add_modal_title')}</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dash.full_name')}
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  maxLength={150}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('dash.ph_name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dash.address_purok')}
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('dash.ph_address')}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {t('dash.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? t('dash.adding') : t('dash.add_customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

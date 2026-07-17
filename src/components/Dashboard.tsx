import React, { useState, useEffect } from 'react'
import { getSupabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import { Customer } from '../types'
import { Search, Plus, User, LogOut, Store, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const { user, profile, signOut, isConfirmed } = useAuth()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerAddress, setNewCustomerAddress] = useState('')
  const [loading, setLoading] = useState(false)

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
    console.log('Add customer clicked, profile:', profile)
    if (!profile) {
      alert('Profile not found! Please try logging out and back in.')
      return
    }
    if (!isConfirmed) {
      alert('Please confirm your email address before adding customers!')
      return
    }

    setLoading(true)
    const supabase = getSupabase()
    const { error } = await supabase
      .from('customers')
      .insert({
        full_name: newCustomerName,
        address_or_purok: newCustomerAddress,
        created_by_profile_id: profile.id,
      })

    if (error) {
      console.error('Error adding customer:', error)
      alert('Error adding customer: ' + error.message)
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
                <h3 className="font-semibold text-yellow-800">Confirm your email</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Please confirm your email address before adding customers. Check your inbox for a confirmation link!
                </p>
                <button
                  onClick={async () => {
                    const supabase = getSupabase()
                    const { error } = await supabase.auth.resend({
                      type: 'signup',
                      email: user?.email || '',
                    })
                    if (error) alert(error.message)
                    else alert('Confirmation email resent! Check your inbox!')
                  }}
                  className="mt-3 w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Resend Confirmation Email
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customer by name or Purok..."
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
          Quick Add Customer
        </button>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
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
              <p>No customers found</p>
            </div>
          )}
        </div>
      </main>

      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Customer</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address / Purok
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter address or Purok"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Customer'}
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

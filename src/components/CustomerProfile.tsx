import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSupabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import { useLanguage } from '../LanguageContext'
import { Customer, Ledger, Profile } from '../types'
import { ArrowLeft, Store, Plus, Minus, AlertCircle, CheckCircle, DollarSign } from 'lucide-react'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const CustomerProfile: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { t } = useLanguage()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [ledgers, setLedgers] = useState<(Ledger & { store: Profile })[]>([])
  const [myLedger, setMyLedger] = useState<Ledger | null>(null)
  const [newCredit, setNewCredit] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const isValidId = !!customerId && UUID_REGEX.test(customerId)

  useEffect(() => {
    if (isValidId) {
      fetchCustomer()
      fetchLedgers()
    }
  }, [customerId, profile])

  const fetchCustomer = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (error) {
      console.error('Error fetching customer:', error)
    } else {
      setCustomer(data)
    }
  }

  const fetchLedgers = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('ledgers')
      .select(`
        *,
        store:profiles(*)
      `)
      .eq('customer_id', customerId)

    if (error) {
      console.error('Error fetching ledgers:', error)
    } else {
      setLedgers(data || [])
      if (profile) {
        const my = data?.find((l) => l.store_id === profile.id) || null
        setMyLedger(my)
        if (my) {
          setNewCredit(my.current_credit.toString())
        }
      }
    }
  }

  const totalDebt = ledgers.reduce((sum, l) => sum + Number(l.current_credit), 0)

  const getRiskColor = (debt: number) => {
    if (debt <= 200) return 'bg-green-500'
    if (debt <= 1000) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getRiskIcon = (debt: number) => {
    if (debt <= 200) return <CheckCircle className="w-6 h-6 text-green-500" />
    if (debt <= 1000) return <AlertCircle className="w-6 h-6 text-yellow-500" />
    return <AlertCircle className="w-6 h-6 text-red-500" />
  }

  const handleUpdateLedger = async () => {
    if (!profile || !customerId) return
    setLoading(true)
    const supabase = getSupabase()
    const credit = Math.min(999999, Math.max(0, Number(newCredit) || 0))

    if (myLedger) {
      const { error } = await supabase
        .from('ledgers')
        .update({
          current_credit: credit,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', myLedger.id)

      if (error) {
        console.error('Ledger update error:', error)
        alert(t('cp.save_failed'))
      } else {
        fetchLedgers()
      }
    } else {
      const { error } = await supabase
        .from('ledgers')
        .insert({
          customer_id: customerId,
          store_id: profile.id,
          current_credit: credit,
        })

      if (error) {
        console.error('Ledger insert error:', error)
        alert(t('cp.save_failed'))
      } else {
        fetchLedgers()
      }
    }

    setLoading(false)
  }

  if (!isValidId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('cp.invalid_title')}</h2>
          <p className="text-gray-500 mb-6">{t('cp.invalid_msg')}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('cp.back_dashboard')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">{t('cp.title')}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {customer && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{customer.full_name}</h2>
                <p className="text-gray-500">{customer.address_or_purok}</p>
              </div>
            </div>
          </div>
        )}

        <div className={`p-6 rounded-2xl shadow-sm border-2 ${getRiskColor(totalDebt).replace('bg-', 'border-')}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">{t('cp.risk_summary')}</h3>
            {getRiskIcon(totalDebt)}
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-gray-900">₱{totalDebt.toFixed(2)}</span>
            <span className="text-gray-500 mb-1">{t('cp.total_debt')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{t('cp.breakdown')}</h3>
          {ledgers.map((ledger) => (
            <div key={ledger.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-gray-900">{ledger.store.store_name}</span>
                </div>
                <span className="text-xl font-bold text-gray-900">₱{Number(ledger.current_credit).toFixed(2)}</span>
              </div>
            </div>
          ))}
          {ledgers.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
              <p>{t('cp.no_records')}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('cp.edit_ledger')}</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNewCredit((prev) => Math.max(0, Number(prev) - 50).toString())}
                className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Minus className="w-6 h-6 text-gray-700" />
              </button>
              <input
                type="number"
                value={newCredit}
                onChange={(e) => setNewCredit(e.target.value)}
                min={0}
                max={999999}
                step="0.01"
                className="flex-1 text-center text-2xl font-bold py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setNewCredit((prev) => (Number(prev) + 50).toString())}
                className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            <button
              onClick={handleUpdateLedger}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? t('cp.saving') : (myLedger ? t('cp.update_ledger') : t('cp.open_ledger'))}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CustomerProfile

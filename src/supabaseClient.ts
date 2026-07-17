import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey
  && supabaseUrl !== 'YOUR_SUPABASE_URL'
  && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/** Non-null accessor — safe to call in components guarded by isSupabaseConfigured */
export function getSupabase() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

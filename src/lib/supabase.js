import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.')
}

const globalAny = globalThis
if (!globalAny.__supabase) {
  globalAny.__supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = globalAny.__supabase
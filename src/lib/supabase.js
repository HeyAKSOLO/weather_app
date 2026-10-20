import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase settings. Copy .env.example to .env and paste your project URL and anon key.',
  )
}

// The anon key is safe in the browser. Row Level Security still blocks other users' data.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

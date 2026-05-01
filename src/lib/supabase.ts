import { createClient } from '@supabase/supabase-js'

// Fallbacks prevent the build from crashing during Vercel's static
// prerender step where env vars are not yet injected.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')

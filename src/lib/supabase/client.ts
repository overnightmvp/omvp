import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a dummy client during build time
    // This will be replaced with a real one when environment variables are available
    return null as any
  }

  return createBrowserClient<Database>(url, key)
}

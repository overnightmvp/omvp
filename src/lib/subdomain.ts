import { createClient } from '@supabase/supabase-js'

/**
 * Reserved subdomains that cannot be used for creator pages
 */
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'app',
  'admin',
  'blog',
  'dashboard',
  'auth',
] as const

/**
 * Extracts subdomain from hostname.
 * Returns null for localhost and main domain.
 *
 * @param hostname - Request hostname (e.g., 'creator.platform.com')
 * @returns Subdomain string or null
 *
 * @example
 * extractSubdomain('creator.platform.com') // => 'creator'
 * extractSubdomain('platform.com') // => null
 * extractSubdomain('localhost') // => null
 */
export function extractSubdomain(hostname: string): string | null {
  // Get root domain from environment
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN

  // If no root domain configured, return null
  if (!rootDomain) {
    return null
  }

  // Handle localhost (with or without port)
  if (hostname.startsWith('localhost')) {
    return null
  }

  // Remove port if present
  const hostnameWithoutPort = hostname.split(':')[0]

  // Check if this is the main domain
  if (hostnameWithoutPort === rootDomain) {
    return null
  }

  // Check if hostname ends with root domain
  if (!hostnameWithoutPort.endsWith(`.${rootDomain}`)) {
    return null
  }

  // Extract subdomain by removing root domain
  const subdomain = hostnameWithoutPort.slice(0, -(rootDomain.length + 1))

  return subdomain || null
}

/**
 * Validates subdomain format and checks against reserved list.
 *
 * @param subdomain - Subdomain string to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidSubdomain('creator') // => true
 * isValidSubdomain('my-creator') // => true
 * isValidSubdomain('www') // => false (reserved)
 * isValidSubdomain('Creator') // => false (uppercase)
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Check if reserved
  if (RESERVED_SUBDOMAINS.includes(subdomain as any)) {
    return false
  }

  // Check format: lowercase letters, numbers, hyphens, 3-30 characters
  const subdomainPattern = /^[a-z0-9-]{3,30}$/
  return subdomainPattern.test(subdomain)
}

/**
 * Get Supabase client instance
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Retrieves user ID from subdomain by querying profiles table.
 * Returns null if subdomain is invalid, reserved, or user not found.
 *
 * @param hostname - Request hostname (e.g., 'creator.platform.com')
 * @returns User ID or null
 *
 * @example
 * await getUserFromSubdomain('creator.platform.com') // => 'user-123'
 * await getUserFromSubdomain('www.platform.com') // => null (reserved)
 * await getUserFromSubdomain('localhost') // => null
 */
export async function getUserFromSubdomain(
  hostname: string
): Promise<string | null> {
  // Extract subdomain
  const subdomain = extractSubdomain(hostname)

  if (!subdomain) {
    return null
  }

  // Validate subdomain
  if (!isValidSubdomain(subdomain)) {
    return null
  }

  // Query profiles table for user with matching handle
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, handle')
      .eq('handle', subdomain)
      .single()

    if (error) {
      // Not found is expected for non-existent handles
      if (error.code === 'PGRST116') {
        return null
      }
      // Log other errors but return null
      console.error('Error querying user from subdomain:', error)
      return null
    }

    return data.id
  } catch (error) {
    console.error('Unexpected error in getUserFromSubdomain:', error)
    return null
  }
}

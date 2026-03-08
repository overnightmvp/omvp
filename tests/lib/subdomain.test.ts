import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  extractSubdomain,
  isValidSubdomain,
  getUserFromSubdomain,
  RESERVED_SUBDOMAINS,
} from '../../src/lib/subdomain'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
}))

describe('subdomain utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default environment for tests
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'platform.com'
  })

  describe('extractSubdomain', () => {
    it('returns subdomain from valid production domain', () => {
      const result = extractSubdomain('creator.platform.com')
      expect(result).toBe('creator')
    })

    it('returns null for main domain (platform.com)', () => {
      const result = extractSubdomain('platform.com')
      expect(result).toBe(null)
    })

    it('returns null for localhost', () => {
      const result = extractSubdomain('localhost')
      expect(result).toBe(null)
    })

    it('returns null for localhost with port', () => {
      const result = extractSubdomain('localhost:3001')
      expect(result).toBe(null)
    })

    it('handles production domains with www prefix', () => {
      const result = extractSubdomain('www.platform.com')
      expect(result).toBe('www')
    })

    it('handles multiple dots correctly', () => {
      const result = extractSubdomain('my-creator.platform.com')
      expect(result).toBe('my-creator')
    })

    it('returns null when NEXT_PUBLIC_ROOT_DOMAIN is not set', () => {
      delete process.env.NEXT_PUBLIC_ROOT_DOMAIN
      const result = extractSubdomain('creator.platform.com')
      expect(result).toBe(null)
    })
  })

  describe('isValidSubdomain', () => {
    it('rejects reserved subdomain: www', () => {
      const result = isValidSubdomain('www')
      expect(result).toBe(false)
    })

    it('rejects reserved subdomain: api', () => {
      const result = isValidSubdomain('api')
      expect(result).toBe(false)
    })

    it('rejects reserved subdomain: admin', () => {
      const result = isValidSubdomain('admin')
      expect(result).toBe(false)
    })

    it('rejects reserved subdomain: app', () => {
      const result = isValidSubdomain('app')
      expect(result).toBe(false)
    })

    it('rejects reserved subdomain: blog', () => {
      const result = isValidSubdomain('blog')
      expect(result).toBe(false)
    })

    it('accepts valid lowercase subdomain', () => {
      const result = isValidSubdomain('creator')
      expect(result).toBe(true)
    })

    it('accepts valid subdomain with hyphens', () => {
      const result = isValidSubdomain('my-creator')
      expect(result).toBe(true)
    })

    it('accepts valid subdomain with numbers', () => {
      const result = isValidSubdomain('creator123')
      expect(result).toBe(true)
    })

    it('rejects subdomain with uppercase letters', () => {
      const result = isValidSubdomain('Creator')
      expect(result).toBe(false)
    })

    it('rejects subdomain with special characters', () => {
      const result = isValidSubdomain('creator_name')
      expect(result).toBe(false)
    })

    it('rejects subdomain shorter than 3 characters', () => {
      const result = isValidSubdomain('ab')
      expect(result).toBe(false)
    })

    it('rejects subdomain longer than 30 characters', () => {
      const result = isValidSubdomain('a'.repeat(31))
      expect(result).toBe(false)
    })

    it('accepts subdomain exactly 3 characters', () => {
      const result = isValidSubdomain('abc')
      expect(result).toBe(true)
    })

    it('accepts subdomain exactly 30 characters', () => {
      const result = isValidSubdomain('a'.repeat(30))
      expect(result).toBe(true)
    })
  })

  describe('getUserFromSubdomain', () => {
    it('returns user_id when subdomain matches valid handle', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'user-123', handle: 'creator' },
                error: null,
              }),
            })),
          })),
        })),
      }

      // Mock the createClient to return our mock
      const { createClient } = await import('@supabase/supabase-js')
      vi.mocked(createClient).mockReturnValue(mockSupabase as any)

      const result = await getUserFromSubdomain('creator.platform.com')
      expect(result).toBe('user-123')
    })

    it('returns null for reserved subdomain', async () => {
      const result = await getUserFromSubdomain('www.platform.com')
      expect(result).toBe(null)
    })

    it('returns null for main domain', async () => {
      const result = await getUserFromSubdomain('platform.com')
      expect(result).toBe(null)
    })

    it('returns null for localhost', async () => {
      const result = await getUserFromSubdomain('localhost:3001')
      expect(result).toBe(null)
    })

    it('returns null when user not found in database', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              }),
            })),
          })),
        })),
      }

      const { createClient } = await import('@supabase/supabase-js')
      vi.mocked(createClient).mockReturnValue(mockSupabase as any)

      const result = await getUserFromSubdomain('nonexistent.platform.com')
      expect(result).toBe(null)
    })

    it('returns null for invalid subdomain pattern', async () => {
      const result = await getUserFromSubdomain('Creator_Name.platform.com')
      expect(result).toBe(null)
    })
  })

  describe('RESERVED_SUBDOMAINS constant', () => {
    it('includes expected reserved subdomains', () => {
      expect(RESERVED_SUBDOMAINS).toContain('www')
      expect(RESERVED_SUBDOMAINS).toContain('api')
      expect(RESERVED_SUBDOMAINS).toContain('app')
      expect(RESERVED_SUBDOMAINS).toContain('admin')
      expect(RESERVED_SUBDOMAINS).toContain('blog')
      expect(RESERVED_SUBDOMAINS).toContain('dashboard')
      expect(RESERVED_SUBDOMAINS).toContain('auth')
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requestIndexing, submitToIndexNow } from '@/lib/agents/indexer'
import { google } from 'googleapis'

// Mock googleapis
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn(),
    },
    searchconsole: vi.fn(),
  },
}))

describe('indexer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock environment variable
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY = JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
      private_key_id: 'key123',
      private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----',
      client_email: 'test@test-project.iam.gserviceaccount.com',
      client_id: '123456789',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    })
  })

  describe('requestIndexing', () => {
    it('should authenticate with Google service account', async () => {
      const mockAuth = vi.fn()
      const mockSearchConsole = vi.fn().mockReturnValue({})

      vi.mocked(google.auth.GoogleAuth).mockImplementation(mockAuth as any)
      vi.mocked(google.searchconsole).mockImplementation(mockSearchConsole as any)

      await requestIndexing('https://creator.example.com/test-article')

      expect(mockAuth).toHaveBeenCalledWith({
        credentials: expect.objectContaining({
          type: 'service_account',
          project_id: 'test-project',
        }),
        scopes: ['https://www.googleapis.com/auth/webmasters'],
      })
    })

    it('should log URL submission for MVP (manual indexing)', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await requestIndexing('https://creator.example.com/test-article')

      expect(result).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Indexing submission logged'),
        'https://creator.example.com/test-article',
        expect.stringContaining('Manual indexing required')
      )

      consoleSpy.mockRestore()
    })

    it('should handle errors gracefully without throwing', async () => {
      // Simulate authentication error
      vi.mocked(google.auth.GoogleAuth).mockImplementation(() => {
        throw new Error('Authentication failed')
      })

      const result = await requestIndexing('https://creator.example.com/test-article')

      expect(result).toBe(false)
    })

    it('should log errors to console when indexing fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(google.auth.GoogleAuth).mockImplementation(() => {
        throw new Error('Authentication failed')
      })

      await requestIndexing('https://creator.example.com/test-article')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Indexing failed'),
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('submitToIndexNow', () => {
    it('should be a stub function for MVP', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await submitToIndexNow('https://creator.example.com/test-article')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('IndexNow submission (future enhancement)'),
        'https://creator.example.com/test-article',
        expect.stringContaining('Requires host verification key')
      )

      consoleSpy.mockRestore()
    })
  })
})

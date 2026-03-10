import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Resend before importing the module that uses it
// Use factory function to avoid hoisting issues
vi.mock('resend', () => {
  const mockSend = vi.fn()
  return {
    Resend: class {
      constructor() {
        (this as any).emails = {
          send: mockSend,
        }
      }
    },
    __mockSend: mockSend, // Export for test access
  }
})

// Import after mocking
import { sendPageReadyEmail, sendPageFailedEmail } from '@/lib/agents/notifier'
import * as ResendModule from 'resend'

// Access the mock through the module
const mockEmailsSend = (ResendModule as any).__mockSend

describe('notifier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup environment
    process.env.RESEND_API_KEY = 'test-api-key'
    // Default successful response
    mockEmailsSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })
  })

  describe('sendPageReadyEmail', () => {
    const pageData = {
      url: 'https://creator.example.com/test-article',
      headline: 'How to Build Authority Online',
      slug: 'test-article',
    }

    it('should send email with page URL and headline', async () => {
      await sendPageReadyEmail('user@example.com', pageData)

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('How to Build Authority Online'),
          html: expect.stringContaining('How to Build Authority Online'),
        })
      )
    })

    it('should include CTA button linking to published page', async () => {
      await sendPageReadyEmail('user@example.com', pageData)

      const emailCall = mockEmailsSend.mock.calls[0][0]
      expect(emailCall.html).toContain('https://creator.example.com/test-article')
      expect(emailCall.html).toContain('View Your Page')
    })

    it('should use brand colors (#E8FF47 accent)', async () => {
      await sendPageReadyEmail('user@example.com', pageData)

      const emailCall = mockEmailsSend.mock.calls[0][0]
      expect(emailCall.html).toContain('#E8FF47')
    })

    it('should include next steps guidance', async () => {
      await sendPageReadyEmail('user@example.com', pageData)

      const emailCall = mockEmailsSend.mock.calls[0][0]
      expect(emailCall.html).toContain('Next steps')
      expect(emailCall.html).toContain('Share on social media')
      expect(emailCall.html).toContain('Google Search Console')
    })

    it('should handle Resend API errors gracefully', async () => {
      mockEmailsSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'API error' },
      })

      const result = await sendPageReadyEmail('user@example.com', pageData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return success when email sent', async () => {
      const result = await sendPageReadyEmail('user@example.com', pageData)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })
  })

  describe('sendPageFailedEmail', () => {
    it('should send error notification with error message', async () => {
      await sendPageFailedEmail('user@example.com', 'Transcript extraction failed')

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('failed'),
          html: expect.stringContaining('Transcript extraction failed'),
        })
      )
    })

    it('should include support CTA', async () => {
      await sendPageFailedEmail('user@example.com', 'API quota exceeded')

      const emailCall = mockEmailsSend.mock.calls[0][0]
      expect(emailCall.html).toContain('support')
      expect(emailCall.html).toContain('Contact')
    })

    it('should handle Resend errors gracefully', async () => {
      mockEmailsSend.mockRejectedValueOnce(new Error('Network error'))

      const result = await sendPageFailedEmail('user@example.com', 'Test error')

      expect(result.success).toBe(false)
    })
  })
})

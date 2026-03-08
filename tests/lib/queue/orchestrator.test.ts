import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  enqueueStep,
  processQueueItem,
  exponentialBackoff,
  updateQueueStatus,
  PipelineStep
} from '@/lib/queue/orchestrator'

// Mock QStash publishJSON method
const mockPublishJSON = vi.fn()

// Mock QStash client
vi.mock('@upstash/qstash', () => ({
  Client: class MockQStashClient {
    publishJSON = mockPublishJSON
  },
}))

// Mock Supabase client
const mockSupabaseFrom = vi.fn()
const mockSupabaseSelect = vi.fn()
const mockSupabaseEq = vi.fn()
const mockSupabaseSingle = vi.fn()
const mockSupabaseUpdate = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}))

// Set up environment variable for tests
process.env.QSTASH_TOKEN = 'test-token'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3001'

describe('Queue Orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPublishJSON.mockResolvedValue({ messageId: 'mock-msg-id' })
  })

  describe('exponentialBackoff', () => {
    it('returns correct delay for retry attempt 0 (1 minute)', () => {
      const delay = exponentialBackoff(0)
      expect(delay).toBe(60000) // 1 minute in ms
    })

    it('returns correct delay for retry attempt 1 (2 minutes)', () => {
      const delay = exponentialBackoff(1)
      expect(delay).toBe(120000) // 2 minutes in ms
    })

    it('returns correct delay for retry attempt 2 (4 minutes)', () => {
      const delay = exponentialBackoff(2)
      expect(delay).toBe(240000) // 4 minutes in ms
    })

    it('returns correct delay for retry attempt 3 (8 minutes)', () => {
      const delay = exponentialBackoff(3)
      expect(delay).toBe(480000) // 8 minutes in ms
    })
  })

  describe('enqueueStep', () => {
    it('enqueues job to QStash with correct URL and body', async () => {
      await enqueueStep('queue-item-1', PipelineStep.SCRAPE)

      expect(mockPublishJSON).toHaveBeenCalledWith({
        url: 'http://localhost:3001/api/generation/scrape',
        body: { queueItemId: 'queue-item-1' },
        retries: 3,
      })
    })

    it('enqueues job with delay when provided', async () => {
      const delay = 60000 // 1 minute
      await enqueueStep('queue-item-1', PipelineStep.TRANSFORM, delay)

      expect(mockPublishJSON).toHaveBeenCalledWith({
        url: 'http://localhost:3001/api/generation/transform',
        body: { queueItemId: 'queue-item-1' },
        retries: 3,
        delay,
      })
    })
  })

  describe('processQueueItem', () => {
    it('enqueues scrape step when status is "pending"', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockSupabaseSelect.mockReturnValue({
          eq: mockSupabaseEq.mockReturnValue({
            single: mockSupabaseSingle.mockResolvedValue({
              data: { id: 'queue-1', status: 'pending', retry_count: 0 },
              error: null,
            }),
          }),
        }),
      })

      await processQueueItem('queue-1')

      expect(mockPublishJSON).toHaveBeenCalledWith({
        url: 'http://localhost:3001/api/generation/scrape',
        body: { queueItemId: 'queue-1' },
        retries: 3,
      })
    })

    it('enqueues transform step when status is "scraped"', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockSupabaseSelect.mockReturnValue({
          eq: mockSupabaseEq.mockReturnValue({
            single: mockSupabaseSingle.mockResolvedValue({
              data: { id: 'queue-1', status: 'scraped', retry_count: 0 },
              error: null,
            }),
          }),
        }),
      })

      await processQueueItem('queue-1')

      expect(mockPublishJSON).toHaveBeenCalledWith({
        url: 'http://localhost:3001/api/generation/transform',
        body: { queueItemId: 'queue-1' },
        retries: 3,
      })
    })

    it('enqueues schema step when status is "transformed"', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockSupabaseSelect.mockReturnValue({
          eq: mockSupabaseEq.mockReturnValue({
            single: mockSupabaseSingle.mockResolvedValue({
              data: { id: 'queue-1', status: 'transformed', retry_count: 0 },
              error: null,
            }),
          }),
        }),
      })

      await processQueueItem('queue-1')

      expect(mockPublishJSON).toHaveBeenCalledWith({
        url: 'http://localhost:3001/api/generation/schema',
        body: { queueItemId: 'queue-1' },
        retries: 3,
      })
    })

    it('skips already-completed steps (status is "published")', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockSupabaseSelect.mockReturnValue({
          eq: mockSupabaseEq.mockReturnValue({
            single: mockSupabaseSingle.mockResolvedValue({
              data: { id: 'queue-1', status: 'published', retry_count: 0 },
              error: null,
            }),
          }),
        }),
      })

      await processQueueItem('queue-1')

      // Should not enqueue any step for completed items
      expect(mockPublishJSON).not.toHaveBeenCalled()
    })
  })

  describe('updateQueueStatus', () => {
    it('updates status and increments retry_count on error', async () => {
      // Setup mock for nested calls
      const mockEqForSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { retry_count: 0 },
          error: null,
        }),
      })

      const mockSelectForRetryCount = vi.fn().mockReturnValue({
        eq: mockEqForSelect,
      })

      const mockEqForUpdate = vi.fn().mockResolvedValue({ error: null })

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEqForUpdate,
      })

      // First call to get current retry_count
      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSelectForRetryCount,
      })

      // Second call to update
      mockSupabaseFrom.mockReturnValueOnce({
        update: mockUpdate,
      })

      const result = await updateQueueStatus('queue-1', 'failed', 'Test error')

      expect(result).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error_message: 'Test error',
          retry_count: 1,
        })
      )
    })
  })
})

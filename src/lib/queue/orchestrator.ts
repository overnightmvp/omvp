import { Client } from '@upstash/qstash'
import { createClient } from '@/lib/supabase/server'

/**
 * Pipeline steps for the 6-agent generation pipeline
 */
export enum PipelineStep {
  SCRAPE = 'scrape',
  TRANSFORM = 'transform',
  SCHEMA = 'schema',
  PUBLISH = 'publish', // Future phase
  INDEX = 'index' // Future phase
}

/**
 * Queue item status types matching the database schema
 */
export type QueueStatus =
  | 'pending'
  | 'processing'
  | 'scraped'
  | 'transformed'
  | 'schema_generated'
  | 'published'
  | 'failed'

/**
 * Initialize QStash client
 */
function getQStashClient() {
  const token = process.env.QSTASH_TOKEN
  if (!token) {
    throw new Error('QSTASH_TOKEN environment variable is required')
  }
  return new Client({ token })
}

/**
 * Get base URL for API endpoints
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
}

/**
 * Calculate exponential backoff delay
 * @param attempt - Retry attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
export function exponentialBackoff(attempt: number): number {
  // 2^attempt * 60000ms = 1min, 2min, 4min, 8min
  return Math.pow(2, attempt) * 60000
}

/**
 * Enqueue a pipeline step to QStash
 * @param queueItemId - ID of the queue item
 * @param step - Pipeline step to execute
 * @param delay - Optional delay in milliseconds
 */
export async function enqueueStep(
  queueItemId: string,
  step: PipelineStep,
  delay?: number
): Promise<void> {
  const qstash = getQStashClient()
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/api/generation/${step}`

  const options: any = {
    url,
    body: { queueItemId },
    retries: 3,
  }

  if (delay) {
    options.delay = delay
  }

  await qstash.publishJSON(options)

  console.log(`[Orchestrator] Enqueued ${step} for queue item ${queueItemId}${delay ? ` with ${delay}ms delay` : ''}`)
}

/**
 * Determine next pipeline step based on current status
 * @param status - Current queue item status
 * @returns Next pipeline step or null if complete/failed
 */
function determineNextStep(status: QueueStatus): PipelineStep | null {
  switch (status) {
    case 'pending':
      return PipelineStep.SCRAPE
    case 'scraped':
      return PipelineStep.TRANSFORM
    case 'transformed':
      return PipelineStep.SCHEMA
    case 'schema_generated':
      return PipelineStep.PUBLISH
    case 'published':
    case 'failed':
      return null // No next step for completed or failed items
    default:
      return null
  }
}

/**
 * Process a queue item by determining and enqueuing the next pipeline step
 * @param queueItemId - ID of the queue item to process
 */
export async function processQueueItem(queueItemId: string): Promise<void> {
  const supabase = await createClient()

  // Fetch current queue item
  const { data, error } = await supabase
    .from('generation_queue')
    .select('*')
    .eq('id', queueItemId)
    .single()

  if (error || !data) {
    console.error(`[Orchestrator] Queue item ${queueItemId} not found`)
    throw new Error(`Queue item not found: ${queueItemId}`)
  }

  const queueItem = data as any
  const status = queueItem.status as QueueStatus

  console.log(`[Orchestrator] Processing queue item ${queueItemId} with status: ${status}`)

  // Determine next step
  const nextStep = determineNextStep(status)

  if (!nextStep) {
    console.log(`[Orchestrator] No next step for status: ${status}. Item complete or failed.`)
    return
  }

  // Enqueue next step
  await enqueueStep(queueItemId, nextStep)
}

/**
 * Update queue item status with error tracking
 * @param itemId - Queue item ID
 * @param status - New status
 * @param errorMessage - Optional error message
 * @returns Success boolean
 */
export async function updateQueueStatus(
  itemId: string,
  status: QueueStatus,
  errorMessage?: string
): Promise<boolean> {
  const supabase = await createClient()

  try {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Set started_at when processing begins
    if (status === 'processing') {
      updates.started_at = new Date().toISOString()
    }

    // Set completed_at when done (published or failed)
    if (status === 'published' || status === 'failed') {
      updates.completed_at = new Date().toISOString()
    }

    // Store error message if provided
    if (errorMessage) {
      updates.error_message = errorMessage
      // Increment retry count on errors
      // Note: We'll need to fetch current retry_count first
      const { data: currentItem } = await supabase
        .from('generation_queue')
        .select('retry_count')
        .eq('id', itemId)
        .single()

      if (currentItem) {
        updates.retry_count = ((currentItem as any).retry_count || 0) + 1
      }
    }

    const { error } = await (supabase as any)
      .from('generation_queue')
      .update(updates)
      .eq('id', itemId)

    if (error) {
      console.error('[Orchestrator] Error updating queue status:', error)
      return false
    }

    console.log(`[Orchestrator] Updated queue item ${itemId} to status: ${status}`)
    return true
  } catch (error) {
    console.error('[Orchestrator] Exception updating queue status:', error)
    return false
  }
}

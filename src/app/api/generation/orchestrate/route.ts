import { NextRequest, NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { createClient } from '@/lib/supabase/server'
import { updateQueueStatus, exponentialBackoff, enqueueStep, PipelineStep } from '@/lib/queue/orchestrator'
import { getPageByQueueItemId } from '@/lib/db/generated-pages'
import { z } from 'zod'

const RequestSchema = z.object({
  queueItemId: z.string().uuid(),
})

/**
 * POST /api/generation/orchestrate
 *
 * Main orchestration endpoint called by QStash to execute pipeline steps.
 * Verifies QStash signature for security, then executes pipeline steps sequentially:
 * 1. Scrape (if pending)
 * 2. Transform (if scraped)
 * 3. Schema (if transformed)
 * 4. Publish (if schema_generated)
 *
 * Handles errors with retry logic and exponential backoff.
 */
async function handler(request: NextRequest) {
  const supabase = await createClient()

  // Validate request body
  let queueItemId: string
  try {
    const body = await request.json()
    const validated = RequestSchema.parse(body)
    queueItemId = validated.queueItemId
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body. queueItemId required.' },
      { status: 400 }
    )
  }

  try {
    // Fetch queue item
    const { data, error: fetchError } = await supabase
      .from('generation_queue')
      .select('*')
      .eq('id', queueItemId)
      .single()

    if (fetchError || !data) {
      return NextResponse.json(
        { success: false, error: 'Queue item not found' },
        { status: 404 }
      )
    }

    const queueItem = data as any
    const initialStatus = queueItem.status
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

    console.log(`[Orchestrate] Processing queue item ${queueItemId} with status: ${initialStatus}`)

    // Execute pipeline steps based on status
    let currentStatus = initialStatus

    // Step 1: Scrape (if status is 'pending')
    if (currentStatus === 'pending') {
      console.log(`[Orchestrate] Calling scrape endpoint for ${queueItemId}`)
      const scrapeResponse = await fetch(`${baseUrl}/api/generation/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueItemId }),
      })

      if (!scrapeResponse.ok) {
        const error = await scrapeResponse.json()
        throw new Error(`Scrape failed: ${error.error || 'Unknown error'}`)
      }

      // Re-fetch to get updated status
      const { data: updatedItem } = await supabase
        .from('generation_queue')
        .select('status')
        .eq('id', queueItemId)
        .single()

      currentStatus = updatedItem?.status || currentStatus
      console.log(`[Orchestrate] Scrape complete. New status: ${currentStatus}`)
    }

    // Step 2: Transform (if status is 'scraped')
    if (currentStatus === 'scraped') {
      console.log(`[Orchestrate] Calling transform endpoint for ${queueItemId}`)
      const transformResponse = await fetch(`${baseUrl}/api/generation/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueItemId }),
      })

      if (!transformResponse.ok) {
        const error = await transformResponse.json()
        throw new Error(`Transform failed: ${error.error || 'Unknown error'}`)
      }

      // Re-fetch to get updated status
      const { data: updatedItem } = await supabase
        .from('generation_queue')
        .select('status')
        .eq('id', queueItemId)
        .single()

      currentStatus = updatedItem?.status || currentStatus
      console.log(`[Orchestrate] Transform complete. New status: ${currentStatus}`)
    }

    // Step 3: Schema (if status is 'transformed')
    if (currentStatus === 'transformed') {
      console.log(`[Orchestrate] Calling schema endpoint for ${queueItemId}`)
      const schemaResponse = await fetch(`${baseUrl}/api/generation/schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueItemId }),
      })

      if (!schemaResponse.ok) {
        const error = await schemaResponse.json()
        throw new Error(`Schema generation failed: ${error.error || 'Unknown error'}`)
      }

      // Re-fetch to get updated status
      const { data: updatedItem } = await supabase
        .from('generation_queue')
        .select('status')
        .eq('id', queueItemId)
        .single()

      currentStatus = updatedItem?.status || currentStatus
      console.log(`[Orchestrate] Schema generation complete. New status: ${currentStatus}`)
    }

    // Step 4: Publish (if status is 'schema_generated')
    if (currentStatus === 'schema_generated') {
      console.log(`[Orchestrate] Publishing page for ${queueItemId}`)

      // Fetch the page record created by schema endpoint
      const page = await getPageByQueueItemId(queueItemId)

      if (!page) {
        throw new Error('Page not found after schema generation')
      }

      // Publish page by setting published_at timestamp
      const { error: publishError } = await supabase
        .from('generated_pages')
        .update({ published_at: new Date().toISOString() })
        .eq('id', page.id)

      if (publishError) {
        throw new Error(`Failed to publish page: ${publishError.message}`)
      }

      // Update queue status to 'published'
      await updateQueueStatus(queueItemId, 'published')

      console.log(`[Orchestrate] Page ${page.id} published successfully`)

      // TODO: Trigger Plan 02-06's indexing and notification handler
      // For now, log a placeholder
      console.log(`[Orchestrate] TODO: Trigger indexing and send email notification for page ${page.id}`)

      // Note: Plan 02-06 will implement:
      // - Search indexing (Algolia/Meilisearch)
      // - Email notification to user
      // await fetch(`${baseUrl}/api/generation/notify`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     queueItemId,
      //     status: 'success',
      //     page_id: page.id,
      //     user_id: queueItem.user_id,
      //     published_at: new Date().toISOString()
      //   }),
      // })

      currentStatus = 'published'
    }

    return NextResponse.json({
      success: true,
      status: currentStatus,
      progress: {
        initial: initialStatus,
        final: currentStatus,
      },
    })

  } catch (error: any) {
    console.error('[Orchestrate] Pipeline error:', error)

    // Re-fetch queue item for retry logic
    const { data: queueItem } = await supabase
      .from('generation_queue')
      .select('retry_count, status')
      .eq('id', queueItemId)
      .single()

    const retryCount = (queueItem as any)?.retry_count || 0

    // Update queue with error
    await updateQueueStatus(queueItemId, 'failed', error.message)

    // Retry logic with exponential backoff (max 3 retries)
    if (retryCount < 3) {
      const delay = exponentialBackoff(retryCount)
      console.log(`[Orchestrate] Scheduling retry ${retryCount + 1}/3 with ${delay}ms delay`)

      // Determine which step to retry based on status
      const status = (queueItem as any)?.status || 'pending'
      let retryStep: PipelineStep

      switch (status) {
        case 'pending':
        case 'processing':
          retryStep = PipelineStep.SCRAPE
          break
        case 'scraped':
        case 'transforming':
          retryStep = PipelineStep.TRANSFORM
          break
        case 'transformed':
          retryStep = PipelineStep.SCHEMA
          break
        default:
          retryStep = PipelineStep.SCRAPE
      }

      // Enqueue retry with delay
      await enqueueStep(queueItemId, retryStep, delay)

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          retry: retryCount + 1,
          delay: delay,
        },
        { status: 500 }
      )
    }

    // Max retries exceeded
    console.error(`[Orchestrate] Max retries exceeded for queue item ${queueItemId}`)
    return NextResponse.json(
      {
        success: false,
        error: 'Max retries exceeded',
        finalError: error.message,
      },
      { status: 500 }
    )
  }
}

// Export with QStash signature verification
export const POST = verifySignatureAppRouter(handler)

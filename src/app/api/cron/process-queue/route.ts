import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processQueueItem } from '@/lib/queue/orchestrator'

/**
 * GET /api/cron/process-queue
 *
 * Vercel Cron Job endpoint that runs every 5 minutes to process pending queue items.
 * Fetches up to 5 pending items and enqueues them via QStash for pipeline execution.
 *
 * Security: Requires CRON_SECRET header for authentication (Vercel Cron automatically provides this).
 */
export async function GET(request: NextRequest) {
  // Verify authorization using Vercel Cron secret
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET) {
    console.error('[Cron] CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    )
  }

  if (authHeader !== expectedAuth) {
    console.error('[Cron] Unauthorized cron request')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const supabase = await createClient()

  try {
    // Query pending items from generation_queue
    // Statuses to process: pending, scrape_retry, transform_retry
    const { data: queueItems, error } = await supabase
      .from('generation_queue')
      .select('*')
      .in('status', ['pending', 'scraped', 'transformed', 'schema_generated'])
      .order('priority', { ascending: false })
      .order('queued_at', { ascending: true })
      .limit(5)

    if (error) {
      console.error('[Cron] Error fetching queue items:', error)
      // Return 200 even on error so Vercel doesn't retry
      return NextResponse.json(
        { success: false, error: 'Database error', processed: 0 },
        { status: 200 }
      )
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('[Cron] No pending queue items found')
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No pending items',
      })
    }

    console.log(`[Cron] Processing ${queueItems.length} queue items`)

    // Process each item (enqueue next step via QStash)
    const processedItems = []
    const failedItems = []

    for (const item of queueItems) {
      try {
        await processQueueItem(item.id)
        processedItems.push({
          id: item.id,
          status: item.status,
        })
        console.log(`[Cron] Successfully enqueued item ${item.id} (status: ${item.status})`)
      } catch (error: any) {
        console.error(`[Cron] Failed to process item ${item.id}:`, error)
        failedItems.push({
          id: item.id,
          error: error.message,
        })
      }
    }

    // Always return 200 so Vercel doesn't retry on partial failures
    return NextResponse.json({
      success: true,
      processed: processedItems.length,
      failed: failedItems.length,
      items: processedItems,
      failures: failedItems.length > 0 ? failedItems : undefined,
    })

  } catch (error: any) {
    console.error('[Cron] Unexpected error:', error)
    // Return 200 to prevent Vercel retries on unexpected errors
    return NextResponse.json(
      { success: false, error: error.message, processed: 0 },
      { status: 200 }
    )
  }
}

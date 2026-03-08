import { createClient } from '@/lib/supabase/server'
import { scrapeYouTubeVideo } from '@/lib/agents/scraper'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const RequestSchema = z.object({
  queueItemId: z.string().uuid(),
})

/**
 * POST /api/generation/scrape
 *
 * Scrapes YouTube video metadata and transcript using Apify.
 * Updates queue item with scraped data and sets status to 'scraped'.
 */
export async function POST(request: NextRequest) {
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

  // Check for APIFY_API_TOKEN
  if (!process.env.APIFY_API_TOKEN) {
    console.error('APIFY_API_TOKEN not configured')
    return NextResponse.json(
      { success: false, error: 'Apify API token not configured. Please set APIFY_API_TOKEN.' },
      { status: 500 }
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

    // Verify status is 'pending' or 'processing'
    if (queueItem.status !== 'pending' && queueItem.status !== 'processing') {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status: ${queueItem.status}. Expected 'pending' or 'processing'.`
        },
        { status: 400 }
      )
    }

    // Validate video_url exists
    if (!queueItem.video_url) {
      await (supabase as any)
        .from('generation_queue')
        .update({
          status: 'failed',
          error_message: 'Missing video_url',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', queueItemId)

      return NextResponse.json(
        { success: false, error: 'Queue item missing video_url' },
        { status: 400 }
      )
    }

    // Update status to 'processing'
    await (supabase as any)
      .from('generation_queue')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', queueItemId)

    // Scrape video using Apify
    let scrapedData
    try {
      scrapedData = await scrapeYouTubeVideo(queueItem.video_url)

      console.log(`[Scrape] Video scraped for queue item ${queueItemId}`)
      console.log(`[Scrape] Title: ${scrapedData.title}`)
      console.log(`[Scrape] View count: ${scrapedData.viewCount}`)
      console.log(`[Scrape] Transcript length: ${scrapedData.transcript?.length || 0} chars`)

      // Warn if no transcript available
      if (!scrapedData.transcript) {
        console.warn(`[Scrape] No transcript available for video: ${queueItem.video_url}`)
      }

    } catch (scrapeError: any) {
      console.error('Apify scraping error:', scrapeError)

      // Handle rate limiting
      if (scrapeError.message?.includes('429') || scrapeError.message?.toLowerCase().includes('rate limit')) {
        await (supabase as any)
          .from('generation_queue')
          .update({
            status: 'pending',
            error_message: 'Rate limited - will retry',
            retry_count: (queueItem.retry_count || 0) + 1,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', queueItemId)

        return NextResponse.json(
          { success: false, error: 'Apify rate limit exceeded. Will retry automatically.' },
          {
            status: 429,
            headers: { 'Retry-After': '60' }
          }
        )
      }

      // Invalid URL error
      if (scrapeError.message?.includes('Invalid YouTube URL')) {
        await (supabase as any)
          .from('generation_queue')
          .update({
            status: 'failed',
            error_message: 'Invalid YouTube URL',
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', queueItemId)

        return NextResponse.json(
          { success: false, error: 'Invalid YouTube URL' },
          { status: 400 }
        )
      }

      // Other scraping errors
      await (supabase as any)
        .from('generation_queue')
        .update({
          status: 'failed',
          error_message: `Scraping failed: ${scrapeError.message}`,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', queueItemId)

      return NextResponse.json(
        { success: false, error: 'Failed to scrape video' },
        { status: 500 }
      )
    }

    // Update queue item with scraped data
    const { error: updateError } = await (supabase as any)
      .from('generation_queue')
      .update({
        status: 'scraped',
        scraped_data: scrapedData,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', queueItemId)

    if (updateError) {
      console.error('Error updating queue with scraped data:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to save scraped data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        title: scrapedData.title,
        description: scrapedData.description,
        viewCount: scrapedData.viewCount,
        channelName: scrapedData.channelName,
        publishedDate: scrapedData.publishedDate,
        hasTranscript: !!scrapedData.transcript,
        transcriptLength: scrapedData.transcript?.length || 0,
      },
    })

  } catch (error: any) {
    console.error('Scrape error:', error)

    // Update queue status to failed
    try {
      await (supabase as any)
        .from('generation_queue')
        .update({
          status: 'failed',
          error_message: error.message || 'Unknown error during scraping',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', queueItemId)
    } catch (updateError) {
      console.error('Failed to update error status:', updateError)
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Scraping failed' },
      { status: 500 }
    )
  }
}

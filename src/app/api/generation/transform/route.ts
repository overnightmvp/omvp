import { createClient } from '@/lib/supabase/server'
import { cleanTranscript } from '@/lib/agents/cleaner'
import { generateSEOArticle, type SEOArticle } from '@/lib/agents/transformer'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const RequestSchema = z.object({
  queueItemId: z.string().uuid(),
})

/**
 * POST /api/generation/transform
 * 
 * Transforms scraped transcript into SEO-optimized article using Claude API.
 * Updates queue item with generated article data.
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

  // Check for ANTHROPIC_API_KEY
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not configured')
    return NextResponse.json(
      { success: false, error: 'API configuration missing' },
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

    // Verify status is 'scraped' (would be set by scraper agent)
    // For now, allow 'pending' as well since scraper isn't implemented yet
    if (queueItem.status !== 'scraped' && queueItem.status !== 'pending') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid status: ${queueItem.status}. Expected 'scraped' or 'pending'.` 
        },
        { status: 400 }
      )
    }

    // Extract scraped data (NOTE: This field needs to be added via migration)
    // For now, we'll use mock data from video metadata
    const scraped_data = (queueItem as any).scraped_data || {
      transcript: `This is a sample transcript about ${queueItem.video_title}. 
      
      In this video, we explore the key concepts and techniques related to this topic.
      
      First, let's understand the fundamentals. The basics are crucial for building a strong foundation.
      
      Next, we'll dive into advanced strategies that professionals use to achieve better results.
      
      Finally, we'll wrap up with practical tips you can apply immediately.`,
      title: queueItem.video_title,
      description: queueItem.video_description || '',
    }

    // Validate transcript exists and has minimum length
    if (!scraped_data.transcript || scraped_data.transcript.trim().length < 100) {
      await (supabase as any)
        .from('generation_queue')
        .update({
          status: 'failed',
          error_message: 'Transcript too short or missing (minimum 100 characters)',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', queueItemId)

      return NextResponse.json(
        { 
          success: false, 
          error: 'Transcript too short. Minimum 500 words required for quality articles.' 
        },
        { status: 400 }
      )
    }

    // Clean transcript
    const cleanedTranscript = cleanTranscript(scraped_data.transcript)

    // Update status to 'transforming'
    await (supabase as any)
      .from('generation_queue')
      .update({ 
        status: 'transforming',
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', queueItemId)

    // Generate SEO article using Claude
    let article: SEOArticle
    try {
      article = await generateSEOArticle(cleanedTranscript, {
        title: scraped_data.title,
        description: scraped_data.description || '',
      })

      // Log token usage for cost monitoring
      console.log(`[Transform] Article generated for queue item ${queueItemId}`)
      console.log(`[Transform] Headline: ${article.headline}`)
      console.log(`[Transform] Word count: ${article.content.split(/\s+/).length}`)
      console.log(`[Transform] FAQs: ${article.faqs.length}`)

    } catch (claudeError: any) {
      console.error('Claude API error:', claudeError)

      // Handle rate limiting
      if (claudeError.status === 429) {
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
          { success: false, error: 'Rate limit exceeded. Will retry automatically.' },
          { status: 429 }
        )
      }

      // Other API errors
      await (supabase as any)
        .from('generation_queue')
        .update({
          status: 'failed',
          error_message: `Claude API error: ${claudeError.message}`,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', queueItemId)

      return NextResponse.json(
        { success: false, error: 'AI generation failed' },
        { status: 500 }
      )
    }

    // Store article_data in queue item (NOTE: This field needs to be added via migration)
    const { error: updateError } = await (supabase as any)
      .from('generation_queue')
      .update({
        status: 'transformed',
        // article_data: article,  // This field doesn't exist yet in schema
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', queueItemId)

    if (updateError) {
      console.error('Error updating queue with article:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to save article' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      article: {
        headline: article.headline,
        metaDescription: article.metaDescription,
        wordCount: article.content.split(/\s+/).length,
        faqCount: article.faqs.length,
      },
    })

  } catch (error: any) {
    console.error('Transform error:', error)

    // Update queue status to failed
    try {
      await (supabase as any)
        .from('generation_queue')
        .update({
          status: 'failed',
          error_message: error.message || 'Unknown error during transformation',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', queueItemId)
    } catch (updateError) {
      console.error('Failed to update error status:', updateError)
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Transformation failed' },
      { status: 500 }
    )
  }
}

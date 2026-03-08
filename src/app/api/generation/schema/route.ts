import { createClient } from '@/lib/supabase/server'
import { generateSchemaMarkup, validateSchema, CreatorProfile } from '@/lib/agents/schema-builder'
import { createPage, generateSlug } from '@/lib/db/generated-pages'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SEOArticle } from '@/lib/agents/transformer'

const RequestSchema = z.object({
  queueItemId: z.string().uuid(),
})

/**
 * POST /api/generation/schema
 *
 * Generates JSON-LD schema markup and stores complete page in database.
 * Updates queue item with page_id reference.
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

    // Verify status is 'transformed'
    if (queueItem.status !== 'transformed') {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status: ${queueItem.status}. Expected 'transformed'. Run transform endpoint first.`
        },
        { status: 400 }
      )
    }

    // Extract article data
    const articleData = queueItem.article_data as SEOArticle | null
    if (!articleData) {
      return NextResponse.json(
        { success: false, error: 'Article data not found in queue item' },
        { status: 400 }
      )
    }

    // Fetch user profile data for creator info
    const userId = queueItem.user_id

    // Get user's YouTube connection for social media links
    const { data: youtubeData } = await supabase
      .from('youtube_connections')
      .select('channel_name, channel_url')
      .eq('user_id', userId)
      .single()

    // Get user's quiz responses for niche/brand context
    const { data: quizData } = await supabase
      .from('quiz_responses')
      .select('niche, brand_name')
      .eq('user_id', userId)
      .single()

    // Build creator profile for Person schema
    const creatorProfile: CreatorProfile = {
      name: (quizData as any)?.brand_name || (youtubeData as any)?.channel_name || 'Content Creator',
      subdomain: userId.substring(0, 8), // Use first 8 chars of user_id as subdomain (will be replaced with actual subdomain later)
      socialMedia: {
        youtube: (youtubeData as any)?.channel_url || undefined,
      },
    }

    // Generate schema markup
    const schemaMarkup = generateSchemaMarkup(articleData, creatorProfile)

    // Validate all schemas before storage
    const validationErrors: string[] = []
    if (!validateSchema(schemaMarkup.article)) {
      validationErrors.push('Article schema validation failed')
    }
    if (!validateSchema(schemaMarkup.person)) {
      validationErrors.push('Person schema validation failed')
    }
    if (!validateSchema(schemaMarkup.organization)) {
      validationErrors.push('Organization schema validation failed')
    }
    if (!validateSchema(schemaMarkup.faq)) {
      validationErrors.push('FAQ schema validation failed')
    }

    if (validationErrors.length > 0) {
      console.error('Schema validation errors:', validationErrors)
      return NextResponse.json(
        { success: false, error: 'Schema validation failed', details: validationErrors },
        { status: 500 }
      )
    }

    // Generate slug from headline
    const slug = generateSlug(articleData.headline)

    // Create page record
    let page
    try {
      page = await createPage({
        userId: userId,
        queueItemId: queueItemId,
        videoUrl: queueItem.video_url,
        headline: articleData.headline,
        metaDescription: articleData.metaDescription,
        content: articleData.content,
        faqs: articleData.faqs,
        schemaMarkup: schemaMarkup,
      })

      console.log(`[Schema] Created page ${page.id} with slug: ${page.slug}`)
    } catch (createError: any) {
      console.error('Error creating page:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to create page record' },
        { status: 500 }
      )
    }

    // Update queue item with page_id and status
    const { error: updateError } = await (supabase as any)
      .from('generation_queue')
      .update({
        status: 'schema_generated',
        updated_at: new Date().toISOString(),
      })
      .eq('id', queueItemId)

    if (updateError) {
      console.error('Error updating queue status:', updateError)
      // Page was created successfully, but queue update failed - log warning
      console.warn(`[Schema] Page ${page.id} created but queue update failed`)
    }

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        slug: page.slug,
        headline: page.headline,
        url: `https://authority-platform.com/${creatorProfile.subdomain}/${page.slug}`,
      },
      schemas: {
        article: true,
        person: true,
        organization: true,
        faq: true,
      },
    })

  } catch (error: any) {
    console.error('Schema generation error:', error)

    // Update queue status to failed
    try {
      await (supabase as any)
        .from('generation_queue')
        .update({
          status: 'failed',
          error_message: error.message || 'Unknown error during schema generation',
          updated_at: new Date().toISOString(),
        })
        .eq('id', queueItemId)
    } catch (updateError) {
      console.error('Failed to update error status:', updateError)
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Schema generation failed' },
      { status: 500 }
    )
  }
}

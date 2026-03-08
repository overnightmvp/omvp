import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getQueueItem } from '@/lib/generation-queue'
import { getPageByQueueItemId } from '@/lib/db/generated-pages'
import { requestIndexing } from '@/lib/agents/indexer'

/**
 * POST /api/generation/index
 *
 * Submits a published page URL to Google Search Console for indexing.
 * MVP implementation: Logs submission timestamp (manual indexing required).
 *
 * Request body:
 * {
 *   queueItemId: string
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   indexed?: boolean
 *   error?: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { queueItemId } = body

    if (!queueItemId) {
      return NextResponse.json(
        { success: false, error: 'queueItemId is required' },
        { status: 400 }
      )
    }

    // Fetch queue item
    const queueItem = await getQueueItem(queueItemId)
    if (!queueItem) {
      return NextResponse.json(
        { success: false, error: 'Queue item not found' },
        { status: 404 }
      )
    }

    // Fetch generated page
    const page = await getPageByQueueItemId(queueItemId)
    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Generated page not found' },
        { status: 404 }
      )
    }

    // Ensure page is published
    if (!page.published_at) {
      return NextResponse.json(
        { success: false, error: 'Page is not published yet' },
        { status: 400 }
      )
    }

    // Get creator handle from profiles
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('handle')
      .eq('id', page.user_id)
      .single()

    if (!profile || !profile.handle) {
      return NextResponse.json(
        { success: false, error: 'Creator handle not found' },
        { status: 404 }
      )
    }

    // Build page URL: https://{creator}.{ROOT_DOMAIN}/{slug}
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3001'
    const pageUrl = `https://${profile.handle}.${rootDomain}/${page.slug}`

    // Submit for indexing (MVP: logs submission)
    const indexed = await requestIndexing(pageUrl)

    // Update generated_pages with indexed_at timestamp
    if (indexed) {
      await supabase
        .from('generated_pages')
        .update({ indexed_at: new Date().toISOString() } as any)
        .eq('id', page.id)
    }

    return NextResponse.json({
      success: true,
      indexed,
      pageUrl,
    })
  } catch (error: any) {
    console.error('Error submitting page for indexing:', error)

    // Don't fail - indexing is best-effort
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to submit for indexing',
    })
  }
}

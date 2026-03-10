import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getQueueItem } from '@/lib/generation-queue'
import { getPageByQueueItemId } from '@/lib/db/generated-pages'
import { sendPageReadyEmail, sendPageFailedEmail } from '@/lib/agents/notifier'

/**
 * POST /api/generation/notify
 *
 * Sends email notification to user when page generation completes or fails.
 *
 * Request body:
 * {
 *   queueItemId: string
 *   status: 'success' | 'failed'
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   emailSent?: boolean
 *   error?: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { queueItemId, status } = body

    if (!queueItemId || !status) {
      return NextResponse.json(
        { success: false, error: 'queueItemId and status are required' },
        { status: 400 }
      )
    }

    if (!['success', 'failed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'status must be "success" or "failed"' },
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

    // Get user email from auth.users via Supabase
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.admin.getUserById(
      queueItem.user_id
    )

    if (!userData?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'User email not found' },
        { status: 404 }
      )
    }

    const userEmail = userData.user.email

    if (status === 'success') {
      // Fetch generated page
      const page = await getPageByQueueItemId(queueItemId)
      if (!page) {
        return NextResponse.json(
          { success: false, error: 'Generated page not found' },
          { status: 404 }
        )
      }

      // Get creator handle
      const { data: profile } = await supabase
        .from('profiles')
        .select('handle')
        .eq('id', page.user_id)
        .single() as any

      if (!profile || !(profile as any).handle) {
        return NextResponse.json(
          { success: false, error: 'Creator handle not found' },
          { status: 404 }
        )
      }

      // Build page URL
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3001'
      const pageUrl = `https://${(profile as any).handle}.${rootDomain}/${page.slug}`

      // Send success email
      const result = await sendPageReadyEmail(userEmail, {
        url: pageUrl,
        headline: page.headline,
        slug: page.slug,
      })

      return NextResponse.json({
        success: result.success,
        emailSent: result.success,
        error: result.error,
      })
    } else {
      // status === 'failed'
      const errorMessage =
        (queueItem as any).error_message || 'Unknown error occurred'

      // Send failure email
      const result = await sendPageFailedEmail(userEmail, errorMessage)

      return NextResponse.json({
        success: result.success,
        emailSent: result.success,
        error: result.error,
      })
    }
  } catch (error: any) {
    console.error('Error sending notification email:', error)

    // Don't fail - email notification is best-effort
    // Return 200 anyway to not block pipeline
    return NextResponse.json({
      success: false,
      emailSent: false,
      error: error.message || 'Failed to send notification',
    })
  }
}

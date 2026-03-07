import { createClient } from '@/lib/supabase/server'
import { getMostPopularVideo } from '@/lib/youtube-api'
import { queuePageGeneration } from '@/lib/generation-queue'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get YouTube connection
    const { data: connection, error: connectionError } = await supabase
      .from('youtube_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'YouTube not connected' },
        { status: 400 }
      )
    }

    // Check if user already has a pending/processing generation
    const { data: existingQueue } = await supabase
      .from('generation_queue')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])
      .maybeSingle()

    if (existingQueue) {
      return NextResponse.json(
        {
          error: 'You already have a page in the generation queue',
          queueItem: existingQueue,
        },
        { status: 400 }
      )
    }

    // Fetch most popular video from YouTube
    const video = await getMostPopularVideo(
      (connection as any).access_token,
      (connection as any).refresh_token,
      (connection as any).channel_id
    )

    // Queue generation job with high priority (free page = priority 10)
    const queueItem = await queuePageGeneration(
      user.id,
      video.videoId,
      video.title,
      video.url,
      video.description,
      10 // High priority for free page
    )

    if (!queueItem) {
      throw new Error('Failed to queue page generation')
    }

    // TODO Phase 2: Trigger background processing
    // For now, just queue the item

    return NextResponse.json({
      success: true,
      queueItem,
      message: 'Page generation queued! You will receive an email when ready.',
    })
  } catch (error: any) {
    console.error('Error queuing page generation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to queue page generation' },
      { status: 500 }
    )
  }
}
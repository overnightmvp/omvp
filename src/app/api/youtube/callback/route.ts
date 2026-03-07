import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens, getChannelInfo } from '@/lib/youtube-oauth'
import { getMostPopularVideo } from '@/lib/youtube-api'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const supabase = await createClient()

  // Handle user denial or error
  if (error) {
    console.error('YouTube OAuth error:', error)
    return NextResponse.redirect(
      new URL(
        `/youtube-connect?error=${encodeURIComponent(
          error === 'access_denied'
            ? 'You denied access to your YouTube channel'
            : 'OAuth authorization failed'
        )}`,
        request.url
      )
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        '/youtube-connect?error=Missing authorization code or state',
        request.url
      )
    )
  }

  try {
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify state token (CSRF protection)
    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('user_id', user.id)
      .eq('state', state)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (stateError || !stateRecord) {
      console.error('Invalid or expired state token:', stateError)
      return NextResponse.redirect(
        new URL(
          '/youtube-connect?error=Invalid or expired authorization request',
          request.url
        )
      )
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to obtain access tokens')
    }

    // Get channel information
    const channelInfo = await getChannelInfo(
      tokens.access_token,
      tokens.refresh_token
    )

    // Store YouTube connection in database
    const { error: insertError } = await supabase
      .from('youtube_connections')
      .upsert({
        user_id: user.id,
        channel_id: channelInfo.channelId,
        channel_name: channelInfo.channelName,
        channel_url: channelInfo.channelUrl,
        channel_subscriber_count: channelInfo.subscriberCount,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(tokens.expiry_date || Date.now() + 3600000).toISOString(),
        connected_at: new Date().toISOString(),
      } as any)

    if (insertError) throw insertError

    // Clean up state record
    await supabase.from('oauth_states').delete().eq('id', (stateRecord as any).id)

    // CRITICAL: Automatically queue free page generation
    console.log('[YouTube OAuth] Connection successful, triggering queue generation')

    try {
      // First, get the most popular video to queue for generation
      const mostPopularVideo = await getMostPopularVideo(
        tokens.access_token,
        tokens.refresh_token,
        channelInfo.channelId
      )

      // Create queue entry
      const { data: queueItem, error: queueError } = await supabase
        .from('generation_queue')
        .insert({
          user_id: user.id,
          video_id: mostPopularVideo.videoId,
          video_title: mostPopularVideo.title,
          video_url: mostPopularVideo.url,
          status: 'pending',
        } as any)
        .select()
        .single()

      if (queueError) throw queueError

      console.log('[YouTube OAuth] Queue generation triggered:', {
        queueItemId: (queueItem as any)?.id,
        videoTitle: (queueItem as any)?.video_title,
      })

      // Redirect to generating page
      return NextResponse.redirect(
        new URL('/generating', request.url)
      )
    } catch (queueError) {
      console.error('[YouTube OAuth] CRITICAL: Failed to auto-queue generation:', queueError)
      // Fallback: redirect to dashboard
      console.log('[YouTube OAuth] Falling back to dashboard redirect')
      return NextResponse.redirect(
        new URL('/dashboard?youtube_connected=true', request.url)
      )
    }
  } catch (error: any) {
    console.error('YouTube OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(
        `/youtube-connect?error=${encodeURIComponent(
          error.message || 'Failed to connect YouTube channel'
        )}`,
        request.url
      )
    )
  }
}

import { YouTubeConnectFlow } from '@/components/youtube/YouTubeConnectFlow'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connect YouTube | Authority Platform',
  description: 'Connect your YouTube channel to get your free SEO page',
}

export default async function YouTubeConnectPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Check if YouTube already connected
  const { data: connection } = await supabase
    .from('youtube_connections')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Redirect to dashboard if already connected
  if (connection) {
    redirect('/dashboard?youtube_already_connected=true')
  }

  return <YouTubeConnectFlow />
}
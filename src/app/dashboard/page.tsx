import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/auth/LogoutButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check YouTube connection
  const { data: youtubeConnection } = await supabase
    .from('youtube_connections')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>

        {/* YouTube Connection Status */}
        {youtubeConnection ? (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  YouTube Connected ✓
                </h2>
                <p className="text-txt-mid">
                  Channel: {youtubeConnection.channel_name}
                </p>
                <p className="text-txt-faint text-sm">
                  {youtubeConnection.channel_subscriber_count?.toLocaleString()}{' '}
                  subscribers
                </p>
              </div>
              <a
                href={youtubeConnection.channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                View Channel →
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-accent2/10 border border-accent2/20 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">
              YouTube Not Connected
            </h2>
            <p className="text-txt-mid mb-4">
              Connect your YouTube channel to generate your free SEO page
            </p>
            <Link
              href="/youtube-connect"
              className="inline-block bg-accent text-bg font-medium px-6 py-3 rounded-lg hover:bg-accent/90 transition-smooth"
            >
              Connect YouTube
            </Link>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Info</h2>
          <p className="text-txt-mid mb-2">Email: {user.email}</p>
          <p className="text-txt-mid">User ID: {user.id}</p>
        </div>
      </div>
    </div>
  )
}

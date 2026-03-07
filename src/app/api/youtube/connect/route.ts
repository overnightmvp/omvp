import { createClient } from '@/lib/supabase/server'
import { generateAuthUrl } from '@/lib/youtube-oauth'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function GET() {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Generate CSRF protection state token
    const state = randomUUID()

    // Store state in database (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    const { error: stateError } = await supabase.from('oauth_states').insert({
      user_id: user.id,
      state,
      expires_at: expiresAt.toISOString(),
    } as any)

    if (stateError) throw stateError

    // Generate Google OAuth URL
    const authUrl = generateAuthUrl(state)

    return NextResponse.json({ url: authUrl })
  } catch (error: any) {
    console.error('Error generating YouTube auth URL:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}

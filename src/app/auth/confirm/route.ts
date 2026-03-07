import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as
    | 'email'
    | 'recovery'
    | 'signup'
    | 'magiclink'
    | null
  const next = searchParams.get('next') || '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Redirect to the appropriate page based on type
      if (type === 'recovery') {
        return NextResponse.redirect(
          new URL('/auth/reset-password', request.url)
        )
      }
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return to login with error
  return NextResponse.redirect(
    new URL('/login?error=verification_failed', request.url)
  )
}

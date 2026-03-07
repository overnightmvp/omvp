# Phase 1: Onboarding Foundation - Research

**Phase:** 01-onboarding-foundation
**Research Date:** 2026-03-06
**Status:** Complete

---

## Overview

This research document addresses the technical approaches needed to plan and implement Phase 1 of the Authority Infrastructure Platform. Phase 1 focuses on migrating the existing quiz, implementing authentication, and enabling YouTube OAuth integration.

**Phase Requirements Coverage:**
- ONBOARD-01 to ONBOARD-09 (quiz, scoring, YouTube OAuth, free page)
- AUTH-01 to AUTH-06 (email/password auth, session, YouTube OAuth storage)

---

## 1. Next.js + Supabase Integration

### Architecture Pattern (2026)

Use the **@supabase/ssr package** for Server-Side Auth, which provides cookie-based session management optimized for Next.js App Router.

**Key Components:**
- **Client-side client** (`lib/supabase/client.ts`) - For Client Components (browser)
- **Server-side client** (`lib/supabase/server.ts`) - For Server Components, Server Actions, Route Handlers
- **Middleware** (`middleware.ts`) - Token refresh and cookie management

### Client Setup Pattern

```typescript
// lib/supabase/client.ts - Client Component access
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// lib/supabase/server.ts - Server Component access
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### Middleware Implementation

**CRITICAL SECURITY BEST PRACTICE:**
- Always use `supabase.auth.getClaims()` to protect pages and user data
- NEVER trust `supabase.auth.getSession()` inside server code (can be spoofed)
- `getClaims()` validates JWT signature against published public keys every time

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session and validate JWT
  const { data: { user } } = await supabase.auth.getClaims()

  // Protect authenticated routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
```

### API Route Pattern for Auth Operations

```typescript
// app/api/auth/signup/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
```

**Sources:**
- [Use Supabase Auth with Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Setting up Server-Side Auth for Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js + Supabase Cookie-Based Auth Workflow: The Best Auth Solution (2025 Guide)](https://the-shubham.medium.com/next-js-supabase-cookie-based-auth-workflow-the-best-auth-solution-2025-guide-f6738b4673c1)

---

## 2. Quiz Implementation

### Migration Strategy: Vanilla JS → React Components

**Decision: Pure React components with Framer Motion** (per CONTEXT.md)

The existing `authority-onboarding-funnel.html` has:
- 9 quiz steps with card/chip selection patterns
- Authority score calculation algorithm (0-100)
- Dark minimal design (#0A0A0A bg, #E8FF47 accent, Geist fonts)
- Smooth animations (`cubic-bezier(.22,1,.36,1)`)

### Component Architecture

```
/src/app/quiz/
  page.tsx                    # Main quiz route
  components/
    QuizContainer.tsx         # State management wrapper
    QuizProgress.tsx          # Progress bar
    QuizStep.tsx              # Individual step wrapper
    steps/
      Step0Intro.tsx
      Step1Identity.tsx
      Step2Platform.tsx
      ...
      Step9Readiness.tsx
      StepResult.tsx
    ui/
      ChipOption.tsx          # Single/multi-select chips
      CardOption.tsx          # Card selection
      ScaleOption.tsx         # 1-5 scale selection
      AntiCard.tsx            # Anti-vision cards
```

### State Management Pattern

**Before Signup:** localStorage persistence
**After Signup:** Sync to Supabase `quiz_responses` table

```typescript
// hooks/useQuizState.ts
import { useState, useEffect } from 'react'

interface QuizState {
  name: string
  handle: string
  primaryPlatform: string
  // ... all quiz fields
}

export function useQuizState() {
  const [state, setState] = useState<QuizState>(() => {
    // Lazy initialization from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quiz_state')
      return saved ? JSON.parse(saved) : initialState
    }
    return initialState
  })

  // Auto-save to localStorage on state change
  useEffect(() => {
    localStorage.setItem('quiz_state', JSON.stringify(state))
  }, [state])

  return [state, setState] as const
}
```

**Data Validation:**
Use Zod schema to validate localStorage data (data coming from localStorage is untrusted and can crash the app if malformed).

```typescript
import { z } from 'zod'

const QuizStateSchema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  primaryPlatform: z.enum(['instagram', 'youtube', 'tiktok', 'linkedin', 'twitter', 'podcast']),
  // ... other fields
})

// Validate before using
const saved = localStorage.getItem('quiz_state')
const parsed = saved ? QuizStateSchema.safeParse(JSON.parse(saved)) : null
const validState = parsed?.success ? parsed.data : initialState
```

### Animation Library Choice: Framer Motion

**Why Framer Motion (now Motion) over CSS:**
- **Declarative API** - Natural fit for React, describe end state and Motion handles interpolation
- **Built-in gesture support** - drag, hover, tap animations without extra JS
- **Layout animations** - Animates DOM structure changes automatically
- **Performance** - Uses same high-performance browser animations as CSS (120fps capable)
- **Developer experience** - 18M+ monthly downloads, excellent TypeScript support

**Example Implementation:**

```typescript
import { motion, AnimatePresence } from 'framer-motion'

export function QuizStep({ step, children, isActive }: QuizStepProps) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1] // matches existing cubic-bezier
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**CSS Animations for Simple Cases:**
Use CSS transitions for hover states, color changes, and other simple self-contained effects. Reserve Motion for complex state-based animations and page transitions.

**Sources:**
- [Comparing the best React animation libraries for 2026 - LogRocket Blog](https://blog.logrocket.com/best-react-animation-libraries/)
- [Motion — JavaScript & React animation library](https://motion.dev)
- [Do you still need Framer Motion? - Motion Magazine](https://motion.dev/blog/do-you-still-need-framer-motion)
- [Using localStorage with React Hooks - LogRocket Blog](https://blog.logrocket.com/using-localstorage-react-hooks/)

### Authority Score Calculation

**Location: Client-side only** (per CONTEXT.md)

```typescript
// lib/calculateAuthorityScore.ts
export function calculateAuthorityScore(state: QuizState): number {
  let score = 20 // base

  // Google presence (max +20)
  if (state.google === 'page1') score += 20
  if (state.google === 'exists') score += 10
  if (state.google === 'dontknow') score += 2

  // AI visibility (max +18)
  if (state.ai === 'mentioned') score += 18
  if (state.ai === 'others') score += 6
  if (state.ai === 'untested') score += 2

  // Website (max +18)
  if (state.website === 'yes_good') score += 18
  if (state.website === 'yes_basic') score += 8

  // Clear niche (max +12)
  if (state.niche.length > 10) score += 8
  if (state.nicheCategory) score += 4

  // Offers clarity (max +8)
  if (state.offers.length > 0 && !state.offers.includes('undecided')) score += 8
  if (state.offers.includes('undecided')) score -= 4

  // Cross-platform presence (max +4)
  if (state.secondaryChannels.length >= 2) score += 4

  // Anti-vision clarity (max +4)
  if (state.antiVision.length >= 2) score += 4

  return Math.min(100, Math.max(5, score))
}
```

---

## 3. YouTube OAuth Flow

### Server-Side OAuth Implementation (Next.js API Routes)

**OAuth 2.0 Pattern for Web Server Applications:**

```typescript
// app/api/youtube/connect/route.ts
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/youtube/callback`
)

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getClaims()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Generate OAuth URL with state for CSRF protection
  const state = crypto.randomUUID()

  // Store state in session (Supabase table or encrypted cookie)
  await supabase.from('oauth_states').insert({
    user_id: user.id,
    state,
    expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 min
  })

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ],
    state,
    prompt: 'consent' // Force consent screen to get refresh token
  })

  return NextResponse.json({ url: authUrl })
}

// app/api/youtube/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    // User denied access or error occurred
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?youtube_error=${error}`
    )
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getClaims()

  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`)
  }

  // Verify state to prevent CSRF
  const { data: stateRecord } = await supabase
    .from('oauth_states')
    .select()
    .eq('user_id', user.id)
    .eq('state', state)
    .single()

  if (!stateRecord) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?youtube_error=invalid_state`
    )
  }

  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code!)
  oauth2Client.setCredentials(tokens)

  // Fetch channel info
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })
  const { data: channelData } = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    mine: true
  })

  const channel = channelData.items?.[0]

  if (channel) {
    // Store in youtube_connections table
    await supabase.from('youtube_connections').upsert({
      user_id: user.id,
      channel_id: channel.id,
      channel_name: channel.snippet.title,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expiry_date!)
    })

    // Clean up state record
    await supabase.from('oauth_states').delete().eq('id', stateRecord.id)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?youtube_connected=true`
    )
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?youtube_error=no_channel`
  )
}
```

### Required OAuth Scopes for Read-Only Access

**Recommended scope:** `https://www.googleapis.com/auth/youtube.readonly`
- Read-only access to channel metadata
- Access to video list
- Non-invasive, easier Google verification process

**Alternative (if needed):** `https://www.googleapis.com/auth/youtube.force-ssl`
- Full access via SSL
- Required for accessing certain API endpoints
- May require additional OAuth verification from Google

### Error Handling Pattern

```typescript
// components/YouTubeConnect.tsx
export function YouTubeConnect() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/youtube/connect')
      const { url, error } = await res.json()

      if (error) throw new Error(error)

      // Redirect to Google OAuth consent screen
      window.location.href = url
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleConnect} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect YouTube Channel'}
      </button>

      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={handleConnect}>Try Again</button>
          <button onClick={() => router.push('/dashboard')}>
            Skip for Now
          </button>
        </div>
      )}
    </div>
  )
}
```

### Testing Strategy

**Development:**
- Use Google OAuth test mode (doesn't require app verification)
- Test with personal YouTube channel
- Verify token refresh mechanism works

**Production:**
- Submit app for OAuth verification if using sensitive scopes
- Implement proper error logging (Sentry or similar)
- Monitor failed OAuth attempts in dashboard

**Sources:**
- [Using OAuth 2.0 for Web Server Applications | YouTube Data API](https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps)
- [OAuth | NextAuth.js](https://next-auth.js.org/configuration/providers/oauth)
- [YouTube API Guide 2026: Data API v3 Setup, Quotas & Code](https://getlate.dev/blog/youtube-api)

---

## 4. Database Schema

### Schema Design

```sql
-- Enable Row Level Security (CRITICAL)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_connections ENABLE ROW LEVEL SECURITY;

-- users table (managed by Supabase Auth, extend with custom fields)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  handle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- quiz_responses table
CREATE TABLE public.quiz_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Step 1: Identity
  name TEXT NOT NULL,
  handle TEXT,

  -- Step 2-3: Platforms
  primary_platform TEXT NOT NULL,
  secondary_channels TEXT[] DEFAULT '{}',

  -- Step 4: Niche
  niche TEXT NOT NULL,
  niche_category TEXT,

  -- Step 5: Offers
  offers TEXT[] DEFAULT '{}',

  -- Step 6: Current Presence
  google_presence TEXT,
  ai_presence TEXT,
  website_status TEXT,

  -- Step 7: Brand Direction
  brand_tones TEXT[] DEFAULT '{}',

  -- Step 8: Anti-Vision
  anti_vision TEXT[] DEFAULT '{}',
  anti_custom TEXT,

  -- Step 9: Readiness
  blocker TEXT,
  timeline TEXT,
  context TEXT,

  -- Calculated
  authority_score INTEGER NOT NULL CHECK (authority_score >= 0 AND authority_score <= 100),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id) -- One quiz response per user
);

-- youtube_connections table
CREATE TABLE public.youtube_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_url TEXT,

  access_token TEXT NOT NULL, -- Encrypted in production
  refresh_token TEXT NOT NULL, -- Encrypted in production
  expires_at TIMESTAMPTZ NOT NULL,

  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id) -- One YouTube connection per user
);

-- oauth_states table (for CSRF protection)
CREATE TABLE public.oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quiz_responses_user_id ON quiz_responses(user_id);
CREATE INDEX idx_youtube_connections_user_id ON youtube_connections(user_id);
CREATE INDEX idx_oauth_states_user_id ON oauth_states(user_id);
CREATE INDEX idx_oauth_states_state ON oauth_states(state);
CREATE INDEX idx_oauth_states_expires_at ON oauth_states(expires_at);
```

### Row-Level Security (RLS) Policies

**CRITICAL SECURITY REQUIREMENTS:**
1. **Always enable RLS** - Tables without RLS are publicly accessible via Supabase API
2. **Create policies after enabling RLS** - RLS with no policies = no one can access data
3. **Separate policies** - Don't use `FOR ALL`, create separate SELECT, INSERT, UPDATE, DELETE policies
4. **Index policy columns** - Always index columns referenced in RLS policies (performance)
5. **Test from client SDK** - SQL Editor bypasses RLS, always test via JavaScript client

```sql
-- Profiles policies (users can only access their own profile)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Quiz responses policies
CREATE POLICY "Users can view own quiz responses"
  ON public.quiz_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz responses"
  ON public.quiz_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz responses"
  ON public.quiz_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- YouTube connections policies
CREATE POLICY "Users can view own YouTube connection"
  ON public.youtube_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own YouTube connection"
  ON public.youtube_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own YouTube connection"
  ON public.youtube_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own YouTube connection"
  ON public.youtube_connections FOR DELETE
  USING (auth.uid() = user_id);

-- OAuth states policies
CREATE POLICY "Users can view own OAuth states"
  ON public.oauth_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own OAuth states"
  ON public.oauth_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own OAuth states"
  ON public.oauth_states FOR DELETE
  USING (auth.uid() = user_id);
```

**Security Warnings:**
- **NEVER use `service_role` key in client code** - It bypasses RLS and grants full database access
- **Avoid user_metadata in RLS policies** - This claim can be modified by authenticated users
- **Keep policies simple** - Complex policies with multiple joins slow down queries

**Sources:**
- [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Row Level Security (RLS): Complete Guide (2026)](https://designrevision.com/blog/supabase-row-level-security)
- [Best Practices for Supabase | Security, Scaling & Maintainability](https://www.leanware.co/insights/supabase-best-practices)

### Type Generation

**Command:**
```bash
npx supabase gen types typescript --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" --schema public > types/database.types.ts
```

**Integration with supabase-js:**
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Now fully type-safe
const { data, error } = await supabase
  .from('quiz_responses')
  .select('*')
  .single()

// data is typed as Database['public']['Tables']['quiz_responses']['Row']
```

**Automation:**
Set up GitHub Action to regenerate types on schema changes:

```yaml
# .github/workflows/update-types.yml
name: Update database types
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npx supabase gen types typescript --db-url "${{ secrets.DATABASE_URL }}" --schema public > types/database.types.ts
      - uses: peter-evans/create-pull-request@v5
        with:
          commit-message: Update database types
          title: Update database types
          body: Automated database type update
```

**Sources:**
- [Generating TypeScript Types | Supabase Docs](https://supabase.com/docs/guides/api/rest/generating-types)
- [Generate types using GitHub Actions | Supabase Docs](https://supabase.com/docs/guides/deployment/ci/generating-types)
- [Using TypeScript with Supabase: A Practical Guide to Type Safety](https://supalaunch.com/blog/supabase-typescript-guide)

### Migrations vs Manual Setup

**Recommended: Use migrations for production**

```bash
# Initialize Supabase locally
npx supabase init

# Create migration
npx supabase migration new create_schema

# Edit migration file in supabase/migrations/
# Run locally
npx supabase db reset

# Apply to production
npx supabase db push
```

**For Phase 1:** Manual setup via Supabase Dashboard is acceptable (speed over infrastructure perfection). Switch to migrations in Phase 2.

---

## 5. Email Verification & Password Reset

### Supabase Auth Email Templates

**Built-in Templates Available:**
1. **Confirm Signup** - Email verification after signup
2. **Reset Password** - Password reset flow
3. **Magic Link** - Passwordless login
4. **Change Email Address** - Email change confirmation
5. **Invite User** - Team invitations

**Customization Location:**
- Hosted Supabase: Dashboard → Authentication → Email Templates
- Self-hosted: Configuration files or Management API

### Email Template Variables

Available variables in templates:
- `{{ .SiteURL }}` - Your site URL (from Supabase settings)
- `{{ .TokenHash }}` - Hashed token (required for PKCE auth)
- `{{ .RedirectTo }}` - Redirect URL after action
- `{{ .Token }}` - Plain token (deprecated, use TokenHash)

### Custom Template Example

**Email Verification Template:**
```html
<h2>Confirm your email</h2>
<p>Follow this link to confirm your account:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">
    Confirm your email
  </a>
</p>
```

**Password Reset Template:**
```html
<h2>Reset your password</h2>
<p>Follow this link to reset your password:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}">
    Reset Password
  </a>
</p>
```

### Auth Callback Route Handler

```typescript
// app/auth/confirm/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'recovery' | 'signup' | 'magiclink'
  const next = searchParams.get('next') || '/dashboard'

  if (token_hash && type) {
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return error page
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
```

### Email Delivery Configuration

**Supabase Built-in SMTP (Default):**
- Works out of the box
- Limited to 3 emails/hour per user (free tier)
- Sent from `noreply@[your-project-ref].supabase.co`

**Custom SMTP (Production):**
Configure in Dashboard → Project Settings → Auth → SMTP Settings
- Use SendGrid, Resend, AWS SES, etc.
- Higher sending limits
- Custom sender domain

**For Phase 1:** Use Supabase built-in SMTP (sufficient for beta testing)

### Password Reset Flow

**Client-side trigger:**
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`,
})
```

**Reset password page:**
```typescript
// app/auth/reset-password/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Password updated successfully!')
      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleReset}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}
```

### Testing Email Flows in Development

**Option 1: Supabase Inbucket**
- Local email testing server
- Accessible at `http://localhost:54324` when running `supabase start`
- Captures all emails sent during local development

**Option 2: Use real email**
- Test with your own email address
- Verify templates render correctly
- Check links work across different browsers

**Sources:**
- [Email Templates | Supabase Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Customizing email templates | Supabase Docs](https://supabase.com/docs/guides/local-development/customizing-email-templates)
- [Password-based Auth | Supabase Docs](https://supabase.com/docs/guides/auth/passwords)

---

## 6. Session Management

### How Supabase Auth Handles Sessions

**Storage Mechanism:**
- Supabase uses **httpOnly cookies** for session storage (via @supabase/ssr)
- Access token + refresh token stored in cookies
- Browser automatically sends cookies with requests

**Session Lifecycle:**
1. User signs in → access token + refresh token created
2. Access token expires (1 hour by default)
3. Middleware automatically refreshes token using refresh token
4. Refresh token rotates on each refresh (security)
5. Refresh token expires after session duration (default: 7 days)

### Token Refresh Pattern

**Automatic refresh via middleware:**
```typescript
// middleware.ts automatically refreshes tokens
const { data: { user } } = await supabase.auth.getClaims()
// This validates JWT and refreshes if needed
```

**Manual refresh (if needed):**
```typescript
const { data, error } = await supabase.auth.refreshSession()
```

### Session Duration Configuration

**Set in Supabase Dashboard:**
Authentication → Settings → Session Duration

**For Phase 1: 30 days** (per CONTEXT.md decision)
- Balance between convenience and security
- Users stay logged in for a month unless they logout
- No "Remember Me" checkbox needed (consistent behavior)

### Client-Side Session Checks

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

### Logout and Token Cleanup

```typescript
// components/LogoutButton.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh() // Clear Next.js cache
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

**What happens on logout:**
1. Access token invalidated on server
2. Refresh token invalidated
3. Cookies cleared from browser
4. User redirected to login page

### Protected Route Pattern

```typescript
// components/ProtectedRoute.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

**Sources:**
- [Creating a Supabase client for SSR | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js Authentication: Complete Guide with Auth.js & Supabase](https://vladimirsiedykh.com/blog/nextjs-authentication-complete-guide-authjs-supabase)

---

## 7. Free Page Generation Trigger

### Architecture Decision

**Phase 1 Scope:** Queue generation job only (processing happens in Phase 2)

**Flow:**
1. User completes quiz → signup → connects YouTube → redirected to dashboard
2. System automatically identifies most popular video
3. Job queued in `generation_queue` table
4. User sees "Generating your page..." status in dashboard
5. Phase 2 will process the queue via background workers

### Database Table

```sql
CREATE TABLE public.generation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_url TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'published', 'failed')),

  priority INTEGER DEFAULT 0, -- Higher = more urgent
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for queue processing
CREATE INDEX idx_generation_queue_status ON generation_queue(status, priority DESC, queued_at ASC);
CREATE INDEX idx_generation_queue_user_id ON generation_queue(user_id);

-- RLS policies
ALTER TABLE generation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue items"
  ON public.generation_queue FOR SELECT
  USING (auth.uid() = user_id);
```

### API Route to Queue Generation

```typescript
// app/api/generate/queue/route.ts
import { createClient } from '@/lib/supabase/server'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getClaims()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get YouTube connection
  const { data: connection } = await supabase
    .from('youtube_connections')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!connection) {
    return NextResponse.json(
      { error: 'YouTube not connected' },
      { status: 400 }
    )
  }

  // Fetch most popular video
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({
    access_token: connection.access_token,
    refresh_token: connection.refresh_token,
  })

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

  const { data: videosData } = await youtube.search.list({
    part: ['snippet'],
    channelId: connection.channel_id,
    order: 'viewCount',
    maxResults: 1,
    type: ['video']
  })

  const video = videosData.items?.[0]

  if (!video) {
    return NextResponse.json(
      { error: 'No videos found on channel' },
      { status: 400 }
    )
  }

  // Queue generation job
  const { data: queueItem, error } = await supabase
    .from('generation_queue')
    .insert({
      user_id: user.id,
      video_id: video.id.videoId,
      video_title: video.snippet.title,
      video_url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      status: 'pending',
      priority: 10 // High priority for free page
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // TODO Phase 2: Trigger background processing

  return NextResponse.json({
    success: true,
    queueItem,
    message: 'Page generation queued. You will receive an email when ready.'
  })
}
```

### Background Job Architecture (Phase 2 Implementation)

**Recommended Approach: Supabase Queue + Vercel Cron**

**Pattern:**
1. **Supabase pgmq** (PostgreSQL Message Queue) - Queue storage
2. **Vercel Cron Jobs** - Trigger processing every 5 minutes
3. **Next.js API Route** - Worker that processes queue items

```typescript
// app/api/cron/process-queue/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Verify cron secret (security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch pending items from queue
  const { data: items } = await supabase
    .from('generation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('queued_at', { ascending: true })
    .limit(5) // Process 5 at a time

  // Process each item (Phase 2 implementation)
  for (const item of items || []) {
    try {
      await processGenerationJob(item)
    } catch (error) {
      console.error(`Failed to process job ${item.id}:`, error)
    }
  }

  return NextResponse.json({ processed: items?.length || 0 })
}
```

**Vercel Cron Configuration:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-queue",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Alternative: Supabase Edge Functions with pg_cron**

```sql
-- Schedule queue processing every 5 minutes
SELECT cron.schedule(
  'process-generation-queue',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://[project-ref].supabase.co/functions/v1/process-queue',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.anon_key'))
  )
  $$
);
```

**Recommendation for Phase 1:**
- Set up queue table + API route to add jobs
- Defer actual processing to Phase 2
- Show "queued" status in dashboard

**Sources:**
- [Build Queue Worker using Supabase Cron, Queue and Edge Function](https://dev.to/suciptoid/build-queue-worker-using-supabase-cron-queue-and-edge-function-19di)
- [Background Jobs for Node.js using Next.js, Inngest, Supabase, and Vercel](https://medium.com/@cyri113/background-jobs-for-node-js-using-next-js-inngest-supabase-and-vercel-e5148d094e3f)
- [Payload Jobs Queue on Vercel: Complete Production Setup](https://www.buildwithmatija.com/blog/payload-jobs-queue-vercel-complete-production-setup-2026)

### Email Notification Architecture

**Simple approach for Phase 1:**

```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPageReadyEmail(
  to: string,
  pageUrl: string,
  pageTitle: string
) {
  await resend.emails.send({
    from: 'Authority Platform <noreply@yourdomain.com>',
    to,
    subject: 'Your SEO page is ready!',
    html: `
      <h2>Your page is live</h2>
      <p>We've generated your SEO page from "${pageTitle}".</p>
      <p><a href="${pageUrl}">View your page</a></p>
    `
  })
}
```

**Call after successful generation (Phase 2):**
```typescript
await sendPageReadyEmail(
  user.email,
  `https://${user.handle}.platform.com/${slug}`,
  videoTitle
)
```

**Email service options:**
- **Resend** - Modern, developer-friendly, generous free tier
- **SendGrid** - Established, 100 emails/day free
- **AWS SES** - Cheap at scale, complex setup

**Recommendation:** Use Resend for Phase 1 (simple API, React Email support for templates)

---

## Design System Migration Notes

### Existing Design System (Astro site)

**Current (`design-system.css`):**
- Colors: `--color-primary: #FF6B35`, `--bg-primary: #121212`
- Fonts: Reddit Sans (headings), Inter (body), SF Mono (code)
- Orange/teal accent colors

**Quiz HTML (`authority-onboarding-funnel.html`):**
- Colors: `--bg: #0A0A0A`, `--accent: #E8FF47` (yellow)
- Fonts: Geist (sans), Instrument Serif (display), Geist Mono (code)
- Dark minimal aesthetic

### Target Design System (Next.js App)

**Decision: Use quiz design system** (per CONTEXT.md)
- Preserve dark minimal, Geist fonts, #E8FF47 accent
- Extract CSS custom properties to Tailwind config or CSS modules
- Maintain existing animation easing: `cubic-bezier(.22,1,.36,1)`

**Tailwind Configuration:**
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        surface: '#141414',
        card: '#1C1C1C',
        border: 'rgba(255,255,255,0.08)',
        'border-md': 'rgba(255,255,255,0.15)',
        txt: 'rgba(255,255,255,0.90)',
        'txt-mid': 'rgba(255,255,255,0.55)',
        'txt-faint': 'rgba(255,255,255,0.28)',
        accent: '#E8FF47',
        accent2: '#FF3B5C',
        accent3: '#4DFFA4',
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(.22,1,.36,1)',
      },
    },
  },
  plugins: [],
}
export default config
```

**Font Loading (Next.js):**
```typescript
// app/layout.tsx
import { Geist, Instrument_Serif, Geist_Mono } from 'next/font/google'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif'
})
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

---

## Phase 1 Implementation Checklist

### Week 1, Days 1-3 (per ROADMAP.md)

**Day 1: Project Setup + Authentication**
- [ ] Create Next.js 15 app with TypeScript + Tailwind
- [ ] Set up Supabase project (hosted or local)
- [ ] Install dependencies: `@supabase/ssr`, `@supabase/supabase-js`, `framer-motion`
- [ ] Configure environment variables
- [ ] Set up Supabase client utilities (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- [ ] Implement middleware for session management
- [ ] Create auth routes: `/signup`, `/login`, `/auth/callback`, `/auth/reset-password`
- [ ] Test email verification flow
- [ ] Test password reset flow

**Day 2: Database Schema + Quiz Migration (Part 1)**
- [ ] Design and create database schema (profiles, quiz_responses, youtube_connections, oauth_states)
- [ ] Enable RLS and create policies for all tables
- [ ] Generate TypeScript types from schema
- [ ] Migrate quiz HTML structure to React components (Steps 0-4)
- [ ] Set up quiz state management with localStorage
- [ ] Implement Framer Motion animations for step transitions
- [ ] Test quiz state persistence across page refreshes

**Day 3: Quiz Migration (Part 2) + YouTube OAuth**
- [ ] Complete quiz migration (Steps 5-9 + Result)
- [ ] Implement authority score calculation
- [ ] Create YouTube OAuth API routes (`/api/youtube/connect`, `/api/youtube/callback`)
- [ ] Test YouTube OAuth flow end-to-end
- [ ] Create generation queue table
- [ ] Implement queue API route (add job to queue)
- [ ] Wire up complete flow: Quiz → Signup → YouTube → Queue
- [ ] Test complete onboarding flow

**Deliverables:**
- [ ] Working quiz at `/quiz` route
- [ ] Email/password authentication working
- [ ] YouTube OAuth connection working
- [ ] Quiz responses saved to Supabase
- [ ] Free page generation queued (processing deferred to Phase 2)

---

## Risk Assessment & Mitigation

### Technical Risks

**1. YouTube OAuth Approval Delay**
- **Risk:** Google may require app verification for production OAuth
- **Mitigation:** Use test mode for Phase 1 beta, apply for verification in parallel
- **Impact:** Medium (doesn't block beta launch)

**2. Middleware Session Refresh Issues**
- **Risk:** Token refresh might fail silently, causing auth issues
- **Mitigation:** Add logging to middleware, test extensively with expired tokens
- **Impact:** High (blocks user access)

**3. localStorage Quiz State Loss**
- **Risk:** Users might clear browser data mid-quiz
- **Mitigation:** Add "Resume Quiz" detection on signup, show warning before clearing state
- **Impact:** Low (rare occurrence)

**4. RLS Policy Misconfiguration**
- **Risk:** Forgetting to enable RLS exposes all data publicly
- **Mitigation:** Create checklist, test from client SDK (not SQL editor), use Supabase Policy Advisor
- **Impact:** Critical (security breach)

**5. Email Deliverability**
- **Risk:** Verification emails might land in spam
- **Mitigation:** Use custom SMTP with verified domain (Resend), test with multiple email providers
- **Impact:** Medium (affects activation rate)

### UX Risks

**1. Quiz Abandonment**
- **Risk:** 9-step quiz might feel too long
- **Mitigation:** Show progress bar, enable back navigation, save state automatically
- **Impact:** Medium (affects conversion)

**2. YouTube Connection Failure**
- **Risk:** Users deny OAuth or have no YouTube channel
- **Mitigation:** Allow "Skip for now" option, show clear error messages, enable retry
- **Impact:** Medium (affects free page generation)

**3. Free Page Generation Expectation**
- **Risk:** Users expect instant results, not aware of 15-minute wait
- **Mitigation:** Set expectations clearly ("Generating... you'll receive email"), show queue status
- **Impact:** Low (managed expectations)

### Timeline Risks

**1. Animation Implementation Time**
- **Risk:** Quiz animations might take longer than estimated
- **Mitigation:** Use simpler CSS animations if Motion takes too long, focus on core transitions first
- **Impact:** Low (animations are nice-to-have for beta)

**2. OAuth Flow Debugging**
- **Risk:** OAuth callback issues can be hard to debug
- **Mitigation:** Add extensive logging, test with multiple Google accounts, use OAuth Playground
- **Impact:** Medium (can extend Day 3 timeline)

---

## Key Decisions Summary

### Confirmed Decisions (from CONTEXT.md)

1. **Quiz Migration:** Pure React components (not vanilla JS preservation)
2. **Animation Library:** Framer Motion for quiz transitions
3. **State Persistence:** localStorage before signup, Supabase after
4. **Authority Score:** Client-side calculation only
5. **Session Duration:** 30 days (no "Remember Me" option)
6. **Email Verification:** Sent but not required for dashboard access
7. **Password Reset:** Magic link via email (Supabase native flow)
8. **YouTube OAuth:** Required for free page generation, can skip and connect later
9. **Free Page Generation:** Auto-triggered after YouTube connection

### Technical Decisions (from Research)

1. **Supabase Auth Package:** `@supabase/ssr` for cookie-based sessions
2. **Session Validation:** Use `getClaims()` in middleware (not `getSession()`)
3. **Database Approach:** Manual setup for Phase 1, migrate to migrations in Phase 2
4. **Type Generation:** Manual command for Phase 1, automate with GitHub Actions later
5. **Email Service:** Supabase built-in SMTP for Phase 1
6. **Background Jobs:** Queue table only in Phase 1, processing in Phase 2
7. **Design System:** Extract quiz CSS to Tailwind config
8. **Font Loading:** Next.js font optimization with Geist fonts

---

## Open Questions for Planning

### Technical Clarifications Needed

1. **Quiz State Sync Timing:** When exactly should localStorage state be synced to Supabase?
   - Option A: Immediately after signup (before YouTube OAuth)
   - Option B: After YouTube connection (complete onboarding)
   - **Recommendation:** Option A (preserve data immediately)

2. **YouTube OAuth Error Recovery:** How many retry attempts before showing "Contact Support"?
   - **Recommendation:** 3 attempts, then show skip option with support email

3. **Email Template Customization Priority:** Should we customize email templates in Phase 1 or use defaults?
   - **Recommendation:** Use defaults for Phase 1, customize in Phase 2 based on feedback

4. **Generation Queue Priority Logic:** Should free pages have higher priority than paid tier pages?
   - **Recommendation:** Yes, free pages = priority 10 (prove value fast)

### UX Clarifications Needed

1. **Quiz Exit Behavior:** What happens if user closes browser mid-quiz?
   - **Recommendation:** Auto-save to localStorage every step, show "Resume Quiz" on return

2. **YouTube Not Connected State:** Can user access dashboard without YouTube connection?
   - **Recommendation:** Yes (per CONTEXT.md), but show prominent "Connect YouTube to get free page" CTA

3. **Failed Generation Notification:** Should we email user if free page generation fails?
   - **Recommendation:** Yes, with clear explanation and "Contact Support" button

---

## RESEARCH COMPLETE

**Status:** All 7 research focus areas addressed
**Next Step:** Proceed to PLAN.md creation with implementation details
**Confidence Level:** High - All technical approaches validated with current 2026 best practices

**Key Takeaways:**
1. Supabase SSR package provides complete auth solution for Next.js
2. Framer Motion is ideal for quiz animations (performance + DX)
3. RLS security is critical - must be enabled on all tables
4. YouTube OAuth flow is straightforward with proper state management
5. Background job processing deferred to Phase 2 (queue only in Phase 1)
6. Email verification optional for beta (reduces friction)
7. Design system migration is straightforward (CSS → Tailwind)

**Estimated Implementation Time:** 3 days (per ROADMAP.md)
- Day 1: Auth + Project Setup (8 hours)
- Day 2: Database + Quiz Part 1 (8 hours)
- Day 3: Quiz Part 2 + YouTube OAuth (8 hours)

---

*Research completed: 2026-03-06*
*Phase: 01-onboarding-foundation*

# Phase 1: Onboarding Foundation - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the user onboarding foundation: migrating the authority-onboarding-funnel.html quiz into Next.js, implementing email/password authentication with Supabase Auth, and enabling YouTube OAuth connection. The phase establishes the complete flow from quiz completion through account creation to YouTube channel connection, culminating in automatic free page generation.

Scope is fixed per ROADMAP.md. This captures HOW to implement, not WHETHER to expand.

</domain>

<decisions>
## Implementation Decisions

### Quiz Migration & Preservation
- **Technology approach:** Pure React components (not vanilla JS preservation)
  - Rebuild quiz as React components with Framer Motion or CSS animations
  - Type-safe, maintainable, matches Next.js ecosystem
  - Preserves dark minimal design (#E8FF47 accent, Geist fonts per design system)
- **State persistence:** localStorage before signup
  - Quiz progress saved locally so users can refresh or return without losing answers
  - Works before user creates account
  - Synced to Supabase after signup
- **Authority score calculation:** Client-side only
  - Calculate in browser using validated algorithm from quiz
  - Instant feedback, no server delay
  - Score saved to database on signup
- **Post-quiz action:** Show score + signup CTA
  - Display authority score with interpretation
  - Clear call-to-action to create account
  - Natural funnel progression

### Authentication Flow Order
- **Signup timing:** After quiz completion
  - Flow: Quiz → Score → Signup → YouTube OAuth
  - User has invested time, higher intent
  - Quiz data already captured in localStorage, transferred on signup
- **Page structure:** Separate routes for auth
  - `/signup` and `/login` as distinct pages
  - Clear intent, better SEO, easier conversion tracking
- **Signup fields:** Email + password only
  - Minimal friction
  - Name/handle already captured in quiz (9 steps)
  - Supabase handles authentication
- **Post-signup redirect:** YouTube OAuth flow immediately
  - Signup → Connect YouTube → Dashboard
  - Natural progression, captures YouTube data immediately
  - Matches requirement ONBOARD-06 and ONBOARD-07

### YouTube OAuth UX
- **Connection requirement:** Required for free page generation
  - User must connect YouTube to get their free page (core value prop)
  - Can skip and connect later from dashboard if needed
  - Not a hard blocker to dashboard access
- **OAuth permissions:** Read-only channel data
  - Access to channel metadata and video list
  - Matches AUTH-05 requirement
  - Non-invasive, easier Google approval
- **Failure handling:** Show error + retry option
  - Clear error message explaining what went wrong
  - "Try Again" button for immediate retry
  - "Skip for now" option redirects to dashboard
  - User can retry from dashboard later
- **Success action:** Auto-trigger free page generation
  - Immediately queue generation of free page from most popular video
  - User sees "Generating your page..." progress indicator
  - Matches ONBOARD-07 and ONBOARD-08 (email notification)

### Session & Verification Handling
- **Session duration:** 30 days default
  - Balance between convenience and security
  - User stays logged in for a month unless they logout
  - Generous for SaaS app, reduces re-login friction
- **Remember me:** Not offered
  - Consistent 30-day behavior for all users
  - Simplifies UX, reduces decision fatigue
  - 30 days is already generous
- **Email verification:** Not required for dashboard access
  - User can access dashboard immediately after signup
  - Email verification needed only for password reset functionality
  - Lower friction, faster onboarding
  - Matches requirement AUTH-02 (verification sent, not enforced)
- **Password reset:** Magic link via email
  - Supabase native flow: click link → set new password
  - Secure, standard UX pattern
  - Matches requirement AUTH-03

### Claude's Discretion
- Exact animation timing and easing for quiz transitions
- Loading skeleton design while generating free page
- Specific error message copy (tone/wording)
- Email template designs (verification, password reset, page ready)
- Dashboard layout post-YouTube connection

</decisions>

<code_context>
## Existing Code Insights

### Current Architecture
**Framework shift required:**
- Current site: Astro 5 static site generator (TypeScript, vanilla CSS/JS)
- Target: Next.js + Supabase + React
- This is a complete architectural migration, not incremental

### Reusable Patterns from Astro Site
**Design system:**
- `design-system.css` defines color tokens, typography scale, spacing system
  - Dark minimal aesthetic already established
  - `--color-primary` pattern for theming
  - Can extract tokens for Next.js Tailwind config or CSS modules
- Geist fonts already in use (Reddit Sans headings, Inter body)
- Mobile-responsive patterns (44px minimum touch targets, touch event handling)

**Component patterns:**
- State management via CSS classes (`.open`, `.loading`, `.error`)
- ARIA attributes for accessibility (current site has good a11y practices)
- Semantic HTML structure

### Integration Points
**New integrations needed:**
- Supabase Client: `@supabase/supabase-js` for auth + database
- Supabase Auth UI: Optional helper components for auth flows
- Google YouTube Data API v3: For OAuth and channel data
- Next.js API routes: Backend for OAuth callbacks, Supabase operations

**No existing auth:** Current Astro site is completely static
- No authentication system to reference
- No database connections
- No API routes or server-side logic
- Starting authentication from scratch

### Database Schema Requirements
Per ROADMAP.md, Supabase schema needed:
- `users` table (managed by Supabase Auth)
- `quiz_responses` table (9 steps, authority score)
- `youtube_connections` table (channel ID, access token, refresh token)

</code_context>

<specifics>
## Specific Ideas

**Quiz design reference:**
- "Preserve dark minimal, Geist fonts, #E8FF47 accent" from existing authority-onboarding-funnel.html
- Quiz has 9 steps capturing: name/handle, platforms, niche, offers, Google/AI presence, brand tone, anti-vision, readiness
- Authority score algorithm already validated (0-100 scale)

**User experience flow:**
1. User lands on `/quiz` (public route)
2. Completes 9-step quiz (progress saved to localStorage)
3. Sees authority score + interpretation
4. Clicks "Create Account" → `/signup`
5. Enters email + password → Supabase signup
6. Auto-redirected to YouTube OAuth consent screen
7. Grants read-only channel access
8. Redirected back to app → auto-triggers free page generation
9. Sees "Generating your page from [video title]..." progress
10. Receives email when page ready (<15 min per ROADMAP.md)

**Error handling priorities:**
- YouTube OAuth rejection or failure (most likely failure point per ROADMAP risks)
- Quiz state loss (mitigated by localStorage)
- Email verification failures (acceptable since not blocking)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

Phase 2 will handle the automation pipeline (Apify, content generation, publishing).

</deferred>

---

*Phase: 01-onboarding-foundation*
*Context gathered: 2026-03-06*

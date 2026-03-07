# Phase 1: Onboarding Foundation - Planning Summary

**Phase:** 01-onboarding-foundation
**Planning Date:** 2026-03-06
**Status:** Complete and ready for execution
**Estimated Duration:** 3 days (24 hours)

---

## Overview

Phase 1 delivers the complete user onboarding flow from quiz completion through account creation to YouTube channel connection and free page generation. All 15 requirements (ONBOARD-01 through ONBOARD-09, AUTH-01 through AUTH-06) are covered across 7 executable plans organized into 3 waves.

---

## Plans Created

### Wave 1: Foundation (Parallel Execution)

**Plan 01: Project Setup & Supabase Auth Configuration**
- Duration: 4 hours
- Autonomous: Yes
- Requirements: AUTH-04
- Deliverables:
  - Next.js 15 project initialized
  - Supabase SSR auth configured
  - Middleware for session management
  - Tailwind with quiz design system
  - Environment variables configured

**Plan 02: Database Schema & Migrations**
- Duration: 3 hours
- Autonomous: Yes
- Depends on: Plan 01
- Requirements: AUTH-04, AUTH-06
- Deliverables:
  - 5 database tables created (profiles, quiz_responses, youtube_connections, oauth_states, generation_queue)
  - RLS policies enabled
  - TypeScript types generated
  - Profile auto-creation trigger

### Wave 2: Authentication & Quiz (Parallel Execution)

**Plan 03: Authentication Routes (Signup/Login/Reset)**
- Duration: 4 hours
- Autonomous: Yes
- Depends on: Plans 01, 02
- Requirements: AUTH-01, AUTH-02, AUTH-03, AUTH-04
- Deliverables:
  - Signup/login pages
  - Email verification flow
  - Password reset flow
  - Protected routes
  - Session persistence (30 days)

**Plan 04: Quiz Migration Part 1 (Steps 0-4)**
- Duration: 5 hours
- Autonomous: Yes
- Depends on: Plan 01
- Requirements: ONBOARD-01, ONBOARD-02, ONBOARD-03, ONBOARD-04
- Deliverables:
  - Quiz Steps 0-4 (intro, identity, platforms, niche)
  - localStorage persistence
  - Framer Motion animations
  - Progress bar
  - Authority score algorithm

**Plan 05: Quiz Migration Part 2 & Signup Integration**
- Duration: 3 hours
- Autonomous: Yes
- Depends on: Plans 02, 03, 04
- Requirements: ONBOARD-05
- Deliverables:
  - Quiz Steps 5-11 (offers, presence, brand, anti-vision, readiness)
  - Quiz result with authority score
  - Signup integration
  - Quiz data saved to Supabase

### Wave 3: YouTube OAuth & Generation Queue (Sequential)

**Plan 06: YouTube OAuth Flow**
- Duration: 4 hours
- Autonomous: Yes
- Depends on: Plans 01, 02, 03
- Requirements: AUTH-05, AUTH-06, ONBOARD-06
- Deliverables:
  - YouTube OAuth 2.0 flow
  - Channel data fetching
  - Token storage (access + refresh)
  - Error handling with retry
  - Skip for now option

**Plan 07: Free Page Generation Queue**
- Duration: 3 hours
- Autonomous: Yes
- Depends on: Plans 01, 02, 06
- Requirements: ONBOARD-07, ONBOARD-08, ONBOARD-09
- Deliverables:
  - Generation queue system
  - Auto-trigger after YouTube connection
  - Queue status display
  - Email notification infrastructure
  - Most popular video detection

---

## Requirements Coverage

### Onboarding Requirements (9/9)

| Requirement | Plan(s) | Status |
|-------------|---------|--------|
| ONBOARD-01 | Plan 04 | ✅ User can access /quiz route |
| ONBOARD-02 | Plan 04 | ✅ Quiz preserves dark minimal design |
| ONBOARD-03 | Plan 04, 05 | ✅ Quiz captures all 9 steps |
| ONBOARD-04 | Plan 04 | ✅ Authority score calculation |
| ONBOARD-05 | Plan 05 | ✅ Quiz result displays score |
| ONBOARD-06 | Plan 06 | ✅ YouTube OAuth connection |
| ONBOARD-07 | Plan 07 | ✅ Free page generation queued |
| ONBOARD-08 | Plan 07 | ✅ Email notification prepared |
| ONBOARD-09 | Plan 07 | ✅ Free page preview CTA |

### Authentication Requirements (6/6)

| Requirement | Plan(s) | Status |
|-------------|---------|--------|
| AUTH-01 | Plan 03 | ✅ Email/password signup |
| AUTH-02 | Plan 03 | ✅ Email verification sent |
| AUTH-03 | Plan 03 | ✅ Password reset via email |
| AUTH-04 | Plan 01, 02, 03 | ✅ Session persistence (30 days) |
| AUTH-05 | Plan 06 | ✅ YouTube OAuth (read-only) |
| AUTH-06 | Plan 02, 06 | ✅ YouTube tokens stored securely |

**Total Coverage: 15/15 requirements (100%)**

---

## Technical Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Zod (validation)

### Backend
- Supabase (PostgreSQL + Auth)
- @supabase/ssr (cookie-based sessions)
- YouTube Data API v3
- Google OAuth 2.0
- Resend (email service)

### Architecture Patterns
- Server-side rendering (SSR)
- Cookie-based authentication
- Row-Level Security (RLS)
- Type-safe database queries
- CSRF protection (OAuth state tokens)
- localStorage with validation

---

## Security Considerations

✅ **Implemented:**
- Row-Level Security (RLS) on all tables
- CSRF protection for OAuth flow
- JWT validation via `getClaims()` (not `getSession()`)
- Token refresh via middleware
- httpOnly cookies for session storage
- Input validation with Zod
- OAuth state token expiration (10 minutes)

✅ **Best Practices:**
- Never use service_role key in client code
- Encrypt OAuth tokens in production
- Validate localStorage data before use
- Index all RLS policy columns
- Test RLS from client SDK (not SQL editor)

---

## File Organization

All files organized according to project structure rules:

```
/src
  /app
    /quiz                    # Quiz route
    /(auth)                  # Auth route group
    /dashboard               # Protected dashboard
    /youtube-connect         # YouTube OAuth flow
    /generating              # Generation status page
    /api                     # API routes
  /components
    /quiz                    # Quiz components
    /auth                    # Auth components
    /youtube                 # YouTube components
    /dashboard               # Dashboard components
  /lib                       # Utilities and helpers
  /hooks                     # Custom React hooks
  /types                     # TypeScript types
/tests                       # Test files (Phase 2)
/docs                        # Documentation
```

**No files saved to root folder.**

---

## 3-Day Sprint Timeline

### Day 1: Auth Setup + Project Initialization (7 hours)

**Morning (4 hours):**
- Execute Plan 01: Project setup + Supabase client

**Afternoon (3 hours):**
- Execute Plan 02: Database schema + RLS policies

### Day 2: Quiz Migration + Auth Routes (12 hours)

**Morning (4 hours):**
- Execute Plan 03: Authentication routes

**Afternoon (5 hours):**
- Execute Plan 04: Quiz Part 1 (Steps 0-4)

**Late Afternoon (3 hours):**
- Execute Plan 05: Quiz Part 2 (Steps 5-11) + signup integration

### Day 3: YouTube OAuth + Generation Queue (7 hours)

**Morning (4 hours):**
- Execute Plan 06: YouTube OAuth flow

**Afternoon (3 hours):**
- Execute Plan 07: Free page generation queue

---

## Verification Checklist

### End-to-End Flow
- [ ] User can access /quiz and complete all 9 steps
- [ ] Quiz state persists in localStorage
- [ ] Authority score calculated and displayed
- [ ] User can create account with email/password
- [ ] Email verification sent (not required for access)
- [ ] User can log in and session persists (30 days)
- [ ] User redirected to YouTube OAuth after signup
- [ ] YouTube channel connected and tokens stored
- [ ] Free page generation automatically queued
- [ ] User sees generation status in dashboard
- [ ] Can navigate back through flow without errors

### Technical Validation
- [ ] No TypeScript errors
- [ ] All RLS policies working (test from client)
- [ ] Middleware refreshes tokens correctly
- [ ] OAuth CSRF protection working
- [ ] localStorage validation prevents crashes
- [ ] Database types generated correctly
- [ ] Email infrastructure configured (Resend API key)
- [ ] All environment variables set

### Design System
- [ ] Dark minimal design (#0A0A0A background)
- [ ] #E8FF47 accent color used consistently
- [ ] Geist fonts loaded correctly
- [ ] Animations smooth (Framer Motion)
- [ ] Mobile responsive
- [ ] Accessible (ARIA attributes)

---

## Dependencies & External Services

### Required Setup
1. **Supabase Project:**
   - Create project in Supabase Dashboard
   - Copy URL and anon key to .env.local
   - Apply database migrations

2. **Google Cloud Console:**
   - Create OAuth 2.0 Client ID
   - Enable YouTube Data API v3
   - Configure redirect URIs
   - Copy credentials to .env.local

3. **Resend (Email):**
   - Create Resend account
   - Copy API key to .env.local
   - (Optional for Phase 1, required for Phase 2)

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# YouTube OAuth
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

# Email (Phase 2)
RESEND_API_KEY=
```

---

## Risk Mitigation

### Technical Risks

**1. YouTube OAuth Approval:**
- **Mitigation:** Use test mode for Phase 1, apply for verification in parallel
- **Impact:** Medium (doesn't block beta launch)

**2. Middleware Session Refresh:**
- **Mitigation:** Extensive logging, test with expired tokens
- **Impact:** High (blocks user access)

**3. RLS Policy Misconfiguration:**
- **Mitigation:** Test from client SDK, use Supabase Policy Advisor
- **Impact:** Critical (security breach)

### UX Risks

**1. Quiz Abandonment:**
- **Mitigation:** Progress bar, back navigation, auto-save
- **Impact:** Medium (affects conversion)

**2. YouTube Connection Failure:**
- **Mitigation:** Clear error messages, retry option, skip button
- **Impact:** Medium (affects free page generation)

---

## Phase Completion Criteria

Phase 1 is complete when:

✅ All 7 plans executed successfully
✅ All 15 requirements verified (ONBOARD-01 to ONBOARD-09, AUTH-01 to AUTH-06)
✅ End-to-end flow works: quiz → signup → YouTube → queue
✅ No critical bugs or TypeScript errors
✅ Design system matches quiz specifications
✅ Security measures in place (RLS, CSRF, session management)
✅ Database schema created with proper indexes
✅ Generation queue accepting jobs (processing in Phase 2)

---

## Handoff to Phase 2

**What's Complete:**
- ✅ User onboarding flow (quiz to account creation)
- ✅ YouTube OAuth connection
- ✅ Generation queue system (jobs queued, not processed)
- ✅ Email notification infrastructure (configured, not sending)
- ✅ Dashboard showing connection status

**What's Deferred to Phase 2:**
- ⏳ Background job processing (Apify integration)
- ⏳ Content generation (Claude API)
- ⏳ Page publishing to subdomain
- ⏳ Email notifications (actually sending)
- ⏳ Transcript extraction and cleaning

**Database Ready for Phase 2:**
- `generation_queue` table with status tracking
- Queue priority system
- Error handling and retry logic
- User-queue relationships established

---

## PLANNING COMPLETE ✅

**Status:** All plans written and ready for execution
**Requirements Coverage:** 15/15 (100%)
**Estimated Time:** 3 days (24 hours)
**Autonomous:** All plans can be executed without user input during implementation
**Dependencies:** All external dependencies identified and documented

**Next Steps:**
1. Review plans with user (if needed)
2. Set up external services (Supabase, Google Cloud, Resend)
3. Execute Plan 01 (Project Setup)
4. Follow wave-based execution order

---

*Planning completed: 2026-03-06*
*Phase: 01-onboarding-foundation*
*Planner: gsd-planner*

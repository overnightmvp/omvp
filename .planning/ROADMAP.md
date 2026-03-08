# Roadmap: Authority Infrastructure Platform

**Created:** 2026-03-06
**Target:** Beta launch March 2026 (4-week sprint)
**Goal:** $5,000 MRR from 5-10 paying customers

## Milestone 1: Beta Launch (v1.0)

**Timeline:** 4 weeks (March 2026)
**Success Criteria:**
- [ ] Freemium flow generates 1 free page per user
- [ ] Self-serve signup + payment via Polar.sh
- [ ] Automation pipeline generates pages in <15 min
- [ ] 3 templates available
- [ ] 10 beta customers acquired
- [ ] $5,000 MRR achieved

---

## Phase 1: Onboarding Foundation (Week 1, Days 1-3)

**Goal:** Integrate existing quiz + enable YouTube connection + user authentication

**Duration:** 3 days
**Priority:** Critical (blocks all other work)

### Scope

**Integrate Existing Quiz:**
- Migrate authority-onboarding-funnel.html into Next.js app
- Preserve design system (dark minimal, Geist fonts, #E8FF47 accent)
- Connect quiz state to Supabase (save responses)
- Wire up YouTube OAuth flow after quiz completion

**User Authentication:**
- Implement email/password signup/login (Supabase Auth)
- Email verification flow
- Password reset via email
- Session persistence

**Requirements Covered:**
- ONBOARD-01, ONBOARD-02, ONBOARD-03, ONBOARD-04, ONBOARD-05, ONBOARD-06
- AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06

**Deliverables:**
1. `/quiz` route with integrated quiz (migrated HTML → Next.js)
2. `/signup`, `/login`, `/reset-password` routes
3. YouTube OAuth connection working (stores channel ID + access token)
4. Supabase schema: `users`, `quiz_responses`, `youtube_connections`

**Success Criteria:**
- [ ] User can complete quiz and see authority score
- [ ] User can sign up, verify email, log in
- [ ] User can connect YouTube channel via OAuth
- [ ] Quiz responses saved to database

**Risks:**
- YouTube OAuth approval (use test mode initially if needed)
- Quiz UI migration complexity (preserve animations/interactions)

---

## Phase 2: Automation Pipeline (Week 1, Days 4-7) ✅ COMPLETE

**Goal:** Build agentic pipeline that scrapes YouTube → generates SEO page → publishes to subdomain

**Duration:** 4 days
**Priority:** Critical (core product value)
**Status:** ✅ COMPLETE (7/7 plans)

**Plans:** 7 plans in 3 waves (including 02-00 research)

Plans:
- [x] 02-00-PLAN.md — Research & Architecture (Wave 0 - Foundation)
- [x] 02-01-PLAN.md — Apify Integration & YouTube Scraping (Wave 1)
- [x] 02-02-PLAN.md — Transcript Cleaning & Content Transformation (Wave 1)
- [x] 02-03-PLAN.md — Schema Builder & Page Storage (Wave 2)
- [x] 02-04-PLAN.md — Publisher & Subdomain Routing (Wave 2)
- [x] 02-05-PLAN.md — Queue Orchestrator & Cron Job (Wave 3)
- [x] 02-06-PLAN.md — Indexing & Email Notifications (Wave 3)

### Scope

**Apify Integration:**
- Set up Apify account + YouTube scraping actors
- Test channel scraper (get video list)
- Test transcript extractor (get video transcripts)
- Create Apify API wrapper (Next.js API routes)

**Workflow Orchestration (Simplified):**
- Next.js API routes for agentic pipeline (no external orchestrator)
- Vercel Cron Jobs for scheduled tasks (check queue every 5 minutes)
- 6-agent workflow implemented as serverless functions:
  1. YouTube Scraper (Apify trigger)
  2. Transcript Cleaner (remove filler, structure content)
  3. Content Transformer (Claude Sonnet API → SEO article with FAQ)
  4. Schema Builder (generate JSON-LD: Article, Person, Organization, FAQ, entity)
  5. Publisher (deploy to subdomain)
  6. Indexing Monitor (Google Search Console API)
- Simple queue system in Supabase (status updates via database triggers)

**Page Publishing System:**
- Decision: Choose Ghost headless OR Next.js MDX (test both in first 2 days)
- Set up subdomain routing (creator.platform.com)
- Implement page templates (start with 1 minimal template)
- Generate schema markup (Article, Person, Organization)

**Queue Management:**
- Supabase table: `generation_queue` (video_id, status, user_id, created_at)
- Status states: pending → processing → published → failed
- Email notifications (page ready, generation failed)

**Requirements Covered:**
- AUTO-01 through AUTO-12
- ONBOARD-07, ONBOARD-08 (free page generation)

**Deliverables:**
1. Next.js API routes for pipeline orchestration (simpler than n8n)
2. Vercel Cron Job triggers queue processing every 5 minutes
3. Apify integration working (can scrape channel + extract transcripts)
4. Claude API integration (generates 1500-2500 word article with FAQ sections)
5. Schema builder (Article, Person, Organization, FAQ schema, entity mapping)
6. Publishing system (deploys page to subdomain)
7. Email notifications (SendGrid or Resend)
8. Dashboard shows generation queue status

**Success Criteria:**
- [x] User can trigger free page generation from most popular video
- [x] Page generated in <15 minutes
- [x] Page includes: headline, meta description, structured content, schema markup
- [x] Page published to creator.platform.com/[slug]
- [x] User receives email when page is ready

**Risks:**
- Apify rate limits (use appropriate actor pricing tier)
- Claude API costs (use Haiku for drafts, Sonnet for final)
- Vercel Cron Job limits (free tier: 1 cron per project, Pro: unlimited)
- Serverless function timeout (10s on free, 60s on Pro - may need for long articles)

---

## Phase 3: Templates + Dashboard (Week 2, Days 1-4)

**Goal:** Build template selection UX + user dashboard for managing generated pages

**Duration:** 4 days
**Priority:** High (required for paid tier value)

### Scope

**Template System:**
- Design 3 templates: Minimal, Editorial, Technical
- Build template preview system (show actual generated content)
- Implement template switching (user can change default)
- Add brand customization: primary color, logo upload, font pairing
- Ensure all templates are mobile-responsive

**User Dashboard:**
- `/dashboard` route with sidebar navigation
- Pages list view (title, URL, publish date, views from GSC API)
- Generation queue view (pending videos, ETA, progress)
- Manual trigger (user selects YouTube video → generate page)
- Page preview before publishing (draft mode)
- Edit metadata (title, meta description)
- Delete pages
- Analytics: total pages, total views, top-performing pages

**Requirements Covered:**
- TMPL-01 through TMPL-07
- DASH-01 through DASH-09

**Deliverables:**
1. 3 production-ready templates (Minimal, Editorial, Technical)
2. Template preview system (before generation)
3. Dashboard with pages list + queue management
4. Draft mode (preview before publish)
5. Google Search Console API integration (fetch page views)

**Success Criteria:**
- [ ] User can preview all 3 templates with their content
- [ ] User can select template during free page generation
- [ ] User can view all generated pages in dashboard
- [ ] User can manually trigger page generation for any video
- [ ] User can see page view counts (via GSC API)

**Risks:**
- Google Search Console API setup (OAuth + verification)
- Template design time (keep scope minimal for v1)

---

## Phase 4: Payments + Tier Management (Week 2, Days 5-7)

**Goal:** Integrate Polar.sh + enforce tier limits + enable self-serve signup

**Duration:** 3 days
**Priority:** Critical (monetization)

### Scope

**Polar.sh Integration:**
- Set up Polar.sh account + create 3 subscription products
  - Starter: $29/mo (5 pages/month, 1 template, basic SEO)
  - Pro: $99/mo (20 pages/month, all templates, schema markup, FAQ generation)
  - Authority: $1,299/mo (unlimited pages, all add-ons included, priority generation)
- Build checkout flow (Next.js → Polar.sh)
- Implement webhook handler (Polar events → Supabase tier updates)
- Display billing status in dashboard

**Tier Enforcement:**
- Check usage limits before page generation (pages_generated_this_month < tier_limit)
- Display usage meter in dashboard (e.g., "3/5 pages used this month")
- Block generation if limit reached (show upgrade CTA)
- Reset monthly usage on billing cycle

**Subscription Management:**
- User can upgrade/downgrade tier (Polar.sh portal)
- User can cancel subscription (access until period end)
- Failed payment handling (email notification + retry link)
- Invoice emails after successful payment

**Requirements Covered:**
- PAY-01 through PAY-08

**Deliverables:**
1. Polar.sh checkout integration (all 3 tiers)
2. Webhook handler (tier updates in Supabase)
3. Usage tracking + enforcement (pages_generated_this_month counter)
4. Billing portal link in dashboard
5. Upgrade CTAs (on free page, when limit reached)

**Success Criteria:**
- [ ] User can upgrade to Starter/Pro/Authority tier via Polar.sh
- [ ] Tier limits are enforced (cannot generate beyond limit)
- [ ] User can view billing status + usage in dashboard
- [ ] Webhooks update user tier in real-time
- [ ] User can cancel subscription (access continues until period end)

**Risks:**
- Polar.sh webhook reliability (implement idempotency)
- Prorated billing edge cases (test mid-cycle upgrades/downgrades)

---

## Phase 5: Core Add-Ons (Week 3, Days 1-4)

**Goal:** Build internal linking, funnel page builder, SEO services bundle

**Duration:** 4 days
**Priority:** High (LTV expansion)

### Scope

**Internal Linking Add-On ($29/mo):**
- Semantic similarity analysis (use OpenAI embeddings or similar)
- Inject 3-5 contextual internal and external links per page
- Use descriptive anchor text (extract from linked page headings)
- External links to authoritative sources (build trust signals)
- Visualize topical authority graph (D3.js or similar)
- Update links when new pages published

**Funnel Page Builder Add-On ($99 per page):**
- 5 funnel templates: Sales Page, Webinar Registration, Lead Magnet, Course Launch, Coaching Application
- Customization fields: headline, copy blocks, CTA, images
- Calendly integration (embed booking widget)
- Stripe/Polar checkout embed (for creator's products)
- Publish to creator.platform.com/offers/[slug]

**SEO Services Bundle (included in Authority, $99/mo add-on for Pro):**
- AI visibility optimization (FAQ sections, entity mentions, clear answers)
- FAQ schema generation (common questions in niche)
- Entity mapping (creator → topics → offers → related entities)
- Monthly SEO audit report (keyword rankings, AI mentions, schema coverage)

**Requirements Covered:**
- ADDON-IL-01 through ADDON-IL-06
- ADDON-FPB-01 through ADDON-FPB-06
- ADDON-SEO-01 through ADDON-SEO-05

**Deliverables:**
1. Internal linking system (semantic analysis + link injection)
2. Funnel page builder UI (5 templates + customization)
3. SEO services automation (FAQ generation, entity mapping)
4. Add-on marketplace page in dashboard
5. Polar.sh add-on products (enable/disable subscriptions)

**Success Criteria:**
- [ ] User can enable internal linking add-on (pages get auto-linked)
- [ ] User can create funnel page from template in <10 minutes
- [ ] User can view topical authority graph
- [ ] SEO bundle generates FAQ schema for all pages
- [ ] Monthly SEO audit email sent to Authority tier users

**Risks:**
- Semantic similarity quality (test with real creator content)
- Funnel builder scope creep (keep templates simple)

---

## Phase 6: Advanced Add-Ons (Week 3, Days 5-7)

**Goal:** Build link building automation + payment integration for creator's products

**Duration:** 3 days
**Priority:** Medium (nice-to-have for beta)

### Scope

**Link Building Add-On ($99/mo):**
- Identify backlink opportunities (industry directories, guest post sites)
- Cold email outreach automation (via user's email)
- User approves/rejects outreach templates before sending
- Monthly report: outreach sent, links acquired, domain authority

**Payment Integration for Creator's Products ($29 setup fee):**
- Connect user's Stripe or Polar.sh account (OAuth)
- Create checkout pages for courses, coaching, digital products
- Match creator's brand (template + customization)
- Sales notifications via email
- Sales analytics in dashboard (revenue, conversion rate)

**Requirements Covered:**
- ADDON-LB-01 through ADDON-LB-05
- ADDON-PI-01 through ADDON-PI-06

**Deliverables:**
1. Link building automation (opportunity finder + outreach)
2. Payment integration (Stripe/Polar OAuth)
3. Checkout page generator for creator's products
4. Sales analytics dashboard

**Success Criteria:**
- [ ] User can enable link building add-on (receives opportunity list)
- [ ] User can approve outreach templates
- [ ] User can connect Stripe/Polar for their products
- [ ] User can create checkout pages for their offers
- [ ] User can view sales analytics in dashboard

**Risks:**
- Link building deliverability (avoid spam filters)
- Stripe OAuth approval process (can use test mode initially)

**Note:** This phase can be deferred to Week 4 if beta launch needs to happen sooner.

---

## Phase 7: Beta Launch (Week 3, Day 7 - Week 4)

**Goal:** Acquire 10 beta customers → hit $5,000 MRR

**Duration:** 7-10 days
**Priority:** Critical (revenue goal)

### Scope

**Launch Preparation:**
- Final QA testing (onboarding flow, generation pipeline, payments)
- Set up customer support email (help@platform.com)
- Create help docs (how to connect YouTube, how to generate pages, how to customize templates)
- Set up monitoring (Sentry for errors, Polar.sh webhooks for payments)
- Launch announcement (X/Twitter post, ProductHunt if ready)

**Cold Outreach Campaign:**
- Scrape 1,000 creator leads (Apify YouTube channel scraper)
- Filter for 10K-150K subscriber count + monetizing signals
- Authority Gap Audit for top 100 leads (5-minute Loom teardowns)
- Send 100 X/Twitter DMs (cold outreach script)
- Goal: 30 replies → 10 calls → 3-5 closes

**Beta Pricing Options:**
1. **Lifetime Deal:** $297 one-time (unlimited pages forever) - for first 10 customers
2. **Discounted Monthly:** $49/mo for 6 months (then $99/mo) - limited to 20 customers

**Sales Assets:**
- Sales page (long-form explaining system) - REQUIRED
- Loom video (Authority Gap Audit example)
- Case studies (3 existing: PT, gym, clinic)
- Demo video (quiz → free page → upgrade flow)

**Deliverables:**
1. Sales page live at platform.com
2. Help documentation
3. Cold outreach campaign (100 DMs sent)
4. 10 beta customers onboarded
5. $5,000 MRR achieved

**Success Criteria:**
- [ ] Sales page live + converting at 20%+ (calls → signups)
- [ ] 10 beta customers signed up
- [ ] 30+ pages generated across all users
- [ ] $5,000 MRR confirmed (via Polar.sh)
- [ ] Zero critical bugs reported

**Risks:**
- Cold outreach response rate (test multiple DM scripts)
- Conversion rate lower than expected (iterate on sales page)
- Technical bugs during onboarding (have support SLA ready)

---

## Phase 8: Iteration + Optimization (Week 4+)

**Goal:** Fix bugs, optimize conversion, improve retention

**Duration:** Ongoing
**Priority:** High (post-launch)

### Scope

**Based on Beta Feedback:**
- Fix reported bugs (prioritize blockers)
- Optimize generation speed (currently <15 min, target <5 min)
- Improve template designs based on user preferences
- Add missing features from beta feedback
- Optimize sales page based on conversion data

**Retention Focus:**
- Email onboarding sequence (activate new users)
- Monthly newsletter (showcase new features, success stories)
- Usage analytics (identify churning users early)
- Upgrade campaigns (Starter → Pro conversion)

**Technical Debt:**
- Add test coverage (critical flows: quiz, generation, payments)
- Improve error handling (retry logic for failed generations)
- Optimize database queries (Supabase performance)
- Set up CI/CD (automated deployments)

**Success Criteria:**
- [ ] <5% churn rate
- [ ] 80%+ user activation (completed free page generation)
- [ ] 30%+ conversion rate (free → paid)
- [ ] <1% error rate on page generation

---

## Milestone 2: Growth + Scale (v1.1+)

**Timeline:** Post-beta (Month 2+)
**Success Criteria:**
- [ ] 50 paying customers
- [ ] $15,000 MRR
- [ ] Multi-platform support (Instagram, TikTok)
- [ ] Custom domain support
- [ ] Self-serve onboarding (no sales calls)

**Deferred Phases:**
- Multi-platform integration (v2 requirements: PLATFORM-01 to PLATFORM-08)
- Advanced customization (v2 requirements: CUSTOM-01 to CUSTOM-04)
- Content management features (v2 requirements: CMS-01 to CMS-04)
- Collaboration tools (v2 requirements: COLLAB-01 to COLLAB-03)
- Advanced analytics (v2 requirements: ANALYTICS-01 to ANALYTICS-04)

---

## Dependencies + Critical Path

**Critical Path (Blocks Beta Launch):**
1. Phase 1 (Onboarding) → Must complete before Phase 2
2. Phase 2 (Automation) → Must complete before Phase 3
3. Phase 4 (Payments) → Must complete before Phase 7 (Beta Launch)
4. Phase 7 (Beta Launch) → Requires Phases 1-4 complete

**Parallelizable:**
- Phase 3 (Templates/Dashboard) + Phase 5 (Add-ons) can run in parallel after Phase 2
- Phase 6 (Advanced Add-ons) can be deferred to Week 4 if needed

**External Dependencies:**
- YouTube OAuth approval (can use test mode initially)
- Google Search Console API access (for analytics)
- Polar.sh account approval (test mode available)
- Apify account setup (instant, just need API key)
- n8n deployment (VPS or Railway.app)

---

## Resource Requirements

**Development:**
- Full-time founder (you) for 4 weeks
- No additional hires needed for beta

**Infrastructure Costs (Monthly):**
- Apify: $49/mo (Actor usage)
- Polar.sh: Free (takes % of transactions)
- Supabase: Free tier (upgrade if >10 customers)
- Vercel: $20/mo (Pro plan - needed for Cron Jobs + longer function timeouts)
- Claude API: ~$100/mo (estimated for 50 pages/month)
- SendGrid/Resend: Free tier (<1000 emails/mo)
- **Total:** ~$170/mo for beta (no n8n needed - simpler stack)

**Scaling Costs (50 customers):**
- Apify: $99/mo
- Supabase: $25/mo (Pro plan)
- Claude API: $500/mo (500 pages/month)
- **Total:** ~$650/mo

---

## Risk Mitigation

**Technical Risks:**
1. **Apify rate limits** → Use appropriate pricing tier, implement queue backoff
2. **Claude API costs** → Use Haiku for drafts, Sonnet for final (cost optimization)
3. **Vercel function timeouts** → Upgrade to Pro for 60s timeout (needed for article generation)
4. **Vercel Cron Job limits** → Pro plan allows unlimited cron jobs (needed for queue processing)
5. **YouTube OAuth rejection** → Use test mode for beta, apply for production later

**Business Risks:**
1. **Low conversion rate** → A/B test sales page, offer money-back guarantee
2. **High churn** → Email onboarding sequence, usage analytics, proactive support
3. **Slow outreach response** → Test multiple DM scripts, use Authority Gap Audit Loom videos
4. **Feature bloat** → Stick to roadmap, defer v2 features to post-beta

**Mitigation Strategy:**
- Weekly sprint reviews (adjust roadmap based on progress)
- Daily standups with yourself (track blockers)
- Beta customer feedback loop (weekly calls)
- Kill switch conditions (if <3 signups in Week 3, pivot to manual delivery hybrid)

---

## Success Metrics (Beta Launch)

**Acquisition:**
- 100 DMs sent → 30 replies (30% response rate)
- 10 calls booked → 5 signups (50% close rate)
- 5 direct signups (from sales page) → 10 total customers

**Activation:**
- 10 customers → 8 complete quiz (80% activation)
- 8 quiz completions → 8 connect YouTube (100% connection rate)
- 8 connections → 6 generate free page (75% generation rate)

**Monetization:**
- 6 free pages → 3 upgrade to paid (50% conversion rate)
- Tier mix: 2 Starter ($29) + 1 Pro ($99) = $157 MRR (conservative)
- OR: Target 5 Pro tier customers = $495 MRR
- OR: 1 Authority tier customer ($1,299) + 3 Starter ($87) = $1,386 MRR
- **Goal:** Mix of tiers to reach $5,000 MRR (e.g., 4 Authority + 10 Starter + 5 Pro)

**Retention (Month 1):**
- 3 paid customers → 3 remain after 30 days (0% churn)
- 3 customers → 2 generate 5+ pages (66% power user rate)

---

*Roadmap created: 2026-03-06*
*Last updated: 2026-03-06 after requirements definition*

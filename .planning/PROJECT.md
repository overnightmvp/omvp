# Authority Infrastructure Platform

**Created:** 2026-03-06
**Model:** Micro-SaaS with freemium onboarding + add-on marketplace

## What This Is

A micro-SaaS that automatically converts YouTube channels into SEO-optimized, AI-ready authority websites. Creators complete an interactive quiz onboarding, receive 1 free generated page as proof of value, then choose templates and add-on services to build compounding search authority without manual content work.

**The System:**
- Quiz captures creator authority profile (platform, niche, offers, current Google/AI presence)
- Agentic automation scrapes YouTube → transforms transcripts → generates SEO articles
- Self-serve template marketplace for page customization
- Add-on marketplace for ongoing authority services (internal linking, link building, funnel builders)
- Zero ongoing management for creators

## Core Value

**For creators (10K-150K subscribers):**
"Own your name + niche on Google in 14 days" — Turn your YouTube content into compounding search traffic without hiring writers, learning SEO, or managing websites.

**Why this matters:**
Creators are invisible to Google/AI despite having valuable content. This platform makes them discoverable through automation, not manual work.

## Requirements

### Validated

**Market Validation (3 case studies):**
- Personal trainer: Ranked #1 in city for "personal trainer [city]"
- Muay Thai gym: #1 in Bangkok
- Aesthetic clinic: #1 in Brazil

**Business Model Validation:**
- Service pricing validated: $1,000 setup + $400-500/month retention
- Micro-SaaS tier structure: $99/$299/$799 per month
- Revenue goal: $5,000 this month through beta launch

### Active

**V1 Scope - Freemium Onboarding:**
- [ ] Interactive quiz (authority-onboarding-funnel.html) - **EXISTS**
  - 9-step entity mapping flow
  - Authority scoring algorithm (0-100)
  - Dark minimal design (Geist fonts, #0A0A0A bg, #E8FF47 accent)
  - Calendly integration for booking
- [ ] Free page generation after quiz completion
  - Single SEO-optimized article from YouTube transcript
  - Demonstrates quality + speed
  - Conversion trigger to paid tiers

**V1 Scope - Core Automation:**
- [ ] YouTube OAuth connection
- [ ] Apify integration (channel scraper → video list → transcript extraction)
- [ ] n8n workflow orchestration (agentic pipeline)
- [ ] Claude API content transformation (Haiku for speed, Sonnet for quality)
- [ ] Article generation with schema markup (Article, Person, Organization, FAQ JSON-LD)
- [ ] Page publishing system (Ghost headless CMS OR Next.js MDX)

**V1 Scope - Self-Serve Product:**
- [ ] Template selection system
  - Multiple page designs (minimal, editorial, technical)
  - Preview before generation
  - Brand customization (colors, fonts, logo)
- [ ] Polar.sh payment integration
  - Self-serve signup + billing
  - Tier management ($99/$299/$799)
  - Usage tracking
- [ ] User dashboard
  - Generated pages list
  - Queue status for new pages
  - Add-on marketplace access

**V1 Scope - Add-On Marketplace:**
- [ ] Internal linking service
  - Semantic clustering of articles
  - Automated link injection
  - Topical authority graph building
- [ ] Link building service (productized)
  - Outreach automation
  - Quality backlink acquisition
  - Reporting dashboard
- [ ] SEO services bundle
  - Schema optimization
  - Entity mapping
  - AI visibility optimization
- [ ] Funnel page builder
  - Landing pages for creator's offers
  - Sales page templates
  - Calendly/payment integration
- [ ] Payment integration (for creator's products)
  - Stripe/Polar embed for creator's own products
  - Checkout page generation

**V1 Scope - Agentic Architecture:**
- [ ] Agent 1: YouTube Scraper (Apify → channel data)
- [ ] Agent 2: Transcript Cleaner (remove filler, structure content)
- [ ] Agent 3: Content Transformer (Claude → SEO article)
- [ ] Agent 4: Schema Builder (JSON-LD generation)
- [ ] Agent 5: Publisher (Ghost API or Next.js deployment)
- [ ] Agent 6: Indexing Monitor (Google Search Console integration)

### Out of Scope (V1)

**Deferred to V2+:**
- Manual delivery / agency services (full automation only)
- Custom design work (templates only)
- Non-YouTube platforms (Instagram, TikTok, LinkedIn, Podcasts)
- White-label reselling
- Multi-language support
- Video embedding (text-only for SEO)
- Real-time chat support (async only)

**Explicitly Excluded:**
- OAuth login (email/password sufficient for V1)
- Mobile app (web-first)
- Custom domain hosting (subdomains only: creator.platform.com)

## Context

### Market Opportunity

**Target Buyer:** YouTube creators with:
- 10K-150K subscribers
- Monetizing through offers (courses, coaching, services)
- Consistent upload schedule
- No personal website or weak SEO presence
- Invisible on Google search despite valuable content

**The Gap:** Creators produce hours of content weekly but own zero search real estate. They're discoverable on YouTube but invisible on Google/AI.

**Revenue Math:**
- Cold outreach: 100 DMs → 30 replies → 10 calls → 3-5 closes
- Beta pricing: $99-799/month per customer
- Goal: 5-10 paying customers = $5,000 MRR

### Creator Archetypes (Easiest to Sell)

1. **Course Creators** - High-ticket offers ($997-5K), need authority site
2. **Business Educators** - SaaS founders, consultants teaching online business
3. **AI Educators** - Tech YouTubers teaching AI/automation
4. **Finance Educators** - Personal finance, investing, crypto
5. **Health/Fitness Coaches** - Transformation-based offers
6. **Creative Entrepreneurs** - Design, writing, content creation
7. **Niche B2B Consultants** - Specialized industries (legal, medical, etc.)

### Authority Gap Audit (4 Signals)

**Used for sales qualification:**
1. Google presence (search "their name" + "their niche")
   - Page 1 result = +20 authority points
   - Exists but buried = +10 points
   - No results = 0 points
2. AI visibility (ChatGPT/Perplexity mentions)
   - Mentioned by name = +18 points
   - Generic/others mentioned = 0 points
3. Website quality
   - Professional + SEO = +18 points
   - Basic site = +8 points
   - No website = 0 points
4. Niche clarity
   - Clear positioning = +8 points

**Score 60+:** Strong authority, harder sell
**Score 20-40:** Perfect buyer (visible on YouTube, invisible on Google)

### User Journey (From Quiz → Paid Customer)

1. **Discovery:** Cold DM on X/Twitter or YouTube search
2. **Qualification:** Authority Gap Audit (5-minute Loom teardown)
3. **Onboarding:** Interactive quiz (authority-onboarding-funnel.html)
4. **Proof:** Generate 1 free page (demonstrate speed + quality)
5. **Template selection:** Choose page design
6. **Conversion:** Self-serve signup (Polar.sh checkout)
7. **Fulfillment:** Automated page generation via agentic pipeline
8. **Upsell:** Add-on marketplace (internal linking, link building, funnels)

## Constraints

### Technical

**Must Use (User-Specified Stack):**
- Apify (YouTube scraping actors)
- Polar.sh (developer-first payments/subscriptions)
- Next.js API routes + Vercel Cron Jobs (workflow orchestration - simpler than n8n)
- Claude API (content transformation)
- Next.js (frontend + API routes)
- Supabase (database + auth)

**Design System (From Existing Quiz):**
- Colors: `--bg: #0A0A0A`, `--surface: #141414`, `--accent: #E8FF47`
- Fonts: Geist (sans), Instrument Serif (display), Geist Mono (code)
- UI style: Dark minimal, card-based, chip selection patterns
- Animations: `cubic-bezier(.22,1,.36,1)` transitions

**Performance:**
- Free page generation: <15 minutes (acceptable for proof)
- Paid tier generation: <5 minutes per page
- Quiz completion: <3 minutes
- Template preview: Instant (<1s)

### Business

**Timeline:**
- Beta launch target: This month (March 2026)
- Revenue goal: $5,000 MRR in 30 days
- 4-week build sprint:
  - Week 1: Agentic pipeline (Apify → n8n → Claude → publish)
  - Week 2: Product wrapper (Next.js dashboard + Polar integration)
  - Week 3: Beta launch (10 lifetime deal customers)
  - Week 4: Iteration based on feedback

**Pricing Strategy:**
- Freemium: 1 free page (quiz completion)
- Self-serve tiers:
  - **Starter ($29/mo):** 5 pages/month, 1 template, basic SEO
  - **Pro ($99/mo):** 20 pages/month, all templates, schema markup, FAQ generation
  - **Authority ($1,299/mo):** Unlimited pages, all add-ons included, priority generation

**Add-On Pricing:**
- Internal linking: $29/mo (includes external links to authoritative sources)
- Link building: $99/mo (cold outreach automation + monthly report)
- SEO services bundle: $99/mo (FAQ schema, entity mapping, monthly audit) - included in Authority tier
- Funnel page builder: $99 per page (5 templates, Calendly + payment integration)
- Payment integration: $29 setup fee (Stripe/Polar OAuth for creator's products)

### Founder Capabilities

**Strengths:**
- 8 years SEO experience (ranked #1 for multiple terms)
- Product designer (UX/UI)
- 6 years startup experience
- Technical: Can build automation pipelines
- Validated service model (3 case studies)

**Gaps:**
- No existing audience (starting from 0)
- Cold outreach required for first customers
- No content marketing moat yet

## Key Decisions

### Build → Sell (Not Sell → Build)

**Decision:** Build micro-SaaS first, then acquire customers through beta launch.

**Reasoning:**
- Apify = pre-built scrapers (5-7 day build, not 3-4 weeks)
- Polar.sh = payments ready (no Stripe integration work)
- Agentic architecture = technical moat (hard to replicate)
- Self-serve model requires working product before sales

**Trade-off:** Delays revenue but enables scalable SaaS vs. manual service.

### Freemium with 1 Free Page (Not Lead Magnet)

**Decision:** Quiz generates actual product (1 SEO page), not just qualification.

**Reasoning:**
- Demonstrates quality instantly
- Proves automation works
- Reduces sales objection ("will this actually work?")
- Creates psychological investment (they see their content transformed)

**Trade-off:** Higher CAC (cost to deliver free page) but higher conversion rate.

### Add-On Marketplace (Not All-Inclusive)

**Decision:** Unbundle services into add-ons, not single subscription tier.

**Reasoning:**
- Higher LTV through cross-sell
- Flexible pricing (customers buy what they need)
- Enables testing new services without repricing core product
- Productized services (link building) have different margins

**Trade-off:** More complex product but better unit economics.

### Apify Over Custom Scrapers

**Decision:** Use Apify's pre-built YouTube actors instead of building scrapers.

**Reasoning:**
- 10x faster to ship (days vs. weeks)
- Handles rate limiting, proxies, anti-bot detection
- Maintained by Apify (no scraper maintenance burden)
- $49/mo cost justified by time savings

**Trade-off:** Dependency on third-party, but acceptable for V1 speed.

### Ghost Headless vs. Next.js MDX (TBD)

**Decision:** To be determined during build.

**Options:**
1. **Ghost Headless CMS:**
   - Pros: Built-in SEO, content management, themes
   - Cons: Extra infrastructure, less control
2. **Next.js MDX:**
   - Pros: Full control, fast static pages, integrated with dashboard
   - Cons: Build custom CMS features

**Deciding Factor:** Test both in Week 1, choose based on schema markup flexibility and generation speed.

### Next.js API Routes + Vercel Cron Over n8n

**Decision:** Use Next.js serverless functions + Vercel Cron Jobs for orchestration instead of n8n.

**Reasoning:**
- Simpler stack (no external orchestrator to maintain)
- Vercel Cron Jobs trigger queue processing every 5 minutes
- Serverless functions scale automatically
- Lower infrastructure complexity (fewer moving parts)
- Cost: $20/mo Vercel Pro (includes cron + 60s timeouts) vs. $20/mo VPS + DevOps time

**Trade-off:** Less visual workflow builder, but faster to ship and maintain.

---

## Open Questions

**Product:**
1. How many templates in V1? (Start with 3: Minimal, Editorial, Technical)
2. Which add-ons launch first? (Internal linking most valuable, start there)
3. Custom domain support timeline? (V2 - adds complexity)

**Technical:**
1. Ghost vs. Next.js MDX for publishing?
2. Supabase Edge Functions vs. Next.js API routes for automation triggers?
3. Real-time generation status (Supabase Realtime) or polling?

**Business:**
1. Beta pricing: Lifetime deal ($297 one-time) or discounted monthly ($49/mo)?
2. Refund policy for failed generations?
3. How to handle creators with no YouTube transcripts (auto-generated only)?

---

**Status:** Ready for requirements definition and roadmap creation.

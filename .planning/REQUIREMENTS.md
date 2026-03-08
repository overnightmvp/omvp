# Requirements: Authority Infrastructure Platform

**Defined:** 2026-03-06
**Core Value:** Turn YouTube content into compounding search authority without manual work—creators get Google/AI visibility through automation, not hiring.

## v1 Requirements

Requirements for beta launch (March 2026). Each maps to roadmap phases.

### Onboarding (ONBOARD)

- [ ] **ONBOARD-01**: User can access interactive quiz at /quiz route
- [ ] **ONBOARD-02**: Quiz preserves existing design system (dark minimal, Geist fonts, #E8FF47 accent)
- [ ] **ONBOARD-03**: Quiz captures all 9 steps: name/handle, platforms, niche, offers, Google/AI presence, brand tone, anti-vision, readiness
- [ ] **ONBOARD-04**: Quiz calculates authority score (0-100) using validated algorithm
- [ ] **ONBOARD-05**: Quiz result page displays score + interpretation
- [ ] **ONBOARD-06**: User can connect YouTube channel via OAuth after quiz completion
- [ ] **ONBOARD-07**: System generates 1 free SEO page from user's most popular YouTube video
- [ ] **ONBOARD-08**: User receives email notification when free page is ready (<15 min)
- [ ] **ONBOARD-09**: Free page preview includes CTA to choose template + upgrade to paid tier

### Authentication (AUTH)

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh
- [ ] **AUTH-05**: User can connect YouTube account via OAuth (read access only)
- [ ] **AUTH-06**: System stores YouTube channel ID and access token securely

### Automation Pipeline (AUTO)

- [x] **AUTO-01**: System scrapes YouTube channel data via Apify actor (channel metadata, video list) 
- [x] **AUTO-02**: System extracts transcripts for selected videos via Apify
- [ ] **AUTO-03**: n8n workflow orchestrates scrape → clean → transform → publish pipeline {i want to use openclaw or cron jobs the simpler the better}
- [ ] **AUTO-04**: Transcript cleaning agent removes filler words, timestamps, repeated phrases
- [ ] **AUTO-05**: Content transformation agent (Claude Sonnet) converts transcript to SEO article (1500-2500 words)
- [ ] **AUTO-06**: Article includes: headline, meta description, structured sections, keyword optimization, FAQ
- [ ] **AUTO-07**: Schema builder generates JSON-LD markup (Article, Person, Organization schemas, FAQ schema, entity)
- [ ] **AUTO-08**: Publisher agent deploys page to creator's subdomain (creator.platform.com)
- [ ] **AUTO-09**: Indexing monitor submits URL to Google Search Console
- [ ] **AUTO-10**: User can view generation queue status in dashboard (pending/processing/published)
- [ ] **AUTO-11**: System sends email notification when page is published
- [ ] **AUTO-12**: Failed generations are logged with error details and retry option

### Templates (TMPL)

- [ ] **TMPL-01**: User can preview 3 template styles: Minimal, Editorial, Technical
- [ ] **TMPL-02**: Template previews show actual generated content (not Lorem Ipsum)
- [ ] **TMPL-03**: User can select template during free page generation
- [ ] **TMPL-04**: User can change default template in account settings
- [ ] **TMPL-05**: All templates are mobile-responsive
- [ ] **TMPL-06**: All templates include schema markup placeholders
- [ ] **TMPL-07**: Templates support brand customization: primary color, logo upload, font pairing

### Dashboard (DASH)

- [ ] **DASH-01**: User can view list of all generated pages (title, URL, publish date, views)
- [ ] **DASH-02**: User can view generation queue (pending videos, ETA)
- [ ] **DASH-03**: User can manually trigger page generation for specific YouTube video
- [ ] **DASH-04**: User can preview generated pages before publishing (draft mode)
- [ ] **DASH-05**: User can edit page metadata (title, meta description) after generation
- [ ] **DASH-06**: User can delete published pages
- [ ] **DASH-07**: User can view analytics: total pages, total views (via GSC API), top-performing pages
- [ ] **DASH-08**: User can access add-on marketplace from dashboard sidebar
- [ ] **DASH-09**: User can view billing status and usage limits

### Payments (PAY)

- [ ] **PAY-01**: User can upgrade to paid tier via Polar.sh checkout
- [ ] **PAY-02**: System supports 3 subscription tiers: Starter ($29/mo), Pro ($99/mo), Authority ($1299/mo)
- [ ] **PAY-03**: Tier limits are enforced: Starter (5 pages/mo), Pro (20 pages/mo), Authority (unlimited)
- [ ] **PAY-04**: User can upgrade/downgrade tier mid-cycle (prorated billing)
- [ ] **PAY-05**: User can cancel subscription (access continues until period end)
- [ ] **PAY-06**: User receives invoice email after successful payment
- [ ] **PAY-07**: Failed payments trigger email notification with retry link
- [ ] **PAY-08**: System webhooks update user tier status in Supabase after Polar.sh events

### Add-Ons: Internal Linking (ADDON-IL)

- [ ] **ADDON-IL-01**: User can enable internal linking add-on ($29/mo)
- [ ] **ADDON-IL-02**: System analyzes semantic similarity between published pages
- [ ] **ADDON-IL-03**: System injects 3-5 contextual internal and external links per page
- [ ] **ADDON-IL-04**: Internal links use descriptive anchor text (not "click here")
- [ ] **ADDON-IL-05**: User can view topical authority graph (visualization of link structure)
- [ ] **ADDON-IL-06**: System updates internal links when new pages are published

### Add-Ons: Link Building (ADDON-LB)

- [ ] **ADDON-LB-01**: User can purchase link building add-on ($99/mo)
- [ ] **ADDON-LB-02**: System identifies target backlink opportunities (industry directories, guest posts)
- [ ] **ADDON-LB-03**: User receives monthly report: outreach sent, links acquired, domain authority
- [ ] **ADDON-LB-04**: System uses cold email automation for outreach (via user's email)
- [ ] **ADDON-LB-05**: User can approve/reject outreach templates before sending

### Add-Ons: Funnel Page Builder (ADDON-FPB)

- [ ] **ADDON-FPB-01**: User can create landing page for their offer ($99 per page)
- [ ] **ADDON-FPB-02**: System provides 5 funnel templates: Sales Page, Webinar Registration, Lead Magnet, Course Launch, Coaching Application
- [ ] **ADDON-FPB-03**: User can customize funnel page: headline, copy, CTA, images
- [ ] **ADDON-FPB-04**: Funnel pages integrate with Calendly for bookings
- [ ] **ADDON-FPB-05**: User can embed Stripe/Polar checkout for product sales
- [ ] **ADDON-FPB-06**: Funnel pages are published to creator.platform.com/offers/[slug]

### Add-Ons: SEO Services Bundle (ADDON-SEO)

- [ ] **ADDON-SEO-01**: User can enable SEO services bundle (included in Authority tier, $99/mo add-on for Pro)
- [ ] **ADDON-SEO-02**: System optimizes all pages for AI visibility (FAQ sections, entity mentions, clear answers)
- [ ] **ADDON-SEO-03**: System generates FAQ schema for common questions in creator's niche
- [ ] **ADDON-SEO-04**: System builds entity map (creator → topics → offers → related entities)
- [ ] **ADDON-SEO-05**: User receives monthly SEO audit: keyword rankings, AI mentions, schema coverage

### Add-Ons: Payment Integration (ADDON-PI)

- [ ] **ADDON-PI-01**: User can enable payment integration for their products ($29 setup fee)
- [ ] **ADDON-PI-02**: System connects user's Stripe or Polar.sh account
- [ ] **ADDON-PI-03**: User can create checkout pages for courses, coaching, digital products
- [ ] **ADDON-PI-04**: Checkout pages match creator's brand (template + customization)
- [ ] **ADDON-PI-05**: User receives sales notifications via email
- [ ] **ADDON-PI-06**: System displays sales analytics in dashboard (revenue, conversion rate)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Multi-Platform (PLATFORM)

- **PLATFORM-01**: User can connect Instagram account
- **PLATFORM-02**: User can connect TikTok account
- **PLATFORM-03**: User can connect LinkedIn account
- **PLATFORM-04**: User can connect podcast RSS feed
- **PLATFORM-05**: System generates pages from Instagram captions + images
- **PLATFORM-06**: System generates pages from TikTok video captions
- **PLATFORM-07**: System generates pages from LinkedIn posts
- **PLATFORM-08**: System generates pages from podcast transcripts

### Advanced Customization (CUSTOM)

- **CUSTOM-01**: User can use custom domain (creator.com instead of creator.platform.com)
- **CUSTOM-02**: User can fully customize template CSS
- **CUSTOM-03**: User can inject custom JavaScript (tracking, chat widgets)
- **CUSTOM-04**: User can create custom page layouts (drag-and-drop builder)

### Content Management (CMS)

- **CMS-01**: User can manually write articles (not just generated)
- **CMS-02**: User can schedule page publishing (future dates)
- **CMS-03**: User can A/B test headlines and meta descriptions
- **CMS-04**: User can set up content calendar for automated publishing

### Collaboration (COLLAB)

- **COLLAB-01**: User can invite team members (editor, viewer roles)
- **COLLAB-02**: User can approve generated pages before publishing (workflow)
- **COLLAB-03**: User can leave comments on draft pages

### Advanced Analytics (ANALYTICS)

- **ANALYTICS-01**: User can view keyword ranking history (track over time)
- **ANALYTICS-02**: User can view backlink profile (acquired links, anchor text)
- **ANALYTICS-03**: User can view AI mention tracking (ChatGPT/Perplexity citations)
- **ANALYTICS-04**: User can export analytics data (CSV, API)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Manual delivery / agency services | Full automation only (micro-SaaS model, not service) |
| Custom design work | Templates only (no 1-on-1 design) |
| Video embedding for SEO | Text-only for search optimization (video is YouTube's job) |
| Real-time chat support | Async support only (email, help docs) - resource constraint |
| White-label reselling | Direct-to-creator only (v1) |
| Multi-language support | English only (v1) - translation adds complexity |
| Mobile app | Web-first (responsive PWA sufficient) |
| OAuth login (Google, GitHub) | Email/password sufficient for v1 |
| Custom domain hosting (v1) | Subdomains only (creator.platform.com) - DNS complexity |
| Video generation | Content-only (no video creation from articles) |
| Social media auto-posting | Focus on SEO, not social distribution |
| AI chatbot training on content | Out of scope (separate product category) |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ONBOARD-01 to ONBOARD-09 | Phase 1 | Pending |
| AUTH-01 to AUTH-06 | Phase 1 | Pending |
| AUTO-01 to AUTO-12 | Phase 2 | Pending |
| TMPL-01 to TMPL-07 | Phase 3 | Pending |
| DASH-01 to DASH-09 | Phase 3 | Pending |
| PAY-01 to PAY-08 | Phase 4 | Pending |
| ADDON-IL-01 to ADDON-IL-06 | Phase 5 | Pending |
| ADDON-FPB-01 to ADDON-FPB-06 | Phase 5 | Pending |
| ADDON-SEO-01 to ADDON-SEO-05 | Phase 5 | Pending |
| ADDON-LB-01 to ADDON-LB-05 | Phase 6 | Pending |
| ADDON-PI-01 to ADDON-PI-06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 77 total
- Mapped to phases: 77
- Unmapped: 0 ✓

---

*Requirements defined: 2026-03-06*
*Last updated: 2026-03-06 after initial definition*

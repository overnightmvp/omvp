# 🏢 Service Providers & Alternatives

Detailed guide to each external service used in the automation pipeline, with pricing, alternatives, and recommendations.

---

## Database & Authentication

### Supabase (Current)

**What it does:** PostgreSQL database + auth + real-time + storage

**Pricing:**
- Free: Unlimited projects, 500 MB storage, 5 concurrent connections
- Pro: $25/month, 8 GB storage, 100 connections

**Free tier limits:**
- Storage: 500 MB (compressed)
- Database: 1.3 GB
- API requests: Rate limited
- Connections: 5 concurrent

**When free tier isn't enough:**
- > 1.3 GB total data
- > 100k API requests/day
- Need > 5 concurrent database connections

**Recommended for:**
- Startups and MVP projects ✅
- Teams with < 10k users
- Projects prioritizing speed to market

**Alternatives:**
- **Firebase/Firestore** - No-code, real-time, weak relational queries
- **MongoDB Atlas** - Document database, good for unstructured data
- **Railway** - Managed Postgres, simpler but fewer features
- **PlanetScale** - MySQL serverless, good MySQL alternative

**Recommendation:** Keep Supabase for this project
- PostgreSQL needed for structured data
- RLS provides natural user isolation
- Auth integration straightforward
- Cost-effective at current scale

---

## YouTube Integration

### YouTube Data API v3 (Current)

**What it does:** OAuth authentication, video metadata, channel info, statistics

**Pricing:**
- Free: Unlimited requests (quotas apply)
- No paid tier (Google Cloud pricing if using premium features)

**Free tier limits:**
- Quota: 10,000 units/day
- Per video metadata: ~100-500 units
- Estimate: 20-100 videos/day with free quota

**When you'd need more:**
- > 100 videos/day
- Storing complete video history
- Premium analytics

**Recommended for:**
- Most applications ✅
- Competitors, influencers, research

**Alternatives:**
- **YouTube Transcript API** - Python library for transcripts only
- **Apify YouTube Scraper** - Web scraping (not official API)
- **Yt-dlp** - Video downloading utility

**Recommendation:** Keep YouTube Data API v3
- Official API with stability guarantee
- Built-in transcript support
- Reliable and widely used
- OAuth handles user authentication naturally

---

## AI Content Generation

### Claude Sonnet 4.5 (Current)

**What it does:** LLM for generating SEO articles from transcript

**Pricing:**
- Input: $3/million tokens
- Output: $15/million tokens
- ~2,000 input tokens + 1,500 output tokens per page
- Cost: ~$0.03-0.05 per page generation

**Estimated monthly cost:**
- 100 pages: $3-5
- 1,000 pages: $30-50
- 10,000 pages: $300-500

**When cost becomes prohibitive:**
- > 1,000 generations/month
- Need sub-$0.01 cost per page

**Recommended for:**
- High-quality content ✅
- Professional/corporate use
- SEO-focused applications

**Alternatives:**
- **GPT-4o** ($0.005/$0.015 per 1k tokens) - Cheaper but lower quality
- **Llama 3.1 (open source)** - Free but self-hosted
- **Groq API** - Very fast inference, pricing varies
- **Hugging Face Inference API** - Open models, pay per usage

**Recommendation:** Keep Claude Sonnet 4.5
- Best quality for SEO content
- Excellent prompt following
- Reliable and professional output
- Affordable at current scale

**Cost optimization:**
- Use prompt caching (25% token savings)
- Batch requests during off-peak hours
- Monitor usage dashboard

---

## Video Scraping

### Apify (Current)

**What it does:** YouTube video scraping (metadata + transcripts)

**Pricing:**
- Free: $5/month credit (no commitment)
- Plans: $29, $99, $499, $999/month

**Free tier performance:**
- ~25-100 videos/month (depends on video length)
- ~1-5 concurrent jobs
- Public actor usage

**When you'd need paid tier:**
- > 100 videos/month consistently
- Need dedicated instances
- Custom scraping requirements

**Recommended for:**
- MVP and testing ✅
- Batch scraping projects
- YouTube-specific data

**Alternatives:**
- **Yt-dlp** - Open source, local installation, free but manual setup
- **SerpAPI YouTube Plugin** - API-based, $50/month minimum
- **Oxylabs YouTube Scraper** - Premium quality, $100+/month
- **Bright Data** - Enterprise scraping, $500+/month

**Cost comparison:**
| Solution | Free | Monthly | Per 1k pages |
|----------|------|---------|-------------|
| Apify | $5 | $29-999 | Variable |
| Yt-dlp | Free | $0 | $0 |
| SerpAPI | $0 | $50+ | ~$0.05 |
| Oxylabs | $0 | $100+ | ~$0.10 |

**Recommendation:** Start with Apify free tier
- Excellent for MVP
- If costs escalate, switch to yt-dlp self-hosted
- Mix both: use Apify for premium content, yt-dlp for bulk

---

## Email Notifications

### Resend (Current)

**What it does:** Transactional email service

**Pricing:**
- Free: 100 emails/day (unlimited days)
- Pro: $20/month (pay-as-you-go)
- Enterprise: Custom pricing

**Free tier limits:**
- 100 emails/day
- 1 domain
- Basic analytics
- **Best for:** MVP, testing, low-volume notifications

**When you'd outgrow free:**
- > 100 emails/day
- Need advanced analytics
- Dedicated IP needed

**Recommended for:**
- Notifications ✅
- Transactional emails
- Startups and MVPs

**Alternatives:**
| Service | Free | Price | Best For |
|---------|------|-------|----------|
| Resend | 100/day | $20/mo | Developers, modern |
| SendGrid | $0 | $10/mo | Enterprises, flexibility |
| Mailgun | $0 | $0.50 per 1k | Volume, reliability |
| AWS SES | Free tier | $0.10 per 1k | High volume, AWS stack |
| Brevo | Unlimited | $20/mo | Marketing + transactional |

**Recommendation:** Keep Resend
- Developer-friendly API
- Beautiful email templates
- Best free tier (100/day)
- React component support for emails

**Cost optimization:**
- 100 free emails/day is enough for most startups
- If needed, switch to SendGrid at $20/month for unlimited

---

## Search Engine Indexing

### Google Search Console API (Current)

**What it does:** Submit pages for Google indexing, track search performance

**Pricing:**
- Free: Unlimited submissions
- Note: Some limitations apply (see below)

**Free tier limitations:**
- Indexing API limited to: JobPosting, BroadcastEvent only
- Article pages: Use URL Inspection tool (manual)
- Batch jobs not available in free tier
- IndexNow alternative for other search engines

**Current implementation:**
- MVP: Logging submissions (not API submission)
- Future: Can switch to IndexNow API (Bing/Yandex)

**Recommended for:**
- Google integration ✅
- Official source for search data
- Free tier sufficient for MVP

**Alternatives:**
| Service | Cost | Coverage | Best For |
|---------|------|----------|----------|
| Google Search Console | Free | Google only | Official integration |
| IndexNow API | Free | Bing, Yandex | Multi-engine |
| Bing Webmaster Tools | Free | Bing, Yahoo | Bing optimization |
| Ahrefs | $99+ | All engines | Enterprise |
| SEMrush | $120+ | All engines | Competitor analysis |

**Recommendation:** Keep Google Search Console
- Free for all functionality we need
- Use IndexNow API for Bing/Yandex (future phase)
- Manual submission via Search Console UI for article pages

**Future enhancement:**
- Add IndexNow API integration for multi-engine support
- Monitor Indexing API for Article page support

---

## Job Queue & Scheduling

### QStash/Upstash (Current)

**What it does:** Serverless message queue with built-in scheduling

**Pricing:**
- Free: 3,000 requests/month, 1 day retention
- Pro: $25/month (100k requests)
- Pay-as-you-go: $0.35 per 1M requests

**Free tier limits:**
- 3,000 requests/month (100/day)
- 1 day message retention
- No FIFO guarantees
- **Sufficient for:** MVP with < 100 page generations/day

**When you'd outgrow free:**
- > 3,000 queue jobs/month
- Need longer message retention
- Need priority queues

**Recommended for:**
- Serverless functions ✅
- Vercel deployment
- Lightweight queue needs

**Alternatives:**
| Service | Free | Price | Best For |
|---------|------|-------|----------|
| QStash | 3k/mo | $25/mo | Serverless, simple |
| AWS SQS | 1M/mo | $0.40 per 1M | AWS stack, high volume |
| Supabase Realtime | Free | $25/mo | Real-time, DB-native |
| IronMQ | Free | $15/mo | Independent queue |
| Bull Queue | Free | $0 | Self-hosted Redis |

**Recommendation:** Keep QStash for MVP
- Perfect for Vercel + serverless
- Free tier handles 100+ page/day
- Upgrade path clear if needed
- No infrastructure needed

**Cost projection:**
- 100 pages/month: Free tier
- 1,000 pages/month: Free tier ($25/mo if needed)
- 10,000 pages/month: $50-100/mo with Pro

---

## Overall Architecture Cost

### Monthly Cost Breakdown (Conservative Estimate)

**MVP Phase (100 pages/month):**
```
Supabase Free:           $0
Claude Sonnet:           $3-5 (100 pages × $0.03-0.05)
Apify:                   $0 (free tier)
Resend:                  $0 (free tier 100/day)
Google Search Console:   $0
QStash:                  $0 (free tier)
YouTube Data API:        $0 (free tier)
────────────────────────────────
TOTAL:                   $3-5/month
```

**Growth Phase (1,000 pages/month):**
```
Supabase Pro:            $25 (upgraded)
Claude Sonnet:           $30-50
Apify Pro:               $29-99
Resend Pro:              $0-20
Google Search Console:   $0
QStash:                  $0-25
YouTube Data API:        $0
────────────────────────────────
TOTAL:                   $84-219/month
```

**Scale Phase (10,000 pages/month):**
```
Supabase Team:           $100+
Claude Sonnet:           $300-500
Apify Enterprise:        $500+
Resend Pro:              $20-100
Google Search Console:   $0
QStash Pro:              $25+
YouTube Data API:        $0
────────────────────────────────
TOTAL:                   $945-1,345/month
```

---

## Decision Matrix: Keeping vs Switching

| Service | Keep? | Reason | Alternative If Needed |
|---------|-------|--------|----------------------|
| Supabase | ✅ Yes | PostgreSQL needed, cost-effective | Firebase, Railway |
| YouTube Data API | ✅ Yes | Official, reliable, free | Yt-dlp, Apify |
| Claude Sonnet | ✅ Yes | Best quality, affordable | GPT-4o, Llama 3.1 |
| Apify | ✅ Yes | Easy MVP, good free tier | Yt-dlp, SerpAPI |
| Resend | ✅ Yes | Best free tier for email | SendGrid, Mailgun |
| Google Search Console | ✅ Yes | Official, free | IndexNow, Ahrefs |
| QStash | ✅ Yes | Serverless-native, simple | Bull Queue, AWS SQS |

---

## Migration Considerations

### If switching to open-source/self-hosted:

**Apify → Yt-dlp:**
- Cost: $0 (free)
- Effort: Medium (setup Node.js runner)
- Maintenance: High (scraper breaks with YouTube changes)
- Best for: Large scale, cost-sensitive

**Claude → Llama 3.1:**
- Cost: $0 (self-hosted) or ~$0.005 (inference)
- Effort: High (setup infrastructure)
- Maintenance: Medium (fine-tuning for SEO)
- Best for: Privacy-focused, high volume

**QStash → Bull Queue:**
- Cost: $0 (just Redis)
- Effort: Medium (setup Redis, worker processes)
- Maintenance: Medium (queue management)
- Best for: High customization needs

---

## Monitoring & Cost Management

### Key Metrics to Track

1. **Claude API Usage**
   - Monitor: `/console.anthropic.com/settings/usage`
   - Alert: Set budget limit to $100/month

2. **Apify Credits**
   - Monitor: Apify console monthly
   - Alert: Stop generation if < $1 remaining

3. **Resend Emails Sent**
   - Monitor: Resend dashboard
   - Alert: Configure daily limit

4. **QStash Requests**
   - Monitor: Upstash console
   - Alert: Track against 3k/month free limit

5. **Supabase Usage**
   - Monitor: Supabase dashboard
   - Alert: Storage + connections

### Monthly Review Checklist

- [ ] Check Claude API spend vs budget
- [ ] Review Apify credits remaining
- [ ] Verify no unexpected charges
- [ ] Check email delivery metrics
- [ ] Monitor queue processing times
- [ ] Review database size growth

---

## Recommendations for Different Scenarios

### Scenario 1: Just Building MVP
**Choose:** Free/cheap tier for everything
- Supabase Free
- Claude Sonnet (cheapest good model)
- Apify Free ($5)
- Resend Free (100/day)
- QStash Free (3k/month)
- **Total: ~$3-5/month**

### Scenario 2: Growing Startup (1k pages/month)
**Choose:** Mix free and Pro tiers
- Supabase Pro ($25)
- Claude Sonnet (budget $50)
- Apify Pro ($29+)
- Resend Free (still under 100/day)
- QStash Free/Pro ($0-25)
- **Total: ~$100-150/month**

### Scenario 3: Scaling Company (10k+ pages/month)
**Choose:** Enterprise options or self-host
- Consider self-hosted Postgres
- Evaluate Llama 3.1 self-hosted
- Use Yt-dlp for scraping
- Evaluate AWS stack
- **Total: Variable, likely $500+/month**

---

**Last Updated:** 2026-03-08
**Service Providers:** 7 total
**Free tier cost:** $0-5/month
**Recommended cost:** $3-5/month (MVP)

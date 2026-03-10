# Phase 2: Automation Pipeline - Research

**Researched:** 2026-03-07
**Domain:** Serverless workflow orchestration, YouTube content extraction, AI content generation, SEO publishing
**Confidence:** HIGH

## Summary

Phase 2 implements the core value proposition of the platform: automated conversion of YouTube videos into SEO-optimized pages. The automation pipeline consists of 6 agents orchestrated via Next.js API routes and Vercel Cron Jobs (replacing the initially proposed n8n).

The research validates the technical feasibility of building a serverless agentic pipeline using proven technologies: Apify for YouTube scraping, Claude API for content transformation, QStash for reliable background job processing, and Vercel's serverless infrastructure for orchestration. The existing Phase 1 infrastructure (Supabase schema, YouTube OAuth, generation queue) provides the foundation needed.

Key finding: A simplified serverless architecture using Next.js API routes + QStash + Vercel Cron Jobs will be more maintainable and cost-effective than n8n orchestration, while providing the same reliability through QStash's built-in retries and 5-minute Vercel function timeouts with Fluid Compute.

**Primary recommendation:** Implement a queue-based architecture where Vercel Cron Jobs poll the generation_queue table every 5 minutes, spawn serverless functions for each agent (scrape → clean → transform → build schema → publish → index), and use QStash for long-running jobs like Claude API content generation to avoid timeout issues.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTO-01 | System scrapes YouTube channel data via Apify actor | Apify YouTube Scraper and YouTube Ultimate Scraper provide channel metadata and video lists via RESTful API |
| AUTO-02 | System extracts transcripts for selected videos via Apify | YouTube Full Channel Transcripts Extractor and multiple transcript actors available, support multiple language variants |
| AUTO-03 | Vercel Cron Jobs + Next.js orchestrate pipeline (not n8n) | Vercel Cron Jobs trigger every 5 minutes via vercel.json config, QStash handles background job reliability |
| AUTO-04 | Transcript cleaning agent removes filler words, timestamps, repeated phrases | NLP-based transcript cleaners use GPT-4 for filler detection, TranscriptCleaner API available, common filler words list documented |
| AUTO-05 | Content transformation agent (Claude Sonnet) converts transcript to SEO article (1500-2500 words) | Claude Sonnet 4.5 ($3 input / $15 output per million tokens) with 1M context window, batch API for 50% discount on non-urgent work |
| AUTO-06 | Article includes: headline, meta description, structured sections, keyword optimization, FAQ | Claude prompt engineering for SEO structure, FAQ generation validated in use cases |
| AUTO-07 | Schema builder generates JSON-LD markup (Article, Person, Organization, FAQ, entity) | JSON-LD is Google's recommended format, schema generators and validation tools available, Article/Person/Organization/FAQ schemas well-documented |
| AUTO-08 | Publisher agent deploys page to creator's subdomain (creator.platform.com) | Next.js middleware-based subdomain routing well-established, Vercel supports wildcard domains |
| AUTO-09 | Indexing monitor submits URL to Google Search Console | Google Indexing API limited to JobPosting/BroadcastEvent, use URL Inspection Tool's "Request Indexing" via Search Console API instead |
| AUTO-10 | User can view generation queue status in dashboard | Existing generation_queue table supports status tracking, 30-second polling implemented in Phase 1 |
| AUTO-11 | System sends email notification when page is published | Resend API integrated in Phase 1, transactional email templates ready |
| AUTO-12 | Failed generations are logged with error details and retry option | generation_queue table has error_message field and retry_count, implement exponential backoff retry logic |
| ONBOARD-07 | System generates 1 free SEO page from user's most popular YouTube video | getMostPopularVideo() implemented in Phase 1, video selection logic ready |
| ONBOARD-08 | User receives email notification when free page is ready (<15 min) | Resend email templates created in Phase 1, 15-minute SLA feasible with current architecture |
| ONBOARD-09 | Free page preview includes CTA to choose template + upgrade to paid tier | Template selection CTA added to quiz results in Phase 1, page preview system needed |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Apify SDK | Latest | YouTube data extraction | Industry-standard web scraping platform, bypasses anti-bot measures, no API quota limits unlike YouTube Data API |
| QStash (Upstash) | Latest | Serverless message queue | Built for serverless environments, automatic retries, no persistent connections needed, 500 free messages/day |
| Anthropic Claude API | Sonnet 4.5 / Haiku 4.5 | Content transformation | Best-in-class for SEO content generation, 1M context window for long transcripts, prompt caching cuts costs by 90% |
| Resend | Latest | Transactional emails | Already integrated in Phase 1, modern developer-first API, React Email support |
| Google APIs (googleapis) | v144+ | YouTube OAuth & Search Console | Already integrated in Phase 1 for YouTube connection, official Google SDK |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | v3.24+ | Validation for API responses | Already in project, validate Apify/Claude responses before saving to DB |
| Next.js rewrites | v16.1+ | Subdomain routing | Built into Next.js, use middleware for dynamic subdomain handling |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| QStash | BullMQ + Redis | BullMQ requires managing Redis infrastructure, more control but higher complexity |
| QStash | Inngest | Similar features, $25/mo minimum vs QStash's free tier, both work well with Next.js |
| Apify | Custom scrapers | 10x faster to ship with Apify, avoid anti-bot detection work, acceptable cost ($49/mo) |
| Vercel Cron | Railway scheduled tasks | Railway requires separate deployment, Vercel keeps everything in one platform |
| Claude API | GPT-4 | Claude better for long-form content (1M context vs 128K), better citation/structure adherence |

**Installation:**

```bash
# Apify SDK for YouTube scraping
npm install apify-client

# QStash SDK for background jobs
npm install @upstash/qstash

# Already installed (from Phase 1):
# - resend (emails)
# - googleapis (YouTube OAuth)
# - zod (validation)
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── api/
│       ├── cron/
│       │   └── process-queue/      # Vercel Cron endpoint
│       ├── generation/
│       │   ├── scrape/             # Agent 1: YouTube scraper
│       │   ├── clean/              # Agent 2: Transcript cleaner
│       │   ├── transform/          # Agent 3: Content transformer
│       │   ├── schema/             # Agent 4: Schema builder
│       │   ├── publish/            # Agent 5: Publisher
│       │   └── index/              # Agent 6: Indexing monitor
├── lib/
│   ├── agents/
│   │   ├── scraper.ts              # Apify integration
│   │   ├── cleaner.ts              # Transcript cleaning logic
│   │   ├── transformer.ts          # Claude API integration
│   │   ├── schema-builder.ts       # JSON-LD generation
│   │   ├── publisher.ts            # Page deployment
│   │   └── indexer.ts              # Search Console API
│   ├── queue/
│   │   ├── qstash.ts               # QStash client config
│   │   └── orchestrator.ts         # Agent coordination logic
│   └── generation-queue.ts         # (exists from Phase 1)
└── content/
    └── pages/                       # Generated MDX files (if using file-based)
```

### Pattern 1: Queue-Based Orchestration (Recommended)

**What:** Vercel Cron Job polls Supabase every 5 minutes, finds pending items, spawns agent pipeline for each.

**When to use:** Serverless environments where long-running processes need reliability without persistent connections.

**Example:**

```typescript
// src/app/api/cron/process-queue/route.ts
// Source: Vercel Cron Jobs documentation + QStash pattern
import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@upstash/qstash'

const qstash = new Client({ token: process.env.QSTASH_TOKEN! })

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get pending queue items from Supabase
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('generation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .limit(5) // Process 5 at a time

  // Enqueue each item to QStash for reliable processing
  for (const item of items || []) {
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/generation/orchestrate`,
      body: { queueItemId: item.id },
      retries: 3,
    })
  }

  return NextResponse.json({ processed: items?.length || 0 })
}
```

### Pattern 2: Agent Pipeline with QStash

**What:** Each agent is a serverless function that processes one step, then triggers the next via QStash.

**When to use:** When individual steps may take >60 seconds (Vercel timeout), use QStash to chain them reliably.

**Example:**

```typescript
// src/app/api/generation/orchestrate/route.ts
// Source: QStash chaining pattern
export async function POST(request: NextRequest) {
  const { queueItemId } = await request.json()

  // Update status to 'processing'
  await updateQueueStatus(queueItemId, 'processing')

  // Step 1: Scrape video data
  const videoData = await scrapeYouTubeVideo(queueItemId)

  // Step 2: Clean transcript (enqueue to QStash for reliability)
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/generation/clean`,
    body: { queueItemId, videoData },
    retries: 2,
  })

  return NextResponse.json({ status: 'pipeline_started' })
}
```

### Pattern 3: Subdomain Routing with Middleware

**What:** Use Next.js middleware to rewrite requests from creator.platform.com to /[creator]/[slug].

**When to use:** Multi-tenant applications where each user gets a subdomain.

**Example:**

```typescript
// middleware.ts
// Source: Next.js subdomain routing patterns
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]

  // Skip if main domain or localhost
  if (subdomain === 'platform' || hostname.includes('localhost')) {
    return NextResponse.next()
  }

  // Rewrite to /pages/[creator]/[slug]
  const pathname = request.nextUrl.pathname
  return NextResponse.rewrite(
    new URL(`/pages/${subdomain}${pathname}`, request.url)
  )
}

export const config = {
  matcher: ['/((?!api|_next|_static|favicon.ico).*)'],
}
```

### Pattern 4: Prompt Caching for Cost Optimization

**What:** Use Claude's prompt caching to cache system prompts across requests, reducing costs by 90%.

**When to use:** When using consistent system prompts for content generation across multiple videos.

**Example:**

```typescript
// src/lib/agents/transformer.ts
// Source: Anthropic prompt caching documentation
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function transformTranscriptToArticle(
  transcript: string,
  videoMetadata: any
) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    system: [
      {
        type: 'text',
        text: 'You are an expert SEO content writer...',
        cache_control: { type: 'ephemeral' }, // Cache this prompt
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Transform this transcript into a 1500-2500 word SEO article:\n\n${transcript}`,
      },
    ],
  })

  return response.content[0].text
}
```

### Anti-Patterns to Avoid

- **Long-running synchronous API routes:** Vercel has 15-second default timeout (60s max on Pro). Use QStash for tasks >60 seconds.
- **Polling without exponential backoff:** 30-second polling is fine for UI, but backend polling should use exponential backoff to avoid rate limits.
- **Storing API keys in client-side code:** Always use server-side API routes for Apify/Claude/Resend keys.
- **Not validating Apify responses:** Apify can return incomplete data if scraping fails; always validate with Zod schemas.
- **Hardcoded subdomain logic:** Use environment variables for domain configuration to support local development (localhost:3000) and production (platform.com).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YouTube scraping | Custom scraper with Puppeteer | Apify YouTube actors | Anti-bot detection, rate limiting, proxy rotation, CAPTCHA solving — all handled by Apify. Custom scrapers break constantly. |
| Transcript cleaning | Regex-based filler word removal | GPT-4 or Claude for cleaning | Filler words are context-dependent ("like" as filler vs. "like this approach"). LLMs understand context. |
| Background job queue | In-memory queue or cron loops | QStash or Inngest | Serverless functions are stateless. In-memory queues reset on cold starts. QStash persists state. |
| Email templates | HTML string concatenation | Resend with React Email | Type-safe components, preview in browser, responsive by default. HTML strings are unmaintainable. |
| Schema markup generation | Manual JSON building | Schema.org generators + validation | Hundreds of schema types with specific requirements. Generators ensure compliance. |
| Subdomain SSL/DNS | Manual cert management | Vercel wildcard domains | Automatic SSL cert generation, DNS propagation, HTTPS redirect. Manual SSL is DevOps overhead. |

**Key insight:** This phase involves 5 distinct domains (scraping, NLP, AI content, SEO markup, DNS routing). Hand-rolling any of them delays launch by weeks and creates ongoing maintenance burden. Use proven services.

## Common Pitfalls

### Pitfall 1: Vercel Serverless Function Timeout

**What goes wrong:** Claude API content generation can take 60-90 seconds for 2500-word articles, causing Vercel functions to timeout.

**Why it happens:** Default Vercel timeout is 15 seconds (Pro plan: 60 seconds max without Fluid Compute).

**How to avoid:**
- Use QStash to offload long-running Claude API calls to background jobs
- Enable Vercel Fluid Compute for Pro plan (up to 800 seconds / 13 minutes)
- Use Claude batch API for 50% cost savings on non-urgent generations (24-hour processing)

**Warning signs:**
- "504 Gateway Timeout" errors in /api/generation/transform
- Queue items stuck in "processing" state with no error message

### Pitfall 2: Apify Rate Limits and Costs

**What goes wrong:** Hitting Apify rate limits or unexpected high costs from running too many actors concurrently.

**Why it happens:** Apify charges per compute unit (CU). YouTube scraping can use 0.05-0.2 CU per video depending on actor complexity.

**How to avoid:**
- Start with Apify's $49/mo plan (includes 50 CU/month = ~250-1000 videos)
- Implement queue throttling: max 5 concurrent generations
- Cache video metadata in Supabase to avoid re-scraping
- Use Apify's "YouTube Scraper" (cheaper) instead of "YouTube Ultimate Scraper" for basic video lists

**Warning signs:**
- Apify returning "Insufficient credits" errors
- Monthly costs >$100 with <50 pages generated

### Pitfall 3: Google Indexing API Misuse

**What goes wrong:** Attempting to use Google Indexing API for general SEO pages (blog posts, articles).

**Why it happens:** Google's Indexing API documentation is confusing; it's limited to JobPosting and BroadcastEvent structured data only.

**How to avoid:**
- Do NOT use Indexing API for article pages
- Use Google Search Console API's URL Inspection Tool "Request Indexing" feature instead
- Submit XML sitemap updates via Search Console API
- For faster indexing: submit to IndexNow (Bing/Yandex) which Google may crawl

**Warning signs:**
- Google Indexing API returning 403 Forbidden or "Unsupported content type" errors

### Pitfall 4: Subdomain Routing in Local Development

**What goes wrong:** Subdomain routing works in production (creator.platform.com) but fails in local development (localhost:3000).

**Why it happens:** Browsers don't support wildcard subdomains on localhost without manual /etc/hosts configuration.

**How to avoid:**
- Use URL query params for local testing: localhost:3000/pages?creator=username
- Or use a service like ngrok for local subdomain testing
- Middleware should detect localhost and skip subdomain rewrite logic
- Environment variable: ENABLE_SUBDOMAIN_ROUTING=false for local dev

**Warning signs:**
- Middleware rewriting localhost URLs incorrectly
- 404 errors on localhost that work in production

### Pitfall 5: Transcript Quality Issues

**What goes wrong:** Videos without manual transcripts return poor-quality auto-generated captions, producing bad articles.

**Why it happens:** YouTube auto-captions have ~10-20% error rate, missing punctuation, speaker diarization.

**How to avoid:**
- Detect if transcript is auto-generated (Apify returns this metadata)
- Show warning in UI: "This video has auto-generated captions. Quality may be lower."
- Add transcript quality check: reject if >50% of words are <3 characters (gibberish indicator)
- Offer manual transcript upload as fallback

**Warning signs:**
- Articles with nonsensical sentences or missing punctuation
- User complaints about "weird wording"

### Pitfall 6: Claude API Cost Spirals

**What goes wrong:** Claude Sonnet costs $15 per million output tokens. A 2500-word article = ~3300 tokens, costing $0.05 per article (acceptable), but testing/retries can spiral costs.

**Why it happens:** Development iterations, failed generations with retries, no cost monitoring.

**How to avoid:**
- Use Claude Haiku ($5/M output tokens) for development and testing
- Implement cost tracking: log token usage per generation to Supabase
- Set monthly budget alerts via Anthropic dashboard
- Use prompt caching to reduce input costs by 90%
- Batch API for non-urgent work (50% discount)

**Warning signs:**
- Monthly Claude API bill >$200 with <100 pages generated
- Anthropic API key suddenly rate-limited

### Pitfall 7: Schema Markup Validation Failures

**What goes wrong:** Generated JSON-LD schema fails Google's Rich Results Test due to missing required fields.

**Why it happens:** Article schema requires specific fields (headline, image, datePublished, author) that may not exist in transcript metadata.

**How to avoid:**
- Always validate schema with Google's Rich Results Test API before publishing
- Use schema.org documentation for required vs. recommended fields
- Default values: use placeholder author (creator's name from YouTube), current date for datePublished, generate OG image if none exists
- Test with https://validator.schema.org/ and Google's Rich Results Test

**Warning signs:**
- "Missing required field" errors in Search Console
- Rich results not appearing in Google search after 2 weeks

## Code Examples

Verified patterns from official sources:

### Vercel Cron Job Configuration

```json
// vercel.json
// Source: https://vercel.com/docs/cron-jobs/manage-cron-jobs
{
  "crons": [
    {
      "path": "/api/cron/process-queue",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Apify YouTube Video Scraping

```typescript
// src/lib/agents/scraper.ts
// Source: Apify SDK documentation
import { ApifyClient } from 'apify-client'

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

export async function scrapeYouTubeVideo(videoUrl: string) {
  // Run the YouTube Scraper actor
  const run = await client.actor('streamers/youtube-scraper').call({
    startUrls: [{ url: videoUrl }],
    maxResults: 1,
    // Request both metadata and transcript
    subtitlesLanguage: 'en',
    subtitlesFormat: 'text',
  })

  // Fetch results from dataset
  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  return items[0] // Returns { title, description, transcript, viewCount, etc. }
}
```

### QStash Job Enqueue with Retries

```typescript
// src/lib/queue/qstash.ts
// Source: QStash documentation
import { Client } from '@upstash/qstash'

const qstash = new Client({ token: process.env.QSTASH_TOKEN! })

export async function enqueueContentGeneration(queueItemId: string) {
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/generation/transform`,
    body: { queueItemId },
    retries: 3,
    delay: 0, // Start immediately
    callback: `${process.env.NEXT_PUBLIC_SITE_URL}/api/generation/callback`,
  })
}
```

### Claude API Content Generation with Streaming

```typescript
// src/lib/agents/transformer.ts
// Source: Anthropic API documentation
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateSEOArticle(
  transcript: string,
  videoTitle: string,
  videoDescription: string
) {
  const systemPrompt = `You are an expert SEO content writer. Transform YouTube video transcripts into comprehensive, well-structured SEO articles (1500-2500 words).

Requirements:
- Compelling H1 headline (50-60 characters, includes primary keyword)
- Meta description (150-160 characters, compelling call-to-action)
- Introduction paragraph (150 words, hooks reader)
- 5-7 H2 sections with supporting paragraphs
- FAQ section with 5-7 common questions and detailed answers
- Conclusion with clear call-to-action
- Use markdown formatting
- Natural keyword integration (avoid keyword stuffing)
- Conversational yet authoritative tone`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' }, // Cache system prompt
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Video Title: ${videoTitle}

Video Description: ${videoDescription}

Transcript:
${transcript}

Generate a comprehensive SEO article based on this content.`,
      },
    ],
  })

  let article = ''
  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      article += event.delta.text
    }
  }

  return article
}
```

### JSON-LD Schema Generation

```typescript
// src/lib/agents/schema-builder.ts
// Source: Schema.org and Google Rich Results documentation
interface SchemaMarkup {
  article: any
  person: any
  organization: any
  faq: any
}

export function generateSchemaMarkup(
  article: {
    headline: string
    content: string
    author: string
    publishedDate: string
    modifiedDate: string
    imageUrl?: string
  },
  creator: {
    name: string
    url: string
    sameAs: string[] // Social media profiles
  },
  faqData: Array<{ question: string; answer: string }>
): SchemaMarkup {
  return {
    article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      description: article.content.substring(0, 160),
      image: article.imageUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
      datePublished: article.publishedDate,
      dateModified: article.modifiedDate,
      author: {
        '@type': 'Person',
        name: article.author,
        url: creator.url,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Authority Platform',
        logo: {
          '@type': 'ImageObject',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
        },
      },
    },
    person: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: creator.name,
      url: creator.url,
      sameAs: creator.sameAs,
    },
    faq: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqData.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  }
}
```

### Resend Email Notification

```typescript
// src/lib/agents/notifier.ts
// Source: Resend documentation (already in Phase 1)
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPageReadyEmail(
  userEmail: string,
  pageUrl: string,
  pageTitle: string
) {
  await resend.emails.send({
    from: 'Authority Platform <noreply@platform.com>',
    to: userEmail,
    subject: `Your SEO page is ready: ${pageTitle}`,
    html: `
      <h2>Your SEO page has been published!</h2>
      <p><strong>${pageTitle}</strong></p>
      <p>Your page is now live and ready to be indexed by Google.</p>
      <a href="${pageUrl}" style="background: #E8FF47; color: #0A0A0A; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0;">View Your Page</a>
      <p>Next steps:</p>
      <ul>
        <li>Share on social media to build initial traffic</li>
        <li>Submit to Google Search Console for faster indexing</li>
        <li>Consider upgrading for more pages and templates</li>
      </ul>
    `,
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| n8n for workflow orchestration | Next.js API routes + Vercel Cron + QStash | 2025-2026 | Simpler serverless stack, no external orchestrator, same reliability through QStash |
| YouTube Data API (10K daily quota) | Apify scrapers (no quota limits) | Ongoing | Unlimited scraping, no API key rotation, better data extraction |
| GPT-4 for long-form content | Claude Sonnet with 1M context | Late 2024 | Better handling of long transcripts (20K+ words), improved citation/structure |
| Manual SSL cert management for subdomains | Vercel wildcard domains | 2023+ | Automatic SSL for all subdomains, zero DevOps overhead |
| SendGrid/Mailgun for emails | Resend with React Email | 2024+ | Type-safe email templates, better deliverability, modern DX |

**Deprecated/outdated:**
- **n8n self-hosted orchestration:** Cloud version expensive ($50+/mo), self-hosted requires VPS maintenance. QStash is serverless-native.
- **YouTube Data API for bulk scraping:** 10K daily quota exhausted quickly (100 video fetches = 10K units). Apify has no quotas.
- **Regex-based transcript cleaning:** Context-unaware, misses nuanced filler words. GPT-4/Claude understand conversational context.
- **Ghost headless CMS for this use case:** Adds infrastructure complexity (separate Ghost instance), overkill for automated generation. Next.js MDX simpler for programmatic publishing.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (configured for Next.js) |
| Config file | vitest.config.ts (create in Wave 0) |
| Quick run command | `npm run test -- --run` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTO-01 | Apify scrapes YouTube channel data | integration | `npm run test -- src/lib/agents/scraper.test.ts -x` | ❌ Wave 0 |
| AUTO-02 | Apify extracts video transcripts | integration | `npm run test -- src/lib/agents/scraper.test.ts -x` | ❌ Wave 0 |
| AUTO-03 | Vercel Cron triggers queue processing | integration | `npm run test -- src/app/api/cron/process-queue/route.test.ts -x` | ❌ Wave 0 |
| AUTO-04 | Transcript cleaner removes filler words | unit | `npm run test -- src/lib/agents/cleaner.test.ts -x` | ❌ Wave 0 |
| AUTO-05 | Claude generates 1500-2500 word article | integration | `npm run test -- src/lib/agents/transformer.test.ts -x` | ❌ Wave 0 |
| AUTO-06 | Article has headline, meta, FAQ sections | unit | `npm run test -- src/lib/agents/transformer.test.ts -x` | ❌ Wave 0 |
| AUTO-07 | Schema builder generates valid JSON-LD | unit | `npm run test -- src/lib/agents/schema-builder.test.ts -x` | ❌ Wave 0 |
| AUTO-08 | Publisher deploys page to subdomain | integration | `npm run test -- src/lib/agents/publisher.test.ts -x` | ❌ Wave 0 |
| AUTO-09 | Indexing monitor submits to Search Console | integration | `npm run test -- src/lib/agents/indexer.test.ts -x` | ❌ Wave 0 |
| AUTO-10 | Dashboard shows queue status | e2e | Manual — use Playwright if automated | ❌ manual-only |
| AUTO-11 | Email sent when page published | integration | `npm run test -- src/lib/agents/notifier.test.ts -x` | ❌ Wave 0 |
| AUTO-12 | Failed generations logged with error | unit | `npm run test -- src/lib/queue/orchestrator.test.ts -x` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test -- --run` (fast unit tests only, <30s)
- **Per wave merge:** `npm run test` (full suite including integration tests)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — Configure Vitest for Next.js with path aliases
- [ ] `tests/setup.ts` — Mock Supabase, Apify, Claude API clients
- [ ] `src/lib/agents/scraper.test.ts` — Test Apify integration with mocked responses
- [ ] `src/lib/agents/transformer.test.ts` — Test Claude API with fixture transcripts
- [ ] `src/lib/agents/schema-builder.test.ts` — Test JSON-LD generation with snapshots
- [ ] Framework install: `npm install -D vitest @vitest/ui` — if none detected

## Sources

### Primary (HIGH confidence)

**Apify YouTube Scraping:**
- [YouTube Scraper · Apify](https://apify.com/streamers/youtube-scraper)
- [The Ultimate Guide to YouTube Data Scraping in 2026 | Use Apify](https://use-apify.com/blog/youtube-scraper-tutorial-2026)
- [YouTube Full Channel Transcripts Extractor · Apify](https://apify.com/karamelo/youtube-full-channel-transcripts-extractor)

**Vercel Cron Jobs & Serverless:**
- [Managing Cron Jobs | Vercel Docs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
- [How to Set Up Cron Jobs on Vercel](https://vercel.com/guides/how-to-setup-cron-jobs-on-vercel)
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations)
- [What can I do about Vercel Functions timing out? | Vercel Knowledge Base](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out)

**QStash Background Jobs:**
- [Background Jobs - Upstash Documentation](https://upstash.com/docs/qstash/features/background-jobs)
- [Getting started with QStash and Next.js](https://brockherion.dev/blog/posts/getting-started-with-qstash-and-nextjs/)
- [QStash: Messaging for the Serverless | Upstash Blog](https://upstash.com/blog/qstash-announcement)

**Claude API:**
- [Anthropic Claude API Pricing February 2026: Opus 4.6 $5/M, Sonnet $3/M, Haiku $1/M - DevTk.AI](https://devtk.ai/en/blog/claude-api-pricing-guide-2026/)
- [Pricing - Claude API Docs](https://platform.claude.com/docs/en/about-claude/pricing)
- [Introducing Claude Haiku 4.5](https://www.anthropic.com/news/claude-haiku-4-5)

**JSON-LD Schema:**
- [JSON-LD Schema Markup: A Quick Guide to Boost SEO in 2026](https://qtonix.com/blog/how-to-add-json-ld-schema-markup/)
- [FAQ ( FAQPage , Question , Answer ) structured data](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- [Schema Markup Examples: Copy-Paste JSON-LD for Every Page Type (2026)](https://schemavalidator.org/guides/schema-markup-examples)

**Google Search Console API:**
- [Indexing API Quickstart | Google Search Central](https://developers.google.com/search/apis/indexing-api/v3/quickstart)
- [How to Use the Indexing API | Google Search Central](https://developers.google.com/search/apis/indexing-api/v3/using-api)

**Resend Email API:**
- [Send emails with Next.js · Resend](https://resend.com/nextjs)
- [How to Send Emails in Next.js (App Router, 2026) | Sequenzy](https://www.sequenzy.com/blog/send-emails-nextjs)

**Next.js Subdomain Routing:**
- [Subdomain-Based Routing in Next.js: A Complete Guide for Multi-Tenant Applications | by Sheharyarishfaq | Medium](https://medium.com/@sheharyarishfaq/subdomain-based-routing-in-next-js-a-complete-guide-for-multi-tenant-applications-1576244e799a)
- [Master Next.js Subdomain Routing Using Middleware](https://blog.cloud-way.dev/mastering-subdomains-in-nextjs-with-middleware)

### Secondary (MEDIUM confidence)

**Transcript Cleaning:**
- [Transcript Processing Workflow: 5 AI Prompts for Clean ...](https://brasstranscripts.com/blog/transcript-processing-workflow-complete-guide-2026)
- [Transcript Cleaner – Remove Timestamps, Filler Words & Speaker Labels (Free Online)](https://transcriptcleaner.org/)

**Ghost vs MDX:**
- [Best Next.js Headless CMS Platforms in 2026](https://prismic.io/blog/best-nextjs-headless-cms-platforms)
- [Using Ghost as a Headless CMS with Next.js](https://draft.dev/learn/using-ghost-as-a-headless-cms)

### Tertiary (LOW confidence)

**SEO Content Generation:**
- [I Used Claude Code to Add SEO to My Next.js Site. 48 Hours Later, I Had Global Traffic — Zero Paid Marketing. | by Chirag T | Feb, 2026 | Medium](https://medium.com/@chiragthummar16/i-used-claude-code-to-add-seo-to-my-next-js-e59290525118) — Anecdotal case study
- [Claude vs Frase (2026): AI Content Briefs & SEO Optimization Compared](https://www.ranktracker.com/blog/claude-vs-frase-2026/) — Third-party comparison

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries verified through official documentation and 2026-dated sources
- Architecture: HIGH — Vercel Cron + QStash pattern is well-established for Next.js serverless
- Pitfalls: MEDIUM-HIGH — Based on official docs and community discussions, but some edge cases from experience reports

**Research date:** 2026-03-07
**Valid until:** 2026-05-07 (60 days — serverless/SaaS ecosystem evolves quickly)

**Technology maturity:**
- Apify: Mature (founded 2015), stable API
- QStash: Newer (2021) but production-ready, active development
- Claude API: Mature (2023+), frequent model updates
- Vercel Cron: Mature (2021), stable feature
- Next.js 16: Latest stable, App Router established (2023+)

**Key assumptions:**
- Vercel Pro plan required ($20/mo) for Cron Jobs and extended timeouts
- Apify $49/mo plan sufficient for <100 videos/month
- Claude API costs ~$0.05-0.10 per article (acceptable unit economics)
- Subdomain SSL handled automatically by Vercel (no manual cert management)

**Open questions resolved:**
1. ✅ Ghost vs MDX → **Recommendation: Next.js MDX** (simpler for programmatic generation, no extra infrastructure)
2. ✅ n8n vs serverless orchestration → **Use Vercel Cron + QStash** (simpler stack, same reliability)
3. ✅ Real-time vs polling → **30-second polling** (already implemented in Phase 1, sufficient UX)
4. ✅ Google Indexing API limitations → **Use Search Console URL Inspection instead** (Indexing API limited to JobPosting/BroadcastEvent only)

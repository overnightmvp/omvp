# 📚 Automation Pipeline Documentation

Complete guide to setting up, configuring, and managing the Phase 02 automation pipeline.

---

## 🎯 Quick Start

**New to this project?** Start here:

1. **[SETUP-QUICK-REFERENCE.md](./SETUP-QUICK-REFERENCE.md)** (10 min read)
   - 10-step checklist to get running
   - All API keys needed
   - Verification steps
   - Common issues

2. **[SETUP.md](./SETUP.md)** (45-60 min to complete)
   - Detailed step-by-step guide for each service
   - Screenshots and navigation tips
   - Database initialization
   - Local testing procedures

3. **[ENV-VARIABLES.md](./ENV-VARIABLES.md)** (reference)
   - All 14 environment variables explained
   - What each one does
   - Where to get it
   - Rotation schedule

---

## 📖 Documentation Map

### Setup & Initialization
- **[SETUP.md](./SETUP.md)** — Complete step-by-step setup guide (45-60 min)
  - Supabase database configuration
  - YouTube OAuth setup
  - Claude API key
  - Apify SDK integration
  - Resend email service
  - Google Search Console
  - QStash job queue
  - Database initialization
  - Testing setup
  - Local development

- **[SETUP-QUICK-REFERENCE.md](./SETUP-QUICK-REFERENCE.md)** — Quick checklist (5 min)
  - 10-step summary
  - Quick troubleshooting
  - Success indicators
  - Free tier limits

### Configuration
- **[ENV-VARIABLES.md](./ENV-VARIABLES.md)** — Environment variable reference
  - All 14 variables explained
  - Usage by component
  - Rotation schedule
  - Best practices
  - Troubleshooting

- **[SERVICE-PROVIDERS.md](./SERVICE-PROVIDERS.md)** — Service guide
  - Each provider explained
  - Pricing models
  - Free tier limits
  - Alternatives
  - Cost breakdown
  - Migration paths

---

## 🔑 Environment Variables (14 Total)

### Database & Auth (3)
- `NEXT_PUBLIC_SUPABASE_URL` — Database URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Client API key (public)
- `SUPABASE_SERVICE_ROLE_KEY` — Server API key (secret)

### Site Config (2)
- `NEXT_PUBLIC_SITE_URL` — Application base URL
- `NEXT_PUBLIC_ROOT_DOMAIN` — Root domain for subdomains

### YouTube Integration (2)
- `YOUTUBE_CLIENT_ID` — OAuth client ID
- `YOUTUBE_CLIENT_SECRET` — OAuth secret

### AI Generation (1)
- `ANTHROPIC_API_KEY` — Claude API key

### Video Scraping (1)
- `APIFY_API_TOKEN` — Apify SDK token

### Email (1)
- `RESEND_API_KEY` — Resend email service

### Search Indexing (1)
- `GOOGLE_SERVICE_ACCOUNT_KEY` — Service account JSON

### Job Queue (2)
- `QSTASH_TOKEN` — Queue authentication
- `QSTASH_CURRENT_SIGNING_KEY` — Request signature verification
- `QSTASH_NEXT_SIGNING_KEY` — Key rotation support

### Security (1)
- `CRON_SECRET` — Cron job authentication

---

## 🏢 Service Providers

| Service | Purpose | Free Tier | Cost | Status |
|---------|---------|-----------|------|--------|
| **Supabase** | Database | Yes | $25/mo | ✅ Recommended |
| **YouTube API** | OAuth + metadata | Yes | Free | ✅ Recommended |
| **Claude Sonnet** | Content generation | No | $0.03-0.05/page | ✅ Recommended |
| **Apify** | Video scraping | Yes ($5) | $29/mo+ | ✅ Recommended |
| **Resend** | Email notifications | Yes (100/day) | $20/mo | ✅ Recommended |
| **Google Search Console** | Indexing | Yes | Free | ✅ Recommended |
| **QStash** | Job queue | Yes (3k/mo) | $25/mo+ | ✅ Recommended |

**Total MVP Cost:** $3-5/month (everything on free tier + Claude)

---

## 🚀 Getting Started Paths

### Path 1: I Just Want to Run It (15 min)
1. Read [SETUP-QUICK-REFERENCE.md](./SETUP-QUICK-REFERENCE.md)
2. Get credentials from each service (from checklist)
3. Fill in `.env.local`
4. Run `npm run dev`
5. Test at `/quiz`

### Path 2: I Want to Understand Everything (2 hours)
1. Read [SETUP.md](./SETUP.md) in full
2. Read [ENV-VARIABLES.md](./ENV-VARIABLES.md) for details
3. Read [SERVICE-PROVIDERS.md](./SERVICE-PROVIDERS.md) for context
4. Set up each service following detailed steps
5. Run full test suite

### Path 3: I Want to Optimize Costs (1 hour)
1. Read [SERVICE-PROVIDERS.md](./SERVICE-PROVIDERS.md)
2. See cost breakdown tables
3. Evaluate alternatives
4. Decision matrix to decide what to keep/switch
5. Plan migration if needed

---

## 🛠️ Setup Checklist

### Prerequisites (5 min)
- [ ] Node.js 18+ installed
- [ ] Git configured
- [ ] Text editor ready

### Create External Accounts (20 min)
- [ ] Supabase account
- [ ] Google Cloud account
- [ ] Anthropic account
- [ ] Apify account
- [ ] Resend account
- [ ] Upstash account

### Get Credentials (15 min)
- [ ] Supabase URL + 2 keys
- [ ] YouTube OAuth ID + secret
- [ ] Claude API key
- [ ] Apify token
- [ ] Resend API key
- [ ] Google service account JSON
- [ ] QStash token + 2 signing keys

### Configure Application (5 min)
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in all 14 environment variables
- [ ] Run `npm run db:push`
- [ ] Run `npm run test`
- [ ] Run `npm run dev`

### Verify Installation (5 min)
- [ ] Dev server starts
- [ ] Health check passes
- [ ] Can access `/quiz`
- [ ] YouTube OAuth redirects work
- [ ] All tests pass (60+)

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Application                         │
│  Quiz Completion → YouTube OAuth → Page Generation Request  │
└────┬────────────────────────────────────────────────────────┘
     │
     ├─► Queue System (QStash)
     │
     ├─► Step 1: YouTube Scraper (Apify)
     │      └─► Extract: Title, Description, Transcript
     │
     ├─► Step 2: Content Transformer (Claude Sonnet)
     │      └─► Generate: 1500-2500 word SEO article + FAQ
     │
     ├─► Step 3: Schema Builder
     │      └─► Create: JSON-LD markup (Article, Person, FAQ)
     │
     ├─► Step 4: Publisher (Middleware routing)
     │      └─► Publish: creator.domain.com/slug
     │
     ├─► Step 5: Indexing (Google Search Console)
     │      └─► Submit: Page for Google indexing
     │
     └─► Step 6: Email Notification (Resend)
            └─► Send: Completion email to user

     Database: Supabase PostgreSQL
     Storage: generated_pages table with RLS
```

---

## 🔍 Component Documentation

| Component | File | Purpose | Docs |
|-----------|------|---------|------|
| Test Setup | `tests/setup.ts` | Mocked external services | 02-00-SUMMARY.md |
| YouTube Scraper | `src/lib/agents/scraper.ts` | Extract video + transcript | 02-01-SUMMARY.md |
| Content Generator | `src/lib/agents/transformer.ts` | Generate SEO article | 02-02-SUMMARY.md |
| Schema Builder | `src/lib/agents/schema-builder.ts` | Create JSON-LD markup | 02-03-SUMMARY.md |
| Publisher | `src/app/pages/[creator]/[slug]/page.tsx` | Publish pages | 02-04-SUMMARY.md |
| Queue Orchestrator | `src/lib/queue/orchestrator.ts` | Coordinate pipeline | 02-05-SUMMARY.md |
| Indexer | `src/lib/agents/indexer.ts` | Submit to Google | 02-06-SUMMARY.md |
| Notifier | `src/lib/agents/notifier.ts` | Send emails | 02-06-SUMMARY.md |

---

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Expected Output
```
✓ 60+ tests passing
✓ All mocks verified
✓ Full coverage
```

### Test Files Location
- `tests/setup.ts` — Shared mocks
- `tests/unit/mocks.test.ts` — Mock verification
- `tests/lib/agents/*.test.ts` — Agent tests
- `tests/lib/queue/*.test.ts` — Queue tests

---

## 🔐 Security Best Practices

1. **Never Commit Secrets**
   - `.env.local` is in `.gitignore`
   - Never share keys in messages
   - Use `git secrets` to prevent accidents

2. **Rotate Keys Regularly**
   - Quarterly: API keys
   - 90 days: Google service account keys
   - Annually: OAuth secrets

3. **Use Secure Storage**
   - Password manager for backups (1Password, Bitwarden)
   - Encrypted USB for disaster recovery
   - Separate keys per environment

4. **Monitor Permissions**
   - Google service account: Editor role (minimize in production)
   - Supabase service role: Schema ownership only
   - QStash: Specific queue access

---

## 📈 Monitoring & Maintenance

### Daily
- Check error logs for failed generations
- Monitor email delivery (Resend dashboard)

### Weekly
- Review API usage metrics
- Check queue processing time
- Verify published pages rendering

### Monthly
- Audit Claude API spending
- Check Apify credits remaining
- Review database storage growth
- Rotate any expiring keys

### Quarterly
- Rotate all API keys
- Review service tier adequacy
- Update environment variables
- Test disaster recovery process

---

## 🆘 Getting Help

### Documentation
- **SETUP.md** — Step-by-step walkthrough
- **ENV-VARIABLES.md** — Variable reference
- **SERVICE-PROVIDERS.md** — Service details

### Phase Summaries
- `02-00-SUMMARY.md` — Test infrastructure
- `02-01-SUMMARY.md` — YouTube scraper
- `02-02-SUMMARY.md` — Content generation
- `02-03-SUMMARY.md` — Schema builder
- `02-04-SUMMARY.md` — Page publisher
- `02-05-SUMMARY.md` — Queue orchestrator
- `02-06-SUMMARY.md` — Indexing & email

### Common Issues

**"API key not found"**
→ Check `.env.local` exists and is readable

**"Connection refused"**
→ Verify Supabase project is active

**"Build fails with type errors"**
→ Run `npm run typecheck` to see all errors

**"Tests failing"**
→ Run `npm install` to ensure mocks are loaded

**"Email not sending"**
→ Verify domain in Resend is verified

---

## 📚 Additional Resources

- **Phase 02 Roadmap:** `.planning/ROADMAP.md`
- **Project State:** `.planning/STATE.md`
- **Requirements:** `.planning/REQUIREMENTS.md`
- **Phase Summaries:** `.planning/phases/02-automation-pipeline/`

---

## ✅ Setup Completion Checklist

- [ ] Read SETUP-QUICK-REFERENCE.md
- [ ] Create all 7 external accounts
- [ ] Get all 14 API credentials
- [ ] Create and fill `.env.local`
- [ ] Run database migrations
- [ ] All tests passing (60+)
- [ ] Dev server runs
- [ ] Health check passes
- [ ] Quiz page loads
- [ ] YouTube OAuth works
- [ ] Can request page generation

---

**Start with:** [SETUP-QUICK-REFERENCE.md](./SETUP-QUICK-REFERENCE.md)

**Time estimate:** 45-60 minutes to complete setup

**Questions?** Check the relevant summary in `.planning/phases/02-automation-pipeline/`

**Estimated Cost:** $3-5/month on free tiers

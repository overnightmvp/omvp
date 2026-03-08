# 🚀 Automation Pipeline Setup Checklist

Complete initialization guide for the Phase 02 automation pipeline. Follow each section to set up external services and configure API keys.

---

## 📋 Prerequisites

- [ ] Node.js 18+ installed
- [ ] PostgreSQL/Supabase project created
- [ ] Google Cloud project with Search Console access
- [ ] Estimated time: 45-60 minutes
- [ ] All API keys will be stored in `.env.local` (never commit to git)

---

## 1️⃣ Supabase Setup (Database & Authentication)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Configure:
   - **Name:** `astro-build` (or your preference)
   - **Database Password:** Generate strong password (save securely)
   - **Region:** Choose closest to your location
4. Click "Create new project" (waits 5-10 minutes for initialization)

### Step 2: Get Supabase Credentials

1. Once project is created, go to **Settings** → **API**
2. Copy these values and add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (KEEP SECRET)
   ```

**Checklist:**
- [ ] Project created
- [ ] API credentials copied to `.env.local`
- [ ] Test connection: Run `npm run typecheck` (should pass)

---

## 2️⃣ YouTube OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable **YouTube Data API v3**:
   - Click "Search for APIs"
   - Find "YouTube Data API v3"
   - Click "Enable"

### Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. If prompted, configure OAuth consent screen first:
   - User Type: **External**
   - App name: `Astro Build`
   - User support email: your email
   - Developer contact: your email
   - **Scopes to add:** `https://www.googleapis.com/auth/youtube.readonly`
4. Back to Credentials, create **Web Application**:
   - Name: `Astro Build YouTube OAuth`
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/youtube/callback
     https://yourdomain.com/api/auth/youtube/callback
     ```
5. Copy **Client ID** and **Client Secret**

**Add to `.env.local`:**
```
YOUTUBE_CLIENT_ID=xxxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-xxxxx
```

**Checklist:**
- [ ] Google Cloud project created
- [ ] YouTube Data API v3 enabled
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs configured for localhost AND production
- [ ] Credentials saved to `.env.local`

---

## 3️⃣ Claude API Setup (Content Generation)

### Step 1: Get Anthropic API Key

1. Go to [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Sign in with your Anthropic account (create if needed)
3. Click **"Create Key"** (or use existing)
4. Copy the key starting with `sk-ant-`

**Add to `.env.local`:**
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### Step 2: Verify Model Access

- Ensure your account has access to **Claude Sonnet 4.5** (model: `claude-sonnet-4-20250514`)
- Free tier includes monthly allowance; check usage at console

**Checklist:**
- [ ] API key created
- [ ] Key starts with `sk-ant-`
- [ ] Added to `.env.local`
- [ ] Account has Claude Sonnet 4.5 access

---

## 4️⃣ Apify Setup (YouTube Scraping)

### Step 1: Create Apify Account

1. Go to [https://apify.com](https://apify.com) and sign up
2. Free tier includes **$5 credit** (enough for 25-100 videos)

### Step 2: Get API Token

1. Go to **Account** → **Integrations**
2. Find **API tokens** section
3. Click **"Create token"** (or copy existing)
4. Scope: **Full access**
5. Copy token (starts with `apify_api_`)

**Add to `.env.local`:**
```
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxx
```

### Step 3: Test the YouTube Scraper Actor

1. Search for actor: **`streamers/youtube-scraper`** in Apify store
2. Click on it to view documentation
3. Save the actor name for reference

**Checklist:**
- [ ] Apify account created
- [ ] Free tier $5 credit confirmed
- [ ] API token created
- [ ] Token saved to `.env.local`
- [ ] YouTube scraper actor identified

---

## 5️⃣ Email Service Setup (Resend)

### Step 1: Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up with your email
3. Free tier includes 100 emails/day

### Step 2: Configure Sending Domain

1. Go to **Domains**
2. Add your domain or use `resend.dev` subdomain
3. Add DNS records if using custom domain
4. Verify domain

### Step 3: Get API Key

1. Go to **API Keys**
2. Click **"Create API Key"**
3. Copy key (starts with `re_`)

**Add to `.env.local`:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Step 4: Update Sender Email

In code (`src/lib/agents/notifier.ts`), the from email should be:
```typescript
from: 'noreply@yourdomain.com' // or noreply@resend.dev if using subdomain
```

**Checklist:**
- [ ] Resend account created
- [ ] Domain configured
- [ ] API key created
- [ ] API key saved to `.env.local`
- [ ] Sender email configured in code

---

## 6️⃣ Google Search Console Setup (Indexing)

### Step 1: Set Up Search Console

1. Go to [https://search.google.com/search-console](https://search.google.com/search-console)
2. Add your domain or subdomain property
3. Verify ownership (choose your preferred method)
4. Once verified, note your domain URL

### Step 2: Create Service Account

1. Go back to [https://console.cloud.google.com](https://console.cloud.google.com)
2. In same project as YouTube OAuth
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"Service Account"**
5. Name: `Astro Build Indexing`
6. Grant role: **Editor** (for MVP; restrict later in production)

### Step 3: Create Service Account Key

1. Click on created service account
2. Go to **Keys** tab
3. Click **"Add Key"** → **"Create new key"** → **"JSON"**
4. A JSON file downloads
5. Copy the entire JSON content

**Add to `.env.local`:**
```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...entire JSON..."}
```

### Step 4: Grant Search Console Access

1. Go to [https://search.google.com/search-console](https://search.google.com/search-console)
2. Go to your property → **Settings** → **Users and permissions**
3. Click **"Add user"**
4. Add service account email (from JSON file): `xxxx@yyyy.iam.gserviceaccount.com`
5. Grant **Full** access

**Checklist:**
- [ ] Search Console property created and verified
- [ ] Service account created
- [ ] Service account key generated (JSON)
- [ ] JSON key content saved to `.env.local`
- [ ] Service account added to Search Console with Full access

---

## 7️⃣ QStash Setup (Job Queue)

### Step 1: Create Upstash Account

1. Go to [https://upstash.com](https://upstash.com)
2. Sign up (free tier available)
3. Choose **QStash** product

### Step 2: Create QStash Token

1. Go to **QStash** → **API Keys**
2. Copy **Token** (never expires unless rotated)
3. Copy **Current Signing Key** and **Next Signing Key**

**Add to `.env.local`:**
```
QSTASH_TOKEN=xxxx_xxxxx_xxxxx
QSTASH_CURRENT_SIGNING_KEY=xxxx_xxxxx_xxxxx
QSTASH_NEXT_SIGNING_KEY=xxxx_xxxxx_xxxxx
```

### Step 3: (Optional) Configure Callback URL

For production, update QStash with your callback URL:
- Callback URL: `https://yourdomain.com/api/generation/orchestrate`
- Used by QStash to verify request signatures

**Checklist:**
- [ ] Upstash account created
- [ ] QStash product accessed
- [ ] API Token copied to `.env.local`
- [ ] Signing keys copied to `.env.local`

---

## 8️⃣ Site Configuration

### Step 1: Set Site URLs

**Development:**
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
```

**Production (update before deploying):**
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com
```

### Step 2: Generate Cron Secret

Generate a secure random string for cron job authentication:
```bash
openssl rand -base64 32
```

Copy output and add to `.env.local`:
```
CRON_SECRET=your-generated-secret
```

**Checklist:**
- [ ] `NEXT_PUBLIC_SITE_URL` set correctly
- [ ] `NEXT_PUBLIC_ROOT_DOMAIN` set correctly
- [ ] `CRON_SECRET` generated and saved

---

## 9️⃣ Environment File Setup

### Create `.env.local`

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

### Fill in All Values

Update with credentials from sections 1-8:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000

# YouTube OAuth
YOUTUBE_CLIENT_ID=xxxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-xxxxx

# Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Google Search Console API
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Apify API
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxx

# Cron Job Security
CRON_SECRET=base64-generated-secret

# QStash Configuration
QSTASH_TOKEN=xxxx_xxxxx_xxxxx
QSTASH_CURRENT_SIGNING_KEY=xxxx_xxxxx_xxxxx
QSTASH_NEXT_SIGNING_KEY=xxxx_xxxxx_xxxxx
```

**Checklist:**
- [ ] `.env.local` created from `.env.local.example`
- [ ] All 12 environment variables filled in
- [ ] `.env.local` added to `.gitignore` (prevent accidental commits)
- [ ] File is readable by the application

---

## 🔟 Database Initialization

### Step 1: Apply Migrations

```bash
npm run db:push
```

This creates all tables:
- `youtube_connections` - User YouTube OAuth tokens
- `generation_queue` - Pipeline job tracking
- `generated_pages` - Published SEO pages
- `generated_pages_content` - Page content (markdown)

### Step 2: Verify Tables

In Supabase dashboard:
1. Go to **SQL Editor**
2. Run: `SELECT tablename FROM pg_tables WHERE schemaname='public';`
3. Verify these tables exist:
   - `youtube_connections`
   - `generation_queue`
   - `generated_pages`
   - `generated_pages_content`

**Checklist:**
- [ ] Database migrations applied
- [ ] All 4 tables created
- [ ] Tables have correct columns (run `\d tablename` to inspect)

---

## 🧪 Test Infrastructure

### Run Test Suite

```bash
npm run test
```

Expected output:
```
✓ tests/setup.ts (mock verification - 7 tests)
✓ tests/unit/mocks.test.ts (7 tests)
✓ tests/lib/agents/scraper.test.ts (6 tests)
✓ tests/lib/agents/transformer.test.ts (7 tests)
✓ tests/lib/agents/schema-builder.test.ts (8 tests)
✓ tests/lib/agents/indexer.test.ts (7 tests)
✓ tests/lib/agents/notifier.test.ts (7 tests)
✓ tests/lib/queue/orchestrator.test.ts (11 tests)

Total: 60 tests passing
```

### Fix Type Errors

If any type errors:
```bash
npm run typecheck
```

**Checklist:**
- [ ] All 60+ tests passing
- [ ] No TypeScript errors
- [ ] Build succeeds: `npm run build`

---

## 🚀 Local Development

### Start Dev Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Test Each Service

#### 1. Test Database Connection
```bash
curl http://localhost:3000/api/health
```
Should return `{"status":"ok"}`

#### 2. Test YouTube OAuth
1. Navigate to `http://localhost:3000/quiz`
2. Click "Connect YouTube Account"
3. Should redirect to Google OAuth flow
4. After login, should return to quiz

#### 3. Test Page Generation Queue
1. Complete quiz and select a video
2. Request free page generation
3. Check job appears in `generation_queue` table
4. Monitor generation progress

#### 4. Test Email Notifications
1. Force-complete a generation (for testing)
2. Check email received at your address
3. Verify email contains published page link

#### 5. Test Published Page
1. From email, click published page link
2. Or visit `creator.localhost:3000/slug` directly
3. Page should load with:
   - Headline and content
   - JSON-LD schemas in `<head>`
   - FAQ section

**Checklist:**
- [ ] Dev server starts without errors
- [ ] Health check endpoint works
- [ ] YouTube OAuth redirects correctly
- [ ] Queue jobs are created
- [ ] Emails are received
- [ ] Published pages are accessible

---

## 📊 API Key Summary Table

| Service | Type | Format | Required | Notes |
|---------|------|--------|----------|-------|
| Supabase | Database | URL + Keys | ✅ Yes | 2 keys (anon + service) |
| YouTube | OAuth | Client ID + Secret | ✅ Yes | Needs redirect URIs |
| Claude | LLM API | Bearer token | ✅ Yes | Starts with `sk-ant-` |
| Apify | Scraping API | Bearer token | ✅ Yes | Free $5 credit |
| Resend | Email API | Bearer token | ✅ Yes | Free 100/day |
| Google | Search Console | Service account JSON | ✅ Yes | Entire JSON object |
| QStash | Job queue | Bearer token | ✅ Yes | 3 keys (token + 2 signing) |
| Cron | Security | Random string | ✅ Yes | `openssl rand -base64 32` |

---

## 🔐 Security Checklist

- [ ] All API keys in `.env.local` (never hardcoded)
- [ ] `.env.local` in `.gitignore`
- [ ] Service account JSON key stored securely (not in repo)
- [ ] `CRON_SECRET` is randomly generated (unique per environment)
- [ ] QStash signing keys backed up securely
- [ ] Production URLs configured before deployment
- [ ] Google service account has minimal required permissions
- [ ] Supabase RLS policies enabled on all tables

---

## 🆘 Troubleshooting

### Issue: "Invalid Supabase URL"
**Fix:** Ensure URL format: `https://xxx.supabase.co` (with https and .co)

### Issue: "YouTube OAuth redirect mismatch"
**Fix:** Add EXACT redirect URI to Google Cloud Console (including protocol and port)

### Issue: "APIFY_API_TOKEN not found"
**Fix:** Check `.env.local` is being read (may need to restart dev server)

### Issue: "Service account not authorized for Search Console"
**Fix:** Go to Search Console → Settings → Users and permissions → Add service account email with Full access

### Issue: "QStash signature verification failed"
**Fix:** Ensure `QSTASH_CURRENT_SIGNING_KEY` is current (check Upstash console)

### Issue: "Email not sending"
**Fix:**
- Verify Resend API key is correct
- Check domain is verified in Resend
- Check sender email matches configured domain

---

## ✅ Final Checklist

- [ ] All 8 external services set up
- [ ] All 11 environment variables configured
- [ ] `.env.local` created and populated
- [ ] Database migrations applied
- [ ] All tests passing (60+)
- [ ] Dev server starts successfully
- [ ] YouTube OAuth works
- [ ] Queue job creation works
- [ ] Email notifications work
- [ ] Published pages are accessible
- [ ] All API keys stored securely

---

## 📚 Next Steps

Once setup is complete:

1. **Create a test user:** Complete quiz at `/quiz`
2. **Generate a test page:** Request free page generation
3. **Monitor progress:** Watch generation pipeline at `/generating`
4. **Verify email:** Check notification email
5. **Visit published page:** Access page at creator subdomain
6. **Check indexing:** View server logs for Search Console submission

You're now ready to use the complete Phase 02 automation pipeline!

---

**Need help?** Check the individual plan summaries:
- `02-00-SUMMARY.md` - Test infrastructure
- `02-01-SUMMARY.md` - YouTube scraper setup
- `02-02-SUMMARY.md` - Content transformation
- `02-03-SUMMARY.md` - Schema builder
- `02-04-SUMMARY.md` - Page publishing
- `02-05-SUMMARY.md` - Queue orchestrator
- `02-06-SUMMARY.md` - Indexing & notifications

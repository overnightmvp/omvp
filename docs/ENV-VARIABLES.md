# 🔑 Environment Variables Reference

Complete documentation of all environment variables used by the automation pipeline.

---

## Database & Authentication

### `NEXT_PUBLIC_SUPABASE_URL`
- **Purpose:** Supabase project URL for database access
- **Type:** URL
- **Format:** `https://xxx.supabase.co`
- **Required:** Yes
- **Public:** Yes (prefix `NEXT_PUBLIC_`)
- **Where to get:** Supabase Dashboard → Settings → API → Project URL
- **Used by:** Supabase client initialization, auth flows, database queries

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Purpose:** Public Supabase API key for client-side operations
- **Type:** JWT Token
- **Format:** `eyJ...` (long base64-encoded string)
- **Required:** Yes
- **Public:** Yes (anon key, limited permissions)
- **Where to get:** Supabase Dashboard → Settings → API → anon (public) key
- **Used by:** Client-side auth, database reads on public schema
- **Rotation:** Annually or after suspected compromise

### `SUPABASE_SERVICE_ROLE_KEY`
- **Purpose:** Server-side Supabase API key with admin permissions
- **Type:** JWT Token
- **Format:** `eyJ...` (long base64-encoded string)
- **Required:** Yes
- **Public:** **NO - KEEP SECRET**
- **Where to get:** Supabase Dashboard → Settings → API → service_role (secret) key
- **Used by:** Server-side operations (migrations, seeding, admin operations)
- **Rotation:** Every 6 months or after any suspected access
- **Security:** Never expose in client code, browser, or public repos

---

## Site Configuration

### `NEXT_PUBLIC_SITE_URL`
- **Purpose:** Base URL of the application
- **Type:** URL
- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`
- **Required:** Yes
- **Public:** Yes
- **Used by:** OAuth redirects, email links, API routes, metadata generation
- **Update before:** Deploying to production

### `NEXT_PUBLIC_ROOT_DOMAIN`
- **Purpose:** Root domain for subdomain routing
- **Type:** Domain (without protocol)
- **Development:** `localhost:3000`
- **Production:** `yourdomain.com`
- **Required:** Yes
- **Public:** Yes
- **Used by:** Subdomain extraction in middleware, email links
- **Pattern:** Used with pattern `creator.root_domain.com`

---

## YouTube Integration

### `YOUTUBE_CLIENT_ID`
- **Purpose:** Google OAuth client ID for YouTube authentication
- **Type:** OAuth Client ID
- **Format:** `xxx.apps.googleusercontent.com`
- **Required:** Yes
- **Public:** Yes (clients know this)
- **Where to get:** Google Cloud Console → APIs & Services → Credentials
- **Used by:** OAuth flow initiation (`/api/auth/youtube/callback`)
- **Scope:** `https://www.googleapis.com/auth/youtube.readonly`
- **Rotation:** Annually in production

### `YOUTUBE_CLIENT_SECRET`
- **Purpose:** Google OAuth client secret for token exchange
- **Type:** OAuth Client Secret
- **Format:** `GOCSPX-xxx...`
- **Required:** Yes
- **Public:** **NO - KEEP SECRET**
- **Where to get:** Google Cloud Console → APIs & Services → Credentials
- **Used by:** Server-side OAuth token exchange
- **Rotation:** Every 6 months or after suspected exposure
- **Security:** Never expose in client code or logs

---

## AI Content Generation

### `ANTHROPIC_API_KEY`
- **Purpose:** API key for Claude Sonnet content generation
- **Type:** Bearer Token
- **Format:** `sk-ant-xxx...`
- **Required:** Yes
- **Public:** **NO - KEEP SECRET**
- **Where to get:** Anthropic Console → Settings → API Keys
- **Used by:** SEO article generation (`src/lib/agents/transformer.ts`)
- **Model:** `claude-sonnet-4-20250514`
- **Rate limit:** Depends on account tier
- **Rotation:** Quarterly for security
- **Cost:** ~$3-5 per page generation (1500-2500 words)

---

## Video Scraping

### `APIFY_API_TOKEN`
- **Purpose:** API token for Apify SDK (YouTube scraping)
- **Type:** Bearer Token
- **Format:** `apify_api_xxx...`
- **Required:** Yes
- **Public:** **NO - KEEP SECRET**
- **Where to get:** Apify Console → Account → Integrations
- **Used by:** YouTube video scraper (`src/lib/agents/scraper.ts`)
- **Free tier:** $5/month credit (~25-100 videos)
- **Actor:** `streamers/youtube-scraper`
- **Rotation:** Yearly or after account compromise
- **Budget:** Monitor usage in Apify console monthly

---

## Email Notifications

### `RESEND_API_KEY`
- **Purpose:** API key for Resend email service
- **Type:** Bearer Token
- **Format:** `re_xxx...`
- **Required:** Yes
- **Public:** **NO - KEEP SECRET**
- **Where to get:** Resend Dashboard → API Keys
- **Used by:** Email notifications (`src/lib/agents/notifier.ts`)
- **From email:** `noreply@yourdomain.com` (must match verified domain)
- **Free tier:** 100 emails/day
- **Rotation:** Quarterly
- **Domain verification:** Required for sending (SPF, DKIM, DMARC)

---

## Search Engine Indexing

### `GOOGLE_SERVICE_ACCOUNT_KEY`
- **Purpose:** Service account credentials for Google Search Console API
- **Type:** JSON object (service account key)
- **Format:**
  ```json
  {
    "type": "service_account",
    "project_id": "...",
    "private_key_id": "...",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
    "client_email": "...@....iam.gserviceaccount.com",
    "client_id": "...",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    ...
  }
  ```
- **Required:** Yes
- **Public:** **NO - KEEP SECRET** (contains private key)
- **Where to get:** Google Cloud Console → Service Account → Create JSON Key
- **Used by:** Search Console indexing submission (`src/lib/agents/indexer.ts`)
- **Service account email:** `xxxx@yyyy.iam.gserviceaccount.com` (add to Search Console)
- **Permissions:** Editor role (or minimal custom role in production)
- **Rotation:** Every 90 days (download new key)
- **Security:** Backup in secure password manager

---

## Job Queue (Upstash)

### `QSTASH_TOKEN`
- **Purpose:** Authentication token for QStash job queue
- **Type:** Bearer Token
- **Format:** `xxxx_xxxxx_xxxxx`
- **Required:** Yes
- **Public:** **NO - KEEP SECRET**
- **Where to get:** Upstash Console → QStash → API Keys
- **Used by:** Queue job publishing and processing
- **Rate limit:** Depends on plan
- **Rotation:** Quarterly or if exposed
- **Note:** Never expires unless manually rotated

### `QSTASH_CURRENT_SIGNING_KEY`
- **Purpose:** Current signing key for QStash request verification
- **Type:** Signing Key
- **Format:** `xxxx_xxxxx_xxxxx`
- **Required:** Yes
- **Public:** **NO - KEEP SECRET**
- **Where to get:** Upstash Console → QStash → API Keys
- **Used by:** Signature verification in callback handlers
- **Rotation:** Before rotating (keep both until migration complete)
- **Verification:** Checks `Authorization` header signature

### `QSTASH_NEXT_SIGNING_KEY`
- **Purpose:** Next signing key for QStash (used during key rotation)
- **Type:** Signing Key
- **Format:** `xxxx_xxxxx_xxxxx`
- **Required:** Yes
- **Public:** **NO - KEEP SECRET**
- **Where to get:** Upstash Console → QStash → API Keys
- **Used by:** Validates requests during key rotation period
- **Rotation process:**
  1. NEXT becomes CURRENT
  2. Generate new NEXT
  3. Update both env vars
  4. Deploy (both keys active for 24-48 hours)

---

## Security & Cron Jobs

### `CRON_SECRET`
- **Purpose:** Authentication secret for Vercel Cron Job endpoints
- **Type:** Random string (base64)
- **Format:** Generated via `openssl rand -base64 32`
- **Length:** 32+ characters
- **Required:** Yes
- **Public:** **NO - KEEP SECRET**
- **Where to get:** Generate locally: `openssl rand -base64 32`
- **Used by:** CRON endpoint authentication (`/api/cron/process-queue`)
- **Rotation:** Every 6 months or after suspected exposure
- **Note:** Different value per environment (dev, staging, production)
- **Security:** Passed by Vercel to cron job trigger (not exposed)

---

## Configuration Matrix

| Variable | Dev | Staging | Production | Rotation |
|----------|-----|---------|------------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Dev project | Staging project | Prod project | Never |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Dev key | Staging key | Prod key | Annually |
| SUPABASE_SERVICE_ROLE_KEY | Dev key | Staging key | Prod key | 6 months |
| YOUTUBE_CLIENT_ID | Dev OAuth ID | Same | Same | Annually |
| YOUTUBE_CLIENT_SECRET | Dev secret | Same | Same | 6 months |
| ANTHROPIC_API_KEY | Dev key | Same | Same | Quarterly |
| APIFY_API_TOKEN | Dev token | Same | Same | Yearly |
| RESEND_API_KEY | Dev key | Staging key | Prod key | Quarterly |
| GOOGLE_SERVICE_ACCOUNT_KEY | Service account JSON | Same | Same | 90 days |
| QSTASH_TOKEN | QStash token | Same | Same | Quarterly |
| QSTASH_CURRENT_SIGNING_KEY | Current key | Same | Same | During rotation |
| QSTASH_NEXT_SIGNING_KEY | Next key | Same | Same | During rotation |
| CRON_SECRET | Random string | Different | Different | 6 months |

---

## Usage by Component

### Database
- Used in: `src/lib/supabase.ts`, all database queries
- Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client)
  - `SUPABASE_SERVICE_ROLE_KEY` (server)

### Authentication
- Used in: `/api/auth/youtube/callback`, middleware
- Variables:
  - `YOUTUBE_CLIENT_ID`
  - `YOUTUBE_CLIENT_SECRET`
  - `NEXT_PUBLIC_SITE_URL` (redirect URI)

### Content Generation Pipeline
- Used in: `src/lib/agents/`
- Variables:
  - `ANTHROPIC_API_KEY` (Claude)
  - `APIFY_API_TOKEN` (YouTube scraping)

### Notifications
- Used in: `src/lib/agents/notifier.ts`
- Variables:
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_SITE_URL` (for email links)

### Indexing
- Used in: `src/lib/agents/indexer.ts`
- Variables:
  - `GOOGLE_SERVICE_ACCOUNT_KEY`

### Job Queue
- Used in: `src/lib/queue/orchestrator.ts`, `/api/cron/process-queue`
- Variables:
  - `QSTASH_TOKEN`
  - `QSTASH_CURRENT_SIGNING_KEY`
  - `QSTASH_NEXT_SIGNING_KEY`

### Routing & URLs
- Used in: middleware, email templates, OAuth flows
- Variables:
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_ROOT_DOMAIN`

### Security
- Used in: `/api/cron/process-queue`
- Variables:
  - `CRON_SECRET`

---

## Loading & Validation

### Development
```javascript
// Loaded from .env.local
require('dotenv').config({ path: '.env.local' })
```

### Production (Vercel)
Set via Vercel Dashboard:
- Project Settings → Environment Variables
- Add each variable for each environment (Production, Preview, Development)

### Validation
TypeScript ensures at build time:
```typescript
// Will error if missing at build time
const apiKey = process.env.ANTHROPIC_API_KEY!
```

---

## Best Practices

1. **Never hardcode** - Always use environment variables
2. **Never commit** - Keep `.env.local` in `.gitignore`
3. **Rotate regularly** - Schedule quarterly key rotations
4. **Use secret manager** - Store backups in 1Password, Bitwarden, etc.
5. **Audit access** - Check who has access to each service
6. **Monitor usage** - Track API usage monthly (especially Apify credits)
7. **Test before rotation** - Verify new key works before removing old one
8. **Document rotation** - Keep changelog of when keys were rotated

---

## Troubleshooting

### "API key is invalid"
- Check value is copied completely (including all characters)
- Ensure no extra spaces or quotes
- Restart dev server after updating
- Verify in source service (not expired/revoked)

### "Connection refused"
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify internet connection
- Check Supabase project is active (not paused)

### "Unauthorized"
- Verify service account is added to Search Console (for Google)
- Check email has permissions (for Resend domain)
- Ensure OAuth app is verified (for YouTube)

### "Rate limited"
- Check Apify free tier credits (`$5/month`)
- Wait for rate limit window (usually 1 hour)
- Consider upgrading account tier

---

## 🔐 Backup Checklist

Before going to production, backup:
- [ ] All API keys in password manager
- [ ] Google service account JSON file
- [ ] QStash signing keys
- [ ] Cron secret
- [ ] List of all OAuth apps created
- [ ] Supabase backup settings configured

---

**Last Updated:** 2026-03-08
**Variables:** 14 total (11 secrets, 3 public)
**Required Setup Time:** 45-60 minutes

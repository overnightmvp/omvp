# ⚡ Setup Quick Reference

**Estimated Time:** 45-60 minutes | **Difficulty:** Intermediate

---

## 🎯 10-Step Checklist

### 1. Supabase Setup
```
✓ https://supabase.com → New Project
✓ Copy: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

### 2. YouTube OAuth
```
✓ https://console.cloud.google.com → New Project
✓ Enable: YouTube Data API v3
✓ APIs & Services → Credentials → OAuth 2.0 Client ID (Web)
✓ Redirect URIs: http://localhost:3000/api/auth/youtube/callback
✓ Copy: YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET
```

### 3. Claude API
```
✓ https://console.anthropic.com/settings/keys → Create Key
✓ Copy: ANTHROPIC_API_KEY (sk-ant-...)
```

### 4. Apify SDK
```
✓ https://apify.com → Sign up (Free $5)
✓ Account → Integrations → Create API Token
✓ Copy: APIFY_API_TOKEN
```

### 5. Resend Email
```
✓ https://resend.com → Sign up (Free 100/day)
✓ Add Domain (or use resend.dev subdomain)
✓ API Keys → Create API Key
✓ Copy: RESEND_API_KEY
```

### 6. Google Search Console
```
✓ https://search.google.com/search-console → Add Property
✓ Verify domain
✓ Google Cloud → Service Account → Create JSON Key
✓ Search Console → Settings → Add service account email
✓ Copy: GOOGLE_SERVICE_ACCOUNT_KEY (entire JSON)
```

### 7. QStash (Upstash)
```
✓ https://upstash.com → Sign up → QStash
✓ API Keys → Copy Token, Current Signing Key, Next Signing Key
✓ Copy: QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY
```

### 8. Site Configuration
```
✓ NEXT_PUBLIC_SITE_URL=http://localhost:3000
✓ NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
✓ CRON_SECRET=$(openssl rand -base64 32)
```

### 9. Create `.env.local`
```bash
cp .env.local.example .env.local
# Then fill in all 12 values from steps 1-8
```

### 10. Initialize & Test
```bash
npm run db:push          # Apply database migrations
npm run test             # Run all tests (should see 60+ pass)
npm run typecheck        # Verify TypeScript
npm run dev              # Start development server
```

---

## 📋 API Keys Needed (11 Total)

| Service | Environment Variable | Format | Status |
|---------|----------------------|--------|--------|
| Supabase | NEXT_PUBLIC_SUPABASE_URL | URL | Required |
| Supabase | NEXT_PUBLIC_SUPABASE_ANON_KEY | Token | Required |
| Supabase | SUPABASE_SERVICE_ROLE_KEY | Token | Required |
| YouTube | YOUTUBE_CLIENT_ID | ID | Required |
| YouTube | YOUTUBE_CLIENT_SECRET | Secret | Required |
| Claude | ANTHROPIC_API_KEY | `sk-ant-...` | Required |
| Apify | APIFY_API_TOKEN | `apify_api_...` | Required |
| Resend | RESEND_API_KEY | `re_...` | Required |
| Google Search | GOOGLE_SERVICE_ACCOUNT_KEY | JSON object | Required |
| QStash | QSTASH_TOKEN | Token | Required |
| QStash | QSTASH_CURRENT_SIGNING_KEY | Key | Required |
| QStash | QSTASH_NEXT_SIGNING_KEY | Key | Required |
| Site | NEXT_PUBLIC_SITE_URL | URL | Required |
| Site | NEXT_PUBLIC_ROOT_DOMAIN | Domain | Required |
| Security | CRON_SECRET | Random | Required |

---

## 🧪 Verification Commands

```bash
# Test database connection
curl http://localhost:3000/api/health

# Run test suite
npm run test

# Type checking
npm run typecheck

# Build verification
npm run build
```

---

## ✅ Success Indicators

- [ ] All 60+ tests pass
- [ ] No TypeScript errors
- [ ] `npm run dev` starts without errors
- [ ] Health check returns `{"status":"ok"}`
- [ ] Can complete quiz flow
- [ ] Can request page generation
- [ ] Receive notification email
- [ ] Published page is accessible

---

## 🚀 After Setup

1. Go to `/quiz` → Complete quiz → Select video
2. Request free page generation
3. Wait for email notification (~15 minutes)
4. Click link in email to view published page
5. Check page has JSON-LD schemas in source

---

## 📖 For More Details

See `docs/SETUP.md` for complete step-by-step guide with:
- Detailed instructions for each service
- Troubleshooting common issues
- Security best practices
- Database initialization details
- Local development testing procedures

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| "Invalid Supabase URL" | Ensure `https://xxx.supabase.co` format |
| "YouTube redirect mismatch" | Add exact URI to Google Cloud Console |
| "API token not found" | Restart dev server after updating `.env.local` |
| "Service account unauthorized" | Add email to Search Console settings |
| "Email not sending" | Verify domain in Resend dashboard |
| "Tests failing" | Run `npm install` to ensure all deps installed |

---

## 💾 Important Notes

- **NEVER commit `.env.local`** - it's in `.gitignore`
- **Keep API keys secure** - treat like passwords
- **Free tier limits:**
  - Apify: $5/month (~25-100 videos)
  - Resend: 100 emails/day
  - Google Search Console: Submissions logged (not API-limited)
- **Backup:** Save all API keys in password manager
- **Rotate:** QStash signing keys regularly

---

**Total Setup Time:** 45-60 minutes
**Difficulty:** 🟡 Intermediate
**Support:** Check `/docs/SETUP.md` or individual `02-XX-SUMMARY.md` files

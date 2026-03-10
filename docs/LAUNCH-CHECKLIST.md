# 🚀 Production Launch Checklist

Complete these steps after initial deployment to fully activate all production features.

---

## ✅ Pre-Launch (Complete Before Going Live)

### Infrastructure
- [ ] Vercel project deployed successfully
- [ ] All 14 environment variables configured in Vercel
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates active
- [ ] Database migrations applied to production Supabase

### Authentication & APIs
- [ ] Supabase connection tested
- [ ] YouTube OAuth working (redirect URI updated in Google Cloud Console)
- [ ] Claude API (Anthropic) responding
- [ ] Apify scraper accessible
- [ ] Resend email service working
- [ ] Google Search Console API configured
- [ ] QStash queue operational

### Testing
- [ ] Homepage loads without errors
- [ ] User signup/login functional
- [ ] Quiz flow completes successfully
- [ ] YouTube channel connection works

---

## 🔧 Post-Launch Configuration

### Step 1: Enable Cron Jobs (After Testing)

**When to enable:** Once you've verified the core functionality works and you want to enable automated queue processing.

**How to enable:**

1. Open `vercel.json`
2. Replace:
   ```json
   {
     "_comment": "Cron jobs disabled for initial deployment - see LAUNCH-CHECKLIST.md",
     "crons": []
   }
   ```

   With:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/process-queue",
         "schedule": "*/5 * * * *"
       }
     ]
   }
   ```

3. Commit and push:
   ```bash
   git add vercel.json
   git commit -m "Enable cron jobs for automated queue processing"
   git push origin main
   ```

4. Vercel will auto-deploy the change and start the cron job

**What this enables:**
- Automatic processing of generation queue every 5 minutes
- 6-agent pipeline automation (scrape → transform → schema → publish → index → notify)
- Background job processing via QStash

**Verification:**
- Check Vercel deployment logs for cron executions (every 5 minutes)
- Monitor QStash dashboard for job submissions
- Verify queue items are being processed in Supabase `generation_queue` table

---

### Step 2: Monitor Queue Processing

After enabling cron jobs, monitor for the first 24 hours:

**Check Vercel Logs:**
- Go to Vercel Dashboard → Deployments → Latest → Functions
- Filter by `/api/cron/process-queue`
- Verify executions every 5 minutes
- Check for errors or failed authentications

**Check Supabase Database:**
```sql
-- View queue status distribution
SELECT status, COUNT(*)
FROM generation_queue
GROUP BY status;

-- View recent processing activity
SELECT id, status, started_at, completed_at, error_message
FROM generation_queue
ORDER BY updated_at DESC
LIMIT 10;
```

**Check QStash Dashboard:**
- Visit https://upstash.com/qstash
- Monitor job submissions and completions
- Check for failed jobs or retries

---

### Step 3: Optimize Cron Schedule (Optional)

If queue processing needs adjustment:

**More frequent (every 2 minutes):**
```json
"schedule": "*/2 * * * *"
```

**Less frequent (every 15 minutes):**
```json
"schedule": "*/15 * * * *"
```

**Business hours only (every 5 minutes, 9am-5pm EST):**
```json
"schedule": "*/5 9-17 * * *"
```

Refer to [crontab.guru](https://crontab.guru) for schedule syntax help.

---

### Step 4: Database Maintenance (Optional)

**Consider adding:** A cleanup cron for expired OAuth states

Currently exists but not scheduled:
- Function: `cleanup_expired_oauth_states()` in database
- Removes OAuth states older than 10 minutes
- Prevents table bloat

**To enable (add to vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/process-queue",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/cleanup-oauth",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Note:** You'd need to create `/api/cron/cleanup-oauth/route.ts` to call the database function.

---

## 📊 Monitoring & Alerts

### Key Metrics to Track

**Queue Health:**
- Items stuck in `processing` status > 30 minutes
- High `retry_count` (> 2 attempts)
- `failed` status ratio > 10%

**Pipeline Performance:**
- Average time per pipeline stage
- Scraping success rate (Apify quota)
- Transformation quality (Claude API errors)
- Indexing submission rate (Google Search Console quota)

**Resource Usage:**
- QStash monthly job count (free tier: 500/month)
- Apify credits (free tier: $5/month)
- Claude API tokens (monitor billing)
- Resend email quota (free tier: 100/day)

### Recommended Alerts

Set up alerts for:
- ❗ Cron job failures (3+ consecutive)
- ❗ Queue items in `failed` status
- ❗ API quota exceeded (Apify, Claude, Resend)
- ⚠️ Queue depth > 20 items (backlog building)
- ⚠️ Pipeline stage taking > 10 minutes

---

## 🔒 Security Checklist

After launch, verify:

- [ ] `CRON_SECRET` is strong random string (32+ characters)
- [ ] All API keys marked as "Secret" in Vercel
- [ ] `.env.local` never committed to git (in `.gitignore`)
- [ ] Service account JSON has minimal permissions
- [ ] Supabase Row Level Security (RLS) policies active
- [ ] OAuth redirect URIs restricted to production domain
- [ ] No hardcoded secrets in codebase

---

## 📚 Related Documentation

- **Setup Guide:** `docs/SETUP.md` - Initial environment setup
- **Environment Variables:** `docs/ENV-VARIABLES.md` - All variable definitions
- **Service Providers:** `docs/SERVICE-PROVIDERS.md` - API provider comparison
- **Architecture:** `.planning/phases/02-automation-pipeline/02-RESEARCH.md` - Pipeline design

---

## 🆘 Troubleshooting

### Cron Job Not Running

**Symptom:** No executions in Vercel logs after 5+ minutes

**Fixes:**
1. Verify `vercel.json` has valid cron configuration (not empty array)
2. Check deployment succeeded after enabling crons
3. Ensure `CRON_SECRET` environment variable is set
4. Try manual trigger: `curl -X POST https://yourdomain.vercel.app/api/cron/process-queue -H "Authorization: Bearer $CRON_SECRET"`

### Queue Items Stuck

**Symptom:** Items remain in `processing` status indefinitely

**Fixes:**
1. Check QStash dashboard for failed jobs
2. Review Vercel function logs for errors
3. Verify all API keys are valid (Claude, Apify, Resend)
4. Manually reset stuck items:
   ```sql
   UPDATE generation_queue
   SET status = 'pending', started_at = NULL
   WHERE status = 'processing' AND started_at < NOW() - INTERVAL '30 minutes';
   ```

### High Failure Rate

**Symptom:** Many items in `failed` status

**Fixes:**
1. Check `error_message` column in `generation_queue` table
2. Common issues:
   - **Apify quota exceeded** → Upgrade plan or reduce scraping
   - **Claude API errors** → Check API key and billing
   - **Timeout errors** → Increase function timeout in Vercel
3. Review failed items and manually requeue if needed

---

## ✅ Launch Complete Checklist

Final verification before considering launch successful:

- [ ] Cron jobs enabled and running
- [ ] Queue processing confirmed (items moving through pipeline)
- [ ] All 6 pipeline stages completing successfully
- [ ] Email notifications being sent
- [ ] Pages publishing to subdomains
- [ ] Search Console indexing working
- [ ] No errors in Vercel function logs (24hr period)
- [ ] Monitoring and alerts configured
- [ ] Team notified of launch
- [ ] Documentation updated with production URLs

**Congratulations! Your production deployment is fully operational! 🎉**

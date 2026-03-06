# External Integrations

**Analysis Date:** 2026-03-06

## APIs & External Services

**YouTube Integration:**
- Video embeds via YouTube iframe
  - Lazy-loaded thumbnails from `img.youtube.com`
  - On-click YouTube embed with autoplay parameter
  - Used in: `src/components/HeroVideo.astro`, `src/components/VideoCard.astro`, `src/layouts/BaseLayout.astro`
  - Pattern: Fetches thumbnails from `https://img.youtube.com/vi/{videoId}/hqdefault.jpg`
  - Embed pattern: `https://www.youtube.com/embed/{videoId}?autoplay=1&rel=0`

**Calendly Integration:**
- Scheduling service for consultations
  - URL: `https://calendly.com/raminpof1/30min`
  - Used in: `src/components/CTASection.astro`, `src/components/Footer.astro`, `src/components/TestimonialCard.astro`
  - Implementation: Direct link via CTA buttons and footer links

**Social Media:**
- Instagram: `https://www.instagram.com/raminrazy_p1`
- Facebook: `https://www.facebook.com/powerof1training`
- YouTube Channel: `https://youtube.com/@powerof1training`
- LinkedIn: `https://www.linkedin.com/in/ramin-razy-4bb53a68`
- Used in: `src/components/Header.astro`, `src/components/Footer.astro`
- Implementation: Direct social profile links (no API integration)

**Google Fonts:**
- Fonts hosted via Google Fonts API
  - Reddit Sans (wght: 400, 500, 600, 700) - Heading font
  - Inter (wght: 400, 500, 600) - Body font
  - URL: `https://fonts.googleapis.com/css2?family=Reddit+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap`
  - Font files preloaded from `https://fonts.gstatic.com/`
  - Optimization: `display=swap` for faster text rendering
  - Used in: `src/layouts/BaseLayout.astro` (lines 46-52)

**Business Location:**
- Elite Fight Club Bangkok
  - URL: `https://elitefightclub.com/bangkok/`
  - Referenced in footer

## Data Storage

**No external databases:**
- Static content stored in markdown and JSON files
- Blog posts: `src/content/blog/` (markdown files)
- Zod schemas define content structure in `src/content/config.ts`

**Content Collections:**
- Blog collection with front matter (title, date, author, category, tags, SEO)
- Type-safe schema validation via Zod
- Generated static pages from `src/pages/blog/[slug].astro`

**File Storage:**
- Local filesystem only
- Public assets: `public/images/`, `public/style.css`
- Manifest files: `public/_headers`, `public/_redirects` (Netlify configuration)

**Static Files:**
- `public/robots.txt` - SEO crawler instructions
- `public/favicon.ico` - Browser tab icon
- `public/images/` - Logos, profiles, OG images (1200×630px)

## Authentication & Identity

**No authentication required:**
- Completely static site
- No user accounts or login system
- No API authentication needed
- No secrets or credentials required

**Author Attribution:**
- Default author: "Ramin Razy" (hardcoded in config)
- Name used in: `src/content/config.ts:10`, schema markup

## Monitoring & Observability

**Error Tracking:**
- Not detected
- No Sentry, Rollbar, or similar configured

**Logs:**
- Client-side console logging only
  - Phone click tracking: `console.log('Phone number clicked')`
  - YouTube video plays: `console.log('YouTube video played: ${videoId}')`
  - Used in: `src/layouts/BaseLayout.astro` (lines 161, 209)

**Analytics:**
- Placeholder for analytics tracking in code comments
- No Google Analytics, Mixpanel, or other tracking library installed
- Comment: "Add analytics tracking here if needed" (line 160)

## CI/CD & Deployment

**Hosting:**
- Static hosting (no specific platform locked in)
- Netlify redirects configured: `public/_redirects`
- Netlify headers configured: `public/_headers`
- Production build output: `dist/`

**Build Commands:**
```bash
npm run dev      # Start dev server (localhost:4321)
npm run build    # Generate static site to dist/
npm run preview  # Preview production build locally
```

**Git Configuration:**
- `.gitignore` excludes: `dist/`, `.astro/`, `node_modules/`, `.env*`
- `.git/` directory present (project is version controlled)

## Environment Configuration

**Required env vars:**
- None - Site uses no environment variables
- `ASTRO_ENABLE_STRICT` potentially from Astro defaults

**Secrets location:**
- No secrets needed
- Site is publicly deployable
- No API keys, database credentials, or passwords required

**Public Configuration:**
- Site URL hardcoded: `https://personaltrainingbangkokp1.com`
- Owner name: "Ramin Razy" (hardcoded)
- Contact: Phone and Calendly links hardcoded in components

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

**Form Submissions:**
- No contact form or submission handler
- All CTAs link externally:
  - Calendly for scheduling
  - Phone calls (tel: links)
  - Social media profiles
  - Email (if configured in future)

---

*Integration audit: 2026-03-06*

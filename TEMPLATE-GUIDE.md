# Template Customization Guide

## Step 1 — Fill in `template.config.ts`

Open `template.config.ts` in your editor. Replace every `{{PLACEHOLDER}}` value.

### Business Info
```ts
business: {
  name:      'Power of One Training',
  tagline:   'Transform Your Body, Transform Your Life',
  ownerName: 'Ramin Razy',
  phone:     '+66 81 234 5678',
  whatsapp:  '66812345678',
  // ...
}
```

### Brand Colors
```ts
design: {
  colors: {
    primary:   '#FF6B35',   // Your brand orange
    secondary: '#00E5FF',   // Your brand cyan
  }
}
```

### Toggle Features
```ts
features: {
  blog:         true,   // set false to hide blog
  whatsapp:     true,   // floating WhatsApp button
  pwa:          true,   // offline + installable
  testimonials: true,
  faq:          true,
}
```

---

## Step 2 — Edit Content Files

### Hero (`src/content/hero/default.json`)
```json
{
  "headline": "Your Best Body Starts Here",
  "subheadline": "Personal training in Bangkok...",
  "ctaPrimary": { "label": "Book Free Consult", "href": "/#contact" }
}
```

### About (`src/content/about/default.md`)
```md
---
title: "About Ramin"
stats:
  - { value: "10+", label: "Years Experience" }
  - { value: "200+", label: "Clients Transformed" }
---
Your bio text here...
```

### Services (`src/content/services/`)
Create one `.md` file per service:
```md
---
title: "1-on-1 Personal Training"
price: "฿2,500"
priceNote: "per session"
featured: true
---
Full session description...
```

### Testimonials (`src/content/testimonials/`)
```md
---
name: "Jane Smith"
rating: 5
featured: true
---
"Ramin changed my life. I lost 15kg in 4 months..."
```

### Blog Posts (`src/content/blog/`)
```md
---
title: "5 Tips for Faster Fat Loss"
description: "Science-backed strategies..."
pubDate: "2026-01-15"
tags: ["nutrition", "fat loss"]
featured: true
---
Your article content in Markdown...
```

---

## Step 3 — Replace Images

| File | Size | Purpose |
|------|------|---------|
| `public/images/og-image.jpg` | 1200×630 | Social sharing |
| `public/images/trainer-profile.jpg` | 600×750 | About section |
| `public/images/icon-192.png` | 192×192 | PWA icon |
| `public/images/icon-512.png` | 512×512 | PWA icon |
| `public/images/testimonials/client-X.jpg` | 100×100 | Testimonial photos |
| `public/images/blog/post-X.jpg` | 800×450 | Blog hero images |

---

## Step 4 — Verify & Build

```bash
npm run dev     # Check everything looks right
npm run build   # Build for production
npm run preview # Preview the production build
```

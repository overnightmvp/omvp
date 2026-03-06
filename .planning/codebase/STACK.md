# Technology Stack

**Analysis Date:** 2026-03-06

## Languages

**Primary:**
- TypeScript - Used in configuration and component type definitions
- JavaScript - Client-side interactivity and Astro server scripts
- CSS - Styling via `public/style.css` (37KB critical stylesheet) and inline scoped styles in `.astro` components

**Secondary:**
- Markdown - Blog post content in `src/content/blog/`
- JSON - Configuration and data files

## Runtime

**Environment:**
- Node.js 18+ (required)
- Browser runtime for client-side scripts

**Package Manager:**
- npm 9+
- Lockfile: `package-lock.json` present (184KB)

## Frameworks

**Core:**
- Astro 5.13.5 - Static site generation framework
  - Static output mode (`output: 'static'`)
  - Astro content collections with Zod validation
  - File-based routing (`src/pages/`)

**Dependencies:**
- @astrojs/rss 4.0.12 - RSS feed generation for blog
- @astrojs/sitemap 3.5.1 - Automatic sitemap generation

**Build/Dev:**
- Terser 5.43.1 - JavaScript minification
- Vite - Build tool (bundled with Astro)
  - CSS minification enabled
  - Terser for JS minification

## Key Dependencies

**Critical:**
- `astro` 5.13.5 - Core framework for static generation and content collections
- `@astrojs/rss` 4.0.12 - Blog RSS feed at `/rss.xml`
- `@astrojs/sitemap` 3.5.1 - Automatic sitemap for SEO

**No runtime dependencies:**
- Project uses zero runtime dependencies besides Astro and integrations
- All styling is vanilla CSS
- All interactivity is vanilla JavaScript

## Configuration

**Environment:**
- Site URL: `https://personaltrainingbangkokp1.com` (hardcoded in `src/layouts/BaseLayout.astro:22` and `astro.config.mjs:8`)
- No external API keys or environment variables required
- Output directory: `dist/` (production builds)

**Build:**
- `astro.config.mjs` - Main Astro configuration
  - Assets directory: `assets/`
  - Sitemap integration enabled
  - Vite minification: CSS and JS via Terser
  - Static output (no SSR)
- `tsconfig.json` - Strict TypeScript mode from Astro presets
- `.gitignore` - Excludes: `dist/`, `.astro/`, `node_modules/`, `.env`, `.env.production`

## Platform Requirements

**Development:**
- Node.js 18 or higher
- npm 9 or higher
- ~274MB `node_modules/` (installed dependencies)
- VS Code recommended (`.vscode/` config included)

**Production:**
- Static hosting (Netlify, Vercel, GitHub Pages, etc.)
- No server runtime required
- Works on CDN or traditional web hosting
- GZIP compression recommended (CSS/JS files)

---

*Stack analysis: 2026-03-06*

# Codebase Structure

**Analysis Date:** 2026-03-06

## Directory Layout

```
Astro build/
├── template.config.ts       # Configuration: business info, design, features, SEO, nav
├── config.ts                # Astro content collection schemas (Zod)
├── Header.astro             # Navigation component with mobile drawer
├── CTAButton.astro          # Call-to-action button (6 variants, 4 sizes)
├── design-system.css        # CSS custom properties (design tokens)
├── README.md                # Quick start guide
├── TEMPLATE-GUIDE.md        # Step-by-step customization instructions
├── .planning/               # GSD planning directory
│   └── codebase/           # Architecture documentation
├── src/                     # (To be created when initializing Astro project)
│   ├── content/            # Content collections
│   │   ├── hero/           # Hero section data
│   │   ├── about/          # About section content
│   │   ├── services/       # Service offerings
│   │   ├── testimonials/   # Client testimonials
│   │   ├── blog/           # Blog posts
│   │   └── faq/            # FAQ items
│   ├── layouts/            # Page layouts and wrappers
│   ├── components/         # Additional reusable components
│   ├── pages/              # Route endpoints
│   └── styles/             # Global and component styles
├── public/                  # (To be created) Static assets
│   └── images/             # Logo, OG image, profile, blog, testimonials
└── docs/                    # (To be created) Additional documentation
```

## Directory Purposes

**Root Level:**
- Purpose: Configuration and core template files
- Contains: TypeScript configs, Astro components, CSS design system, guides
- Key files: `template.config.ts` (main config), `config.ts` (content schemas)

**src/ (Template-expected structure):**
- Purpose: Source code for Astro site (to be generated on `npm run build`)
- Contains: Content, pages, layouts, components, styles
- Key files: Content collection YAML/Markdown files, page templates

**src/content/:**
- Purpose: Type-safe structured content
- Contains: Six collections (hero, about, services, testimonials, blog, faq) as JSON or Markdown files
- Key files: `hero/default.json`, `about/default.md`, `services/*.md`, `testimonials/*.md`, `blog/*.md`, `faq/default.json`

**public/images/:**
- Purpose: Static image assets for web
- Contains: OG image, trainer profile, blog post images, testimonial photos, PWA icons
- Key files: `og-image.jpg` (1200×630), `trainer-profile.jpg` (600×750), `icon-192.png` & `icon-512.png` (PWA)

**docs/:**
- Purpose: Extended documentation
- Contains: Design system guide, mobile UX best practices, accessibility guidelines
- Key files: DESIGN-SYSTEM.md, MOBILE-UX-AUDIT.md (mentioned in README)

**.planning/codebase/:**
- Purpose: GSD mapping documents
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md
- Used by: GSD plan-phase and execute-phase commands

## Key File Locations

**Entry Points:**

**Configuration:**
- `template.config.ts` - Single source of truth for all site customization
- `config.ts` - Astro content collection schema definitions with Zod

**Core Components:**
- `Header.astro` - Navigation and header (sticky, responsive, mobile drawer)
- `CTAButton.astro` - Call-to-action button component (6 variants, 4 sizes, full state machine)

**Design System:**
- `design-system.css` - CSS custom properties defining colors, typography, spacing, shadows, transitions

**Documentation:**
- `README.md` - Quick start and feature overview
- `TEMPLATE-GUIDE.md` - Step-by-step customization walkthrough
- `docs/TEMPLATE-GUIDE.md` - Referenced but not included (user-created)

## Naming Conventions

**Files:**

- **Config files:** PascalCase for TypeScript modules (`template.config.ts`, `config.ts`)
- **Components:** PascalCase with .astro extension (`Header.astro`, `CTAButton.astro`)
- **Styles:** kebab-case for CSS classes (`.site-header`, `.cta-btn`, `.mobile-nav`)
- **Content collections:** lowercase directory names (`hero`, `about`, `services`, `testimonials`, `blog`, `faq`)
- **CSS:** kebab-case filenames (`design-system.css`)

**Directories:**

- **Collections:** All lowercase, plural where appropriate (`services`, `testimonials`, `blog`)
- **Component folders:** PascalCase (e.g., expected `src/components/`)
- **Layout folders:** Lowercase (e.g., expected `src/layouts/`)
- **Page routes:** lowercase with kebab-case (e.g., expected `src/pages/blog/`, `src/pages/contact.astro`)

**CSS Classes:**

- **Component-scoped:** Prefix with component name (`.cta-btn`, `.cta-primary`, `.cta-sm`)
- **Tokens/utilities:** Double-dash for custom properties (`--color-primary`, `--space-4`, `--text-lg`)
- **Semantic naming:** Descriptive intent (`--z-modal`, `--shadow-glow`, `--transition-spring`)

**Content Frontmatter:**

- **YAML keys:** camelCase or snake_case (e.g., `pubDate`, `updatedDate`, `priceNote`, `featured`, `draft`)
- **Service field:** `featured`, `order` for sorting and prominence
- **Blog field:** `pubDate`, `tags`, `featured`, `draft` for content management

## Where to Add New Code

**New Feature Page:**
1. Create `src/pages/feature-name.astro`
2. Import layout from `src/layouts/BaseLayout.astro`
3. Import components from `src/components/`
4. Fetch content via `getCollection('collection-name')`
5. Add styling in component `<style>` block or `src/styles/`

**New Component:**
1. Create `src/components/ComponentName.astro`
2. Use CSS custom properties from `design-system.css` for tokens
3. Follow variant pattern from `CTAButton.astro` if multiple states needed
4. Export props interface at top of component file
5. Include `<style>` block scoped to component classes

**New Content Collection:**
1. Define Zod schema in `config.ts` (add to collections export)
2. Create `src/content/{collection-name}/` directory
3. Add content files (`.md` or `.json` depending on schema `type: 'content'` or `type: 'data'`)
4. Update feature toggle in `template.config.ts` if section should be conditionally rendered
5. Create layout template in `src/layouts/` to render collection

**New Design Token:**
1. Add CSS custom property to `design-system.css` `:root` block
2. Organize by category (colors, typography, spacing, etc.)
3. For theme-specific values, add override in `[data-theme="light"]` or `[data-theme="highcontrast"]`
4. Document purpose in category comment

**Global Style Override:**
1. Add to `src/styles/global.css` or inline in layout
2. Reference design tokens via `var(--token-name)`
3. Use semantic token names (`--color-primary`, `--text-lg`)
4. Avoid hardcoded values; use existing tokens first

## Special Directories

**src/content/:**
- Purpose: Content managed as data source
- Generated: No (user-created during setup)
- Committed: Yes, part of site source

**public/images/:**
- Purpose: Static assets not processed by build
- Generated: No (user-replaced during customization)
- Committed: Yes, required for site preview

**.planning/codebase/:**
- Purpose: GSD mapping documents for automation
- Generated: Yes (by `/gsd:map-codebase`)
- Committed: Yes, consumed by `/gsd:plan-phase` and `/gsd:execute-phase`

**.git/**
- Purpose: Version control repository
- Generated: Yes (git init)
- Committed: N/A (git metadata)

---

*Structure analysis: 2026-03-06*

# Architecture

**Analysis Date:** 2026-03-06

## Pattern Overview

**Overall:** Static Site Generation with Content Collections

This is an enterprise-grade Astro template for personal trainers and service-based businesses. The architecture follows a declarative, content-first pattern where structured data (Zod schemas) drives type-safe rendering across pages and sections.

**Key Characteristics:**
- Configuration-driven design system via TypeScript config
- Type-safe content collections using Astro Content API
- CSS custom properties (tokens) for theme and design system
- Component-based UI with pre-built variants
- Server-side rendering (SSG) for performance and SEO

## Layers

**Configuration Layer:**
- Purpose: Central source of truth for all site settings, branding, and feature toggles
- Location: `template.config.ts`
- Contains: Business info, design tokens, feature flags, SEO settings, navigation config
- Depends on: None
- Used by: All pages, layouts, and components that need site metadata

**Content Schema Layer:**
- Purpose: Type-safe content structure using Zod validation
- Location: `config.ts` (Astro content collection definitions)
- Contains: Six collections with full schemas: hero, about, services, testimonials, blog, FAQ
- Depends on: Astro content API, Zod validation library
- Used by: Template layouts that render content-driven sections

**Component Layer:**
- Purpose: Reusable, composable UI elements with predefined variants and states
- Location: Components like `Header.astro`, `CTAButton.astro`
- Contains: Atomic components (button, header, nav) with full state management
- Depends on: Design system tokens from `design-system.css`
- Used by: Page layouts and section templates

**Design System Layer:**
- Purpose: Unified visual language via CSS custom properties
- Location: `design-system.css`
- Contains: Color palette (primary, secondary, semantic), typography scales (clamp-based), spacing, shadows, z-index stacking, transitions
- Depends on: None (pure CSS variables)
- Used by: All components and layouts

**Pages Layer:**
- Purpose: Route endpoints that compose sections and layouts
- Location: Expected at `src/pages/` and `src/content/` (not yet created in template)
- Contains: Home page sections (hero, about, services, testimonials, blog, FAQ, contact)
- Depends on: Layouts, components, content collections
- Used by: End user navigation

## Data Flow

**Configuration → Rendering Pipeline:**

1. Developer fills `template.config.ts` with business info and design colors
2. Content team creates markdown/JSON files in `src/content/{collection}/`
3. Astro build process validates content against Zod schemas in `config.ts`
4. Layout files read `templateConfig` and collection data
5. Components render using design system tokens from CSS custom properties
6. Static HTML generated for all pages
7. Client-side JavaScript handles interactivity (mobile nav, theme toggle, WhatsApp widget)

**State Management:**

- **Server State:** Content collections (hero, services, blog, etc.) managed by Astro at build time
- **Design State:** CSS custom properties for theme switching (dark/light/highcontrast)
- **Client State:** Minimal runtime state for mobile nav drawer, scroll position tracking, theme preference persistence

## Key Abstractions

**Configuration-as-Code:**
- Purpose: Single declarative source for all customization
- Location: `template.config.ts`
- Pattern: TypeScript constant object with typed properties, feature flags for conditional rendering

**Content Collections:**
- Purpose: Structured content with validation
- Examples: `config.ts` defines schemas for hero (data), about (content), services, testimonials, blog, FAQ
- Pattern: Zod schema validation enforces data shape; both data (JSON) and content (Markdown) types supported

**Design Tokens:**
- Purpose: Centralized visual system variables
- Location: `design-system.css` using CSS custom properties
- Pattern: Variables organized by category (colors, typography, spacing, shadows, z-index, transitions); theme variants override base tokens

**Component Variants:**
- Purpose: Flexible components with predictable styling
- Example: `CTAButton.astro` supports 6 variants (primary, secondary, ghost, outline, gradient, danger) × 4 sizes (sm, md, lg, xl) × multiple states
- Pattern: Class-based variant system with `class:list` and conditional states

## Entry Points

**Build Entry:**
- Location: `template.config.ts`
- Triggers: `npm run dev` or `npm run build`
- Responsibilities: Provides all configuration values to components and layouts during build

**Content Entry:**
- Location: `src/content/` (user-created collections)
- Triggers: Astro content collection loader during build
- Responsibilities: Supplies validated content to templates for rendering

**Component Entry Points:**
- `Header.astro` - Renders sticky navigation with mobile drawer, CTA, and phone link
- `CTAButton.astro` - Renders button/link with variants, sizes, loading/disabled states

**Client Script Entry:**
- Location: Inline scripts in `Header.astro`
- Triggers: Page load
- Responsibilities: Mobile menu toggle, nav drawer open/close, scroll-triggered header shrink, swipe-to-close gesture

## Error Handling

**Strategy:** Validation-first with Zod schemas

**Patterns:**
- Content collections validated against schemas at build time; invalid content fails build
- Optional fields in schemas allow graceful degradation (e.g., `featured: z.boolean().default(false)`)
- Missing images or resources render with default states (e.g., CTAButton renders without icon if not provided)

## Cross-Cutting Concerns

**Logging:** Not implemented (static site); SEO audit via generated markup and sitemap

**Validation:** Zod schemas enforce data integrity at content collection level; TypeScript ensures config type safety

**Authentication:** Not applicable (static site); WhatsApp/phone contact flows for lead capture

**Accessibility:** ARIA labels on interactive elements (nav toggle, close buttons), semantic HTML (role="banner", role="list"), keyboard support (Enter/Escape for menus), 44px+ minimum touch targets

**Mobile-First Design:** Typography uses clamp-based scales; spacing and layout responsive; touch targets meet WCAG 2.5.5 min 44×44px requirement

**Theme Support:** Three theme variants: dark (default), light, highcontrast via `data-theme` attribute on root element; CSS custom properties override for each theme

---

*Architecture analysis: 2026-03-06*

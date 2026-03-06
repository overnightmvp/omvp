# Coding Conventions

**Analysis Date:** 2026-03-06

## Naming Patterns

**Files:**
- Astro components: PascalCase (e.g., `Header.astro`, `CTAButton.astro`)
- TypeScript/JavaScript: camelCase for utilities, PascalCase for types and exports (e.g., `config.ts`, `template.config.ts`)
- CSS: kebab-case for class names and CSS custom properties (e.g., `cta-btn`, `--color-primary`)
- Markdown: kebab-case with descriptive names (e.g., `TEMPLATE-GUIDE.md`)

**Functions:**
- camelCase for function names: `openMenu()`, `closeMenu()`
- Descriptive action-verb prefixes: `open*`, `close*`, `handle*`, `toggle*`
- Arrow functions used in event listeners: `nav?.addEventListener('click', closeMenu)`

**Variables:**
- camelCase for all local variables
- Semantic naming: `startX`, `toggle`, `backdrop`, `nav` (short, meaningful names)
- DOM elements prefixed to show purpose: `toggle`, `closeBtn`, `backdrop`
- Const-first pattern: all variables declared with `const` by default

**Types:**
- PascalCase for interfaces: `interface Props { ... }`
- Type annotations exported as: `export type TemplateConfig = typeof templateConfig;`
- Zod schemas with `defineCollection()` for content validation
- Optional fields marked with `z.optional()` or `?` in interfaces

## Code Style

**Formatting:**
- No explicit formatter configured (check for eslint/prettier in project)
- Indentation: 2 spaces (inferred from existing code)
- Line length: No strict limit observed, but kept under 100 characters in most cases
- Trailing semicolons: Used consistently in TypeScript files
- Template literals: Used for dynamic strings (e.g., `` href={`tel:${business.phone}`} ``)

**Linting:**
- No ESLint or Prettier config files detected
- Code relies on TypeScript type checking and Astro built-in validation

## Import Organization

**Order:**
1. Framework imports: `import { defineCollection, z } from 'astro:content';`
2. Type imports: `import type { TemplateConfig } from './types';`
3. Config/utility imports: `import config from '../../../template.config';`
4. Component imports: `import CTAButton from './CTAButton.astro';`
5. Relative imports use explicit paths (no barrel files detected)

**Path Aliases:**
- No path aliases configured in this codebase
- Relative paths used throughout (e.g., `import config from '../../../template.config';`)

## Error Handling

**Patterns:**
- Optional chaining for DOM operations: `nav?.classList.add('open')`
- Nullish coalescing for default values: `size = 'md'` in prop destructuring
- No explicit try/catch blocks observed
- Validation via Zod schemas in content collections: `z.string()`, `z.number().min(1).max(5)`

## Logging

**Framework:** console (no external logging library detected)

**Patterns:**
- No production logging observed in code
- Browser console used implicitly for debugging
- No explicit log statements in reviewed source files

## Comments

**When to Comment:**
- Section headers use decorative lines for visual organization: `// ─── HERO ────────────────────────────────────────────────────`
- Block comments explain major sections: `// BUSINESS INFO`, `// DESIGN SYSTEM`
- Inline comments document purpose of inline elements in Astro/HTML: `<!-- Logo -->`, `<!-- Mobile Nav Drawer -->`

**JSDoc/TSDoc:**
- Block documentation used for component APIs:
```typescript
/**
 * CTAButton — 6 variants × 4 sizes × full states
 * variant: primary | secondary | ghost | outline | gradient | danger
 * size:    sm | md | lg | xl
 * state:   default | loading | success | error | disabled
 */
```
- No formal JSDoc parameter documentation; information provided in comments above interface

## Function Design

**Size:** Functions kept concise and focused:
- `openMenu()` — 5 lines, single responsibility
- `closeMenu()` — 5 lines, single responsibility
- Event listener setup in sequence, not abstracted into helpers

**Parameters:**
- Astro components use `Props` interface destructuring:
```typescript
const {
  href,
  variant  = 'primary',
  size     = 'md',
  label,
  icon,
  iconPos  = 'right',
  // ...
} = Astro.props;
```
- Default values specified inline in destructuring
- No rest parameters observed

**Return Values:**
- Astro components return JSX/HTML directly
- TypeScript files export objects and types
- Functions used in event handlers don't return values (void)

## Module Design

**Exports:**
- Single default export for config: `export default templateConfig;`
- Named exports for types: `export type TemplateConfig = typeof templateConfig;`
- Exported collections as named export: `export const collections = { ... };`
- Components implicitly exported by Astro framework

**Barrel Files:**
- No barrel files (`index.ts`) detected in this codebase
- Direct imports from specific files preferred

## Object & Data Structure Patterns

**Config Objects:**
- Single source of truth pattern: `template.config.ts` contains all site configuration
- Nested object structure with semantic grouping:
```typescript
business: { name, phone, email, address, social, hours }
design: { colors, fonts, scheme, defaultTheme }
features: { blog, testimonials, videoSection, faq, ... }
seo: { siteUrl, siteName, defaultTitle, ... }
nav: { links, ctaLabel, ctaHref, mobileMode }
```
- Placeholder values use double-brace convention: `{{PLACEHOLDER_NAME}}`

**Content Collections:**
- Zod schema validation for all collections
- Semantic field naming aligned with content type
- `featured` boolean and `order` number fields for ordering/highlighting
- Optional fields clearly marked with `.optional()`

## State Management Patterns

**DOM State:**
- CSS class toggling for state management: `.open`, `.scrolled`, `.cta-loading`, `.cta-disabled`
- ARIA attributes for accessibility: `aria-expanded`, `aria-hidden`, `aria-disabled`
- Dataset attributes for tracking: `data-tracking`

**Client State:**
- Variables track state: `startX` for touch position, `nav`/`toggle`/`backdrop` for DOM references
- State changes through direct DOM manipulation (not reactive framework)

## HTML/Accessibility Patterns

**Element Semantics:**
- Proper heading hierarchy with `<header>`, `<nav>`, `<section>` elements
- Role attributes for enhanced semantics: `role="banner"`, `role="list"`
- Aria attributes for interactive elements:
  - `aria-label` for icon-only buttons and links
  - `aria-expanded` for toggle buttons
  - `aria-hidden` for decorative elements
  - `aria-disabled` for disabled states

**Touch/Mobile Patterns:**
- Minimum touch target sizes: 44px minimum (specified in Hamburger button)
- Touch event listeners with passive flags: `{ passive: true }`
- Swipe detection with `touchstart`/`touchend` coordinates

## CSS Naming & Organization

**Class Naming:**
- Prefixed by component: `.cta-*` for button variants, `.header-*` for header elements, `.nav-*` for navigation
- State suffixes: `.cta-loading`, `.cta-disabled`, `.mobile-nav.open`
- Size/variant suffixes: `.cta-sm`, `.cta-md`, `.cta-lg`, `.cta-xl`, `.cta-primary`, `.cta-secondary`

**Organization:**
- Comments separate sections: `/* Base */`, `/* Sizes */`, `/* States */`, `/* Spinner */`
- Related styles grouped together under comments
- Cascade used for state management (e.g., `:hover`, `:active`, `[aria-expanded="true"]`)

## Design System CSS Patterns

**Custom Properties:**
- Semantic color names: `--color-primary`, `--color-secondary`, `--color-error`, `--color-success`
- Spacing scale (8px base): `--space-1` through `--space-24`
- Type scale with clamp for responsive: `` clamp(0.875rem, 1.8vw, 1rem) ``
- Z-index layers: `--z-base` through `--z-tooltip` (0–700)

---

*Convention analysis: 2026-03-06*

# Testing Patterns

**Analysis Date:** 2026-03-06

## Test Framework

**Runner:**
- Not detected — No test framework configured

**Assertion Library:**
- Not detected — No testing library found

**Run Commands:**
```bash
# No test commands configured in package.json
# Project does not have testing infrastructure
```

## Test File Organization

**Location:**
- No test files found in codebase
- No separate test directory structure (`tests/`, `__tests__/`, `spec/`)

**Naming:**
- No test files detected
- Pattern would likely be `*.test.ts` or `*.spec.ts` if implemented

**Structure:**
- Not applicable — testing not yet implemented

## Test Structure

**Suite Organization:**
- Not currently implemented

**Patterns:**
- No test setup/teardown patterns observed
- No assertion patterns established
- No test data structures in place

## Mocking

**Framework:**
- Not detected — No mocking library configured

**Patterns:**
- No mocking patterns established

**What to Mock:**
- Not defined

**What NOT to Mock:**
- Not defined

## Fixtures and Factories

**Test Data:**
- Not implemented
- Content validation currently handled by Zod schemas in `config.ts`

**Location:**
- N/A

## Coverage

**Requirements:**
- Not enforced — No coverage configuration detected

**View Coverage:**
- Not applicable

## Test Types

**Unit Tests:**
- Not implemented
- Would be recommended for:
  - Astro component rendering (`Header.astro`, `CTAButton.astro`)
  - TypeScript config validation (`template.config.ts`, `config.ts`)
  - Zod schema validation logic

**Integration Tests:**
- Not implemented
- Would be useful for testing:
  - Content collection loading and validation
  - Config integration with page rendering
  - Navigation flow and menu interactions

**E2E Tests:**
- Not implemented
- Framework: Could use Playwright for testing full site navigation, mobile menu, scroll behavior

## Validation Patterns Currently in Place

**Zod Schema Validation:**
The codebase uses Zod for runtime validation of content collections. These schemas serve as implicit tests:

```typescript
// config.ts example
const heroCollection = defineCollection({
  type: 'data',
  schema: z.object({
    headline:    z.string(),
    subheadline: z.string(),
    ctaPrimary:  z.object({ label: z.string(), href: z.string() }),
    ctaSecondary:z.object({ label: z.string(), href: z.string() }).optional(),
    backgroundType: z.enum(['gradient', 'image', 'video']).default('gradient'),
    trustBadges: z.array(z.object({
      icon:  z.string(),
      label: z.string(),
    })).optional(),
  }),
});
```

Validation rules:
- Required string fields: `z.string()`
- Enum constraints: `z.enum(['gradient', 'image', 'video'])`
- Number constraints: `z.number().min(1).max(5)`
- Optional fields: `.optional()`
- Default values: `.default(value)`
- Nested objects: `z.object({ ... })`
- Arrays of objects: `z.array(z.object({ ... }))`

## Type Safety

**TypeScript Configuration:**
- TypeScript enabled (`.ts` and `.tsx` files used)
- Type inference from Zod schemas: `export type TemplateConfig = typeof templateConfig;`
- Interface-based prop validation in Astro components:
```typescript
interface Props {
  href?:    string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient' | 'danger';
  size?:    'sm' | 'md' | 'lg' | 'xl';
  label:    string;
  // ...
}
```

**Recommended Testing Coverage**

If testing is implemented, prioritize:

1. **Configuration Validation** (High Priority)
   - `template.config.ts` placeholder detection
   - Required fields presence
   - Color format validation

2. **Content Collections** (High Priority)
   - Blog post date parsing
   - Featured flag filtering
   - Service ordering by `order` field
   - Testimonial rating constraints (1-5)

3. **Component Rendering** (Medium Priority)
   - `CTAButton.astro` variant/size combinations (6×4 matrix)
   - `Header.astro` mobile menu interactions
   - Mobile menu toggle state management
   - Touch/swipe gesture detection

4. **Accessibility** (Medium Priority)
   - ARIA attributes presence
   - Semantic HTML structure
   - Keyboard navigation
   - Touch target sizes (44px minimum)

5. **Responsive Design** (Medium Priority)
   - Breakpoint behavior at 768px
   - Typography scale with clamp()
   - Mobile drawer positioning and animations

## Testing Strategy Recommendations

**For Astro Components:**
```typescript
// Example test structure (if vitest added)
import { expect, test } from 'vitest';
import { render } from 'astro:test'; // hypothetical

test('CTAButton renders with primary variant', async () => {
  const { html } = await render(CTAButton, {
    props: { label: 'Click me', variant: 'primary' }
  });
  expect(html).toContain('cta-primary');
});
```

**For Config Validation:**
```typescript
// Schema validation tests
import config from '../template.config';
import { collections } from '../config';

test('templateConfig has all required business fields', () => {
  expect(config.business.name).toBeDefined();
  expect(config.business.phone).toBeDefined();
  expect(config.seo.siteUrl).toBeDefined();
});
```

**For Content Collections:**
```typescript
// Content validation tests
test('blog collection schema validates post dates', async () => {
  const { Blog } = collections;
  const valid = Blog.schema.safeParse({
    title: 'Test',
    description: 'Test',
    pubDate: new Date(),
    draft: false
  });
  expect(valid.success).toBe(true);
});
```

---

*Testing analysis: 2026-03-06*

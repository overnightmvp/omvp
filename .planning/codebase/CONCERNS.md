# Codebase Concerns

**Analysis Date:** 2026-03-06

## Tech Debt

**Unfilled Template Placeholders:**
- Issue: `template.config.ts` contains 40+ `{{PLACEHOLDER}}` values that must be manually replaced before deployment. No build-time validation enforces this.
- Files: `template.config.ts` (lines 12-139)
- Impact: Deploying with placeholders results in broken site (invalid business info, placeholder colors, missing contact details). Users may miss critical configurations.
- Fix approach: Implement a build-time validation script that errors if any `{{PLACEHOLDER}}` remains in `template.config.ts`. Consider using TypeScript-first config pattern or a schema validator at build time.

**Missing package.json:**
- Issue: Root directory has `package-lock.json` but no `package.json`. This breaks reproducible builds and dependency installation.
- Files: Root directory (missing `/Users/toshioj/Projects/Astro build/package.json`)
- Impact: Cannot run `npm install`, cannot identify dependencies, cannot build project. Critical blocker for development.
- Fix approach: Create `package.json` with Astro 4 dependencies, npm scripts (dev, build, preview), and version pins. Use lock file to restore exact versions.

**Incomplete Configuration:**
- Issue: `config.ts` defines content collection schemas but there's no indication of which collections are actually used in layout/page components.
- Files: `config.ts` (lines 1-102)
- Impact: Unused schemas add cognitive overhead. If a schema is removed, it's unclear what breaks.
- Fix approach: Add comments mapping each collection to its consumer components. Consider using TypeScript `as const` assertions to make collection names type-safe across the codebase.

## Known Bugs

**Mobile Navigation Event Delegation Issue:**
- Symptoms: Mobile nav drawer closes correctly on link click, but rapid menu toggles can desynchronize aria-expanded state from visual state.
- Files: `Header.astro` (lines 172-211)
- Trigger: Rapidly click hamburger → click nav link → click hamburger again before close animation completes
- Workaround: Add debounce on toggle button, or increase transition duration to prevent race condition
- Root cause: Event listeners fire before CSS transitions complete; no state queue prevents concurrent open/close

**Hardcoded Color in Button Spinner:**
- Symptoms: CTA button spinner color is hardcoded `#fff` instead of using design system variable
- Files: `CTAButton.astro` (lines 132-133)
- Trigger: Use CTAButton with secondary variant on light backgrounds - spinner becomes invisible
- Impact: Loading state is not visible on secondary/ghost buttons
- Fix: Replace `border-top-color: #fff;` with `border-top-color: currentColor;` to inherit text color

**Missing Null Checks on DOM Elements:**
- Symptoms: If HTML structure changes and expected IDs are missing, script silently fails with no error
- Files: `Header.astro` (lines 172-175, 207)
- Trigger: Accidental removal or renaming of `#menu-toggle`, `#menu-close`, `#mobile-nav`, `#site-header` IDs
- Impact: Mobile menu and header scroll effects don't work, no console error alerts developer
- Fix: Add explicit null checks with error messages: `if (!toggle) throw new Error('menu-toggle not found')`

## Security Considerations

**XSS via Unescaped Navigation Links:**
- Risk: `Header.astro` uses `.map()` to render nav.links without explicit escaping (though Astro handles this by default)
- Files: `Header.astro` (lines 18-20, 58-60)
- Current mitigation: Astro's template compiler escapes by default. Config values come from trusted `template.config.ts` file.
- Recommendations: Document that nav links are not user-editable. Add TypeScript strict mode to ensure only string values are used. Consider URL validation for href attributes.

**Insufficient Aria Labels for Icon Buttons:**
- Risk: Icon-only buttons (hamburger, close) rely solely on aria-labels. If labels are accidentally removed or malformed, screen readers can't convey purpose.
- Files: `Header.astro` (lines 36-44, 51-55)
- Current mitigation: aria-labels are hardcoded in Astro component
- Recommendations: Add visual tooltip fallback for keyboard users. Test with screen readers (NVDA, JAWS). Consider using `aria-labelledby` to link to visible text when available.

**No Content Security Policy Headers:**
- Risk: No CSP headers configured. If external scripts are injected via dependencies, malicious code runs unrestricted.
- Current mitigation: None detected
- Recommendations: Add `astro.config.ts` with CSP headers. Restrict inline scripts (use `script-src 'self'`). Pin external domains for fonts/analytics.

## Performance Bottlenecks

**Inefficient Mobile Navigation Selector:**
- Problem: `nav?.querySelectorAll('a')` on line 204 iterates all anchor tags in mobile nav every time it mounts, adding listeners to each
- Files: `Header.astro` (line 204)
- Cause: No event delegation; each link gets its own listener instead of bubbling to parent
- Improvement path: Use event delegation on `.mobile-nav-links` container instead. Single listener on parent handles all child clicks.
- Performance gain: O(n) listeners → O(1) listener (where n = number of nav links)

**Unoptimized Header Scroll Listener:**
- Problem: `scroll` event handler (line 208) fires on every pixel scrolled. No throttle/debounce.
- Files: `Header.astro` (line 208-210)
- Cause: Heavy DOM manipulation (`classList.toggle`) on 60fps event stream
- Improvement path: Add RAF debounce or `requestIdleCallback` wrapper. Cache header element reference. Use Intersection Observer instead to detect scroll threshold.

**CSS Gradient Animations Not Hardware Accelerated:**
- Problem: `.cta-gradient:hover` animates `background-position` (line 111), which triggers repaints
- Files: `CTAButton.astro` (line 111)
- Cause: background-position changes can't be GPU-accelerated on all browsers
- Improvement path: Replace with CSS `::before` pseudo-element containing full gradient, animate opacity instead. Or use SVG gradient masks.

## Fragile Areas

**Header Component — DOM Query Fragility:**
- Files: `Header.astro` (lines 172-211)
- Why fragile: Script depends on exact HTML element IDs (`menu-toggle`, `menu-close`, `mobile-nav`, `nav-backdrop`, `site-header`). If markup changes, script silently breaks.
- Safe modification: Extract ID values to constants at top of script. Add dev-mode warnings if elements not found. Use data attributes instead of IDs to mark interactive elements.
- Test coverage: No automated tests for menu open/close/scroll interactions. Manual browser testing required.

**Config Schema Without Runtime Validation:**
- Files: `template.config.ts`, `config.ts`
- Why fragile: `template.config.ts` has 40+ `{{PLACEHOLDER}}` strings. TypeScript doesn't prevent accidental deployment with placeholders (all values are strings).
- Safe modification: Create a compile-time schema checker that validates no placeholder values exist. Add tests that load config and check for valid URLs, phone numbers, color formats.
- Test coverage: No validation of config structure before build

**CTA Button Variant System:**
- Files: `CTAButton.astro` (lines 1-53)
- Why fragile: CSS class names must match interface prop unions exactly. If new variant added to interface but CSS not written, button renders unstyled.
- Safe modification: Use TypeScript discriminated unions to ensure each variant has CSS. Add visual regression tests for all 6 variants × 4 sizes.
- Test coverage: None. No visual regression or component snapshot tests.

**Content Collection Schema Misalignment:**
- Files: `config.ts` (lines 1-102)
- Why fragile: Schemas define data structure, but no type checking ensures templates actually use all defined fields. Optional fields might never be displayed.
- Safe modification: Generate TypeScript types from schemas. Import types in page components to ensure data is used. Add build warnings for unused schema fields.
- Test coverage: None. No schema conformance tests.

## Scaling Limits

**Single-File Component Architecture:**
- Current capacity: 211 lines for Header.astro (navigation, mobile drawer, scroll effects, styling, scripting all in one file)
- Limit: >250 lines becomes difficult to maintain; feature additions require careful style/script coordination
- Scaling path: Extract mobile menu logic to separate `MobileNav.astro` component. Move scroll spy to dedicated `HeaderScrollController.ts` utility. Create component composition instead of monolithic file.

**CSS Design System Hardcoded:**
- Current capacity: `design-system.css` assumes one fixed color palette and one fixed set of spacing/typography
- Limit: Adding a new color preset, theme, or font requires manual CSS edits; no programmatic way to generate variants
- Scaling path: Move color/spacing definitions to `template.config.ts`. Generate CSS variables at build time using Astro components or a CSS preprocessor. Support multiple themes via config.

**No State Management for Interactive Elements:**
- Current capacity: Individual components (Header, CTAButton) manage their own state (loading, disabled, menu open)
- Limit: Coordinating state across multiple interactive elements (if page has 10+ buttons) becomes error-prone
- Scaling path: Introduce a lightweight state manager (vanilla Context API if using client-side JS, or Astro actions for form submissions)

## Dependencies at Risk

**No package.json = Unknown Dependencies:**
- Risk: Cannot identify which versions of Astro, Node, npm are required. Dependency tree unknown.
- Impact: Builds fail on new machines. No clear upgrade path.
- Migration plan: Create `package.json` with explicit version pins for Astro 4, Zod, TypeScript. Document Node 18+ requirement.

**Astro 4 Minor Version Assumptions:**
- Risk: README states "Astro 4" but no exact version specified. Astro 4.0 → 4.5 could break content collections API
- Impact: Old lockfiles might install incompatible versions
- Migration plan: Pin exact Astro version in `package.json`. Test on latest minor version. Document upgrade steps if breaking changes occur.

## Missing Critical Features

**No Error Handling for Missing Config:**
- Problem: If `template.config.ts` fails to import or has syntax errors, build may fail cryptically
- Blocks: Developer feedback loop; hard to debug config issues
- Solution: Add try-catch in build process. Validate config shape at startup with clear error messages.

**No Pre-deployment Checklist:**
- Problem: No automation ensures all `{{PLACEHOLDERS}}` are replaced before build
- Blocks: Risk of deploying placeholder content to production
- Solution: Add `npm run validate` script. Check config for placeholder strings. Verify required images exist. Validate email/phone formats.

**No Accessibility Audit for Theme Switcher:**
- Problem: Dark/light/high-contrast theme switcher mentioned in docs but not visible in components reviewed
- Blocks: Cannot verify WCAG 2.1 AA color contrast compliance, especially for high-contrast theme
- Solution: Add theme switcher component. Test all three themes with WebAIM contrast checker. Add tests to ensure text always meets 4.5:1 ratio.

## Test Coverage Gaps

**No Component Tests:**
- What's not tested: CTAButton variants, sizes, states (loading, disabled, success, error). No snapshot tests for visual regression.
- Files: `CTAButton.astro`, `Header.astro`
- Risk: Button visual bugs, accessibility regressions, interaction state mismatches go unnoticed
- Priority: High - these are the most reused interactive components

**No Navigation Integration Tests:**
- What's not tested: Mobile menu open/close sequence, scroll behavior changes header, keyboard accessibility (Tab order, Enter to activate)
- Files: `Header.astro`
- Risk: Mobile UX breaks silently; screen reader users can't navigate menu
- Priority: High - critical user path on mobile devices

**No Content Collection Conformance Tests:**
- What's not tested: Blog posts match schema, images referenced in content exist, testimonial rating is 1-5, service prices are non-empty strings
- Files: `config.ts`, content files
- Risk: Missing required fields, type mismatches cause rendering errors at page build time
- Priority: Medium - caught at build time, but error messages may be unclear

**No Config Validation Tests:**
- What's not tested: All `{{PLACEHOLDERS}}` replaced, phone numbers are valid E.164 format, colors are valid hex/rgb, site URL is absolute, schema markup category is valid BusinessType
- Files: `template.config.ts`
- Risk: Broken site deployed with invalid data
- Priority: Critical - blocks production deployment

---

*Concerns audit: 2026-03-06*

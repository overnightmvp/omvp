---
phase: 02-automation-pipeline
plan: 00
subsystem: testing-infrastructure
tags: [wave-0, vitest, mocking, test-setup, tdd-foundation]
completed_at: "2026-03-08T07:45:25Z"
duration_minutes: 3

dependency_graph:
  requires: []
  provides:
    - centralized-test-mocks
    - vitest-global-setup
    - mock-apify-client
    - mock-anthropic-client
    - mock-supabase-client
    - mock-qstash-client
    - mock-resend-client
  affects:
    - tests/lib/agents/scraper.test.ts
    - tests/lib/agents/transformer.test.ts
    - tests/lib/agents/cleaner.test.ts

tech_stack:
  added:
    - vitest: "4.0.18 (already installed, now configured)"
    - "@vitest/ui": "4.0.18"
  patterns:
    - global-mock-setup
    - module-level-mocking
    - vi.mock-factory-pattern
    - environment-variable-setup

key_files:
  created:
    - tests/setup.ts: "Global test setup with 5 mocked external service clients (201 lines)"
    - tests/unit/mocks.test.ts: "Verification tests for mock setup (108 lines)"
  modified:
    - vitest.config.ts: "Added setupFiles, include pattern, and coverage configuration"

decisions:
  - decision: "Use centralized mock setup instead of per-file mocks"
    rationale: "Reduces duplication, provides single source of truth, easier maintenance"
    alternatives: ["Inline mocks in each test file (current pattern)", "Mock service workers"]

  - decision: "Mock all external services at module level using vi.mock()"
    rationale: "Prevents accidental API calls, deterministic tests, no network dependency"
    alternatives: ["Real API calls with test accounts", "HTTP mocking (nock/msw)"]

  - decision: "Export mock clients from setup.ts for test assertions"
    rationale: "Allows tests to verify mock calls and configure return values per test"
    alternatives: ["Private mocks (no exports)", "Spy on module imports"]

metrics:
  tasks_completed: 2
  tests_added: 7
  tests_passing: 7
  test_coverage: "100% (mocks verified)"
  files_created: 2
  files_modified: 1
  commits: 2
---

# Phase 02 Plan 00: Test Infrastructure with Mocked Services Summary

**One-liner:** Centralized Vitest test setup with mocked Apify, Anthropic, Supabase, QStash, and Resend clients preventing real API calls.

## What Was Built

Created Wave 0 test infrastructure with global mock setup for all external service clients, enabling TDD workflow for all subsequent automation pipeline plans without making real API calls.

### Core Components

1. **Global Test Setup** (`tests/setup.ts` - 201 lines)
   - Mocked Apify Client with actor.call() and dataset.listItems()
   - Mocked Anthropic SDK with messages.create() for Claude API
   - Mocked Supabase Client with database queries and auth methods
   - Mocked QStash Client with publishJSON() for job queue
   - Mocked Resend Client with emails.send() for notifications
   - Environment variable setup for all services

2. **Vitest Configuration** (`vitest.config.ts`)
   - Added setupFiles pointing to tests/setup.ts
   - Configured test include pattern: tests/**/*.test.ts
   - Added v8 coverage provider with HTML/text reporters
   - Excluded node_modules, tests, and config files from coverage

3. **Mock Verification Tests** (`tests/unit/mocks.test.ts` - 108 lines)
   - 7 tests verifying all mocks are properly initialized
   - Tests for Apify, Anthropic, Supabase, QStash, Resend clients
   - Verification that mocks prevent real API calls
   - Environment variable verification

### Architecture Decisions

**Centralized vs. Distributed Mocking:**
- Chose centralized setup over per-file inline mocks
- Reduces duplication across test files
- Single source of truth for mock behavior
- Easier to update mock responses globally

**Module-Level Mocking:**
- Used `vi.mock()` at module level for automatic interception
- Mocks apply globally to all imports of external libraries
- No need to manually inject dependencies
- Maintains same import patterns as production code

**Mock Export Pattern:**
- Export mock clients for test-specific configuration
- Allows tests to customize return values per scenario
- Enables verification of mock call counts and arguments
- Supports both default behavior and test-specific overrides

## Deviations from Plan

None - plan executed exactly as written.

## Challenges & Solutions

**Challenge:** Existing tests already had inline mocks for Apify and Anthropic.
**Solution:** Created centralized mocks that can coexist with existing tests. Future refactoring can remove inline mocks in favor of centralized setup.

**Challenge:** Mock structure needed to match real SDK APIs exactly.
**Solution:** Used class constructors for Apify and factory functions for chained methods (Supabase), matching actual SDK patterns.

## Verification Results

✅ **All Success Criteria Met:**
- tests/setup.ts created with 5 mocked external service clients (201 lines)
- vitest.config.ts configured with setupFiles and coverage settings
- tests/unit/mocks.test.ts created with 7 passing verification tests
- All mocks prevent real external API calls
- Test infrastructure ready for Plans 02-01 through 02-06

**Test Results:**
```
✓ tests/unit/mocks.test.ts (7 tests) 3ms
  Test Files  1 passed (1)
  Tests      7 passed (7)
  Duration   173ms
```

**Verification Checks:**
- ✅ Vitest installed: v4.0.18
- ✅ tests/setup.ts exists (201 lines)
- ✅ vitest.config.ts references tests/setup.ts
- ✅ All 7 mock verification tests pass
- ✅ No real API calls made during test execution

## Impact on Future Plans

**Enables TDD for Plans 02-01 through 02-06:**
- Scraper tests can use mockApifyClient
- Transformer tests can use mockAnthropicClient
- Schema builder tests can use mockSupabaseClient
- Queue orchestrator tests can use mockQStashClient
- Email notification tests can use mockResendClient

**Benefits:**
- Fast test execution (no network calls)
- Deterministic test results
- No API costs during testing
- No rate limiting issues
- Can test error scenarios easily

## Technical Notes

### Mock Implementation Patterns

**Apify Mock:**
```typescript
class MockApifyClient {
  constructor() {}
  actor() { return mockApifyClient.actor() }
  dataset() { return mockApifyClient.dataset() }
}
```
Uses class constructor pattern to match real ApifyClient SDK.

**Anthropic Mock:**
```typescript
class MockAnthropic {
  messages = mockAnthropicClient.messages
}
```
Default export with messages.create() matching Anthropic SDK v0.78.0.

**Supabase Mock:**
```typescript
from: vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(...)
}))
```
Chainable methods using mockReturnThis() pattern.

### Environment Variables

Setup file configures test environment:
```
APIFY_API_TOKEN=mock-apify-token
ANTHROPIC_API_KEY=mock-anthropic-key
NEXT_PUBLIC_SUPABASE_URL=https://mock-supabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-supabase-anon-key
QSTASH_TOKEN=mock-qstash-token
RESEND_API_KEY=mock-resend-key
```

## Self-Check: PASSED

**Files Created:**
✅ FOUND: tests/setup.ts
✅ FOUND: tests/unit/mocks.test.ts
✅ FOUND: vitest.config.ts (modified)

**Commits Exist:**
✅ FOUND: 16b185c (Task 1: Global test setup)
✅ FOUND: d194cef (Task 2: Vitest configuration)

**Tests Pass:**
✅ 7/7 tests passing in tests/unit/mocks.test.ts

**Mock Exports Verified:**
✅ mockApifyClient exported
✅ mockAnthropicClient exported
✅ mockSupabaseClient exported
✅ mockQStashClient exported
✅ mockResendClient exported

**Configuration Verified:**
✅ vitest.config.ts has setupFiles: ['./tests/setup.ts']
✅ vitest.config.ts has include: ['tests/**/*.test.ts']
✅ vitest.config.ts has coverage configuration

## Next Steps

**Immediate:**
- Plans 02-01 through 02-06 can now use centralized mocks
- Existing tests in tests/lib/agents/ can be refactored to use centralized mocks (optional)

**Future Considerations:**
- Consider removing inline mocks from existing test files
- Add integration tests that use real services in CI/CD
- Extend mocks as new external services are added

---

**Duration:** 3 minutes
**Commits:**
- `16b185c`: feat(02-00): create global test setup with mocked external service clients
- `d194cef`: feat(02-00): configure Vitest with setup file and create verification test

**Status:** ✅ COMPLETE - Test infrastructure ready for TDD workflow

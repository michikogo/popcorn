# Technical Brief: Popcorn — Test Suite

**Status:** Complete  
**Date:** 2026-05-30  
**Author:** Michiko Go  
**Product Brief:** N/A  
**Stack:** Vitest / React Testing Library / jsdom

---

## Overview

Adds a test suite to a project that currently has none. Coverage targets utility functions, API functions, the `useMovies` hook (the most complex piece — pagination, filter reset, AbortController), and key component behaviours. No E2E tests — the scope is unit and integration tests at the module boundary.

---

## System Architecture

```
src/
  test/
    setup.ts            ← global matchers, env stub, IntersectionObserver mock
  utils/
    getRatingClasses.test.ts
  api/
    fetchMovies.test.ts
    fetchGenres.test.ts
    getPosterUrl.test.ts
  hooks/
    useMovies.test.ts
  components/
    FilterBar.test.tsx
    MovieGallery.test.tsx
    MovieCard.test.tsx
    MovieListItem.test.tsx
```

Tests are co-located next to source files. The `setup.ts` file runs before every test file via Vitest's `setupFiles` config.

| Layer               | Tool                          | Role                                           |
| ------------------- | ----------------------------- | ---------------------------------------------- |
| Test runner         | Vitest                        | Runs tests, watch mode, coverage               |
| DOM environment     | jsdom                         | Simulates browser APIs in Node                 |
| Component rendering | React Testing Library         | Render + query components                      |
| User interactions   | `@testing-library/user-event` | Simulate clicks, selects                       |
| DOM matchers        | `@testing-library/jest-dom`   | `.toBeInTheDocument()`, `.toBeDisabled()` etc. |
| Fetch mocking       | `vi.fn()`                     | Intercept and control `globalThis.fetch`       |
| Env mocking         | `vi.stubEnv()`                | Provide `VITE_TMDB_API_KEY` in test context    |

---

## Test Scope

### What is tested

| File                  | What's covered                                                                      |
| --------------------- | ----------------------------------------------------------------------------------- |
| `getRatingClasses.ts` | Returns correct Tailwind classes for all three rating tiers                         |
| `getPosterUrl.ts`     | Builds correct TMDB image URL                                                       |
| `fetchMovies.ts`      | URL params, AbortSignal, error handling, JSON parsing                               |
| `fetchGenres.ts`      | URL params, error handling, JSON parsing                                            |
| `useMovies.ts`        | Initial load, filter reset, pagination append, loadMore guards, AbortError handling |
| `FilterBar.tsx`       | All filter interactions, yearTo disabled state, layout toggle                       |
| `MovieGallery.tsx`    | Loading/error/empty states, grid vs list render, sentinel, spinner, onLoadMore      |
| `MovieCard.tsx`       | Title, rating, year, ribbon, NoPoster, glow class                                   |
| `MovieListItem.tsx`   | Same as MovieCard                                                                   |

### What is not tested

- `App.tsx` — wiring only; covered indirectly by hook and component tests
- `SkeletonCard.tsx` — pure presentation, no logic
- `NoPoster.tsx` — pure SVG, no logic
- CSS/Tailwind classes beyond the ones that encode logic (rating tiers, ribbon)
- TMDB API responses (real network) — all fetch calls are mocked

---

## Key Mocking Decisions

### `globalThis.fetch`

Mocked per-test with `vi.fn()`. Each test sets the return value explicitly:

```ts
vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockDiscoverResponse),
  }),
)
```

Reset with `vi.restoreAllMocks()` in `afterEach`.

**Why not MSW?** MSW adds meaningful complexity (service worker setup, handlers file, lifecycle hooks) for a project with no existing test infrastructure. `vi.fn()` gives full control with zero setup overhead. MSW is the right call if integration-level tests across multiple hooks/components ever need real request interception.

### `IntersectionObserver`

jsdom does not implement `IntersectionObserver`. It is stubbed globally in `setup.ts`:

```ts
const mockObserver = { observe: vi.fn(), disconnect: vi.fn() }
vi.stubGlobal(
  'IntersectionObserver',
  vi.fn(() => mockObserver),
)
```

In `MovieGallery` tests, the sentinel callback is triggered manually:

```ts
const callback = vi.mocked(IntersectionObserver).mock.calls[0][0]
callback([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver)
```

### `import.meta.env.VITE_TMDB_API_KEY`

Stubbed in `setup.ts` via `vi.stubEnv('VITE_TMDB_API_KEY', 'test-key')`. All API function tests assert the key appears in the built URL.

---

## `useMovies` Hook — Test Notes

`useMovies` uses React's getDerivedStateFromProps pattern to reset state on filter change (calling setState during render, not inside `useEffect`). This means:

- The reset is synchronous during render — no need to `waitFor` the reset itself
- The subsequent fetch triggered by the reset IS async — use `waitFor` for the new movies to arrive

Test structure:

```ts
const { result, rerender } = renderHook(({ sortBy }) => useMovies({ sortBy }), {
  initialProps: { sortBy: 'popularity.desc' },
})
await waitFor(() => expect(result.current.loading).toBe(false))

// Change filter
rerender({ sortBy: 'vote_average.desc' })
// movies should immediately be empty (sync render reset)
expect(result.current.movies).toEqual([])
// loading goes true then false after new fetch
await waitFor(() => expect(result.current.loading).toBe(false))
```

---

## Key Decisions & Tradeoffs

### Vitest over Jest

- **Chosen:** Vitest
- **Alternatives:** Jest — would require `babel-jest` or `ts-jest` transformer, manual ESM config, and Vite-specific workarounds for `import.meta.env`
- **Rationale:** Vitest runs in the same Vite pipeline — `import.meta.env`, TypeScript path aliases, and ESM modules all work without extra config
- **Tradeoff:** Vitest is newer; fewer StackOverflow answers, but documentation is solid and the API mirrors Jest closely
- **Reversible?** Yes — Jest migration is mechanical

### Co-located tests over `__tests__` directory

- **Chosen:** Test files next to source (`fetchMovies.test.ts` beside `fetchMovies.ts`)
- **Alternatives:** Central `__tests__/` folder — common in older React projects
- **Rationale:** Easier to notice when a source file has no test; test and source move together on refactors
- **Tradeoff:** Slightly more files in each directory
- **Reversible?** Yes

### `vi.fn()` over MSW for fetch mocking

- **Chosen:** `vi.fn()` inline mocks
- **Alternatives:** MSW — better for testing components that make real fetch calls end-to-end
- **Rationale:** Most tests target a single module (a hook or a function). Fine-grained `vi.fn()` control is cleaner at this scope
- **Tradeoff:** If a future test needs to verify the full request/response cycle across multiple components, MSW would be the right upgrade
- **Reversible?** Yes

---

## Development Phases

- **MR 1 — Test infrastructure + utility tests**
  - Install Vitest, RTL, jsdom, jest-dom, user-event
  - Configure `vite.config.ts`, `tsconfig.app.json`, `package.json`
  - Create `src/test/setup.ts`
  - Write tests for `getRatingClasses`, `getPosterUrl`, `fetchMovies`, `fetchGenres`

- **MR 2 — Hook tests**
  - `useMovies` — all cases including pagination, filter reset, AbortError
  - `useGenres` — initial load, error state

- **MR 3 — Component tests**
  - `FilterBar`, `MovieGallery`, `MovieCard`, `MovieListItem`

---

## Open Questions

| Question                                      | Owner   | Status                                        |
| --------------------------------------------- | ------- | --------------------------------------------- |
| Add coverage thresholds to CI (`--coverage`)? | Michiko | Closed — out of scope for this take-home demo |

# Decision Log: Popcorn

**Project:** Popcorn  
**Owner:** Michiko Go  
**Date Started:** 2026-05-30

A running log of engineering decisions made during the design and build of Popcorn, including the reasoning and tradeoffs behind each choice.

---

## Server-side vs client-side sort and filter

**Decision:** Server-side — pass `sort_by`, `with_genres`, and `primary_release_year` directly to the TMDB API.

**Context:** The assignment says "first page is sufficient" which could be interpreted as filtering/sorting the 20 returned results client-side. However, the assignment also explicitly requires applying a filter and sorting the movies.

**Reasoning:** Server-side filtering applies across the entire TMDB catalogue before returning results. The 20 movies returned are always the best matches for the active filter/sort — not a filtered-down subset of an arbitrary first page. Client-side sort/filter on 20 items would be trivial and wouldn't demonstrate meaningful engineering judgement.

**Tradeoff:** Every filter/sort change triggers a network request instead of being instant.

---

## No backend / client-only architecture

**Decision:** All API calls go directly from the browser to TMDB. No proxy or backend server.

**Reasoning:** The assignment requires `npm i && npm start` with no server setup. A backend proxy would add unnecessary complexity and setup friction.

**Tradeoff:** The TMDB API key is visible in browser network requests. Acceptable for a demo app — TMDB keys are designed for client-side use.

---

## Separate `useMovies` and `useGenres` hooks

**Decision:** Two hooks with distinct fetch responsibilities instead of one combined hook.

**Reasoning:** Genres are static — they only need to be fetched once on mount. Movies refetch on every filter/sort state change. Combining them would cause unnecessary genre re-fetches on every user interaction.

**Tradeoff:** Slightly more files, but cleaner separation of concerns.

---

## Image performance strategy

**Decision:** Three-layer approach to keep image loading fast and non-blocking.

1. **`loading="lazy"`** — native HTML attribute on all `<img>` tags so off-screen posters don't block the initial render or consume bandwidth until the user scrolls near them
2. **TMDB `w500` image variant** — large enough for quality on a card grid, small enough to load fast. Avoid `original` which can be several MB per image
3. **Fallback for `poster_path: null`** — render a local placeholder asset instead of a broken image icon to keep the UI clean

**Phase 2 note:** When infinite scroll is added and the DOM accumulates 100+ cards, pair it with `react-virtual` to unmount off-screen cards entirely — removing their `<img>` elements from the DOM, not just lazy-loading them.

**Tradeoff:** `w500` may look slightly soft on very large screens. Acceptable at this scale — revisit if a full-screen detail view is added later.

---

## Layout toggle icons: unicode over an icon library

**Decision:** Use unicode characters (⊞ for grid, ☰ for list) in the `FilterBar` layout toggle instead of an icon library.

**Context:** Heroicons (made by the Tailwind team) provides `Squares2X2Icon` and `ListBulletIcon` which would be a natural fit and are visually polished. Install is `npm install @heroicons/react`.

**Reasoning:** For two small toggle buttons, adding a dependency is unnecessary. The unicode characters are universally supported, visually clear, and require zero setup. Heroicons remains the right choice if more icons are needed elsewhere in the app.

**Tradeoff:** Slightly less refined visually than SVG icons. Easy to swap if the bar for icon quality is raised.

---

## Phase 2 scope decisions

The following were deliberately deferred to Phase 2 to keep Phase 1 focused on the core assignment requirements:

- **Infinite scroll** — Phase 1 fetches the first page only (20 results), aligned with the assignment's "first page is sufficient" guidance. Phase 2 adds scroll-triggered pagination.
- **Year range filter** — Phase 1 uses a single year dropdown (2020–2025). Phase 2 replaces it with a from/to range picker for more expressive filtering.
- **List view layout** — Phase 1 is grid-only. Phase 2 adds a horizontal list layout with a toggle, satisfying the assignment's "different layout option" extra.

---

## Tech Brief — Phase 2 (ref: [tech-brief-popcorn-phase2.md](tech-brief-popcorn-phase2.md))

### IntersectionObserver over scroll event listener

**Decision:** Use `IntersectionObserver` with a sentinel `<div>` at the bottom of the gallery to trigger infinite scroll pagination.

**Reasoning:** A `scroll` event listener fires continuously on every scroll frame and requires manual throttling to avoid performance issues. `IntersectionObserver` fires exactly once when the sentinel enters the viewport — no throttle needed, no scroll math, and cleanup is a single `observer.disconnect()` call.

**Tradeoff:** `rootMargin` tuning is required to get the prefetch timing right. We use `500px` to start loading the next page before the user actually reaches the bottom — aggressive but intentional.

---

### getDerivedStateFromProps for filter reset

**Decision:** Reset movie list, page, and loading state during the render cycle (not inside a `useEffect`) when filter params change.

**Context:** The `react-hooks/set-state-in-effect` lint rule blocks synchronous `setState` calls at the top of effect bodies. The naive fix — a dedicated `useEffect` for resets — causes a stale render frame where the old movie list is briefly visible after a filter change.

**Reasoning:** React explicitly supports calling `setState` during render when guarded by a condition that becomes false on the next render (the getDerivedStateFromProps pattern). This resets state synchronously as part of the render that processes the new filter, eliminating the stale frame and satisfying the lint rule.

**Tradeoff:** Less familiar pattern than a `useEffect` reset — documented in `engineering-notes.md` to avoid future confusion.

---

## Tech Brief — Movie Detail Modal (ref: [tech-brief-popcorn-modal.md](tech-brief-popcorn-modal.md))

### Optimistic render with detail enrichment

**Decision:** Render the modal immediately with data already in memory (title, poster, rating, year from the discover response), then enrich with a `/movie/{id}` fetch that adds tagline, overview, runtime, and genre names.

**Reasoning:** The user just clicked a card they can see — showing a blank modal or full-screen spinner while re-fetching data they already viewed would feel slow. The optimistic render gives instant feedback; the enriched fields appear as they load.

**Tradeoff:** Two data sources (discover response + detail response) means some fields briefly show discover values before being replaced by detail values. In practice poster, rating, and year are identical between the two responses.

---

## Tech Brief — Test Suite (ref: [tech-brief-popcorn-tests.md](tech-brief-popcorn-tests.md))

### Vitest over Jest

**Decision:** Use Vitest as the test runner instead of Jest.

**Reasoning:** Vitest runs inside the same Vite pipeline the project already uses. `import.meta.env`, TypeScript path aliases, and ESM modules all work without additional transformer config. Jest requires `babel-jest` or `ts-jest`, manual ESM configuration, and Vite-specific workarounds for environment variables — significant setup overhead for no functional benefit.

**Tradeoff:** Vitest is newer than Jest and has fewer community answers for edge cases. The API mirrors Jest closely enough that migration is mechanical if needed.

### `vi.fn()` over MSW for fetch mocking

**Decision:** Mock `globalThis.fetch` with `vi.fn()` per test rather than using Mock Service Worker.

**Reasoning:** Tests target individual modules in isolation — a single hook or API function. Fine-grained `vi.fn()` control is simpler and more explicit at this scope. MSW introduces service worker setup, a handlers file, and lifecycle hooks that add meaningful overhead when the goal is unit-level isolation.

**Tradeoff:** If future tests need to verify the full request/response cycle across multiple components simultaneously, MSW is the right upgrade path.

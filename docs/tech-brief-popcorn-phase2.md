# Technical Brief: Popcorn — Phase 2

**Status:** Draft  
**Date:** 2026-05-30  
**Author:** Michiko Go  
**Product Brief:** product-brief-popcorn.md  
**Stack:** TypeScript / React / Vite / Tailwind CSS

---

## Overview

Phase 2 extends the Phase 1 movie discovery grid with four features: rating-based card visuals, list view, year range filter, and infinite scroll. All changes are additive — no Phase 1 behaviour is removed. This doc covers only the features not already shipped in Phase 1.

Already shipped in Phase 1 that counted as Phase 2 scope:

- **Responsive grid** — `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` in `MovieGrid`
- **Skeleton shimmer** — `@keyframes shimmer` + per-image fade-in in `MovieCard`
- **CSS transitions on filter/sort changes** — covered by the per-image shimmer; each new card fades in individually as its poster loads, making a separate grid-level fade transition redundant

---

## System Architecture

No new components or hooks introduced until MR 4 (infinite scroll). Existing components are extended in place.

```
App
  ├── FilterBar  (+ list/grid toggle, + year range from/to)
  └── MovieGrid  (+ list layout mode)
        ├── MovieCard (+ glow border, + Top Rated ribbon)
        └── SkeletonCard
```

| Change                         | Affects                                      | Notes                                             |
| ------------------------------ | -------------------------------------------- | ------------------------------------------------- |
| Rating visuals (glow + ribbon) | `MovieCard`                                  | Pure Tailwind, no new state                       |
| List view toggle               | `App`, `FilterBar`, `MovieCard`, `MovieGrid` | `layout` state in App                             |
| Year range filter              | `FilterBar`, `useMovies`, `fetchMovies`      | Replaces single year param with `gte`/`lte`       |
| Infinite scroll                | `useMovies`, `MovieGrid`                     | IntersectionObserver sentinel, page state in hook |

---

## Feature Specs

### Rating Visuals

Two tiers based on `vote_average`:

| Rating | Treatment                                                                  |
| ------ | -------------------------------------------------------------------------- |
| ≥ 8    | Gold glow (`shadow-yellow-400/50`) + "Top Rated" ribbon in top-left corner |
| ≥ 7    | Gold glow only                                                             |
| < 7    | No treatment                                                               |

Glow via Tailwind `ring` + `shadow`. Ribbon is an absolutely-positioned `<span>` inside the poster area — no layout impact.

### List View

`layout: 'grid' | 'list'` state in `App`, defaulting to `'grid'`.

- Toggle button added to `FilterBar`
- `MovieGrid` switches between `grid` and `flex flex-col` layout based on prop
- `MovieCard` renders differently in list mode: poster fixed at `w-24`, title + rating displayed to the right, full row width

### Year Range Filter

Replaces the single year `<select>` in `FilterBar` with two dropdowns: **From** and **To**.

- `FilterBar` props change: `year: number | null` → `yearFrom: number | null`, `yearTo: number | null`
- `useMovies` params updated: `year` → `yearFrom`, `yearTo`
- `fetchMovies` passes `primary_release_date.gte` = `${yearFrom}-01-01` and `primary_release_date.lte` = `${yearTo}-12-31`
- Both dropdowns show 2020–2025; `yearTo` must be ≥ `yearFrom` (enforce in `FilterBar`)

### Infinite Scroll

Page-based fetch appended to existing results.

- `page` state added to `useMovies`, starting at `1`
- `totalPages` exposed from hook (from `DiscoverResponse.total_pages`)
- `IntersectionObserver` on a sentinel `<div>` at the bottom of `MovieGrid`
- Sentinel fires when ~5 rows from viewport bottom (`rootMargin: '500px'`)
- On trigger: increment `page` in `useMovies` — new fetch runs, results appended (`setMovies(prev => [...prev, ...data.results])`)
- Filter/sort change resets `page` to `1` and clears `movies` to `[]`
- Stop observing when `page >= totalPages`
- Small spinner shown below the grid during next-page fetch

---

## API Design

Year range filter changes the TMDB params:

```
GET https://api.themoviedb.org/3/discover/movie
New/changed params:
  primary_release_date.gte   string   // e.g. "2020-01-01" (replaces primary_release_year)
  primary_release_date.lte   string   // e.g. "2023-12-31"
  page                       number   // increments with infinite scroll (was always 1)
```

---

## Performance & Scalability

- **Infinite scroll DOM growth:** once card count exceeds ~100, introduce `@tanstack/react-virtual` to virtualise the grid. Deferred to a follow-up — not in this phase.
- **Sentinel threshold:** `rootMargin: '500px'` triggers prefetch before the user actually hits the bottom (~5 rows at desktop). Adjust if grid row height changes.
- **Append vs replace:** filter/sort changes clear and replace `movies`; page increments append. These are the only two mutation paths.
- **Race condition on rapid filter change:** if the user changes filters while a page-2 fetch is in flight, the page resets to 1 and a new fetch fires. The stale page-2 response must be ignored — use an `AbortController` or a stale-check flag in `useMovies`.

---

## Edge Cases & Error Handling

| Scenario                           | Expected Behavior                            |
| ---------------------------------- | -------------------------------------------- |
| `yearTo` < `yearFrom` selected     | Disable invalid options in `yearTo` dropdown |
| Last page reached                  | Stop IntersectionObserver, hide spinner      |
| Next-page fetch fails              | Show error below grid, keep existing cards   |
| Filter changes during page-2 fetch | Abort in-flight request, reset to page 1     |
| All movies have rating < 7         | No glow or ribbon — cards render plainly     |

---

## Key Decisions & Tradeoffs

### Rating visuals: glow + ribbon over card sizing

- **Chosen:** `ring`/`shadow` glow for ≥7, "Top Rated" ribbon for ≥8
- **Alternatives:** column-span sizing (cards take up more grid columns for high-rated) — rejected because it distorts the grid and punishes lower-rated films visually in a way that felt wrong
- **Rationale:** glow and ribbon communicate quality without changing layout — the grid stays scannable
- **Tradeoff:** subtler signal than size difference; depends on user noticing the glow
- **Reversible?** Yes

### Infinite scroll: IntersectionObserver over scroll event listener

- **Chosen:** `IntersectionObserver` on a sentinel `<div>`
- **Alternatives:** `window.addEventListener('scroll', ...)` — rejected, runs on every scroll event and requires manual throttling
- **Rationale:** fires once at threshold, no throttle needed, built into the browser
- **Tradeoff:** `rootMargin` tuning is needed to get the 5-row prefetch feel right
- **Reversible?** Yes

### Year range: `primary_release_date.gte/lte` over `primary_release_year`

- **Chosen:** date range params
- **Alternatives:** keep single year, add a second year and filter client-side — rejected, server-side is more accurate
- **Rationale:** TMDB supports date range natively; gives full-year coverage without client-side filtering
- **Tradeoff:** `FilterBar` props change is a breaking change to the existing interface — needs coordinated update across `FilterBar`, `useMovies`, and `fetchMovies`
- **Reversible?** Yes

---

## Development Phases

- **[PR #12](https://github.com/michikogo/popcorn/pull/12) — Rating Visuals** ✅
  - Add glow (`ring`, `shadow-yellow-400/50`) to `MovieCard` for `vote_average ≥ 7`
  - Add "Top Rated" ribbon overlay to `MovieCard` for `vote_average ≥ 8`
  - `getRatingClasses` utility extracted to `src/utils/getRatingClasses.ts`

- **MR 2 — List View**
  - Add `layout: 'grid' | 'list'` state to `App`
  - Add toggle button to `FilterBar`
  - Update `MovieGrid` to switch between grid and flex-col layout
  - Update `MovieCard` to render list mode (poster left, info right)

- **MR 3 — Year Range Filter**
  - Replace `year` with `yearFrom` / `yearTo` in `FilterBar` props, `useMovies`, and `fetchMovies`
  - Add validation: disable `yearTo` options below `yearFrom`

- **MR 4 — Infinite Scroll**
  - Add `page` and `totalPages` state to `useMovies`
  - Append results on page increment, reset on filter/sort change
  - Add `IntersectionObserver` sentinel to `MovieGrid` with `rootMargin: '500px'`
  - Add AbortController to `useMovies` to cancel stale fetches
  - Show spinner below grid during next-page fetch

## Open Questions

| Question                                                                                 | Owner   | Due               |
| ---------------------------------------------------------------------------------------- | ------- | ----------------- |
| Virtualization threshold — at what card count do we introduce `@tanstack/react-virtual`? | Michiko | Before MR 4 ships |

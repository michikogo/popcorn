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

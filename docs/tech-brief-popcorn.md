# Technical Brief: Popcorn

**Status:** Draft  
**Date:** 2026-05-30  
**Author:** Michiko Go  
**Product Brief:** product-brief-popcorn.md  
**Stack:** TypeScript / React / Vite / Tailwind CSS

---

## Overview

Popcorn is a client-only movie discovery app that fetches data from the TMDB API and displays it in a filterable, sortable grid. There is no backend — all data fetching happens in the browser via the TMDB REST API. Scope is a single-page app with no routing.

## System Architecture

```
Browser
  └── App
        ├── FilterBar (genre dropdown, year dropdown, sort dropdown)
        └── MovieGrid
              ├── MovieCard (× n)
              └── SkeletonCard (× n, shown during load)

Data flow:
  useGenres → GET /genre/movie/list        → populates FilterBar genre options (once on mount)
  useMovies → GET /discover/movie?params   → populates MovieGrid (re-fetches on filter/sort change)
```

| Component       | Type            | Role                                                         |
| --------------- | --------------- | ------------------------------------------------------------ |
| `App`           | React component | Root — holds filter/sort state, passes to hooks and children |
| `FilterBar`     | React component | Genre dropdown, year dropdown, sort dropdown                 |
| `MovieGrid`     | React component | Renders grid of `MovieCard` or `SkeletonCard`                |
| `MovieCard`     | React component | Poster, title, rating — reusable, no internal state          |
| `SkeletonCard`  | React component | Placeholder shown while `useMovies` is loading               |
| `useMovies`     | Custom hook     | Fetches `/discover/movie`, re-runs on filter/sort change     |
| `useGenres`     | Custom hook     | Fetches `/genre/movie/list` once on mount                    |
| `api/fetchMovies.ts`, `fetchGenres.ts`, `getPosterUrl.ts` | API module | Fetch wrappers, URL builder, reads env key |
| `types/tmdb.ts` | Types file      | `Movie`, `Genre`, `DiscoverResponse` interfaces              |

## Data Model

```
Movie {
  id:                number
  title:             string
  poster_path:       string    // append to https://image.tmdb.org/t/p/w500
  vote_average:      number    // 0–10
  release_date:      string    // "YYYY-MM-DD"
  genre_ids:         number[]
}

Genre {
  id:    number
  name:  string
}

DiscoverResponse {
  page:          number
  results:       Movie[]
  total_pages:   number
  total_results: number
}
```

## API Design

```
GET https://api.themoviedb.org/3/discover/movie
Params:
  api_key                string   // from VITE_TMDB_API_KEY
  sort_by                string   // "popularity.desc" | "vote_average.desc" | "release_date.desc"
  with_genres            number   // genre id (optional)
  primary_release_year   number   // e.g. 2023 (optional)
  page                   1        // always first page (Phase 1)

GET https://api.themoviedb.org/3/genre/movie/list
Params:
  api_key   string

Image base URL: https://image.tmdb.org/t/p/w500{poster_path}
```

## Security

- **API key:** stored in `.env` as `VITE_TMDB_API_KEY`, never hardcoded or committed
- **`.env` in `.gitignore`:** must be confirmed before first commit
- **Note:** TMDB API keys are client-side by design for this use case — the key will be visible in network requests, which is acceptable for a demo app

## Performance & Scalability

- **Page size:** TMDB returns 20 results per page by default — Phase 1 fetches page 1 only
- **Image lazy loading:** use native `loading="lazy"` on all `<img>` tags so off-screen posters don't block initial render
- **Image sizing:** use TMDB's `w500` image size — large enough for quality, small enough to load fast
- **Fallback images:** handle `poster_path: null` with a local placeholder to avoid broken image icons
- **`useGenres` caching:** genres are fetched once on mount and held in state — no refetch needed
- **`useMovies` refetch:** triggers on every filter/sort state change via `useEffect` dependency array — 20 results keeps this fast
- **Phase 2 note — virtualization:** once infinite scroll is added and the rendered card count grows (100+), introduce `react-virtual` or `@tanstack/react-virtual` to virtualise the grid and keep DOM node count low
- **Phase 2 note — prefetching:** when the user scrolls near the bottom of the grid, prefetch the next page in the background before the scroll threshold is hit

## Edge Cases & Error Handling

| Scenario                    | Expected Behavior                                          |
| --------------------------- | ---------------------------------------------------------- |
| No movies match filters     | Show empty state message in grid area                      |
| `poster_path` is null       | Render a local fallback placeholder image                  |
| TMDB API request fails      | Show error message in UI, no crash                         |
| `VITE_TMDB_API_KEY` not set | Requests fail with 401 — surface a clear error message     |
| Filter change mid-fetch     | Cancel previous request, show skeleton, render new results |

## Key Decisions & Tradeoffs

### Client-only, no backend

- **Chosen:** All fetching happens in the browser directly against TMDB
- **Alternatives:** A thin Express proxy to hide the API key server-side
- **Rationale:** Assignment requires `npm i && npm start` with no server — a proxy adds unnecessary complexity
- **Tradeoff:** API key is visible in network tab; acceptable for a demo, not for production
- **Reversible?** Yes — a proxy can be added later without changing frontend fetch logic

### Separate `useMovies` and `useGenres` hooks

- **Chosen:** Two hooks with distinct responsibilities
- **Alternatives:** One combined hook that fetches both
- **Rationale:** Genres are static and only need to fetch once; movies refetch on every filter change. Combining them causes unnecessary genre re-fetches
- **Tradeoff:** Slightly more files, but cleaner separation of concerns
- **Reversible?** Yes

### Tailwind CSS for all styling

- **Chosen:** Tailwind utility classes; custom keyframe in `tailwind.config.ts` for skeleton shimmer
- **Alternatives:** CSS Modules, plain CSS, Styled Components
- **Rationale:** Fastest path to a polished UI — hover transitions, responsive grid, and skeleton animation all handled without leaving the component file
- **Tradeoff:** Class strings on components can get verbose at this scale
- **Reversible?** Partially — migrating away would require rewriting all styles

### Server-side sort and filter via TMDB params

- **Chosen:** Pass `sort_by`, `with_genres`, and `primary_release_year` directly to the API
- **Alternatives:** Fetch all movies once and filter/sort client-side
- **Rationale:** Server-side filtering applies across the full TMDB catalogue, not just the 20 results on the current page — more accurate results
- **Tradeoff:** Every filter/sort change triggers a network request
- **Reversible?** Yes

### Native `loading="lazy"` for images

- **Chosen:** HTML native lazy loading attribute on `<img>` tags
- **Alternatives:** Intersection Observer API, a library like `react-lazyload`
- **Rationale:** Zero dependencies, good browser support, sufficient for 20 images per page
- **Tradeoff:** Less control over load thresholds vs. Intersection Observer
- **Reversible?** Yes — easy to swap for Intersection Observer when infinite scroll is added in Phase 2

## Folder Structure

```
src/
  api/
    fetchMovies.ts     // GET /discover/movie
    fetchGenres.ts     // GET /genre/movie/list
    getPosterUrl.ts    // builds TMDB image URL
  components/
    FilterBar.tsx
    MovieCard.tsx
    MovieGrid.tsx
    NoPoster.tsx       // inline SVG fallback for missing posters
    SkeletonCard.tsx
  hooks/
    useGenres.ts
    useMovies.ts
  types/
    tmdb.ts            // Movie, Genre, DiscoverResponse
  App.tsx
  main.tsx
```

## Development Phases

- **[PR #1](https://github.com/michikogo/popcorn/pull/1) — Docs** ✅
  - Product brief, tech brief, decision log

- **[PR #3](https://github.com/michikogo/popcorn/pull/3) — Project Setup** ✅
  - Vite + React + TypeScript scaffold
  - Blank white page, boilerplate removed

- **[PR #5](https://github.com/michikogo/popcorn/pull/5) — Linting + CI** ✅
  - Prettier + ESLint integration
  - GitHub Actions CI pipeline
  - PR template

- **[PR #6](https://github.com/michikogo/popcorn/pull/6) — Tailwind Setup**
  - Install Tailwind CSS v4 + Vite plugin
  - Add `@import 'tailwindcss'` to `index.css`
  - Placeholder `MovieCard` to verify Tailwind works

- **[PR #7](https://github.com/michikogo/popcorn/pull/7) — Data Layer** ✅
  - `Movie`, `Genre`, `DiscoverResponse` types (`src/types/tmdb.ts`)
  - API fetch helpers for `/discover/movie` and `/genre/movie/list` (`src/api/fetchMovies.ts`, `src/api/fetchGenres.ts`)
  - `getPosterUrl()` helper (`src/api/getPosterUrl.ts`)
  - `NoPoster` component — inline SVG fallback rendered when `poster_path` is null
  - `useGenres` hook — fetches once on mount
  - `useMovies` hook — re-fetches on filter/sort change, returns movies, loading, error

- **MR — UI Components**
  - `SkeletonCard` — pulsing placeholder card
  - `MovieCard` — poster, title, rating badge, hover effect (`hover:scale-105 hover:shadow-xl`), lazy image loading
  - `MovieGrid` — renders `MovieCard` grid, skeleton state, empty state, error state

- **MR — FilterBar + App Wiring**
  - `FilterBar` — genre dropdown, year dropdown (2020–2025), sort dropdown
  - `App` — holds filter/sort state, wires `useMovies` and `useGenres` to `FilterBar` and `MovieGrid`
  - Default sort: `popularity.desc`

## Open Questions

| Question                 | Owner    | Due                          |
| ------------------------ | -------- | ---------------------------- |
| ~~Default sort on load~~ | Resolved | `popularity.desc`            |
| ~~Fallback image~~       | Resolved | Local asset in `src/assets/` |

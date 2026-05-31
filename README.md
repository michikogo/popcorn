# Popcorn

A movie discovery app for browsing, filtering, and exploring films using the TMDB API.

## Setup

1. Copy `.env.example` to `.env` and add your TMDB API key as `VITE_TMDB_API_KEY`
2. `npm install`
3. `npm run dev`

## Architecture

The app is a single-page React app that talks directly to the TMDB API from the browser. Filters and sort state live in `App` and are passed down to a `useMovies` hook that drives fetches against `/discover/movie`. Genres are fetched once on mount via `useGenres` and used both to populate the filter bar and to resolve genre names in the detail modal.

Infinite scroll is handled by an `IntersectionObserver` sentinel at the bottom of the gallery — when it enters the viewport, `loadMore` increments the page and appends results. Filter changes reset the page and movie list synchronously during render (getDerivedStateFromProps pattern) to avoid a flash of stale content.

Clicking a movie opens a detail modal that renders immediately with card data, then enriches once a `/movie/{id}` fetch resolves with tagline, overview, runtime, and full genre names.

```
Browser
  ├── useGenres      → TMDB /genre/movie/list
  ├── useMovies      → TMDB /discover/movie (paginated, filtered)
  └── useMovie       → TMDB /movie/{id}  (on modal open)
```

## Docs

- [Technical brief — Phase 1](docs/tech-brief-popcorn.md)
- [Technical brief — Phase 2](docs/tech-brief-popcorn-phase2.md)
- [Technical brief — Movie detail modal](docs/tech-brief-popcorn-modal.md)
- [Technical brief — Test suite](docs/tech-brief-popcorn-tests.md)
- [Decision log](docs/decisions.md)
- [Engineering notes](docs/engineering-notes.md)
- [Known bugs](docs/bugs.md)

## Known limitations

**No auth or rate limiting:** The TMDB API key is exposed in the browser bundle. Fine for a demo; a production version would proxy requests through a server.

**Infinite scroll threshold is aggressive:** The `IntersectionObserver` uses a `500px` rootMargin, so the next page starts loading before the user reaches the bottom. Works well on fast connections; on slow connections the user may notice a spinner sooner than expected.

**No caching between sessions:** Filters and scroll position reset on page reload. A production version could persist state to `localStorage` or the URL query string.

# Technical Brief: Movie Detail Modal

**Status:** Complete  
**Date:** 2026-05-30  
**Author:** Michiko Go  
**Product Brief:** product-brief-popcorn.md  
**Stack:** React 19 / TypeScript / Tailwind CSS v4 / Vite

---

## Overview

Adds a detail modal that opens when a user clicks any movie card or list item. The modal renders immediately with data already in memory (title, poster, rating, year), then enriches once a `/movie/{id}` fetch resolves with tagline, overview, runtime, and full genre names. Closes via ESC key, backdrop click, or the ✕ button.

---

## System Architecture

```
MovieCard / MovieListItem
  └── onClick → App.selectedMovie (useState<Movie | null>)
        └── MovieModal (renders when selectedMovie !== null)
              ├── useMovie(id) → TMDB /movie/{id}
              └── onClose → setSelectedMovie(null)
```

| Component       | Type        | Role                                                                     |
| --------------- | ----------- | ------------------------------------------------------------------------ |
| `App`           | Container   | Owns `selectedMovie` state; passes `onMovieClick` down and renders modal |
| `MovieGallery`  | Passthrough | Accepts `onMovieClick`, forwards it to each card/list item               |
| `MovieCard`     | UI          | Grid tile; fires `onClick` prop on click                                 |
| `MovieListItem` | UI          | List row; fires `onClick` prop on click                                  |
| `MovieModal`    | UI          | Overlay; renders card data immediately, detail fields after fetch        |
| `useMovie`      | Hook        | Fetches `/movie/{id}`, manages loading/error, AbortController on unmount |
| `fetchMovie`    | API         | Wraps TMDB `/movie/{id}`, returns `MovieDetail`                          |

---

## Data Model

Two data shapes are used. `Movie` (from the discover response) is available immediately. `MovieDetail` (from the detail fetch) enriches the modal after the request resolves.

```
Movie {                          // available immediately from discover
  id:            number
  title:         string
  poster_path:   string | null
  vote_average:  number
  release_date:  string          // "YYYY-MM-DD"
  genre_ids:     number[]
}

MovieDetail {                    // fetched from /movie/{id} on modal open
  id:            number
  title:         string
  tagline:       string
  overview:      string
  runtime:       number | null
  release_date:  string
  vote_average:  number
  poster_path:   string | null
  genres:        { id: number; name: string }[]
}
```

The modal falls back to `Movie` fields (poster, rating, year) while the detail fetch is in flight, so the user always sees something immediately.

---

## Key Decisions & Tradeoffs

### Optimistic render with detail enrichment

- **Chosen:** Render title, poster, and rating from the existing `Movie` object immediately; show a spinner for the enriched fields (tagline, overview, runtime, genres) until `/movie/{id}` resolves
- **Alternatives:** Show a full-screen loading state until the detail fetch completes
- **Rationale:** The user clicked on a card they can already see — showing a blank modal or spinner while re-fetching data they just saw would feel slow. The optimistic render uses what's already in memory
- **Tradeoff:** Two data sources means some fields (poster, rating) can briefly show the discover value before being replaced by the detail value. In practice these are identical
- **Reversible?** Yes

### Genres from detail response, not the discover list

- **Chosen:** `MovieDetail.genres` (array of `{id, name}`) from `/movie/{id}` — no cross-referencing needed
- **Alternatives:** Cross-reference `Movie.genre_ids` against the `Genre[]` array from `useGenres`
- **Rationale:** The detail endpoint returns genre names directly, so there's no need to pass the app-level genre list into the modal
- **Tradeoff:** Requires the detail fetch to complete before genres are shown
- **Reversible?** Yes

### State in `App`, not `MovieGallery`

- **Chosen:** `selectedMovie: Movie | null` in `App`; `MovieGallery` is a passthrough
- **Alternatives:** State in `MovieGallery`, modal rendered inside it
- **Rationale:** The modal needs `fixed inset-0` over the entire page, not scoped inside the gallery's DOM subtree. `MovieGallery` stays a pure rendering component
- **Tradeoff:** One extra prop thread (`onMovieClick`) through `MovieGallery` to each card
- **Reversible?** Yes

### No `ReactDOM.createPortal`

- **Chosen:** Modal renders inline in `App`'s JSX after the gallery
- **Alternatives:** `ReactDOM.createPortal` to `document.body`
- **Rationale:** `fixed inset-0` positioning escapes the layout stack regardless of DOM placement. A portal adds complexity (ref management, hydration edge cases) with no visual benefit at this scale
- **Tradeoff:** If a parent ever applies `transform` or `filter` to the app container, `fixed` positioning breaks. Not a concern here
- **Reversible?** Yes — one-line change

### Body scroll lock on mount

- **Chosen:** `document.body.style.overflow = 'hidden'` on mount, restored on unmount
- **Rationale:** Without this the background page scrolls while the modal is open (BUG-001)
- **Tradeoff:** Inline style over a CSS class — self-contained, cleans up reliably on unmount, no global stylesheet entry needed

---

## Edge Cases & Error Handling

| Scenario                               | Expected Behavior                                                          |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `poster_path` is null                  | `NoPoster` component renders in place of `<img>`                           |
| Detail fetch fails                     | Error message renders; title, rating, year from card data still visible    |
| `release_date` is empty string         | Year display is skipped (`?.slice(0, 4)` returns undefined → not rendered) |
| `runtime` is null                      | Runtime field is omitted from the metadata row                             |
| No tagline                             | Tagline element is not rendered                                            |
| User clicks inside modal, not backdrop | `e.stopPropagation()` on modal card prevents close                         |
| Filter changes while modal is open     | Modal stays open — `selectedMovie` is not tied to filter state             |
| Viewport < 640px                       | Poster renders at fixed 192px centered; modal scrolls internally (BUG-002) |

---

## Development Phases

- **[PR #20](https://github.com/michikogo/popcorn/pull/20) — Movie Detail Modal (initial)** ✅
  - `MovieModal.tsx` — poster, title, rating, year, genre chips; ESC + backdrop close
  - `MovieCard.tsx` / `MovieListItem.tsx` — added `onClick` prop
  - `MovieGallery.tsx` — added `onMovieClick`, forwarded to cards
  - `App.tsx` — `selectedMovie` state, renders modal

- **[PR #21](https://github.com/michikogo/popcorn/pull/21) — Detail fetch enrichment** ✅
  - `fetchMovie.ts` — new API function for `/movie/{id}`
  - `useMovie.ts` — new hook; getDerivedStateFromProps reset on id change
  - `MovieModal.tsx` — optimistic render + detail enrichment; tagline, overview, runtime

- **[PR #22](https://github.com/michikogo/popcorn/pull/22) — Bug fixes** ✅
  - BUG-001: body scroll lock on modal mount
  - BUG-002: poster width constraint on mobile viewports

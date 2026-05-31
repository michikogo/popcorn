# Technical Brief: Movie Detail Modal

**Status:** Complete  
**Date:** 2026-05-30  
**Author:** Michiko Go  
**Product Brief:** product-brief-popcorn.md  
**Stack:** React 19 / TypeScript / Tailwind CSS v4 / Vite

---

## Overview

Adds a detail modal that opens when a user clicks any movie card or list item. The modal displays the movie's poster, title, rating, release year, and genres using data already available from the discover response — no additional API call. Closes via ESC key or backdrop click.

---

## System Architecture

```
MovieCard / MovieListItem
  └── onClick prop → App.selectedMovie (useState<Movie | null>)
        └── MovieModal (renders when selectedMovie !== null)
              ├── genres (passed from useGenres, already in App)
              └── onClose → setSelectedMovie(null)
```

| Component       | Type        | Role                                                                     |
| --------------- | ----------- | ------------------------------------------------------------------------ |
| `App`           | Container   | Owns `selectedMovie` state; passes `onMovieClick` down and renders modal |
| `MovieGallery`  | Passthrough | Accepts `onMovieClick`, forwards it to each card/list item               |
| `MovieCard`     | UI          | Grid tile; fires `onClick` prop on click                                 |
| `MovieListItem` | UI          | List row; fires `onClick` prop on click                                  |
| `MovieModal`    | UI          | Overlay with poster, title, rating, year, genre chips                    |

---

## Data Model

The modal reuses the `Movie` type from the discover response — no new types or fetch:

```
Movie {
  id:            number
  title:         string
  poster_path:   string | null
  vote_average:  number
  release_date:  string        // "YYYY-MM-DD" — modal slices [0,4] for year
  genre_ids:     number[]      // cross-referenced with Genre[] from useGenres
}

Genre {
  id:   number
  name: string
}
```

Genre names are resolved client-side: `genres.filter(g => movie.genre_ids.includes(g.id))`. The `genres` array is already fetched by `useGenres` in `App` — no duplication.

---

## Key Decisions & Tradeoffs

### No additional API fetch

- **Chosen:** Display only the data already in the `Movie` object from `/discover/movie`
- **Alternatives:** Fetch `/movie/{id}` on open to get overview, runtime, tagline, backdrop image
- **Rationale:** The goal is to demonstrate click-to-modal interaction, not data richness. Keeping it zero-fetch avoids a loading state inside the modal, error handling, and a new hook — all scope that doesn't serve the demo objective
- **Tradeoff:** Modal has no overview text or runtime. A real product would want those; this is straightforward to add later by wiring `useMovie` hook → `/movie/{id}`
- **Reversible?** Yes — swapping to a detail fetch is additive: add the hook, extend the modal props

### State lives in App, not MovieGallery

- **Chosen:** `selectedMovie: Movie | null` state in `App`; `MovieGallery` just receives `onMovieClick`
- **Alternatives:** State in `MovieGallery` with modal rendered inside it
- **Rationale:** The modal needs to render above the entire page (full-screen overlay), not scoped inside the gallery's DOM subtree. Keeping state in `App` also keeps `MovieGallery` a pure rendering component
- **Tradeoff:** One extra prop thread (`onMovieClick`) through `MovieGallery` to each card
- **Reversible?** Yes

### No portal for modal DOM placement

- **Chosen:** Modal renders inline in `App`'s JSX, after the gallery
- **Alternatives:** `ReactDOM.createPortal` to `document.body`
- **Rationale:** The modal uses `fixed inset-0` positioning — it escapes the layout stack regardless of DOM placement. A portal adds complexity (ref management, hydration edge cases) with no visual benefit for a single-page app at this scale
- **Tradeoff:** If a parent ever sets `transform` or `filter` on the app container, `fixed` positioning breaks. Not a concern here
- **Reversible?** Yes — wrapping in a portal is a one-line change

### Close on ESC and backdrop click, no close button required

- **Chosen:** ESC via `keydown` listener + backdrop `onClick`; close button present as a secondary affordance (✕ in top-right)
- **Alternatives:** Close button only
- **Rationale:** Standard modal UX — keyboard and pointer users both get a natural exit path. `e.stopPropagation()` on the modal card prevents backdrop handler firing on inner clicks

---

## Edge Cases & Error Handling

| Scenario                                 | Expected Behavior                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| `poster_path` is null                    | `NoPoster` component renders in place of `<img>`                           |
| `genre_ids` don't match any loaded genre | Genre chip section is omitted (empty array → no render)                    |
| `release_date` is empty string           | Year display is skipped (`?.slice(0, 4)` returns undefined → not rendered) |
| User clicks inside modal, not backdrop   | `e.stopPropagation()` on modal card prevents close                         |
| Filter changes while modal is open       | Modal stays open — `selectedMovie` is not tied to filter state             |

---

## Development Phases

This feature shipped in a single MR:

- **MR 1 — Movie Detail Modal**
  - `MovieModal.tsx` — new component: poster, title, rating, year, genre chips, ESC + backdrop close
  - `MovieCard.tsx` — added `onClick: () => void` prop
  - `MovieListItem.tsx` — added `onClick: () => void` prop
  - `MovieGallery.tsx` — added `onMovieClick: (movie: Movie) => void`, forwarded to cards
  - `App.tsx` — added `selectedMovie` state, wired `onMovieClick`, renders `MovieModal`

## Open Questions

| Question                                              | Owner   | Due                    |
| ----------------------------------------------------- | ------- | ---------------------- |
| Add movie overview + runtime via `/movie/{id}` fetch? | Michiko | If taken to production |

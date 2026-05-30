# Product Brief: Popcorn

**Status:** Draft  
**Date:** 2026-05-30  
**Owner:** Michiko Go  
**Domain:** Demo Web App

---

## Target Users

### The Film Browser

A movie enthusiast who enjoys exploring the catalogue for its own sake — browsing by genre, era, or mood. They want a clean, visual experience that rewards wandering. No urgency, just discovery. Today they cobble together tabs across IMDb, Letterboxd, and streaming apps to find what to watch next.

---

## User Stories

- As a film browser, I want to filter movies by genre so that I can narrow down to films that match my mood.
- As a film browser, I want to filter movies by release year so that I can explore a specific era of cinema.
- As a film browser, I want to sort movies by rating or popularity so that standout films surface first.
- As a film browser, I want to browse a visually rich grid of movie posters so that the experience feels like flipping through a collection.
- As a film browser, I want to see a movie's rating on its card so that I can gauge quality at a glance.
- As a film browser, I want smooth hover interactions on cards so that browsing feels tactile and engaging.
- As a film browser, I want skeleton cards while data loads so that the experience feels fast and responsive.

---

## Requirements

- Fetch movies from the TMDB `/discover/movie` endpoint (first page)
- Fetch genres from the TMDB `/genre/movie/list` endpoint to populate the filter UI
- Display movies in a grid of cards
- Each card must show: poster image, title, and rating
- Filter movies by genre (dropdown populated from TMDB genres)
- Filter movies by release year (single year dropdown, 2020–2025)
- Sort movies via TMDB `sort_by` param (popularity, rating, release date)
- Skeleton card loading state while data is fetching
- Hover interaction on each card (scale + shadow transition via Tailwind utilities)
- API key stored in `.env` as `VITE_TMDB_API_KEY`, never hardcoded

---

## Iterations

### Phase 1 — MVP

The core assignment: a working movie discovery grid with genre filter, year filter, server-side sort, skeleton loading, and hover effects. Covers the brief requirements fully.

**Includes:**

- Movie grid with poster, title, and rating
- Genre filter (populated from TMDB `/genre/movie/list`)
- Year dropdown filter (single year, 2020–2025)
- Server-side sort via TMDB `sort_by`
- Skeleton loading cards
- Hover effect (scale + shadow via Tailwind)

### Phase 2 — Extras

Polish and interactivity that elevate the experience beyond the base requirements.

**Includes:**

- Responsive grid (mobile, tablet, desktop)
- Card size variation by rating
- Skeleton shimmer animation (custom keyframe in `tailwind.config.ts`)
- CSS transitions on filter/sort changes
- List view layout + toggle between grid and list
- Year range filter (from/to) replacing single year dropdown
- Infinite scroll to load additional pages as the user reaches the bottom of the grid

### Phase 3 and beyond

Expand from discovery into action — clicking a movie surfaces showtimes or streaming availability, moving Popcorn toward a lightweight ticketing or watchlist experience.

# Production Considerations

This document covers what would need to change to take Popcorn from a demo to a production deployment under real traffic.

---

## Current Architecture — Where It Breaks

The app talks to TMDB directly from the browser. Every user makes their own API requests with the same API key. This works for a demo but has two hard limits in production:

**TMDB rate limit:** 40 requests per 10 seconds per API key. With concurrent users each making 2–3 requests on page load (genres + movies + optional movie detail), a key saturates at roughly 10–15 concurrent active users. Beyond that, requests get 429 responses and the UI shows errors.

**Exposed API key:** The key is in the browser bundle and visible in every network request. Anyone can extract it and use it against your quota.

---

## Production Architecture

The fix for both problems is a server-side proxy that sits between the browser and TMDB.

```
Browser → Proxy Server → TMDB API
              ↓
         Cache Layer (Redis / in-memory)
```

The browser never talks to TMDB directly. The proxy:

1. Holds the API key server-side — not in the bundle
2. Caches responses so repeated requests don't consume quota
3. Can rate-limit per user or per IP to prevent abuse

### What gets cached and for how long

| Endpoint                 | TTL          | Reason                                                                               |
| ------------------------ | ------------ | ------------------------------------------------------------------------------------ |
| `/genre/movie/list`      | 24 hours     | Genre list changes rarely — TMDB updates it infrequently                             |
| `/discover/movie?params` | 5–10 minutes | Popular/trending results change slowly; stale-by-a-few-minutes is fine for discovery |
| `/movie/{id}`            | 1 hour       | Movie details are stable; runtime/tagline don't change day-to-day                    |

With this caching in place, 1,000 concurrent users browsing the same popular sort could be served from a single cached TMDB response, using no additional quota.

### Scaling the proxy

The proxy itself is stateless (cache aside) — it can be horizontally scaled behind a load balancer. For the cache, Redis works across multiple instances; in-memory cache works if you're running a single instance.

A CDN in front of the proxy (Cloudflare, Fastly) handles the genre list and popular pages with zero origin hits after the first request per region.

---

## What Stays the Same

The React frontend doesn't change. The only difference is the base URL for API calls — pointed at the proxy instead of TMDB directly. `fetchMovies`, `fetchGenres`, and `fetchMovie` all stay identical.

---

## Other Production Gaps

**Error recovery:** Network errors currently show a message but offer no retry. A production app would auto-retry with exponential backoff on transient failures (5xx, network timeout).

**State persistence:** Filters and scroll position reset on page reload. Persisting to `localStorage` or URL query params (`?sort=rating&genre=28`) would let users share links and resume sessions.

**Bundle size:** The current bundle has no code-splitting. Routes (if added) or lazy-loaded components would reduce initial load time.

**Accessibility:** The modal traps visual focus but does not trap keyboard focus (`Tab` can leave the modal). A production version would use a focus trap library or the native `<dialog>` element.

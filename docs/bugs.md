# Bug Tracker

## BUG-001 — Background scrollable while modal is open

**Status:** Fixed  
**Found:** 2026-05-30  
**Fixed in:** `feat/movie-modal-detail`

### Description

Opening the movie detail modal did not prevent the user from scrolling the page behind it. The backdrop overlay visually covered the gallery but the document scroll position could still change, creating a disorienting experience.

### Root Cause

`MovieModal` rendered a fixed overlay but never locked the document scroll. `document.body.style.overflow` remained at its default, so the browser still processed scroll events on the body.

### Fix

Added a `useEffect` in `MovieModal` that sets `document.body.style.overflow = 'hidden'` on mount and restores it to `''` on unmount. This ensures scroll is locked for exactly the lifetime of the modal.

```ts
useEffect(() => {
  document.body.style.overflow = 'hidden'
  return () => {
    document.body.style.overflow = ''
  }
}, [])
```

---

## BUG-002 — Modal poster overflows at narrow viewports

**Status:** Fixed  
**Found:** 2026-05-30  
**Fixed in:** `fix/modal-mobile-overflow`

### Description

At viewports below 640px (below Tailwind's `sm` breakpoint), the movie poster inside the modal rendered at full container width. Because the poster has a 2:3 aspect ratio, this made it extremely tall, pushing the title, rating, and overview off-screen with no way to reach them.

### Root Cause

The poster `div` used `w-full` on mobile with no height constraint. At the `sm` breakpoint it correctly switched to `sm:w-40` (fixed 160px), but below that breakpoint the full-width rule made the poster dominate the entire modal.

The modal card also had no `max-height` or internal scroll, so overflowing content simply clipped outside the viewport.

### Fix

Two changes to `MovieModal.tsx`:

- Poster width changed from `w-full sm:w-40` to `mx-auto w-48 sm:mx-0 sm:w-40` — fixed 192px centered on mobile, then snaps to the side-by-side layout at `sm`
- Modal card gains `overflow-y-auto` and `max-height: 90svh` so long content (overview, many genres) scrolls inside the card rather than overflowing

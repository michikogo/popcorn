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

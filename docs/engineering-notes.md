# Engineering Notes

A running log of patterns, gotchas, and lessons learned during the build. Not decisions — just things worth remembering.

---

## setState inside useEffect

When using `eslint-plugin-react-hooks`, calling `setState` synchronously at the top of a `useEffect` body triggers a lint error. The fix is simple — only call `setState` inside async callbacks:

```ts
// ✗ triggers lint error
useEffect(() => {
  setLoading(true)
  setError(null)
  fetchMovies().then(...)
}, [])

// ✓ correct
useEffect(() => {
  fetchMovies()
    .then((data) => setMovies(data.results))
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false))
}, [])
```

The rule exists because synchronous setState in an effect causes an extra render cycle before the async work completes. Keeping all state updates in the callbacks is both lint-compliant and more correct.

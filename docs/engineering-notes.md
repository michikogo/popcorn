# Engineering Notes

A running log of patterns, gotchas, and lessons learned during the build. Not decisions — just things worth remembering.

---

## setState inside useEffect — two valid patterns

The `react-hooks/set-state-in-effect` lint rule blocks calling `setState` synchronously at the top of a `useEffect` body. There are two valid ways to handle this depending on the situation.

**Pattern 1 — async callbacks only (simple fetches)**

When state updates are purely in response to async work, keep all `setState` calls inside `.then()` / `.catch()` / `.finally()`:

```ts
// ✗ triggers lint error
useEffect(() => {
  setLoading(true)
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

**Pattern 2 — getDerivedStateFromProps (filter/param reset)**

When state needs to reset _synchronously_ the moment a prop changes (e.g. clearing the movie list when filters change), calling `setState` in an effect is too late — it fires after render and causes a stale frame. The React-approved fix is to call `setState` during render, guarded by a condition that becomes false on the next render:

```ts
const [prevFilterKey, setPrevFilterKey] = useState(filterKey)

if (prevFilterKey !== filterKey) {
  setPrevFilterKey(filterKey)
  setPage(1)
  setMovies([])
  setLoading(true)
}
```

This is React's own getDerivedStateFromProps pattern. It skips the stale frame, satisfies the lint rule, and is explicitly documented in the React docs as valid. Used in `useMovies` for filter reset and `useMovie` for movie ID reset.

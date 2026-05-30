import { useState, useEffect, useCallback } from 'react'
import fetchMovies, { type FetchMoviesParams } from '../api/fetchMovies'
import type { Movie } from '../types/tmdb'

interface UseMoviesResult {
  movies: Movie[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  totalPages: number
  page: number
  loadMore: () => void
}

const useMovies = ({
  sortBy,
  genreId,
  yearFrom,
  yearTo,
}: Omit<FetchMoviesParams, 'page'> = {}): UseMoviesResult => {
  const filterKey = `${sortBy ?? ''}|${genreId ?? ''}|${yearFrom ?? ''}|${yearTo ?? ''}`

  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Derived state reset on filter change — React's getDerivedStateFromProps pattern.
  // Calling setState during render is valid when guarded by a condition that becomes
  // false on the next render, preventing infinite loops.
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey)
    setPage(1)
    setMovies([])
    setError(null)
    setLoading(true)
  }

  useEffect(() => {
    const controller = new AbortController()

    fetchMovies({ sortBy, genreId, yearFrom, yearTo, page }, controller.signal)
      .then((data) => {
        setTotalPages(data.total_pages)
        setMovies((prev) => (page === 1 ? data.results : [...prev, ...data.results]))
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      })

    return () => controller.abort()
  }, [sortBy, genreId, yearFrom, yearTo, page])

  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && page < totalPages) {
      setLoadingMore(true)
      setPage((p) => p + 1)
    }
  }, [loading, loadingMore, page, totalPages])

  return { movies, loading, loadingMore, error, totalPages, page, loadMore }
}

export default useMovies
